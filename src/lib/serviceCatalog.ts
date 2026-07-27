import type { DinState, EquipmentCategory, EquipmentType, ServiceGroup } from "../types";

export const SKI_CATEGORIES: EquipmentCategory[] = ["Alpine Ski", "Touring Ski", "Race Ski"];
export const BOARD_CATEGORIES: EquipmentCategory[] = ["Powder Board", "Split Board", "Snowboard"];

export function categoryToType(category: EquipmentCategory): EquipmentType {
  return (BOARD_CATEGORIES as string[]).includes(category) ? "BOARD" : "SKI";
}

export function defaultCategoryForType(type: EquipmentType): EquipmentCategory {
  return type === "BOARD" ? "Snowboard" : "Alpine Ski";
}

export interface ServiceDef {
  name: string;
  group: ServiceGroup;
  types: EquipmentType[];
}

export const SERVICE_GROUPS: ServiceGroup[] = ["Waxing", "Tuning", "Bindings", "Repairs"];

export const SERVICE_DEFS: ServiceDef[] = [
  { name: "Hot Wax", group: "Waxing", types: ["SKI", "BOARD"] },
  { name: "Roll Wax", group: "Waxing", types: ["SKI", "BOARD"] },
  { name: "Edge and Wax", group: "Tuning", types: ["SKI", "BOARD"] },
  { name: "Full Tune", group: "Tuning", types: ["SKI", "BOARD"] },
  { name: "Race Tune", group: "Tuning", types: ["SKI"] },
  { name: "Premium Service", group: "Tuning", types: ["SKI", "BOARD"] },
  { name: "Binding Mount", group: "Bindings", types: ["SKI"] },
  { name: "Binding Check", group: "Bindings", types: ["SKI"] },
  { name: "Repair", group: "Repairs", types: ["SKI", "BOARD"] },
];

export const SERVICE_CATALOG: string[] = [
  "Hot Wax",
  "Roll Wax",
  "Edge and Wax",
  "Full Tune",
  "Race Tune",
  "Premium Service",
  "Binding Mount",
  "Binding Check",
  "Repair",
];

export const PRICE_MAP: Record<string, number> = {
  "Hot Wax": 15,
  "Edge and Wax": 25,
  "Full Tune": 45,
  "Premium Service": 65,
  "Binding Mount": 30,
  Repair: 40,
  "Binding Check": 20,
  "Roll Wax": 15,
  "Free Binding Mount (with purchase)": 0,
  "Race Tune": 55,
};

/** [bg, fg, border] */
export const SERVICE_COLORS: Record<string, [string, string, string]> = {
  "Hot Wax": ["#eff6ff", "#2563eb", "#bfdbfe"],
  "Edge and Wax": ["#f8fafc", "#475569", "#e2e8f0"],
  "Full Tune": ["#fdf2f8", "#db2777", "#fbcfe8"],
  "Premium Service": ["#f0fdf4", "#16a34a", "#bbf7d0"],
  "Binding Mount": ["#fdf4ff", "#c026d3", "#f5d0fe"],
  Repair: ["#f5f3ff", "#7c3aed", "#ddd6fe"],
  "Binding Check": ["#ecfdf5", "#059669", "#a7f3d0"],
  "Roll Wax": ["#fffbeb", "#d97706", "#fde68a"],
  "Free Binding Mount (with purchase)": ["#f4f4f5", "#3f3f46", "#e4e4e7"],
  "Race Tune": ["#fff1f2", "#e11d48", "#fecdd3"],
};

const DEFAULT_SERVICE_COLOR: [string, string, string] = ["#f4f4f5", "#3f3f46", "#e4e4e7"];

export function serviceColor(name: string): [string, string, string] {
  return SERVICE_COLORS[name] || DEFAULT_SERVICE_COLOR;
}

export function serviceDisplayLabel(name: string): string {
  return name === "Free Binding Mount (with purchase)" ? "Free Binding" : name;
}

export function isQuoted(name: string): boolean {
  return name === "Repair";
}

/** Tuning-style services get default angle/structure values at check-in when none are supplied. */
export const TUNING_LIKE: Record<string, true> = {
  "Hot Wax": true,
  "Edge and Wax": true,
  "Full Tune": true,
  "Premium Service": true,
  "Roll Wax": true,
  "Race Tune": true,
};

export function svcPrice(name: string, serviceData: Record<string, { quote?: string }> | undefined): number {
  if (isQuoted(name)) {
    const q = serviceData?.[name]?.quote;
    return q != null && q !== "" ? Number(q) : 0;
  }
  const p = PRICE_MAP[name];
  return p != null ? p : 0;
}

export function groupOrder(): ServiceGroup[] {
  const order: ServiceGroup[] = [];
  SERVICE_DEFS.forEach((s) => {
    if (!order.includes(s.group)) order.push(s.group);
  });
  return order;
}

export function groupFields(group: ServiceGroup): { key: string; label: string; placeholder: string }[] {
  if (group === "Tuning") return [
    { key: "angles", label: "Angles", placeholder: "e.g. 1° base / 88°" },
    { key: "structure", label: "Structure", placeholder: "e.g. Linear" },
  ];
  if (group === "Bindings") return [
    { key: "din", label: "DIN setting", placeholder: "e.g. 7.5" },
    { key: "sole", label: "Boot sole (mm)", placeholder: "e.g. 305" },
  ];
  if (group === "Waxing") return [{ key: "wax", label: "Wax type", placeholder: "e.g. All-temp" }];
  return [{ key: "notes", label: "Notes", placeholder: "Details required" }];
}

// ---- DIN calculator ----

export interface DinOptions {
  weight: string[];
  height: string[];
  age: string[];
  skier: string[];
  sole: string[];
}

export function dinOptions(): DinOptions {
  return {
    weight: [
      "10-13 kg",
      "14-17 kg",
      "18-21 kg",
      "22-25 kg",
      "26-30 kg",
      "31-35 kg",
      "36-41 kg",
      "42-48 kg",
      "49-57 kg",
      "58-66 kg",
      "67-78 kg",
      "79-94 kg",
      "95+ kg",
    ],
    height: ["≤148 cm", "149-157 cm", "158-166 cm", "167-178 cm", "179-194 cm", "≥195 cm"],
    age: ["10-49 years", "50+ years or <10 years"],
    skier: ["Type 1 - Cautious", "Type 2 - Moderate", "Type 3 - Aggressive"],
    sole: ["≤230 mm", "231-250 mm", "251-270 mm", "271-290 mm", "291-310 mm", "311-330 mm", "331+ mm"],
  };
}

export function computeDin(d: Pick<DinState, "weight" | "height" | "age" | "skier" | "sole">): string | null {
  const o = dinOptions();
  const wCode = o.weight.indexOf(d.weight) + 1;
  const hCode = o.height.indexOf(d.height) + 1;
  if (!wCode || !hCode) return null;
  let code = Math.max(wCode, hCode);
  const st = o.skier.indexOf(d.skier);
  if (st === 0) code -= 1;
  else if (st === 2) code += 1;
  if (d.age === "50+ years or <10 years") code -= 1;
  code = Math.max(1, Math.min(13, code));
  const table = [0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 10.0];
  let din = table[code - 1];
  const soleIdx = o.sole.indexOf(d.sole);
  if (soleIdx >= 0) {
    if (soleIdx <= 1) din += 0.5;
    else if (soleIdx >= 5) din -= 0.5;
  }
  return Math.max(0.75, din).toFixed(2);
}

export function blankDin(): DinState {
  return { mode: "calculate", weight: "", height: "", age: "", skier: "", sole: "" , custom: "" };
}

export function pickupSlots(): string[] {
  const out: string[] = [];
  for (let m = 7 * 60; m <= 21 * 60; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const ap = h >= 12 ? "PM" : "AM";
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    out.push(`${h12}:${String(mm).padStart(2, "0")} ${ap}`);
  }
  return out;
}
