import { PhysicalLayout, BatteryPackInputs, generatePackSpec } from './batteryConfigAlgorithm';
import { BatterySpec } from './batteryDatabase';
import { BatteryPackGeometry, generateBatteryPackGeometry, generateEnclosureGeometry } from './batteryGeometryGenerator';
import { saveAs } from 'file-saver';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import * as THREE from 'three';

export class BatteryExporters {
  static exportPackSpec(layout: PhysicalLayout, battery: BatterySpec, inputs: BatteryPackInputs): void {
    const spec = generatePackSpec(layout, battery, inputs);

    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: 'application/json'
    });

    const filename = `battery-pack-${layout.configuration.code}-${new Date().toISOString().split('T')[0]}.json`;
    saveAs(blob, filename);
  }

  static exportPackSTL(layout: PhysicalLayout, battery: BatterySpec): void {
    const packGeometry = generateBatteryPackGeometry(layout, battery);

    const exporter = new STLExporter();
    const stlString = exporter.parse(packGeometry.group);

    const blob = new Blob([stlString], {
      type: 'application/sla'
    });

    const filename = `battery-pack-${layout.configuration.code}.stl`;
    saveAs(blob, filename);
  }

  static exportPackOBJ(layout: PhysicalLayout, battery: BatterySpec): void {
    const packGeometry = generateBatteryPackGeometry(layout, battery);

    const exporter = new OBJExporter();
    const objString = exporter.parse(packGeometry.group);

    const blob = new Blob([objString], {
      type: 'text/plain'
    });

    const filename = `battery-pack-${layout.configuration.code}.obj`;
    saveAs(blob, filename);
  }

  static exportEnclosureSTL(layout: PhysicalLayout): void {
    const enclosureGeometry = generateEnclosureGeometry(layout);

    const exporter = new STLExporter();
    const stlString = exporter.parse(enclosureGeometry);

    const blob = new Blob([stlString], {
      type: 'application/sla'
    });

    const filename = `battery-enclosure-${layout.configuration.code}.stl`;
    saveAs(blob, filename);
  }

  static exportEnclosureOBJ(layout: PhysicalLayout): void {
    const enclosureGeometry = generateEnclosureGeometry(layout);

    const exporter = new OBJExporter();
    const objString = exporter.parse(enclosureGeometry);

    const blob = new Blob([objString], {
      type: 'text/plain'
    });

    const filename = `battery-enclosure-${layout.configuration.code}.obj`;
    saveAs(blob, filename);
  }

  static exportCompletePack(layout: PhysicalLayout, battery: BatterySpec, inputs: BatteryPackInputs): void {
    // Export spec
    this.exportPackSpec(layout, battery, inputs);

    // Export pack geometry
    setTimeout(() => this.exportPackSTL(layout, battery), 100);
    setTimeout(() => this.exportPackOBJ(layout, battery), 200);

    // Export enclosure
    setTimeout(() => this.exportEnclosureSTL(layout), 300);
    setTimeout(() => this.exportEnclosureOBJ(layout), 400);
  }

  static exportToSTEP(layout: PhysicalLayout, battery: BatterySpec): void {
    // STEP export would require additional libraries like ThreeCSG or custom STEP generation
    // For now, we'll export as STL which can be converted to STEP in other CAD software
    console.warn('STEP export not yet implemented. Exporting as STL instead.');
    this.exportPackSTL(layout, battery);
  }

  static exportWiringDiagram(layout: PhysicalLayout): void {
    // Generate a simple SVG wiring diagram
    const svgContent = this.generateWiringDiagramSVG(layout);

    const blob = new Blob([svgContent], {
      type: 'image/svg+xml'
    });

    const filename = `wiring-diagram-${layout.configuration.code}.svg`;
    saveAs(blob, filename);
  }

  private static generateWiringDiagramSVG(layout: PhysicalLayout): string {
    const width = 800;
    const height = 600;
    const margin = 50;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Title
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">${layout.configuration.code} Wiring Diagram</text>`;

    // Series groups
    const groupSpacing = (width - 2 * margin) / layout.configuration.series;
    const cellSpacing = 30;

    for (let seriesPos = 0; seriesPos < layout.configuration.series; seriesPos++) {
      const x = margin + seriesPos * groupSpacing;
      const cellsInGroup = layout.cellPositions.filter(c => c.seriesPosition === seriesPos);

      // Draw parallel group
      cellsInGroup.forEach((cell, index) => {
        const y = 80 + index * cellSpacing;

        // Cell symbol (circle)
        svg += `<circle cx="${x}" cy="${y}" r="10" fill="#cccccc" stroke="#000000"/>`;

        // Cell label
        svg += `<text x="${x}" y="${y+4}" text-anchor="middle" font-family="Arial" font-size="10">${cell.index}</text>`;

        // Positive terminal
        svg += `<line x1="${x-10}" y1="${y-10}" x2="${x-10}" y2="${y-15}" stroke="red" stroke-width="2"/>`;

        // Negative terminal
        svg += `<line x1="${x+10}" y1="${y+10}" x2="${x+10}" y2="${y+15}" stroke="black" stroke-width="2"/>`;
      });

      // Parallel connections within group
      for (let i = 0; i < cellsInGroup.length - 1; i++) {
        const y1 = 80 + i * cellSpacing;
        const y2 = 80 + (i + 1) * cellSpacing;

        // Positive connection
        svg += `<line x1="${x-10}" y1="${y1-15}" x2="${x-10}" y2="${y2-15}" stroke="red" stroke-width="2"/>`;

        // Negative connection
        svg += `<line x1="${x+10}" y1="${y1+15}" x2="${x+10}" y2="${y2+15}" stroke="black" stroke-width="2"/>`;
      }

      // Series connection to next group
      if (seriesPos < layout.configuration.series - 1) {
        const nextX = margin + (seriesPos + 1) * groupSpacing;
        const lastCellY = 80 + (cellsInGroup.length - 1) * cellSpacing;

        // From negative of current group to positive of next group
        svg += `<line x1="${x+10}" y1="${lastCellY+15}" x2="${nextX-10}" y2="${80-15}" stroke="blue" stroke-width="3"/>`;
      }
    }

    // Legend
    svg += `<text x="50" y="${height-50}" font-family="Arial" font-size="12">Red: Positive connections</text>`;
    svg += `<text x="50" y="${height-30}" font-family="Arial" font-size="12">Black: Negative connections</text>`;
    svg += `<text x="50" y="${height-10}" font-family="Arial" font-size="12">Blue: Series connections</text>`;

    svg += '</svg>';
    return svg;
  }

  static exportManufacturingPackage(layout: PhysicalLayout, battery: BatterySpec, inputs: BatteryPackInputs): void {
    // Create a ZIP file containing all manufacturing files
    const zip = new (require('jszip'))();

    // Add specification JSON
    const spec = generatePackSpec(layout, battery, inputs);
    zip.file(`specs-${layout.configuration.code}.json`, JSON.stringify(spec, null, 2));

    // Add wiring diagram
    const wiringSVG = this.generateWiringDiagramSVG(layout);
    zip.file(`wiring-${layout.configuration.code}.svg`, wiringSVG);

    // Add README with manufacturing instructions
    const readme = this.generateManufacturingREADME(layout, battery, inputs);
    zip.file('README.txt', readme);

    // Generate and add STL files
    const packGeometry = generateBatteryPackGeometry(layout, battery);
    const enclosureGeometry = generateEnclosureGeometry(layout);

    // Note: In a real implementation, you'd need to convert geometries to STL strings
    // For now, we'll create placeholder files
    zip.file(`pack-${layout.configuration.code}.stl`, 'STL file content would go here');
    zip.file(`enclosure-${layout.configuration.code}.stl`, 'STL file content would go here');

    zip.generateAsync({ type: 'blob' }).then((blob: Blob) => {
      const filename = `battery-pack-${layout.configuration.code}-manufacturing.zip`;
      saveAs(blob, filename);
    });
  }

  private static generateManufacturingREADME(layout: PhysicalLayout, battery: BatterySpec, inputs: BatteryPackInputs): string {
    return `
BATTERY PACK MANUFACTURING INSTRUCTIONS
========================================

Configuration: ${layout.configuration.code}
Generated: ${new Date().toISOString()}

CELL SPECIFICATIONS
-------------------
Type: ${battery.name}
Dimensions: ${battery.model_type === 'cylinder' ?
  `${battery.diameter}mm diameter × ${battery.length}mm length` :
  `${battery.width}mm × ${battery.length}mm × ${battery.thickness}mm`
}
Nominal Voltage: ${battery.nominal_voltage}V
Capacity: ${battery.typical_capacity}mAh
Weight: ${battery.weight}g

PACK CONFIGURATION
------------------
Series: ${layout.configuration.series} groups
Parallel: ${layout.configuration.parallel} cells per group
Total Cells: ${layout.configuration.cellsUsed}
Nominal Voltage: ${layout.configuration.nominalVoltage}V
Capacity: ${layout.configuration.capacityAh}Ah
Energy: ${layout.configuration.energyWh}Wh
Total Weight: ${(layout.configuration.weightKg * 1000).toFixed(0)}g

PHYSICAL LAYOUT
---------------
Dimensions: ${layout.totalDimensions.x.toFixed(1)} × ${layout.totalDimensions.y.toFixed(1)} × ${layout.totalDimensions.z.toFixed(1)} mm
Volume: ${layout.volumeCm3.toFixed(1)} cm³
Layout: ${layout.cols} × ${layout.rowsPerLayer} × ${layout.layers}
Packing: ${layout.useHoneycomb ? 'Honeycomb' : 'Rectangular'}

SPACING
-------
Cell Gap: ${inputs.cellGap}mm
Wall Clearance: ${inputs.wallClearance}mm
Nickel Strip Top: ${inputs.nickelStripTop}mm
Nickel Strip Bottom: ${inputs.nickelStripBottom}mm

ASSEMBLY INSTRUCTIONS
---------------------
1. Arrange cells according to the layout specifications
2. Connect parallel groups with nickel strips (0.15mm × 8mm recommended)
3. Connect series groups with nickel strips (0.15mm × 10mm recommended)
4. Apply spot welds at all connection points
5. Test electrical continuity before enclosure
6. Install BMS if required
7. Place in enclosure with proper ventilation

SAFETY NOTES
------------
- Always wear appropriate PPE when working with lithium batteries
- Work in a well-ventilated area
- Have fire suppression equipment available
- Test all connections before final assembly
- Verify voltage and polarity before connecting load

FILES INCLUDED
--------------
- specs-${layout.configuration.code}.json: Complete technical specifications
- wiring-${layout.configuration.code}.svg: Wiring diagram
- pack-${layout.configuration.code}.stl: 3D model for reference
- enclosure-${layout.configuration.code}.stl: Enclosure model

For additional support, contact your battery pack engineer.
`;
  }
}