import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { TopologyResult } from '../types/electrical';
import { ElectricalSolver } from '../lib/electricalSolver';
import { useSceneStore } from './sceneStore';

export interface ElectricalState {
  // Current topology result
  topology: TopologyResult | null;

  // Calculation state
  calculating: boolean;
  lastCalculated: number;

  // Actions
  recalculate: () => Promise<void>;
  setTopology: (topology: TopologyResult | null) => void;
  setCalculating: (calculating: boolean) => void;
}

export const useElectricalStore = create<ElectricalState>()(
  subscribeWithSelector(
    immer((set) => ({
      // Initial state
      topology: null,
      calculating: false,
      lastCalculated: 0,

      // Actions
      recalculate: async () => {
        set((state) => {
          state.calculating = true;
        });

        try {
          // Get current scene data
          const sceneState = useSceneStore.getState();
          const cells = sceneState.cells;
          const connections = sceneState.connections;

          // Create and run solver
          const solver = new ElectricalSolver(cells, connections);
          const topology = solver.solve();

          set((state) => {
            state.topology = topology;
            state.calculating = false;
            state.lastCalculated = Date.now();
          });
        } catch (error) {
          console.error('Failed to calculate electrical topology:', error);
          set((state) => {
            state.calculating = false;
          });
        }
      },

      setTopology: (topology) => {
        set((state) => {
          state.topology = topology;
        });
      },

      setCalculating: (calculating) => {
        set((state) => {
          state.calculating = calculating;
        });
      },
    }))
  )
);