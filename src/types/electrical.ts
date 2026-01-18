export interface TopologyNode {
  uuid: string;
  type: 'cell' | 'bms' | 'terminal';
  cellId?: number;
  positiveConnections: string[];
  negativeConnections: string[];
}

export interface TopologyEdge {
  sourceUuid: string;
  targetUuid: string;
  connectionType: 'series' | 'parallel' | 'busbar';
  materialId?: number;
}

export interface TopologyGraph {
  nodes: Map<string, TopologyNode>;
  edges: Map<string, TopologyEdge>;
}

export type ValidationError =
  | { type: 'MIXED_CHEMISTRY'; cells: string[] }
  | { type: 'VOLTAGE_MISMATCH'; cells: string[]; delta: number }
  | { type: 'CAPACITY_MISMATCH'; cells: string[]; delta: number }
  | { type: 'FLOATING_CELL'; cell: string }
  | { type: 'SHORT_CIRCUIT'; path: string[] };

export type ValidationWarning =
  | { type: 'UNBALANCED_PARALLEL'; groups: string[][]; delta: number }
  | { type: 'HIGH_SERIES_COUNT'; count: number; maxRecommended: number }
  | { type: 'THERMAL_CONCERN'; cells: string[] };

export interface TopologyResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];

  // Calculated values
  totalSeriesCells: number;
  totalParallelGroups: number;
  configuration: string; // e.g., "10S4P"
  nominalVoltage: number;
  maxVoltage: number;
  minVoltage: number;
  totalCapacityAh: number;
  totalEnergyWh: number;
  maxDischargeCurrent: number;

  // Graph representation
  graph: TopologyGraph;
}