import { useMemo } from 'react';
import { useSceneStore } from '../../stores';
import { InstancedCells } from './InstancedCells';
import { ConnectionLines } from './ConnectionLines';
import { Components } from './Components';
import { SelectionBox } from './SelectionBox';

export function Scene() {
  const cells = useSceneStore((state) => state.cells);
  const connections = useSceneStore((state) => state.connections);
  const components = useSceneStore((state) => state.components);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);

  // Convert maps to arrays for rendering
  const cellArray = useMemo(() => Array.from(cells.values()), [cells]);
  const connectionArray = useMemo(() => Array.from(connections.values()), [connections]);
  const componentArray = useMemo(() => Array.from(components.values()), [components]);

  return (
    <group>
      {/* Instanced cells for performance */}
      <InstancedCells cells={cellArray} />

      {/* Individual components (BMS, shapes, etc.) */}
      <Components components={componentArray} />

      {/* Connection lines */}
      <ConnectionLines connections={connectionArray} />

      {/* Selection visualization */}
      {selectedUuids.size > 0 && (
        <SelectionBox selectedUuids={Array.from(selectedUuids)} />
      )}
    </group>
  );
}