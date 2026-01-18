import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { TopologyResult } from '../types/electrical';

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
    immer((set, get) => ({
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
          // TODO: Implement electrical topology calculation
          // This will be implemented in the electrical solver module
          const topology: TopologyResult = {
            isValid: true,
            errors: [],
            warnings: [],
            totalSeriesCells: 0,
            totalParallelGroups: 0,
            configuration: '0S0P',
            nominalVoltage: 0,
            maxVoltage: 0,
            minVoltage: 0,
            totalCapacityAh: 0,
            totalEnergyWh: 0,
            maxDischargeCurrent: 0,
            graph: {
              nodes: new Map(),
              edges: new Map(),
            },
          };

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