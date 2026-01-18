export type Vector3 = [number, number, number];
export type Euler = [number, number, number]; // XYZ radians
export type Quaternion = [number, number, number, number];
export type Matrix4 = Float32Array; // 16 elements, column-major

export interface Transform {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface BoundingSphere {
  center: Vector3;
  radius: number;
}

export type Color = string; // Hex format: "#RRGGBB" or "#RRGGBBAA"
export type RGB = [number, number, number]; // 0-1 range
export type RGBA = [number, number, number, number];

export type UUID = string; // crypto.randomUUID() format
export type DatabaseId = number; // SQLite rowid

export interface ArrayConfig {
  pattern: 'rectangular' | 'hexagonal' | 'circular';
  // Rectangular/Hex
  rows: number;
  cols: number;
  rowSpacing: number;
  colSpacing: number;
  // Circular
  radius: number;
  count: number;
  startAngle: number;
  // Common
  includeSource: boolean;
  autoConnect: 'none' | 'series' | 'parallel';
}

export interface AutoConnectConfig {
  mode: 'series' | 'parallel' | 'series-first' | 'parallel-first';
  maxDistance: number; // mm - max gap between terminals
  respectGroups: boolean; // Only connect within groups
  skipExisting: boolean; // Don't duplicate connections
}

export interface Measurement {
  type: 'distance' | 'angle' | 'area' | 'volume';
  points: Vector3[];
  value: number;
  unit: string;
  displayPosition: Vector3;
}

export interface HexGridConfig {
  cellDiameter: number;
  padding: number; // Gap between cells
  rows: number;
  cols: number;
  pattern: 'pointy' | 'flat'; // Hex orientation
  stagger: 'odd' | 'even'; // Which rows offset
}

export interface HolderGenerationConfig {
  cellPositions: Vector3[];
  cellDiameter: number;
  cellLength: number;
  wallThickness: number;
  tolerance: number; // Clearance around cells
  baseThickness: number;
  ventHoles: boolean;
  ventHoleDiameter: number;
}

export interface ArrayConfig {
  pattern: 'rectangular' | 'hexagonal' | 'circular';
  // Rectangular/Hex
  rows: number;
  cols: number;
  rowSpacing: number;
  colSpacing: number;
  // Circular
  radius: number;
  count: number;
  startAngle: number;
  // Common
  includeSource: boolean;
  autoConnect: 'none' | 'series' | 'parallel';
}

export interface AutoConnectConfig {
  mode: 'series' | 'parallel' | 'series-first' | 'parallel-first';
  maxDistance: number; // mm - max gap between terminals
  respectGroups: boolean; // Only connect within groups
  skipExisting: boolean; // Don't duplicate connections
}

export interface Measurement {
  type: 'distance' | 'angle' | 'area' | 'volume';
  points: Vector3[];
  value: number;
  unit: string;
  displayPosition: Vector3;
}