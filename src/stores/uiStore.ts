import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export interface UIState {
  // Active tool
  activeTool: 'select' | 'add' | 'connect' | 'measure' | 'transform';
  transformMode: 'translate' | 'rotate' | 'scale';

  // View options
  snapEnabled: boolean;
  snapIncrement: number;
  gridVisible: boolean;
  gridSize: number;

  // Panel states
  sidebarWidth: number;
  propertiesWidth: number;
  libraryTab: 'cells' | 'bms' | 'shapes' | 'materials';
  librarySearch: string;
  outlinerExpanded: Set<string>;

  // Modal states
  showNewProjectDialog: boolean;
  showOpenProjectDialog: boolean;
  showSaveAsDialog: boolean;
  showExportDialog: boolean;
  showPreferencesDialog: boolean;
  showAboutDialog: boolean;

  // Actions
  setActiveTool: (tool: UIState['activeTool']) => void;
  setTransformMode: (mode: UIState['transformMode']) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapIncrement: (increment: number) => void;
  setGridVisible: (visible: boolean) => void;
  setGridSize: (size: number) => void;
  setSidebarWidth: (width: number) => void;
  setPropertiesWidth: (width: number) => void;
  setLibraryTab: (tab: UIState['libraryTab']) => void;
  setLibrarySearch: (search: string) => void;
  toggleOutlinerExpanded: (uuid: string) => void;

  // Modal actions
  openNewProjectDialog: () => void;
  closeNewProjectDialog: () => void;
  openOpenProjectDialog: () => void;
  closeOpenProjectDialog: () => void;
  openSaveAsDialog: () => void;
  closeSaveAsDialog: () => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openPreferencesDialog: () => void;
  closePreferencesDialog: () => void;
  openAboutDialog: () => void;
  closeAboutDialog: () => void;
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector(
    immer((set) => ({
      // Initial state
      activeTool: 'select',
      transformMode: 'translate',
      snapEnabled: true,
      snapIncrement: 1.0,
      gridVisible: true,
      gridSize: 10.0,
      sidebarWidth: 300,
      propertiesWidth: 280,
      libraryTab: 'cells',
      librarySearch: '',
      outlinerExpanded: new Set(),

      showNewProjectDialog: false,
      showOpenProjectDialog: false,
      showSaveAsDialog: false,
      showExportDialog: false,
      showPreferencesDialog: false,
      showAboutDialog: false,

      // Actions
      setActiveTool: (tool) => {
        set((state) => {
          state.activeTool = tool;
        });
      },

      setTransformMode: (mode) => {
        set((state) => {
          state.transformMode = mode;
        });
      },

      setSnapEnabled: (enabled) => {
        set((state) => {
          state.snapEnabled = enabled;
        });
      },

      setSnapIncrement: (increment) => {
        set((state) => {
          state.snapIncrement = increment;
        });
      },

      setGridVisible: (visible) => {
        set((state) => {
          state.gridVisible = visible;
        });
      },

      setGridSize: (size) => {
        set((state) => {
          state.gridSize = size;
        });
      },

      setSidebarWidth: (width) => {
        set((state) => {
          state.sidebarWidth = width;
        });
      },

      setPropertiesWidth: (width) => {
        set((state) => {
          state.propertiesWidth = width;
        });
      },

      setLibraryTab: (tab) => {
        set((state) => {
          state.libraryTab = tab;
        });
      },

      setLibrarySearch: (search) => {
        set((state) => {
          state.librarySearch = search;
        });
      },

      toggleOutlinerExpanded: (uuid) => {
        set((state) => {
          if (state.outlinerExpanded.has(uuid)) {
            state.outlinerExpanded.delete(uuid);
          } else {
            state.outlinerExpanded.add(uuid);
          }
        });
      },

      // Modal actions
      openNewProjectDialog: () => {
        set((state) => {
          state.showNewProjectDialog = true;
        });
      },

      closeNewProjectDialog: () => {
        set((state) => {
          state.showNewProjectDialog = false;
        });
      },

      openOpenProjectDialog: () => {
        set((state) => {
          state.showOpenProjectDialog = true;
        });
      },

      closeOpenProjectDialog: () => {
        set((state) => {
          state.showOpenProjectDialog = false;
        });
      },

      openSaveAsDialog: () => {
        set((state) => {
          state.showSaveAsDialog = true;
        });
      },

      closeSaveAsDialog: () => {
        set((state) => {
          state.showSaveAsDialog = false;
        });
      },

      openExportDialog: () => {
        set((state) => {
          state.showExportDialog = true;
        });
      },

      closeExportDialog: () => {
        set((state) => {
          state.showExportDialog = false;
        });
      },

      openPreferencesDialog: () => {
        set((state) => {
          state.showPreferencesDialog = true;
        });
      },

      closePreferencesDialog: () => {
        set((state) => {
          state.showPreferencesDialog = false;
        });
      },

      openAboutDialog: () => {
        set((state) => {
          state.showAboutDialog = true;
        });
      },

      closeAboutDialog: () => {
        set((state) => {
          state.showAboutDialog = false;
        });
      },
    }))
  )
);