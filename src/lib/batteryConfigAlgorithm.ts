import { BatterySpec } from './batteryDatabase';

export interface BatteryConfigInputs {
  batteryType: string;
  cellCount: number;
  targetVoltage: number;
  layoutPriority: 'MINIMIZE_Z' | 'MINIMIZE_XY' | 'BALANCED' | 'CUSTOM';
  customMaxDimensions?: { x: number; y: number; z: number };
  cellOrientation: 'STANDING' | 'LAYING' | 'MIXED';
  useHoneycomb: boolean;
  cellGap: number;
  wallClearance: number;
  nickelStripTop: number;
  nickelStripBottom: number;
  showOnlyExact: boolean;
}

export interface ElectricalConfig {
  series: number;
  parallel: number;
  code: string;
  cellsUsed: number;
  cellsUnused: number;
  nominalVoltage: number;
  maxVoltage: number;
  minVoltage: number;
  capacityAh: number;
  energyWh: number;
  weightKg: number;
}

export interface PhysicalLayout {
  configuration: ElectricalConfig;
  orientation: string;
  cols: number;
  rowsPerLayer: number;
  layers: number;
  cellPositions: CellPosition[];
  useHoneycomb: boolean;
  packDimensions: { x: number; y: number; z: number };
  totalDimensions: { x: number; y: number; z: number };
  volumeCm3: number;
  footprintCm2: number;
  cubeness: number;
}

export interface CellPosition {
  index: number;
  x: number;
  y: number;
  z: number;
  col: number;
  row: number;
  layer: number;
  seriesPosition: number;
  parallelGroup: number;
  polarityUp: boolean;
}

export interface BatteryPackSpec {
  packSpecification: {
    generatedDate: string;
    generator: string;
    version: string;
  };
  cellType: BatterySpec;
  configuration: {
    code: string;
    seriesCount: number;
    parallelCount: number;
    totalCells: number;
    cellsUsed: number;
    cellsUnused: number;
  };
  electrical: {
    nominalVoltageV: number;
    maxVoltageV: number;
    minVoltageV: number;
    capacityAh: number;
    energyWh: number;
    maxDischargeA: number;
  };
  physical: {
    totalWeightKg: number;
    orientation: string;
    packing: string;
    layout: {
      columns: number;
      rows: number;
      layers: number;
    };
    packDimensionsMm: { x: number; y: number; z: number };
    withClearanceMm: { x: number; y: number; z: number };
    volumeCm3: number;
  };
  spacing: {
    cellGapMm: number;
    wallClearanceMm: number;
    nickelStripTopMm: number;
    nickelStripBottomMm: number;
  };
  cellPositions: {
    index: number;
    xMm: number;
    yMm: number;
    zMm: number;
    seriesGroup: number;
    parallelGroup: number;
    polarityUp: boolean;
  }[];
  wiringNotes: string[];
}

export function calculateConfigurations(battery: BatterySpec, inputs: BatteryConfigInputs): ElectricalConfig[] {
  const configurations: ElectricalConfig[] = [];

  // Iterate through all possible series counts
  for (let seriesCount = 1; seriesCount <= inputs.cellCount; seriesCount++) {
    // Calculate parallel groups for this series count
    const parallelCount = Math.floor(inputs.cellCount / seriesCount);

    if (parallelCount < 1) continue;

    const cellsUsed = seriesCount * parallelCount;
    const cellsUnused = inputs.cellCount - cellsUsed;

    // Skip if show_only_exact and not using all cells
    if (inputs.showOnlyExact && cellsUnused > 0) continue;

    // Calculate electrical properties
    const nominalVoltage = seriesCount * battery.nominal_voltage;
    const maxVoltage = seriesCount * battery.max_voltage;
    const minVoltage = seriesCount * battery.min_voltage;
    const capacityAh = parallelCount * battery.typical_capacity / 1000;
    const totalWeight = cellsUsed * battery.weight / 1000; // kg
    const energyWh = nominalVoltage * capacityAh;

    const configuration: ElectricalConfig = {
      series: seriesCount,
      parallel: parallelCount,
      code: `${seriesCount}S${parallelCount}P`,
      cellsUsed,
      cellsUnused,
      nominalVoltage,
      maxVoltage,
      minVoltage,
      capacityAh,
      energyWh,
      weightKg: totalWeight
    };

    configurations.push(configuration);
  }

  return configurations;
}

export function generateLayouts(configuration: ElectricalConfig, battery: BatterySpec, inputs: BatteryConfigInputs): PhysicalLayout[] {
  const layouts: PhysicalLayout[] = [];

  // Determine cell dimensions based on orientation
  if (battery.model_type === "cylinder") {
    if (inputs.cellOrientation === 'STANDING' || inputs.cellOrientation === 'MIXED') {
      // Standing: diameter in XY, length in Z
      const cellX = battery.diameter! + inputs.cellGap;
      const cellY = battery.diameter! + inputs.cellGap;
      const cellZ = battery.length!;
      layouts.push(...generateGridLayouts(configuration, cellX, cellY, cellZ, "standing", inputs));
    }

    if (inputs.cellOrientation === 'LAYING' || inputs.cellOrientation === 'MIXED') {
      // Laying along X: length in X, diameter in Y and Z
      const cellX = battery.length! + inputs.cellGap;
      const cellY = battery.diameter! + inputs.cellGap;
      const cellZ = battery.diameter!;
      layouts.push(...generateGridLayouts(configuration, cellX, cellY, cellZ, "laying_x", inputs));

      // Laying along Y: diameter in X, length in Y, diameter in Z
      const cellX2 = battery.diameter! + inputs.cellGap;
      const cellY2 = battery.length! + inputs.cellGap;
      const cellZ2 = battery.diameter!;
      layouts.push(...generateGridLayouts(configuration, cellX2, cellY2, cellZ2, "laying_y", inputs));
    }
  } else if (battery.model_type === "box") {
    // Box cells: try all three orientations
    // Orientation 1: normal (width=X, length=Y, thickness=Z)
    const cellX = battery.width! + inputs.cellGap;
    const cellY = battery.length! + inputs.cellGap;
    const cellZ = battery.thickness!;
    layouts.push(...generateGridLayouts(configuration, cellX, cellY, cellZ, "flat", inputs));

    // Orientation 2: standing on edge (width=X, thickness=Y, length=Z)
    const cellX2 = battery.width! + inputs.cellGap;
    const cellY2 = battery.thickness! + inputs.cellGap;
    const cellZ2 = battery.length!;
    layouts.push(...generateGridLayouts(configuration, cellX2, cellY2, cellZ2, "edge_y", inputs));

    // Orientation 3: standing on end (thickness=X, length=Y, width=Z)
    const cellX3 = battery.thickness! + inputs.cellGap;
    const cellY3 = battery.length! + inputs.cellGap;
    const cellZ3 = battery.width!;
    layouts.push(...generateGridLayouts(configuration, cellX3, cellY3, cellZ3, "edge_x", inputs));
  }

  return layouts;
}

function generateGridLayouts(
  config: ElectricalConfig,
  cellX: number,
  cellY: number,
  cellZ: number,
  orientation: string,
  inputs: BatteryConfigInputs
): PhysicalLayout[] {
  const layouts: PhysicalLayout[] = [];
  const cellsTotal = config.cellsUsed;

  // Find all factor pairs for arranging cells in XY grid
  // Then stack in Z if needed
  for (let cols = 1; cols <= cellsTotal; cols++) {
    if (cellsTotal % cols !== 0) continue;

    const rows = cellsTotal / cols;

    for (let layers = 1; layers <= cellsTotal; layers++) {
      const cellsPerLayer = cols * rows;

      // Check if this creates valid configuration
      if (cellsPerLayer * layers !== cellsTotal) continue;

      const rowsPerLayer = rows / layers;
      if (rowsPerLayer < 1 || rowsPerLayer !== Math.floor(rowsPerLayer)) continue;

      // Calculate bounding dimensions
      let packX: number, packY: number;
      if (inputs.useHoneycomb && orientation === "standing") {
        // Honeycomb offset packing
        packX = cols * cellX + (cellX * 0.5); // Extra for offset
        packY = rowsPerLayer * cellY * 0.866; // sin(60°) compression
      } else {
        // Rectangular grid packing
        packX = cols * cellX;
        packY = rowsPerLayer * cellY;
      }

      const packZ = layers * cellZ + inputs.nickelStripTop + inputs.nickelStripBottom;

      // Add wall clearance
      const totalX = packX + (2 * inputs.wallClearance);
      const totalY = packY + (2 * inputs.wallClearance);
      const totalZ = packZ + (2 * inputs.wallClearance);

      // Check against custom dimension constraints
      if (inputs.customMaxDimensions) {
        if (totalX > inputs.customMaxDimensions.x ||
            totalY > inputs.customMaxDimensions.y ||
            totalZ > inputs.customMaxDimensions.z) {
          continue;
        }
      }

      const volume = totalX * totalY * totalZ;
      const footprint = totalX * totalY;

      // Calculate how cubic the shape is (1.0 = perfect cube)
      const dimensionsSorted = [totalX, totalY, totalZ].sort((a, b) => a - b);
      const cubeness = dimensionsSorted[0] / dimensionsSorted[2];

      const layout: PhysicalLayout = {
        configuration: config,
        orientation,
        cols,
        rowsPerLayer,
        layers,
        cellPositions: [], // Filled in later
        useHoneycomb: inputs.useHoneycomb,
        packDimensions: { x: packX, y: packY, z: packZ },
        totalDimensions: { x: totalX, y: totalY, z: totalZ },
        volumeCm3: volume / 1000,
        footprintCm2: footprint / 100,
        cubeness
      };

      // Generate individual cell positions
      layout.cellPositions = generateCellPositions(layout, cellX, cellY, cellZ, inputs);

      layouts.push(layout);
    }
  }

  return layouts;
}

function generateCellPositions(
  layout: PhysicalLayout,
  cellX: number,
  cellY: number,
  cellZ: number,
  inputs: BatteryConfigInputs
): CellPosition[] {
  const positions: CellPosition[] = [];
  let cellIndex = 0;

  for (let layer = 0; layer < layout.layers; layer++) {
    for (let row = 0; row < layout.rowsPerLayer; row++) {
      for (let col = 0; col < layout.cols; col++) {
        // Base position (grid)
        let x = col * cellX;
        let y = row * cellY;
        let z = layer * cellZ + inputs.nickelStripBottom;

        // Apply honeycomb offset for odd rows
        if (layout.useHoneycomb && row % 2 === 1) {
          x = x + (cellX * 0.5);
        }

        // Center the pack around origin
        x = x - (layout.packDimensions.x / 2) + (cellX / 2);
        y = y - (layout.packDimensions.y / 2) + (cellY / 2);
        z = z; // Z starts at 0

        // Determine series group and parallel group
        const parallelGroup = cellIndex % layout.configuration.parallel;
        const seriesPosition = Math.floor(cellIndex / layout.configuration.parallel);

        const position: CellPosition = {
          index: cellIndex,
          x,
          y,
          z,
          col,
          row,
          layer,
          seriesPosition,
          parallelGroup,
          polarityUp: seriesPosition % 2 === 0 // Alternate polarity for series wiring
        };

        positions.push(position);
        cellIndex++;
      }
    }
  }

  return positions;
}

export function rankLayouts(layouts: PhysicalLayout[], inputs: BatteryConfigInputs): PhysicalLayout[] {
  if (inputs.layoutPriority === 'MINIMIZE_Z') {
    // Sort by Z dimension (height), then volume
    layouts.sort((a, b) => a.totalDimensions.z - b.totalDimensions.z || a.volumeCm3 - b.volumeCm3);
  } else if (inputs.layoutPriority === 'MINIMIZE_XY') {
    // Sort by footprint area, then volume
    layouts.sort((a, b) => a.footprintCm2 - b.footprintCm2 || a.volumeCm3 - b.volumeCm3);
  } else if (inputs.layoutPriority === 'BALANCED') {
    // Sort by cubeness (closest to 1.0), then volume
    layouts.sort((a, b) => (1 - a.cubeness) - (1 - b.cubeness) || a.volumeCm3 - b.volumeCm3);
  } else if (inputs.layoutPriority === 'CUSTOM') {
    // Sort by volume (since custom constraints already filter)
    layouts.sort((a, b) => a.volumeCm3 - b.volumeCm3);
  }

  // Remove duplicates (same dimensions, different internal arrangement)
  const uniqueLayouts = removeDuplicateDimensions(layouts);

  return uniqueLayouts;
}

function removeDuplicateDimensions(layouts: PhysicalLayout[]): PhysicalLayout[] {
  const seen = new Set<string>();
  return layouts.filter(layout => {
    const key = `${layout.totalDimensions.x.toFixed(1)}-${layout.totalDimensions.y.toFixed(1)}-${layout.totalDimensions.z.toFixed(1)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generatePackSpec(layout: PhysicalLayout, battery: BatterySpec, inputs: BatteryConfigInputs): BatteryPackSpec {
  const spec: BatteryPackSpec = {
    packSpecification: {
      generatedDate: new Date().toISOString(),
      generator: "CellForge Battery Box Creator",
      version: "1.0"
    },
    cellType: battery,
    configuration: {
      code: layout.configuration.code,
      seriesCount: layout.configuration.series,
      parallelCount: layout.configuration.parallel,
      totalCells: inputs.cellCount,
      cellsUsed: layout.configuration.cellsUsed,
      cellsUnused: layout.configuration.cellsUnused
    },
    electrical: {
      nominalVoltageV: layout.configuration.nominalVoltage,
      maxVoltageV: layout.configuration.maxVoltage,
      minVoltageV: layout.configuration.minVoltage,
      capacityAh: layout.configuration.capacityAh,
      energyWh: layout.configuration.energyWh,
      maxDischargeA: layout.configuration.capacityAh * 0.2 // Rough estimate: 0.2C discharge rate
    },
    physical: {
      totalWeightKg: layout.configuration.weightKg,
      orientation: layout.orientation,
      packing: layout.useHoneycomb ? "honeycomb" : "rectangular",
      layout: {
        columns: layout.cols,
        rows: Math.round(layout.rowsPerLayer * layout.layers),
        layers: layout.layers
      },
      packDimensionsMm: {
        x: layout.packDimensions.x,
        y: layout.packDimensions.y,
        z: layout.packDimensions.z
      },
      withClearanceMm: {
        x: layout.totalDimensions.x,
        y: layout.totalDimensions.y,
        z: layout.totalDimensions.z
      },
      volumeCm3: layout.volumeCm3
    },
    spacing: {
      cellGapMm: inputs.cellGap,
      wallClearanceMm: inputs.wallClearance,
      nickelStripTopMm: inputs.nickelStripTop,
      nickelStripBottomMm: inputs.nickelStripBottom
    },
    cellPositions: layout.cellPositions.map(pos => ({
      index: pos.index,
      xMm: pos.x,
      yMm: pos.y,
      zMm: pos.z,
      seriesGroup: pos.seriesPosition,
      parallelGroup: pos.parallelGroup,
      polarityUp: pos.polarityUp
    })),
    wiringNotes: generateWiringNotes(layout)
  };

  return spec;
}

function generateWiringNotes(layout: PhysicalLayout): string[] {
  const notes: string[] = [];

  notes.push(`Each parallel group consists of ${layout.configuration.parallel} cells`);
  notes.push("Series connections alternate polarity");
  notes.push("Recommend 0.15mm x 8mm nickel strip for parallel connections");
  notes.push("Recommend 0.15mm x 10mm nickel strip for series connections");
  notes.push(`Total series connections: ${layout.configuration.series - 1}`);
  notes.push(`Total parallel connections: ${layout.configuration.parallel * layout.configuration.series}`);

  return notes;
}