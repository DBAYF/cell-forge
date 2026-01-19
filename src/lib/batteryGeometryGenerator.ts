import { PhysicalLayout, CellPosition } from './batteryConfigAlgorithm';
import { BatterySpec } from './batteryDatabase';
import * as THREE from 'three';

export interface BatteryPackGeometry {
  group: THREE.Group;
  boundingBox: THREE.Box3;
  cellMeshes: THREE.Mesh[];
  metadata: {
    layout: PhysicalLayout;
    battery: BatterySpec;
    cellCount: number;
    configuration: string;
  };
}

export function generateBatteryPackGeometry(layout: PhysicalLayout, battery: BatterySpec): BatteryPackGeometry {
  const group = new THREE.Group();
  const cellMeshes: THREE.Mesh[] = [];
  const boundingBox = new THREE.Box3();

  // Generate individual cell geometries
  layout.cellPositions.forEach((position, index) => {
    const cellMesh = generateCellGeometry(battery, position);
    cellMeshes.push(cellMesh);
    group.add(cellMesh);

    // Update bounding box
    boundingBox.expandByObject(cellMesh);
  });

  // Center the pack at origin
  const center = boundingBox.getCenter(new THREE.Vector3());
  group.position.sub(center);

  // Update bounding box after centering
  boundingBox.makeEmpty();
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      boundingBox.expandByObject(child);
    }
  });

  return {
    group,
    boundingBox,
    cellMeshes,
    metadata: {
      layout,
      battery,
      cellCount: layout.cellPositions.length,
      configuration: layout.configuration.code
    }
  };
}

function generateCellGeometry(battery: BatterySpec, position: CellPosition): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  let material: THREE.MeshStandardMaterial;

  // Color code by series position
  const hue = (position.seriesPosition / Math.max(position.seriesPosition + 1, 1)) * 0.7;
  const color = new THREE.Color().setHSL(hue, 0.7, 0.5);

  if (battery.model_type === 'cylinder') {
    geometry = new THREE.CylinderGeometry(
      battery.diameter! / 2,
      battery.diameter! / 2,
      battery.length!,
      24,
      1
    );

    material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.8
    });

    // Add positive terminal bump
    const terminalGeometry = new THREE.CylinderGeometry(
      battery.diameter! / 4,
      battery.diameter! / 4,
      1.5,
      16,
      1
    );
    const terminalMaterial = new THREE.MeshStandardMaterial({
      color: position.polarityUp ? 0xff4444 : 0x4444ff,
      metalness: 0.9,
      roughness: 0.1
    });
    const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal.position.z = position.polarityUp ? battery.length! / 2 + 0.75 : -battery.length! / 2 - 0.75;

    const cellMesh = new THREE.Mesh(geometry, material);
    cellMesh.add(terminal);

    // Position the cell
    cellMesh.position.set(position.x, position.y, position.z);

    return cellMesh;
  } else {
    // Box cell
    geometry = new THREE.BoxGeometry(
      battery.width!,
      battery.length!,
      battery.thickness!
    );

    material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.8
    });

    // Add terminal tabs
    const tabGeometry = new THREE.BoxGeometry(10, 5, 0.5);
    const tabMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2
    });
    const tab = new THREE.Mesh(tabGeometry, tabMaterial);
    tab.position.set(0, battery.length! / 2 - 5, battery.thickness! / 2 + 0.25);

    const cellMesh = new THREE.Mesh(geometry, material);
    cellMesh.add(tab);

    // Position the cell
    cellMesh.position.set(position.x, position.y, position.z);

    return cellMesh;
  }
}

export function generateEnclosureGeometry(layout: PhysicalLayout): THREE.Group {
  const group = new THREE.Group();
  const wallThickness = 2.0; // mm

  const outerDimensions = {
    x: layout.totalDimensions.x + (2 * wallThickness),
    y: layout.totalDimensions.y + (2 * wallThickness),
    z: layout.totalDimensions.z + wallThickness // Open top
  };

  // Create outer box
  const outerGeometry = new THREE.BoxGeometry(
    outerDimensions.x,
    outerDimensions.y,
    outerDimensions.z
  );
  const enclosureMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });
  const enclosure = new THREE.Mesh(outerGeometry, enclosureMaterial);
  group.add(enclosure);

  // Add mounting holes
  const mountHolePositions = [
    { x: -outerDimensions.x / 2 + 5, y: -outerDimensions.y / 2 + 5 },
    { x: outerDimensions.x / 2 - 5, y: -outerDimensions.y / 2 + 5 },
    { x: -outerDimensions.x / 2 + 5, y: outerDimensions.y / 2 - 5 },
    { x: outerDimensions.x / 2 - 5, y: outerDimensions.y / 2 - 5 }
  ];

  mountHolePositions.forEach(pos => {
    const holeGeometry = new THREE.CylinderGeometry(1.5, 1.5, wallThickness + 2, 16);
    const hole = new THREE.Mesh(holeGeometry, new THREE.MeshStandardMaterial({ color: 0x333333 }));
    hole.position.set(pos.x, pos.y, -1);
    hole.rotateX(Math.PI / 2);
    group.add(hole);
  });

  // Add wire exit hole
  const wireHoleGeometry = new THREE.CylinderGeometry(5, 5, wallThickness + 2, 16);
  const wireHole = new THREE.Mesh(wireHoleGeometry, new THREE.MeshStandardMaterial({ color: 0x333333 }));
  wireHole.position.set(0, outerDimensions.y / 2, outerDimensions.z / 2);
  wireHole.rotateZ(Math.PI / 2);
  group.add(wireHole);

  return group;
}

export function generateWiringGeometry(layout: PhysicalLayout, battery: BatterySpec): THREE.Group {
  const group = new THREE.Group();

  // Parallel connections within each series group
  for (let seriesPos = 0; seriesPos < layout.configuration.series; seriesPos++) {
    const cellsInGroup = layout.cellPositions.filter(c => c.seriesPosition === seriesPos);

    for (let i = 0; i < cellsInGroup.length - 1; i++) {
      const cellA = cellsInGroup[i];
      const cellB = cellsInGroup[i + 1];

      // Positive terminal connection
      const positivePoints = [
        new THREE.Vector3(
          cellA.x,
          cellA.y,
          cellA.z + (cellA.polarityUp ? battery.length! / 2 : -battery.length! / 2)
        ),
        new THREE.Vector3(
          cellB.x,
          cellB.y,
          cellB.z + (cellB.polarityUp ? battery.length! / 2 : -battery.length! / 2)
        )
      ];

      const positiveGeometry = new THREE.BufferGeometry().setFromPoints(positivePoints);
      const positiveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
      const positiveLine = new THREE.Line(positiveGeometry, positiveMaterial);
      group.add(positiveLine);

      // Negative terminal connection
      const negativePoints = [
        new THREE.Vector3(
          cellA.x,
          cellA.y,
          cellA.z + (cellA.polarityUp ? -battery.length! / 2 : battery.length! / 2)
        ),
        new THREE.Vector3(
          cellB.x,
          cellB.y,
          cellB.z + (cellB.polarityUp ? -battery.length! / 2 : battery.length! / 2)
        )
      ];

      const negativeGeometry = new THREE.BufferGeometry().setFromPoints(negativePoints);
      const negativeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const negativeLine = new THREE.Line(negativeGeometry, negativeMaterial);
      group.add(negativeLine);
    }
  }

  // Series connections between groups
  for (let seriesPos = 0; seriesPos < layout.configuration.series - 1; seriesPos++) {
    const currentGroup = layout.cellPositions.filter(c => c.seriesPosition === seriesPos);
    const nextGroup = layout.cellPositions.filter(c => c.seriesPosition === seriesPos + 1);

    if (currentGroup.length > 0 && nextGroup.length > 0) {
      const currentCell = currentGroup[0];
      const nextCell = nextGroup[0];

      const seriesPoints = [
        new THREE.Vector3(
          currentCell.x,
          currentCell.y,
          currentCell.z + (currentCell.polarityUp ? -battery.length! / 2 : battery.length! / 2)
        ),
        new THREE.Vector3(
          nextCell.x,
          nextCell.y,
          nextCell.z + (nextCell.polarityUp ? battery.length! / 2 : -battery.length! / 2)
        )
      ];

      const seriesGeometry = new THREE.BufferGeometry().setFromPoints(seriesPoints);
      const seriesMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
      const seriesLine = new THREE.Line(seriesGeometry, seriesMaterial);
      group.add(seriesLine);
    }
  }

  return group;
}

export function createPackObject3D(packGeometry: BatteryPackGeometry): THREE.Object3D {
  const object3D = new THREE.Object3D();
  object3D.name = `Battery_Pack_${packGeometry.metadata.configuration}`;
  object3D.userData = {
    type: 'battery-pack',
    batteryPackData: packGeometry.metadata,
    boundingBox: packGeometry.boundingBox
  };

  // Add the pack geometry
  object3D.add(packGeometry.group.clone());

  return object3D;
}

export function createEnclosureObject3D(layout: PhysicalLayout): THREE.Object3D {
  const object3D = new THREE.Object3D();
  object3D.name = `Battery_Pack_Enclosure`;

  const enclosureGeometry = generateEnclosureGeometry(layout);
  object3D.add(enclosureGeometry);

  object3D.userData = {
    type: 'battery-enclosure',
    layout: layout
  };

  return object3D;
}