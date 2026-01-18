import { useEffect } from 'react';
import { useSceneStore } from '../stores/sceneStore';
import { useElectricalStore } from '../stores/electricalStore';

/**
 * Hook that automatically recalculates electrical topology when scene changes
 */
export function useElectricalSolver() {
  const cells = useSceneStore((state) => state.cells);
  const connections = useSceneStore((state) => state.connections);
  const recalculate = useElectricalStore((state) => state.recalculate);

  // Recalculate when cells or connections change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      recalculate();
    }, 100); // Debounce for 100ms

    return () => clearTimeout(timeoutId);
  }, [cells, connections, recalculate]);

  return {
    topology: useElectricalStore((state) => state.topology),
    calculating: useElectricalStore((state) => state.calculating),
    lastCalculated: useElectricalStore((state) => state.lastCalculated),
  };
}