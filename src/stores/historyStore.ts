import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { Scene } from '../types/project';

export interface SceneSnapshot {
  timestamp: number;
  label?: string;
  scene: Scene;
}

export interface HistoryState {
  // History stacks
  past: SceneSnapshot[];
  future: SceneSnapshot[];

  // Computed properties
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  undo: () => Scene | null;
  redo: () => Scene | null;
  checkpoint: (label?: string) => void;
  clear: () => void;

  // Internal actions
  _pushSnapshot: (snapshot: SceneSnapshot) => void;
  _getCurrentScene: () => Scene;
}

export const useHistoryStore = create<HistoryState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      past: [],
      future: [],

      // Computed properties
      get canUndo() {
        return get().past.length > 0;
      },

      get canRedo() {
        return get().future.length > 0;
      },

      // Actions
      undo: () => {
        const state = get();
        if (state.past.length === 0) {
          return null;
        }

        const currentSnapshot = state.past[state.past.length - 1];
        const restoredScene = currentSnapshot.scene;

        set((state) => {
          // Move current snapshot to future
          state.future.unshift(currentSnapshot);
          // Remove from past
          state.past.pop();
        });

        return restoredScene;
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) {
          return null;
        }

        const nextSnapshot = state.future[0];
        const restoredScene = nextSnapshot.scene;

        set((state) => {
          // Move next snapshot to past
          state.past.push(nextSnapshot);
          // Remove from future
          state.future.shift();
        });

        return restoredScene;
      },

      checkpoint: (label) => {
        const state = get();
        const currentScene = state._getCurrentScene();

        const snapshot: SceneSnapshot = {
          timestamp: Date.now(),
          label,
          scene: {
            cells: new Map(currentScene.cells),
            connections: new Map(currentScene.connections),
            components: new Map(currentScene.components),
            groups: new Map(currentScene.groups),
          },
        };

        set((state) => {
          state._pushSnapshot(snapshot);
        });
      },

      clear: () => {
        set((state) => {
          state.past = [];
          state.future = [];
        });
      },

      // Internal actions
      _pushSnapshot: (snapshot) => {
        set((state) => {
          // Add to past
          state.past.push(snapshot);

          // Clear future when making new changes
          state.future = [];

          // Limit history size to prevent memory issues
          const MAX_HISTORY_SIZE = 50;
          if (state.past.length > MAX_HISTORY_SIZE) {
            state.past.shift();
          }
        });
      },

      _getCurrentScene: () => {
        // This should be injected from the scene store
        // For now, return empty scene
        return {
          cells: new Map(),
          connections: new Map(),
          components: new Map(),
          groups: new Map(),
        };
      },
    }))
  )
);