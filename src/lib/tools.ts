import { ArrayConfig, AutoConnectConfig, Measurement, Vector3, CellInstance, Connection } from '../types/project';
import { generateHexGridPositions, generateRectangularGridPositions } from './meshGenerators';
import * as THREE from 'three';

/**
 * Array Tool - Creates multiple copies of cells in various patterns
 */
export class ArrayTool {
  static createArray(
    sourceCells: CellInstance[],
    config: ArrayConfig
  ): { cells: CellInstance[]; connections?: Connection[] } {
    const result: CellInstance[] = [];
    const connections: Connection[] = [];

    // Generate positions based on pattern
    let threePositions: THREE.Vector3[] = [];

    switch (config.pattern) {
      case 'rectangular':
        threePositions = generateRectangularGridPositions(
          config.rows,
          config.cols,
          config.rowSpacing,
          config.colSpacing
        );
        break;

      case 'hexagonal':
        threePositions = generateHexGridPositions(
          config.rows,
          config.cols,
          config.rowSpacing
        );
        break;

      case 'circular':
        threePositions = this.generateCircularPositions(
          config.count,
          config.radius,
          config.startAngle
        );
        break;
    }

    // Convert THREE.Vector3[] to Vector3[]
    const positions: Vector3[] = threePositions.map(pos => [pos.x, pos.y, pos.z]);

    // Create cells at each position
    let cellIndex = 0;
    for (const position of positions) {
      for (const sourceCell of sourceCells) {
        if (config.includeSource || cellIndex > 0) {
          const newCell: CellInstance = {
            ...sourceCell,
            uuid: crypto.randomUUID(),
            position: [
              sourceCell.position[0] + position[0],
              sourceCell.position[1] + position[1],
              sourceCell.position[2] + position[2],
            ],
            groupId: undefined, // Arrays don't create groups by default
          };
          result.push(newCell);
        }
        cellIndex++;
      }
    }

    // Create connections if requested
    if (config.autoConnect !== 'none') {
      connections.push(...this.createArrayConnections(result, config));
    }

    return { cells: result, connections };
  }

  private static generateCircularPositions(
    count: number,
    radius: number,
    startAngle: number = 0
  ): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i * angleStep);
      positions.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ));
    }

    return positions;
  }

  private static createArrayConnections(
    cells: CellInstance[],
    config: ArrayConfig
  ): Connection[] {
    const connections: Connection[] = [];

    // Simple connection logic - connect adjacent cells
    // This is a simplified version; real implementation would be more sophisticated
    for (let i = 0; i < cells.length - 1; i++) {
      const connection: Connection = {
        uuid: crypto.randomUUID(),
        connectionType: config.autoConnect === 'series' ? 'series' : 'parallel',
        sourceUuid: cells[i].uuid,
        sourceTerminal: 'positive',
        targetUuid: cells[i + 1].uuid,
        targetTerminal: 'negative',
        materialId: undefined,
        path: undefined,
      };
      connections.push(connection);
    }

    return connections;
  }
}

/**
 * Auto-Connect Tool - Automatically creates connections based on proximity
 */
export class AutoConnectTool {
  static autoConnect(
    cells: CellInstance[],
    config: AutoConnectConfig
  ): Connection[] {
    const connections: Connection[] = [];

    // Group cells by proximity
    const proximityGroups = this.groupCellsByProximity(cells, config.maxDistance);

    for (const group of proximityGroups) {
      if (group.length < 2) continue;

      // Connect cells within each group
      const groupConnections = this.connectGroup(group, config);
      connections.push(...groupConnections);
    }

    return connections;
  }

  private static groupCellsByProximity(
    cells: CellInstance[],
    maxDistance: number
  ): CellInstance[][] {
    const groups: CellInstance[][] = [];
    const processed = new Set<string>();

    for (const cell of cells) {
      if (processed.has(cell.uuid)) continue;

      const group: CellInstance[] = [cell];
      processed.add(cell.uuid);

      // Find all cells within range
      for (const otherCell of cells) {
        if (processed.has(otherCell.uuid)) continue;

        const distance = this.calculateDistance(cell.position, otherCell.position);
        if (distance <= maxDistance) {
          group.push(otherCell);
          processed.add(otherCell.uuid);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }

  private static connectGroup(
    group: CellInstance[],
    config: AutoConnectConfig
  ): Connection[] {
    const connections: Connection[] = [];

    if (config.mode === 'series' || config.mode === 'series-first') {
      // Connect in series: cell1+ -> cell2- -> cell3+ -> cell4- etc.
      for (let i = 0; i < group.length - 1; i++) {
        const connection: Connection = {
          uuid: crypto.randomUUID(),
          connectionType: 'series',
          sourceUuid: group[i].uuid,
          sourceTerminal: i % 2 === 0 ? 'positive' : 'negative',
          targetUuid: group[i + 1].uuid,
          targetTerminal: i % 2 === 0 ? 'negative' : 'positive',
          materialId: undefined,
          path: undefined,
        };
        connections.push(connection);
      }
    } else if (config.mode === 'parallel' || config.mode === 'parallel-first') {
      // Connect all positives together and all negatives together
      const positives: string[] = [];
      const negatives: string[] = [];

      group.forEach(cell => {
        positives.push(cell.uuid);
        negatives.push(cell.uuid);
      });

      // Connect all positives to a virtual bus (simplified)
      // In practice, you'd create a bus connection
      for (let i = 0; i < positives.length - 1; i++) {
        const connection: Connection = {
          uuid: crypto.randomUUID(),
          connectionType: 'parallel',
          sourceUuid: positives[i],
          sourceTerminal: 'positive',
          targetUuid: positives[i + 1],
          targetTerminal: 'positive',
          materialId: undefined,
          path: undefined,
        };
        connections.push(connection);
      }

      // Connect all negatives
      for (let i = 0; i < negatives.length - 1; i++) {
        const connection: Connection = {
          uuid: crypto.randomUUID(),
          connectionType: 'parallel',
          sourceUuid: negatives[i],
          sourceTerminal: 'negative',
          targetUuid: negatives[i + 1],
          targetTerminal: 'negative',
          materialId: undefined,
          path: undefined,
        };
        connections.push(connection);
      }
    }

    return connections;
  }

  private static calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Measurement Tool - Creates measurements between points in 3D space
 */
export class MeasurementTool {
  private static measurements: Map<string, Measurement> = new Map();

  static createMeasurement(
    type: Measurement['type'],
    points: Vector3[]
  ): Measurement {
    const id = crypto.randomUUID();

    let value = 0;
    let unit = '';

    switch (type) {
      case 'distance':
        if (points.length >= 2) {
          value = this.calculateDistance(points[0], points[1]);
          unit = 'mm';
        }
        break;

      case 'angle':
        if (points.length >= 3) {
          value = this.calculateAngle(points[0], points[1], points[2]);
          unit = '°';
        }
        break;

      case 'area':
        if (points.length >= 3) {
          value = this.calculateArea(points);
          unit = 'mm²';
        }
        break;

      case 'volume':
        if (points.length >= 4) {
          value = this.calculateVolume(points);
          unit = 'mm³';
        }
        break;
    }

    const displayPosition = this.calculateDisplayPosition(points);

    const measurement: Measurement = {
      type,
      points,
      value,
      unit,
      displayPosition,
    };

    this.measurements.set(id, measurement);
    return measurement;
  }

  static getMeasurements(): Measurement[] {
    return Array.from(this.measurements.values());
  }

  static removeMeasurement(id: string): boolean {
    return this.measurements.delete(id);
  }

  static clearMeasurements(): void {
    this.measurements.clear();
  }

  private static calculateDistance(p1: Vector3, p2: Vector3): number {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    const dz = p1[2] - p2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private static calculateAngle(p1: Vector3, p2: Vector3, p3: Vector3): number {
    // Calculate angle at p2 between points p1, p2, p3
    const v1 = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]];

    const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);

    const cosAngle = dot / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
  }

  private static calculateArea(points: Vector3[]): number {
    if (points.length < 3) return 0;

    // Use shoelace formula for polygon area
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][2];
      area -= points[j][0] * points[i][2];
    }
    return Math.abs(area) / 2;
  }

  private static calculateVolume(points: Vector3[]): number {
    if (points.length < 4) return 0;

    // Simplified volume calculation for tetrahedron
    // In practice, this would be more complex for arbitrary shapes
    const [p1, p2, p3, p4] = points;

    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    const v3 = [p4[0] - p1[0], p4[1] - p1[1], p4[2] - p1[2]];

    // Scalar triple product
    const volume = Math.abs(
      v1[0] * (v2[1] * v3[2] - v2[2] * v3[1]) -
      v1[1] * (v2[0] * v3[2] - v2[2] * v3[0]) +
      v1[2] * (v2[0] * v3[1] - v2[1] * v3[0])
    ) / 6;

    return volume;
  }

  private static calculateDisplayPosition(points: Vector3[]): Vector3 {
    // Calculate centroid of all points
    const sum: Vector3 = [0, 0, 0];
    points.forEach(point => {
      sum[0] += point[0];
      sum[1] += point[1];
      sum[2] += point[2];
    });

    return [
      sum[0] / points.length,
      sum[1] / points.length + 5, // Offset slightly up for visibility
      sum[2] / points.length,
    ];
  }
}