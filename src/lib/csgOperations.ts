import * as THREE from 'three';
import { CSG } from 'three-bvh-csg';
import { HolderGenerationConfig } from '../types/geometry';

/**
 * CSG Operations for holder generation
 */
export class CSGOperations {
  /**
   * Generate a battery holder using CSG boolean operations
   */
  static async generateHolder(config: HolderGenerationConfig): Promise<THREE.BufferGeometry> {
    const {
      cellPositions,
      cellDiameter,
      cellLength,
      wallThickness,
      tolerance = 0.5,
      baseThickness,
      ventHoles = false,
      ventHoleDiameter = 3,
    } = config;

    if (cellPositions.length === 0) {
      throw new Error('No cell positions provided');
    }

    // Calculate bounding box
    const bounds = new THREE.Box3();
    cellPositions.forEach(pos => {
      const cellBounds = new THREE.Box3(
        new THREE.Vector3(pos[0] - cellDiameter/2, pos[1] - cellLength/2, pos[2] - cellDiameter/2),
        new THREE.Vector3(pos[0] + cellDiameter/2, pos[1] + cellLength/2, pos[2] + cellDiameter/2)
      );
      bounds.union(cellBounds);
    });

    // Create base plate with walls
    const baseWidth = bounds.max.x - bounds.min.x + wallThickness * 2;
    const baseHeight = bounds.max.z - bounds.min.z + wallThickness * 2;

    const baseGeometry = new THREE.BoxGeometry(
      baseWidth,
      baseThickness,
      baseHeight
    );
    baseGeometry.translate(0, -baseThickness / 2, 0);

    let resultGeometry = baseGeometry;

    // Create cutouts for each cell
    for (const position of cellPositions) {
      const cutoutGeometry = new THREE.CylinderGeometry(
        (cellDiameter / 2) + tolerance,
        (cellDiameter / 2) + tolerance,
        baseThickness + 1, // Extra height to ensure full cut
        32
      );

      // Position the cutout
      cutoutGeometry.translate(position[0], 0, position[2]);

      // Perform boolean subtraction
      resultGeometry = CSG.subtract(resultGeometry, cutoutGeometry);
    }

    // Add vent holes if requested
    if (ventHoles) {
      resultGeometry = this.addVentHoles(resultGeometry, cellPositions, ventHoleDiameter, baseThickness);
    }

    return resultGeometry;
  }

  /**
   * Add vent holes to the holder
   */
  private static addVentHoles(
    baseGeometry: THREE.BufferGeometry,
    cellPositions: THREE.Vector3[],
    ventDiameter: number,
    baseThickness: number
  ): THREE.BufferGeometry {
    let resultGeometry = baseGeometry;

    // Add vent hole for each cell
    for (const position of cellPositions) {
      const ventGeometry = new THREE.CylinderGeometry(
        ventDiameter / 2,
        ventDiameter / 2,
        baseThickness + 1,
        16
      );

      // Position vent hole slightly offset from cell center
      ventGeometry.translate(
        position.x + ventDiameter,
        0,
        position.z + ventDiameter
      );

      resultGeometry = CSG.subtract(resultGeometry, ventGeometry);
    }

    return resultGeometry;
  }

  /**
   * Generate an enclosure using CSG operations
   */
  static async generateEnclosure(
    internalVolume: THREE.Box3,
    wallThickness: number,
    includeLid: boolean = true
  ): Promise<THREE.BufferGeometry> {
    const width = internalVolume.max.x - internalVolume.min.x;
    const height = internalVolume.max.y - internalVolume.min.y;
    const depth = internalVolume.max.z - internalVolume.min.z;

    // Create outer box
    const outerGeometry = new THREE.BoxGeometry(
      width + wallThickness * 2,
      height + wallThickness * 2,
      depth + wallThickness * 2
    );

    // Create inner cutout
    const innerGeometry = new THREE.BoxGeometry(width, height, depth);
    innerGeometry.translate(0, 0, wallThickness); // Offset for lid

    // Subtract inner from outer to create shell
    let enclosureGeometry = CSG.subtract(outerGeometry, innerGeometry);

    // Add lid cutout if requested
    if (includeLid) {
      const lidGeometry = new THREE.BoxGeometry(
        width + wallThickness * 2 + 1,
        wallThickness + 1,
        depth + wallThickness * 2 + 1
      );
      lidGeometry.translate(0, height / 2 + wallThickness / 2, 0);

      enclosureGeometry = CSG.subtract(enclosureGeometry, lidGeometry);
    }

    return enclosureGeometry;
  }

  /**
   * Combine multiple geometries using union
   */
  static union(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geometries.length === 0) {
      throw new Error('No geometries provided for union');
    }

    if (geometries.length === 1) {
      return geometries[0];
    }

    let result = geometries[0];
    for (let i = 1; i < geometries.length; i++) {
      result = CSG.union(result, geometries[i]);
    }

    return result;
  }

  /**
   * Intersect multiple geometries
   */
  static intersect(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geometries.length < 2) {
      throw new Error('At least 2 geometries required for intersection');
    }

    let result = geometries[0];
    for (let i = 1; i < geometries.length; i++) {
      result = CSG.intersect(result, geometries[i]);
    }

    return result;
  }

  /**
   * Create a mounting bracket
   */
  static createBracket(
    length: number,
    width: number,
    thickness: number,
    holeDiameter: number
  ): THREE.BufferGeometry {
    // Create main plate
    const plateGeometry = new THREE.BoxGeometry(length, thickness, width);

    // Create mounting holes
    const holeGeometry = new THREE.CylinderGeometry(
      holeDiameter / 2,
      holeDiameter / 2,
      thickness + 1,
      16
    );

    // Position holes at corners
    const holes: THREE.BufferGeometry[] = [];
    const positions = [
      [-length/3, 0, -width/3],
      [length/3, 0, -width/3],
      [-length/3, 0, width/3],
      [length/3, 0, width/3],
    ];

    positions.forEach(pos => {
      const hole = holeGeometry.clone();
      hole.translate(pos[0], pos[1], pos[2]);
      holes.push(hole);
    });

    // Subtract holes from plate
    let result = plateGeometry;
    holes.forEach(hole => {
      result = CSG.subtract(result, hole);
    });

    return result;
  }

  /**
   * Create a wire routing channel
   */
  static createWireChannel(
    length: number,
    width: number,
    depth: number,
    radius: number
  ): THREE.BufferGeometry {
    // Create channel base
    const baseGeometry = new THREE.BoxGeometry(length, depth, width);
    baseGeometry.translate(0, -depth / 2, 0);

    // Create rounded top using cylinder subtraction
    const topGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      length + 1,
      16
    );
    topGeometry.rotateZ(Math.PI / 2);
    topGeometry.translate(0, radius - depth, 0);

    return CSG.subtract(baseGeometry, topGeometry);
  }
}