import { useMemo } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../stores';

interface SelectionBoxProps {
  selectedUuids: string[];
}

export function SelectionBox({ selectedUuids }: SelectionBoxProps) {
  const cells = useSceneStore((state) => state.cells);
  const components = useSceneStore((state) => state.components);

  const boundingBoxes = useMemo(() => {
    const boxes: Array<{ position: THREE.Vector3; size: THREE.Vector3 }> = [];

    selectedUuids.forEach(uuid => {
      const cell = cells.get(uuid);
      if (cell) {
        // Create bounding box for cell
        // In real implementation, this would be based on actual cell dimensions
        boxes.push({
          position: new THREE.Vector3(...cell.position),
          size: new THREE.Vector3(18, 65, 18), // 18650 dimensions
        });
      }

      const component = components.get(uuid);
      if (component) {
        // Create bounding box for component
        boxes.push({
          position: new THREE.Vector3(...component.position),
          size: new THREE.Vector3(50, 10, 30).multiply(new THREE.Vector3(...component.scale)), // BMS dimensions
        });
      }
    });

    return boxes;
  }, [selectedUuids, cells, components]);

  return (
    <group>
      {boundingBoxes.map((box, index) => (
        <SelectionBoxMesh
          key={`selection-${index}`}
          position={box.position}
          size={box.size}
        />
      ))}
    </group>
  );
}

interface SelectionBoxMeshProps {
  position: THREE.Vector3;
  size: THREE.Vector3;
}

function SelectionBoxMesh({ position, size }: SelectionBoxMeshProps) {
  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(size.x, size.y, size.z);
  }, [size]);

  const edges = useMemo(() => {
    return new THREE.EdgesGeometry(geometry);
  }, [geometry]);

  return (
    <lineSegments geometry={edges} position={position}>
      <lineBasicMaterial color="#3b82f6" linewidth={2} />
    </lineSegments>
  );
}