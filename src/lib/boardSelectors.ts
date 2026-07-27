import type { EquipmentCategory, Job, Stage } from "../types";
import { dropKey, dueKey } from "./format";

export function filterJobs(jobs: Job[], query: string, filterCats: EquipmentCategory[]): Job[] {
  const q = (query || "").trim().toLowerCase();
  let out = jobs;
  if (filterCats.length) out = out.filter((j) => j.equipment.some((eq) => filterCats.includes(eq.category)));
  if (!q) return out;
  return out.filter(
    (j) =>
      j.id.toLowerCase().includes(q) ||
      j.customer.toLowerCase().includes(q) ||
      j.equipment.some(
        (eq) =>
          eq.brand.toLowerCase().includes(q) ||
          eq.model.toLowerCase().includes(q) ||
          eq.services.some((s) => s.toLowerCase().includes(q)),
      ),
  );
}

/** One row per equipment item on a job — used by the "Checked in Equipment" panel and wide stage columns.
 * Each row carries its own `stage`/`eqIdx` since stage is now tracked per equipment item, not per job. */
export interface EquipRow {
  jobId: string;
  rowId: string;
  eqIdx: number;
  stage: Stage;
  brand: string;
  model: string;
  size: string;
  customer: string;
  due: string;
  pickup: string;
  dropoff: string;
  hasDrop: boolean;
  dropDate: string;
  dropTime: string;
  status: Job["status"];
  services: string[];
  job: Job;
}

export function jobToRows(job: Job): EquipRow[] {
  const n = job.equipment.length;
  return job.equipment.map((eq, i) => ({
    jobId: job.id,
    rowId: n > 1 ? `${job.id}-${i + 1}` : job.id,
    eqIdx: i,
    stage: eq.stage,
    brand: eq.brand,
    model: eq.model,
    size: eq.size,
    customer: job.customer,
    due: job.due,
    pickup: job.pickup,
    dropoff: job.dropoff || "",
    hasDrop: eq.stage === "kiosk" && !!job.dropoff,
    dropDate: (job.dropoff || "").split(" ")[0] || "",
    dropTime: (job.dropoff || "").split(" ").slice(1).join(" ") || "",
    status: job.status === "late" ? "late" : "",
    services: eq.services,
    job,
  }));
}

export function sortByDue(rows: EquipRow[]): EquipRow[] {
  return rows.slice().sort((a, b) => dueKey(a.due) - dueKey(b.due));
}

export function sortByDropoff(rows: EquipRow[]): EquipRow[] {
  return rows.slice().sort((a, b) => dropKey(a.dropoff) - dropKey(b.dropoff));
}
