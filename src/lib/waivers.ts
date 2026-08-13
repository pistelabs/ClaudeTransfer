import type { Job, JobWaiver, WaiverKind } from "../types";
import { SERVICE_DEFS } from "./serviceCatalog";

/** Services that carry a liability waiver. Binding work is the standard case — the shop is
 * setting release values on someone else's equipment. */
const WAIVER_SERVICES = new Set(SERVICE_DEFS.filter((d) => d.group === "Bindings").map((d) => d.name));

export const WAIVER_LABEL: Record<WaiverKind, string> = {
  check_in: "Check-in waiver",
  release: "Release waiver",
};

/** Whether this job needs waivers at all — drives whether the Waivers section is shown. */
export function requiresWaiver(job: Pick<Job, "equipment">): boolean {
  return job.equipment.some((eq) => eq.services.some((s) => WAIVER_SERVICES.has(s)));
}

export function waiverFileName(jobId: string, kind: WaiverKind): string {
  return `${jobId}-${kind === "check_in" ? "check-in" : "release"}-waiver.pdf`;
}

/** Path the backend serves the signed document from. */
export function waiverUrl(jobId: string, kind: WaiverKind): string {
  return `/waivers/${waiverFileName(jobId, kind)}`;
}

export function makeWaiver(jobId: string, kind: WaiverKind, signedBy: string, signedAt: string): JobWaiver {
  return { kind, url: waiverUrl(jobId, kind), fileName: waiverFileName(jobId, kind), signedBy, signedAt };
}

export function hasWaiver(job: Pick<Job, "waivers">, kind: WaiverKind): boolean {
  return (job.waivers || []).some((w) => w.kind === kind);
}
