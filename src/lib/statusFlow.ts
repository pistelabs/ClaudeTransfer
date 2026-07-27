import type { Stage } from "../types";

export interface StatusStep {
  label: string;
  color: string;
  stage: Stage | null;
}

/** Job Details segmented control. Mirrors the design source's `statusFlow` (see README §2). */
export const STATUS_FLOW: StatusStep[] = [
  { label: "Booked", color: "#64748b", stage: "kiosk" },
  { label: "Checked-in", color: "#0ea5e9", stage: "pending" },
  { label: "In progress", color: "#8b5cf6", stage: "in_progress" },
  { label: "Pending", color: "#f59e0b", stage: null },
  { label: "Ready", color: "#10b981", stage: "awaiting" },
  { label: "Collected", color: "#16a34a", stage: "archive" },
];
