export interface BatterySpec {
  name: string;
  diameter?: number; // For cylindrical cells
  length?: number; // For cylindrical cells (height)
  width?: number; // For box cells
  thickness?: number; // For box cells
  nominal_voltage: number;
  max_voltage: number;
  min_voltage: number;
  typical_capacity: number; // mAh
  weight: number; // grams
  model_type: 'cylinder' | 'box';
}

export const BATTERY_DATABASE: Record<string, BatterySpec> = {
  "18650": {
    name: "18650 Lithium Ion",
    diameter: 18.6,
    length: 65.2,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 2.5,
    typical_capacity: 2600,
    weight: 48,
    model_type: "cylinder"
  },

  "21700": {
    name: "21700 Lithium Ion",
    diameter: 21.7,
    length: 70.2,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 2.5,
    typical_capacity: 4000,
    weight: 68,
    model_type: "cylinder"
  },

  "26650": {
    name: "26650 Lithium Ion",
    diameter: 26.5,
    length: 65.4,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 2.5,
    typical_capacity: 5000,
    weight: 95,
    model_type: "cylinder"
  },

  "32650": {
    name: "32650 LiFePO4",
    diameter: 32.4,
    length: 67.7,
    nominal_voltage: 3.2,
    max_voltage: 3.65,
    min_voltage: 2.0,
    typical_capacity: 6000,
    weight: 145,
    model_type: "cylinder"
  },

  "14500": {
    name: "14500 (AA Size) Lithium",
    diameter: 14.5,
    length: 50.5,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 2.5,
    typical_capacity: 800,
    weight: 23,
    model_type: "cylinder"
  },

  "18350": {
    name: "18350 Lithium Ion",
    diameter: 18.6,
    length: 35.0,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 2.5,
    typical_capacity: 900,
    weight: 30,
    model_type: "cylinder"
  },

  "AA_NIMH": {
    name: "AA NiMH Rechargeable",
    diameter: 14.5,
    length: 50.5,
    nominal_voltage: 1.2,
    max_voltage: 1.4,
    min_voltage: 1.0,
    typical_capacity: 2000,
    weight: 28,
    model_type: "cylinder"
  },

  "AAA_NIMH": {
    name: "AAA NiMH Rechargeable",
    diameter: 10.5,
    length: 44.5,
    nominal_voltage: 1.2,
    max_voltage: 1.4,
    min_voltage: 1.0,
    typical_capacity: 800,
    weight: 12,
    model_type: "cylinder"
  },

  "D_NIMH": {
    name: "D Cell NiMH",
    diameter: 34.2,
    length: 61.5,
    nominal_voltage: 1.2,
    max_voltage: 1.4,
    min_voltage: 1.0,
    typical_capacity: 10000,
    weight: 160,
    model_type: "cylinder"
  },

  "POUCH_SMALL": {
    name: "LiPo Pouch 103040",
    width: 30,
    length: 40,
    thickness: 10,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 3.0,
    typical_capacity: 1200,
    weight: 25,
    model_type: "box"
  },

  "POUCH_MEDIUM": {
    name: "LiPo Pouch 505068",
    width: 50,
    length: 68,
    thickness: 5,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 3.0,
    typical_capacity: 2500,
    weight: 45,
    model_type: "box"
  },

  "POUCH_LARGE": {
    name: "LiPo Pouch 7565121",
    width: 65,
    length: 121,
    thickness: 7.5,
    nominal_voltage: 3.7,
    max_voltage: 4.2,
    min_voltage: 3.0,
    typical_capacity: 5000,
    weight: 95,
    model_type: "box"
  },

  "PRISMATIC_SMALL": {
    name: "Prismatic LiFePO4 10Ah",
    width: 70,
    length: 130,
    thickness: 27,
    nominal_voltage: 3.2,
    max_voltage: 3.65,
    min_voltage: 2.5,
    typical_capacity: 10000,
    weight: 330,
    model_type: "box"
  },

  "PRISMATIC_LARGE": {
    name: "Prismatic LiFePO4 100Ah",
    width: 130,
    length: 200,
    thickness: 50,
    nominal_voltage: 3.2,
    max_voltage: 3.65,
    min_voltage: 2.5,
    typical_capacity: 100000,
    weight: 3200,
    model_type: "box"
  },

  "9V_NIMH": {
    name: "9V NiMH Rechargeable",
    width: 26.5,
    length: 48.5,
    thickness: 17.5,
    nominal_voltage: 8.4,
    max_voltage: 9.6,
    min_voltage: 7.2,
    typical_capacity: 200,
    weight: 45,
    model_type: "box"
  }
};

export function getBatteryOptions(): { value: string; label: string }[] {
  return Object.entries(BATTERY_DATABASE).map(([key, battery]) => ({
    value: key,
    label: battery.name
  }));
}

export function getBatteryByKey(key: string): BatterySpec | undefined {
  return BATTERY_DATABASE[key];
}