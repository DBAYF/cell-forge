import { Vector3, Euler, Transform as GeometryTransform } from './geometry';

export interface CellInstance {
  uuid: string;
  cellId: number; // FK to cells table
  position: Vector3;
  rotation: Euler;
  scale?: Vector3;
  customLabel?: string;
  groupId?: string;
  // Cell properties for UI display (populated from database)
  manufacturer?: string;
  model?: string;
  nominalVoltage?: number;
  capacityMah?: number;
  maxDischargeA?: number;
  chemistry?: string;
}

export interface Connection {
  uuid: string;
  connectionType: 'series' | 'parallel' | 'busbar';
  sourceUuid: string;
  sourceTerminal: 'positive' | 'negative';
  targetUuid: string;
  targetTerminal: 'positive' | 'negative';
  materialId?: number; // FK to materials table
  path?: Vector3[]; // Custom routing points
}

export interface Component {
  uuid: string;
  componentType: 'bms' | 'shape' | 'custom';
  referenceId?: number; // FK to bms or shapes table
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  customMeshPath?: string; // For imported STL/3MF
}

export interface Group {
  uuid: string;
  name: string;
  memberUuids: string[];
  color?: string;
  locked: boolean;
  visible: boolean;
}

export interface Scene {
  cells: Map<string, CellInstance>;
  connections: Map<string, Connection>;
  components: Map<string, Component>;
  groups: Map<string, Group>;
}

export interface Settings {
  units: 'mm' | 'in';
  gridSize: number;
  snapEnabled: boolean;
  hexPackingEnabled: boolean;
}

export interface Camera {
  position: Vector3;
  target: Vector3;
  zoom: number;
}

export interface ProjectMetadata {
  name: string;
  created: string; // ISO 8601
  modified: string;
  author?: string;
}

export interface ProjectFile {
  version: string;
  metadata: ProjectMetadata;
  scene: Scene;
  settings: Settings;
  camera: Camera;
}

export interface STLExportOptions {
  selection: 'all' | 'selected' | 'holders-only' | 'cells-only';
  mergeGeometries: boolean;
  applyTransforms: boolean;
  scale: number; // For unit conversion
  fileName: string;
}

export interface ThreeMFExportOptions {
  selection: 'all' | 'selected';
  includeColors: boolean;
  includeMaterials: boolean;
  separateObjects: boolean; // Each object as component vs merged
  buildPlateOrigin: boolean; // Move to Z=0
  fileName: string;
}

export type ImportableFormat = 'stl' | '3mf' | 'obj' | 'glb' | 'gltf';

export interface ImportResult {
  success: boolean;
  geometry?: any; // THREE.BufferGeometry
  materials?: any[]; // THREE.Material[]
  error?: string;
}

// Re-export geometry types for convenience
export type { Vector3, Euler, Transform } from './geometry';
export type { ArrayConfig, AutoConnectConfig, Measurement } from './geometry';