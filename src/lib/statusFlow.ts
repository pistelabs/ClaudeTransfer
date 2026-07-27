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
  { label: "Pending", color: "#f59e0b", stage: "pending" },
  { label: "Ready", color: "#10b981", stage: "awaiting" },
  { label: "Collected", color: "#16a34a", stage: "archive" },
];

/** The workStatus label a plain (non-hold) move into each stage should carry, so the
 * Job Details status bar always highlights the option matching the job's board column. */
export const STAGE_WORK_STATUS: Record<Stage, string> = {
  kiosk: "Booked",
  pending: "Checked-in",
  in_progress: "In progress",
  awaiting: "Ready",
  archive: "Collected",
};
