import * as THREE from 'three';
// Note: CSG operations are disabled for web deployment
// import { CSG } from 'three-bvh-csg';
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
      baseThickness,
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

    // Create simple base plate (CSG operations disabled for web deployment)
    const baseWidth = bounds.max.x - bounds.min.x + wallThickness * 2;
    const baseHeight = bounds.max.z - bounds.min.z + wallThickness * 2;

    const baseGeometry = new THREE.BoxGeometry(
      baseWidth,
      baseThickness,
      baseHeight
    );
    baseGeometry.translate(0, -baseThickness / 2, 0);

    // For web deployment, just return the base plate
    console.warn('CSG operations disabled in web deployment - returning base plate only');
    return baseGeometry;
  }

  /**
   * Add vent holes to the holder (disabled for web deployment)
   */
  private static addVentHoles(
    baseGeometry: THREE.BufferGeometry,
    _cellPositions: THREE.Vector3[],
    _ventDiameter: number,
    _baseThickness: number
  ): THREE.BufferGeometry {
    // CSG operations disabled for web deployment
    return baseGeometry;
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

    // CSG operations disabled for web deployment - return first geometry
    console.warn('CSG union disabled in web deployment');
    return geometries[0];
  }

  /**
   * Intersect multiple geometries
   */
  static intersect(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geometries.length < 2) {
      throw new Error('At least 2 geometries required for intersection');
    }

    // CSG operations disabled for web deployment - return first geometry
    console.warn('CSG intersect disabled in web deployment');
    return geometries[0];
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