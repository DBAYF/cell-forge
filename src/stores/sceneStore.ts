import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { CellInstance, Connection, Component, Group, Scene, Vector3, Transform } from '../types/project';

export interface SceneState {
  // Scene data
  cells: Map<string, CellInstance>;
  connections: Map<string, Connection>;
  components: Map<string, Component>;
  groups: Map<string, Group>;

  // Selection
  selectedUuids: Set<string>;
  hoveredUuid: string | null;

  // Actions
  addCell: (cellId: number, position: Vector3) => string;
  removeObjects: (uuids: string[]) => void;
  updateTransform: (uuid: string, transform: Partial<Transform>) => void;
  addConnection: (connection: Omit<Connection, 'uuid'>) => string;
  select: (uuids: string[], mode: 'replace' | 'add' | 'toggle') => void;
  group: (uuids: string[], name: string) => string;
  ungroup: (uuid: string) => void;
  duplicate: (uuids: string[]) => string[];
  clear: () => void;

  // Utilities
  getScene: () => Scene;
  loadScene: (scene: Scene) => void;
}

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      cells: new Map(),
      connections: new Map(),
      components: new Map(),
      groups: new Map(),
      selectedUuids: new Set(),
      hoveredUuid: null,

      // Actions
      addCell: (cellId: number, position: Vector3) => {
        const uuid = crypto.randomUUID();
        const cell: CellInstance = {
          uuid,
          cellId,
          position,
          rotation: [0, 0, 0],
          customLabel: undefined,
          groupId: undefined,
        };

        set((state) => {
          state.cells.set(uuid, cell);
        });

        return uuid;
      },

      removeObjects: (uuids: string[]) => {
        set((state) => {
          // Remove from cells
          uuids.forEach(uuid => {
            state.cells.delete(uuid);
          });

          // Remove from connections
          const connectionsToRemove = new Set<string>();
          state.connections.forEach((connection, uuid) => {
            if (uuids.includes(connection.sourceUuid) || uuids.includes(connection.targetUuid)) {
              connectionsToRemove.add(uuid);
            }
          });
          connectionsToRemove.forEach(uuid => {
            state.connections.delete(uuid);
          });

          // Remove from components
          uuids.forEach(uuid => {
            state.components.delete(uuid);
          });

          // Remove from groups and update group memberships
          uuids.forEach(uuid => {
            state.groups.forEach((group, groupUuid) => {
              const index = group.memberUuids.indexOf(uuid);
              if (index !== -1) {
                group.memberUuids.splice(index, 1);
                if (group.memberUuids.length === 0) {
                  state.groups.delete(groupUuid);
                }
              }
            });
          });

          // Remove from selection
          uuids.forEach(uuid => {
            state.selectedUuids.delete(uuid);
          });
        });
      },

      updateTransform: (uuid: string, transform: Partial<Transform>) => {
        set((state) => {
          // Update cell transform
          const cell = state.cells.get(uuid);
          if (cell) {
            if (transform.position) cell.position = transform.position;
            if (transform.rotation) cell.rotation = transform.rotation;
            if (transform.scale) cell.scale = transform.scale;
            return;
          }

          // Update component transform
          const component = state.components.get(uuid);
          if (component) {
            if (transform.position) component.position = transform.position;
            if (transform.rotation) component.rotation = transform.rotation;
            if (transform.scale) component.scale = transform.scale;
            return;
          }
        });
      },

      addConnection: (connection: Omit<Connection, 'uuid'>) => {
        const uuid = crypto.randomUUID();
        const fullConnection: Connection = {
          uuid,
          ...connection,
        };

        set((state) => {
          state.connections.set(uuid, fullConnection);
        });

        return uuid;
      },

      select: (uuids: string[], mode: 'replace' | 'add' | 'toggle') => {
        set((state) => {
          if (mode === 'replace') {
            state.selectedUuids = new Set(uuids);
          } else if (mode === 'add') {
            uuids.forEach(uuid => state.selectedUuids.add(uuid));
          } else if (mode === 'toggle') {
            uuids.forEach(uuid => {
              if (state.selectedUuids.has(uuid)) {
                state.selectedUuids.delete(uuid);
              } else {
                state.selectedUuids.add(uuid);
              }
            });
          }
        });
      },

      group: (uuids: string[], name: string) => {
        const uuid = crypto.randomUUID();
        const group: Group = {
          uuid,
          name,
          memberUuids: [...uuids],
          color: undefined,
          locked: false,
          visible: true,
        };

        set((state) => {
          state.groups.set(uuid, group);

          // Update group membership
          uuids.forEach(uuid => {
            const cell = state.cells.get(uuid);
            if (cell) {
              cell.groupId = group.uuid;
            }
          });
        });

        return uuid;
      },

      ungroup: (uuid: string) => {
        set((state) => {
          const group = state.groups.get(uuid);
          if (group) {
            // Remove group membership
            group.memberUuids.forEach(memberUuid => {
              const cell = state.cells.get(memberUuid);
              if (cell && cell.groupId === uuid) {
                cell.groupId = undefined;
              }
            });

            // Remove group
            state.groups.delete(uuid);
          }
        });
      },

      duplicate: (uuids: string[]) => {
        const newUuids: string[] = [];

        set((state) => {
          uuids.forEach(uuid => {
            // Duplicate cell
            const cell = state.cells.get(uuid);
            if (cell) {
              const newUuid = crypto.randomUUID();
              const newCell: CellInstance = {
                ...cell,
                uuid: newUuid,
                position: [
                  cell.position[0] + 10,
                  cell.position[1],
                  cell.position[2] + 10,
                ],
                groupId: undefined, // Duplicates are not in groups
              };
              state.cells.set(newUuid, newCell);
              newUuids.push(newUuid);
            }

            // Duplicate component
            const component = state.components.get(uuid);
            if (component) {
              const newUuid = crypto.randomUUID();
              const newComponent: Component = {
                ...component,
                uuid: newUuid,
                position: [
                  component.position[0] + 10,
                  component.position[1],
                  component.position[2] + 10,
                ],
              };
              state.components.set(newUuid, newComponent);
              newUuids.push(newUuid);
            }
          });
        });

        return newUuids;
      },

      clear: () => {
        set((state) => {
          state.cells.clear();
          state.connections.clear();
          state.components.clear();
          state.groups.clear();
          state.selectedUuids.clear();
          state.hoveredUuid = null;
        });
      },

      // Utilities
      getScene: () => {
        const state = get();
        return {
          cells: new Map(state.cells),
          connections: new Map(state.connections),
          components: new Map(state.components),
          groups: new Map(state.groups),
        };
      },

      loadScene: (scene: Scene) => {
        set((state) => {
          state.cells = new Map(scene.cells);
          state.connections = new Map(scene.connections);
          state.components = new Map(scene.components);
          state.groups = new Map(scene.groups);
          state.selectedUuids.clear();
          state.hoveredUuid = null;
        });
      },
    }))
  )
);