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

/** `checked_in` is the "Checked in Equipment" panel — equipment that's physically in the shop
 * but not started yet. `pending` is strictly on-hold work (always carries a hold reason). */
export type Stage = "kiosk" | "checked_in" | "in_progress" | "pending" | "awaiting" | "archive";

export const STAGE_ORDER: Stage[] = ["kiosk", "checked_in", "in_progress", "pending", "awaiting", "archive"];

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
  /** which board column this specific piece of equipment sits in — independent of its siblings */
  stage: Stage;
  /** Job Details status-bar label for this specific piece of equipment */
  workStatus: string;
  /** short per-branch identifier for this physical item (e.g. "CAS0"), so two otherwise
   * identical items stay distinguishable. Record-keeping only — no UI logic reads it. */
  code?: string;
  /** epoch ms when this item was marked Collected. After COLLECTED_LOCK_MS it is archived
   * for good and can no longer be edited or moved; null whenever it isn't collected. */
  collectedAt?: number | null;
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
  resolved?: boolean;
  resolvedAt?: string;
  /** the bare hold reason, kept alongside the display text so the board can show it
   * without having to parse the prefixed note back apart */
  reason?: string;
  /** which equipment item (index into job.equipment) a hold note applies to — notes are
   * shared/job-level, but holds are per-item, so this lets the resolve flow target the
   * right note even when several items on the same job have independent holds. */
  eqIdx?: number;
}

/** Liability paperwork attached to a job — signed at check-in, and again on release. */
export type WaiverKind = "check_in" | "release";

export interface JobWaiver {
  kind: WaiverKind;
  /** where the backend serves the signed PDF from */
  url: string;
  fileName: string;
  signedBy: string;
  signedAt: string;
  /** signatures captured at signing, as data URLs */
  signature?: string;
  customerSignature?: string;
}

export interface Job {
  id: string;
  customer: string;
  email: string;
  phone: string;
  /** whole-card tint / OVERDUE pill — stays a job-level due-date concern */
  status: CardStatus;
  due: string;
  pickup: string;
  dropoff?: string;
  notes: string;
  tech: string;
  updatedAt: string;
  /** amount taken so far against this job's total — payment is one combined transaction
   * per job, so it lives here rather than on individual equipment items. */
  paid: number;
  updates: JobUpdate[];
  /** signed waiver documents; empty until one is captured */
  waivers: JobWaiver[];
  equipment: Equipment[];
}

export interface CustomerEquipmentRef {
  type: EquipmentType;
  brand: string;
  model: string;
  size: string;
  category?: EquipmentCategory;
  /** the physical item's code — re-adding this equipment carries it onto the new job */
  code?: string;
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
  /** carried through when re-adding a customer's existing equipment, so the job keeps its code */
  code?: string;
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
  /** code of the on-file equipment currently loaded into the editor, if any */
  code?: string;
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
export type ReadyPromptKind = "incomplete" | "single" | "multi" | "collect_incomplete" | "collect_balance" | "hold_blocked" | null;
