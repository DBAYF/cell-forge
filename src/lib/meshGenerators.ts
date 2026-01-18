import * as THREE from 'three';

export interface CellGeometryParams {
  diameter?: number;
  length: number;
  width?: number;
  height?: number;
  formFactor: '18650' | '21700' | '26650' | '4680' | 'prismatic' | 'pouch';
}

/**
 * Generate parametric cell geometry based on specifications
 */
export function generateCellGeometry(params: CellGeometryParams): THREE.BufferGeometry {
  const { diameter, length, width, height, formFactor } = params;

  switch (formFactor) {
    case '18650':
    case '21700':
    case '26650':
    case '4680':
      // Cylindrical cell
      if (!diameter) throw new Error('Diameter required for cylindrical cells');
      return new THREE.CylinderGeometry(
        diameter / 2, // radiusTop
        diameter / 2, // radiusBottom
        length, // height
        32 // radialSegments
      );

    case 'prismatic':
      // Rectangular prism cell
      if (!width || !height) throw new Error('Width and height required for prismatic cells');
      return new THREE.BoxGeometry(width, height, length);

    case 'pouch':
      // Flat pouch cell (thin rectangular prism)
      if (!width || !height) throw new Error('Width and height required for pouch cells');
      return new THREE.BoxGeometry(width, height, length * 0.1); // Much thinner

    default:
      throw new Error(`Unsupported form factor: ${formFactor}`);
  }
}

/**
 * Generate terminal geometry for positive/negative terminals
 */
export function generateTerminalGeometry(type: 'positive' | 'negative', size: number = 2): THREE.BufferGeometry {
  if (type === 'positive') {
    // Positive terminal (raised button)
    return new THREE.CylinderGeometry(size / 2, size / 2, size / 2, 16);
  } else {
    // Negative terminal (flat ring)
    const outerRadius = size / 2;
    const innerRadius = size / 3;
    return new THREE.RingGeometry(innerRadius, outerRadius, 16);
  }
}

/**
 * Generate connection wire geometry
 */
export function generateWireGeometry(path: THREE.Vector3[], thickness: number = 1): THREE.BufferGeometry {
  if (path.length < 2) {
    return new THREE.BufferGeometry();
  }

  const curve = new THREE.CatmullRomCurve3(path);
  return new THREE.TubeGeometry(curve, path.length * 4, thickness / 2, 8, false);
}

/**
 * Generate holder geometry using CSG operations
 */
export function generateHolderGeometry(
  cellPositions: THREE.Vector3[],
  cellDiameter: number,
  wallThickness: number,
  baseThickness: number,
  tolerance: number = 0.5
): THREE.BufferGeometry {
  // Create base plate
  const bounds = new THREE.Box3();
  cellPositions.forEach(pos => bounds.expandByPoint(pos));

  const baseGeometry = new THREE.BoxGeometry(
    bounds.max.x - bounds.min.x + wallThickness * 2,
    baseThickness,
    bounds.max.z - bounds.min.z + wallThickness * 2
  );

  // Position base at bottom
  baseGeometry.translate(0, -baseThickness / 2, 0);

  // Create cutouts for cells
  const cutouts: THREE.BufferGeometry[] = [];
  cellPositions.forEach(pos => {
    const cutoutGeometry = new THREE.CylinderGeometry(
      (cellDiameter / 2) + tolerance,
      (cellDiameter / 2) + tolerance,
      baseThickness + 1,
      32
    );
    cutoutGeometry.translate(pos.x, 0, pos.z);
    cutouts.push(cutoutGeometry);
  });

  // For now, return base geometry (CSG operations would be handled by three-bvh-csg)
  // In a full implementation, we'd use CSG to subtract cutouts from base
  return baseGeometry;
}

/**
 * Generate hex grid positions for cell arrangement
 */
export function generateHexGridPositions(
  rows: number,
  cols: number,
  cellDiameter: number,
  spacing: number = 0
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const effectiveRadius = (cellDiameter + spacing) / 2;
  const horizontalSpacing = effectiveRadius * 2;
  const verticalSpacing = effectiveRadius * Math.sqrt(3);

  for (let row = 0; row < rows; row++) {
    const offsetX = (row % 2) * effectiveRadius;

    for (let col = 0; col < cols; col++) {
      positions.push(new THREE.Vector3(
        col * horizontalSpacing + offsetX,
        0,
        row * verticalSpacing
      ));
    }
  }

  return positions;
}

/**
 * Generate rectangular grid positions for cell arrangement
 */
export function generateRectangularGridPositions(
  rows: number,
  cols: number,
  spacingX: number,
  spacingZ: number
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push(new THREE.Vector3(
        col * spacingX,
        0,
        row * spacingZ
      ));
    }
  }

  return positions;
}

/**
 * Create instanced mesh for efficient rendering of many identical cells
 */
export function createInstancedCellMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  count: number
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return mesh;
}

/**
 * Update instanced mesh transforms
 */
export function updateInstancedMeshTransforms(
  mesh: THREE.InstancedMesh,
  transforms: Array<{ position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>
): void {
  const matrix = new THREE.Matrix4();

  transforms.forEach((transform, index) => {
    matrix.makeRotationFromEuler(transform.rotation);
    matrix.setPosition(transform.position);
    matrix.scale(transform.scale);
    mesh.setMatrixAt(index, matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
}