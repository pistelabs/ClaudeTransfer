export type EquipmentType = "SKI" | "BOARD";

export type EquipmentCategory =
  | "Alpine Ski"
  | "Touring Ski"
  | "Race Ski"
  | "Powder Board"
  | "Split Board"
  | "Snowboard";

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  "Alpine Ski",
  "Touring Ski",
  "Race Ski",
  "Powder Board",
  "Split Board",
  "Snowboard",
];

export type ServiceGroup = "Waxing" | "Tuning" | "Bindings" | "Repairs";

export type Stage = "kiosk" | "in_progress" | "pending" | "awaiting" | "archive";

export const STAGE_ORDER: Stage[] = ["kiosk", "in_progress", "pending", "awaiting", "archive"];

/** Whole-card tint / pill status (distinct from workStatus, which drives the segmented control). */
export type CardStatus = "" | "late" | "complete" | "partial";

export interface ServiceData {
  angles?: string;
  structure?: string;
  wax?: string;
  din?: string;
  sole?: string;
  notes?: string;
  quote?: string;
  photos?: string[];
}

export interface Equipment {
  type: EquipmentType;
  category: EquipmentCategory;
  brand: string;
  model: string;
  size: string;
  colour?: string;
  services: string[];
  serviceData: Record<string, ServiceData>;
  /** manual price override for the whole item (checkout / job editing) */
  priceOverride?: number | null;
  /** parallel to `services` — whether that line item's work is ticked complete */
  doneFlags: boolean[];
  loc?: string;
}

/** Derived, read-only view of one service line (see README "State Management"). */
export interface LineItem {
  name: string;
  price: number;
  quoted: boolean;
  angles: string;
  structure: string;
  photos: string[];
  done: boolean;
}

export interface JobUpdate {
  text: string;
  at: string;
  hold?: boolean;
}

export interface Job {
  id: string;
  customer: string;
  email: string;
  phone: string;
  stage: Stage;
  status: CardStatus;
  workStatus: string;
  due: string;
  pickup: string;
  dropoff?: string;
  notes: string;
  tech: string;
  updatedAt: string;
  updates: JobUpdate[];
  equipment: Equipment[];
}

export interface CustomerEquipmentRef {
  type: EquipmentType;
  brand: string;
  model: string;
  size: string;
  category?: EquipmentCategory;
}

export type ContactChannel = "Email" | "SMS";

export interface Customer {
  id: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  channel: ContactChannel;
  equipment: CustomerEquipmentRef[];
}

export interface DinState {
  mode: "calculate" | "custom";
  weight: string;
  height: string;
  age: string;
  skier: string;
  sole: string;
  custom: string;
}

/** One equipment item as it is being built in the check-in / edit form, before commit. */
export interface FormItem {
  type: EquipmentType;
  category: EquipmentCategory;
  brand: string;
  model: string;
  size: string;
  colour: string;
  services: string[];
  serviceData: Record<string, ServiceData>;
  priceOverride?: number | string | null;
}

export interface NewJobForm {
  customer: string;
  customerId: string | null;
  phone: string;
  email: string;
  due: string;
  pickup: string;
  notes: string;
  type: EquipmentType;
  category: EquipmentCategory;
  brand: string;
  model: string;
  size: string;
  colour: string;
  services: string[];
  serviceData: Record<string, ServiceData>;
  priceOverride?: number | string | null;
  items: FormItem[];
  din: DinState;
}

export interface NewCustomerForm {
  first: string;
  last: string;
  email: string;
  phone: string;
  channel: ContactChannel;
}

/** payPrompt in the job detail sheet */
export type PayPromptKind = "pay" | "collect" | null;

/** readyPrompt in the job detail sheet */
export type ReadyPromptKind = "incomplete" | "single" | "multi" | "collect_incomplete" | "collect_balance" | null;
