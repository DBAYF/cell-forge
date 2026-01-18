export interface Cell {
  id: number;
  manufacturer: string;
  model: string;
  form_factor: '18650' | '21700' | '26650' | '4680' | 'prismatic' | 'pouch';
  chemistry: 'NMC' | 'NCA' | 'LFP' | 'LTO' | 'LCO';
  nominal_voltage: number;
  max_voltage: number;
  min_voltage: number;
  capacity_mah: number;
  max_discharge_a: number;
  max_charge_a: number;
  internal_res_mohm?: number;
  weight_g: number;
  diameter_mm?: number;
  length_mm: number;
  width_mm?: number;
  height_mm?: number;
  datasheet_url?: string;
  thermal_limit_c?: number;
  cycle_life?: number;
}

export interface Bms {
  id: number;
  manufacturer: string;
  model: string;
  series_count: number;
  max_current_a: number;
  balance_current_ma?: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  pinout_json?: string;
}

export interface Material {
  id: number;
  name: string;
  material_type: 'nickel_strip' | 'copper_strip' | 'busbar' | 'wire';
  thickness_mm?: number;
  width_mm?: number;
  resistance_mohm_per_m: number;
  max_current_a: number;
}

export interface Shape {
  id: number;
  name: string;
  category: 'enclosure' | 'bracket' | 'spacer' | 'vent' | 'terminal';
  file_path: string;
  default_scale: string;
}