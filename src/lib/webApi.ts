// Web-compatible API layer that mocks Tauri IPC calls for web deployment
import { Cell, Material, Shape } from '../types/cell';

// Mock data for web deployment
const mockCells: Cell[] = [
  {
    id: 1,
    manufacturer: 'Samsung',
    model: '30Q',
    form_factor: '18650',
    chemistry: 'NMC',
    nominal_voltage: 3.6,
    max_voltage: 4.2,
    min_voltage: 2.5,
    capacity_mah: 3000,
    max_discharge_a: 15,
    max_charge_a: 4,
    internal_res_mohm: 20,
    weight_g: 48,
    diameter_mm: 18.3,
    length_mm: 65.2,
  },
  {
    id: 2,
    manufacturer: 'LG',
    model: 'HG2',
    form_factor: '18650',
    chemistry: 'NMC',
    nominal_voltage: 3.6,
    max_voltage: 4.2,
    min_voltage: 2.5,
    capacity_mah: 3000,
    max_discharge_a: 20,
    max_charge_a: 4,
    internal_res_mohm: 18,
    weight_g: 48,
    diameter_mm: 18.3,
    length_mm: 65.2,
  },
  {
    id: 3,
    manufacturer: 'Molicel',
    model: 'P42A',
    form_factor: '21700',
    chemistry: 'NMC',
    nominal_voltage: 3.6,
    max_voltage: 4.2,
    min_voltage: 2.5,
    capacity_mah: 4200,
    max_discharge_a: 45,
    max_charge_a: 6,
    internal_res_mohm: 10,
    weight_g: 70,
    diameter_mm: 21.1,
    length_mm: 70.2,
  },
];

const mockMaterials: Material[] = [
  {
    id: 1,
    name: 'Pure Nickel 0.15x8mm',
    material_type: 'nickel_strip',
    thickness_mm: 0.15,
    width_mm: 8.0,
    resistance_mohm_per_m: 70.0,
    max_current_a: 15.0,
  },
  {
    id: 2,
    name: 'Pure Nickel 0.2x10mm',
    material_type: 'nickel_strip',
    thickness_mm: 0.2,
    width_mm: 10.0,
    resistance_mohm_per_m: 50.0,
    max_current_a: 25.0,
  },
];

const mockShapes: Shape[] = [
  {
    id: 1,
    name: 'Box Enclosure',
    category: 'enclosure',
    file_path: 'shapes/enclosure_box.glb',
    default_scale: '1,1,1',
  },
  {
    id: 2,
    name: 'L Bracket',
    category: 'bracket',
    file_path: 'shapes/bracket_l.glb',
    default_scale: '1,1,1',
  },
];

// Web-compatible API functions
export const webApi = {
  getCells: async (search?: string): Promise<Cell[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (search) {
      const searchLower = search.toLowerCase();
      return mockCells.filter(cell =>
        cell.manufacturer.toLowerCase().includes(searchLower) ||
        cell.model.toLowerCase().includes(searchLower) ||
        cell.form_factor.toLowerCase().includes(searchLower) ||
        cell.chemistry.toLowerCase().includes(searchLower)
      );
    }

    return mockCells;
  },

  getCellById: async (id: number): Promise<Cell | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockCells.find(cell => cell.id === id) || null;
  },

  getMaterials: async (): Promise<Material[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockMaterials;
  },

  getShapes: async (): Promise<Shape[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockShapes;
  },

  saveProject: async (project: any, path: string): Promise<void> => {
    // In web version, save to localStorage
    localStorage.setItem('cellforge_project', JSON.stringify(project));
    console.log('Project saved to localStorage');
  },

  loadProject: async (path: string): Promise<any> => {
    // In web version, load from localStorage
    const data = localStorage.getItem('cellforge_project');
    if (data) {
      return JSON.parse(data);
    }
    throw new Error('No saved project found');
  },

  createNewProject: async (name: string): Promise<any> => {
    return {
      version: '1.0.0',
      metadata: {
        name,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: null,
      },
      scene: {
        cells: new Map(),
        connections: new Map(),
        components: new Map(),
        groups: new Map(),
      },
      settings: {
        units: 'mm',
        gridSize: 10,
        snapEnabled: true,
        hexPackingEnabled: false,
      },
      camera: {
        position: [100, 100, 100],
        target: [0, 0, 0],
        zoom: 1,
      },
    };
  },

  exportSTL: async (data: Uint8Array, path: string): Promise<void> => {
    // In web version, trigger download
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'export.stl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportThreeMF: async (data: Uint8Array, path: string): Promise<void> => {
    // Similar to STL export
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'export.3mf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importMesh: async (path: string): Promise<Uint8Array> => {
    // In web version, this would need file input
    throw new Error('File import not supported in web version');
  },
};

// Check if we're running in Tauri or web
export const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;

// For web builds, always use web fallback
const invoke: any = null;

// Unified API that uses Tauri when available, web API otherwise
export const api = {
  getCells: async (search?: string) => {
    if (invoke) {
      try {
        return await invoke('get_cells', { search: search || null });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.getCells(search);
  },

  getCellById: async (id: number) => {
    if (invoke) {
      try {
        return await invoke('get_cell_by_id', { id });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.getCellById(id);
  },

  getMaterials: async () => {
    if (invoke) {
      try {
        return await invoke('get_materials');
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.getMaterials();
  },

  getShapes: async () => {
    if (invoke) {
      try {
        return await invoke('get_shapes');
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.getShapes();
  },

  saveProject: async (project: any, path: string) => {
    if (invoke) {
      try {
        return await invoke('save_project', { project, path });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.saveProject(project, path);
  },

  loadProject: async (path: string) => {
    if (invoke) {
      try {
        return await invoke('load_project', { path });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.loadProject(path);
  },

  createNewProject: async (name: string) => {
    if (invoke) {
      try {
        return await invoke('create_new_project', { name });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.createNewProject(name);
  },

  exportSTL: async (data: Uint8Array, path: string) => {
    if (invoke) {
      try {
        return await invoke('export_stl', { data, path });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.exportSTL(data, path);
  },

  exportThreeMF: async (data: Uint8Array, path: string) => {
    if (invoke) {
      try {
        return await invoke('export_three_mf', { data, path });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.exportThreeMF(data, path);
  },

  importMesh: async (path: string) => {
    if (invoke) {
      try {
        return await invoke('import_mesh', { path });
      } catch (e) {
        console.warn('Tauri API failed, using web fallback');
      }
    }
    return webApi.importMesh(path);
  },
};