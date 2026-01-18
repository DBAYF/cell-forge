import { invoke } from '@tauri-apps/api/core';
import { ProjectFile, ProjectMetadata, Scene, Settings, Camera } from '../types/project';
import { useSceneStore } from '../stores/sceneStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Project management utilities for save/load operations
 */
export class ProjectManager {
  private static autosaveInterval: NodeJS.Timeout | null = null;
  private static readonly AUTOSAVE_INTERVAL = 60000; // 1 minute

  /**
   * Create a new project
   */
  static async createNewProject(name: string): Promise<ProjectFile> {
    try {
      const project = await invoke('create_new_project', { name }) as ProjectFile;
      return project;
    } catch (error) {
      console.error('Failed to create new project:', error);
      throw error;
    }
  }

  /**
   * Save project to file
   */
  static async saveProject(project: ProjectFile, path: string): Promise<void> {
    try {
      await invoke('save_project', { project, path });
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  /**
   * Load project from file
   */
  static async loadProject(path: string): Promise<ProjectFile> {
    try {
      const project = await invoke('load_project', { path }) as ProjectFile;
      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  }

  /**
   * Export data using Tauri backend
   */
  static async exportSTL(data: Uint8Array, path: string): Promise<void> {
    try {
      await invoke('export_stl', { data, path });
    } catch (error) {
      console.error('Failed to export STL:', error);
      throw error;
    }
  }

  static async exportThreeMF(data: Uint8Array, path: string): Promise<void> {
    try {
      await invoke('export_three_mf', { data, path });
    } catch (error) {
      console.error('Failed to export 3MF:', error);
      throw error;
    }
  }

  /**
   * Import mesh file
   */
  static async importMesh(path: string): Promise<Uint8Array> {
    try {
      const data = await invoke('import_mesh', { path }) as number[];
      return new Uint8Array(data);
    } catch (error) {
      console.error('Failed to import mesh:', error);
      throw error;
    }
  }

  /**
   * Get current project state from stores
   */
  static getCurrentProject(): ProjectFile {
    const scene = useSceneStore.getState().getScene();
    const uiState = useUIStore.getState();

    // Convert scene to serializable format
    const serializableScene: Scene = {
      cells: scene.cells,
      connections: scene.connections,
      components: scene.components,
      groups: scene.groups,
    };

    const now = new Date().toISOString();

    return {
      version: '1.0.0',
      metadata: {
        name: 'Current Project', // TODO: Get from project store
        created: now, // TODO: Get actual creation date
        modified: now,
        author: undefined,
      },
      scene: serializableScene,
      settings: {
        units: 'mm',
        gridSize: uiState.gridSize,
        snapEnabled: uiState.snapEnabled,
        hexPackingEnabled: false,
      },
      camera: {
        position: [0, 0, 0], // TODO: Get from camera store
        target: [0, 0, 0],
        zoom: 1,
      },
    };
  }

  /**
   * Load project into stores
   */
  static loadProjectIntoStores(project: ProjectFile): void {
    // Load scene
    useSceneStore.getState().loadScene(project.scene);

    // Load settings
    const uiStore = useUIStore.getState();
    uiStore.setGridSize(project.settings.gridSize);
    uiStore.setSnapEnabled(project.settings.snapEnabled);
  }

  /**
   * Start auto-save functionality
   */
  static startAutosave(): void {
    if (this.autosaveInterval) {
      this.stopAutosave();
    }

    this.autosaveInterval = setInterval(async () => {
      try {
        const project = this.getCurrentProject();
        // Save to autosave location (would be handled by Tauri)
        console.log('Auto-saving project...');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.AUTOSAVE_INTERVAL);
  }

  /**
   * Stop auto-save functionality
   */
  static stopAutosave(): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  /**
   * Check if project has unsaved changes
   */
  static hasUnsavedChanges(): boolean {
    // TODO: Implement change tracking
    return false;
  }

  /**
   * Validate project file
   */
  static validateProject(project: any): project is ProjectFile {
    return (
      project &&
      typeof project.version === 'string' &&
      project.metadata &&
      typeof project.metadata.name === 'string' &&
      project.scene &&
      project.settings &&
      project.camera
    );
  }

  /**
   * Get project file extension
   */
  static getProjectExtension(): string {
    return '.cellforge';
  }

  /**
   * Get supported export formats
   */
  static getSupportedExportFormats(): Array<{ extension: string; name: string }> {
    return [
      { extension: '.stl', name: 'STL (Binary)' },
      { extension: '.3mf', name: '3MF (3D Manufacturing Format)' },
    ];
  }
}