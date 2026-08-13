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

export function makeWaiver(jobId: string, kind: WaiverKind, signedBy: string, signedAt: string, signature?: string): JobWaiver {
  return { kind, url: waiverUrl(jobId, kind), fileName: waiverFileName(jobId, kind), signedBy, signedAt, signature };
}

/** Placeholder wording — replace with the shop's actual policy text before going live. */
export const WAIVER_TERMS = [
  "The customer confirms that the height, weight, age and skier-type details supplied are accurate, and understands that binding release settings are calculated from them in line with the applicable industry standard.",
  "The customer understands that a binding system cannot release under all circumstances, and is not a guarantee of safety. Skiing and snowboarding carry an inherent risk of injury that no equipment or adjustment can remove.",
  "The customer accepts that any equipment presented for service may be found unserviceable on inspection, and that the shop may decline to work on equipment it judges unsafe or outside manufacturer specification.",
  "The customer authorises the shop to carry out the services listed above at the prices shown, and to test and adjust the equipment as needed to complete that work.",
];

export function hasWaiver(job: Pick<Job, "waivers">, kind: WaiverKind): boolean {
  return (job.waivers || []).some((w) => w.kind === kind);
}
