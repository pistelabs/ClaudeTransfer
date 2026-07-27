import type { Equipment, EquipmentCategory, EquipmentType, Job, LineItem, ServiceData, Stage } from "../types";
import { isQuoted, svcPrice, TUNING_LIKE } from "../lib/serviceCatalog";
import { STAGE_WORK_STATUS } from "../lib/statusFlow";
import type { RawEquip, RawJob } from "./seedRaw";

/** Deterministic pseudo-random category assignment, mirroring the design source's hash-based fallback. */
function hashCategory(type: EquipmentType, brand: string, model: string): EquipmentCategory {
  const cats: EquipmentCategory[] =
    type === "BOARD" ? ["Powder Board", "Split Board", "Snowboard"] : ["Alpine Ski", "Touring Ski", "Race Ski"];
  const key = (brand || "") + (model || "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return cats[h % cats.length];
}

export function buildEquip(e: RawEquip, jobStatus: string | undefined, stage: Stage): Equipment {
  const services = (e.services || []).slice();
  const type: EquipmentType = e.type || "SKI";
  const category = e.category || hashCategory(type, e.brand || "", e.model || "");
  const serviceData: Record<string, ServiceData> = {};
  services.forEach((name) => {
    const sd = (e.serviceData && e.serviceData[name]) || {};
    serviceData[name] = {
      angles: sd.angles || (TUNING_LIKE[name] ? "Standard" : "—"),
      structure: sd.structure || (TUNING_LIKE[name] ? "Linear" : "—"),
      photos: sd.photos || [],
    };
  });
  return {
    type,
    brand: e.brand || "New",
    model: e.model || "Equipment",
    size: e.size || "—",
    colour: e.colour || "",
    category,
    services,
    serviceData,
    priceOverride: null,
    doneFlags: services.map(() => jobStatus === "complete"),
    loc: "",
    stage,
    workStatus: STAGE_WORK_STATUS[stage] ?? "Booked",
    // Seeded archive rows are historic collections — already past their grace period, so
    // they load locked rather than briefly editable on every page load.
    collectedAt: stage === "archive" ? 0 : null,
  };
}

export function normalizeJob(j: RawJob): Job {
  const first = (j.customer || "").trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") || "customer";
  const equipSrc: RawEquip[] =
    j.equipment ||
    [{ type: j.type || "SKI", brand: j.brand || "New", model: j.model || "Equipment", size: j.size || "—", services: j.services || [] }];
  const equipment = equipSrc.map((e) => buildEquip(e, j.status, j.stage));
  return {
    id: j.id,
    customer: j.customer,
    email: first + "@pistelabs.com",
    phone: "+353 86 863 3044",
    status: j.status,
    due: j.due,
    pickup: j.pickup,
    dropoff: j.dropoff || "",
    notes: j.notes || "",
    tech: "Dan Sweetnam",
    updatedAt: "29/06/26 2:32 PM",
    updates: [],
    // Seeded archive rows were collected and paid for historically.
    paid: j.stage === "archive" ? equipment.reduce((a, eq) => a + equipmentPrice(eq), 0) : 0,
    equipment,
  };
}

/** Derived `lineItems[]` for one equipment item (README: "plus derived lineItems[]"). */
export function deriveLineItems(eq: Equipment): LineItem[] {
  return eq.services.map((name, i) => {
    const sd = eq.serviceData[name] || {};
    return {
      name,
      price: svcPrice(name, eq.serviceData),
      quoted: isQuoted(name),
      angles: sd.angles || "—",
      structure: sd.structure || "—",
      photos: sd.photos || [],
      done: !!eq.doneFlags[i],
    };
  });
}

export function equipmentServiceTotal(eq: Equipment): number {
  return eq.services.reduce((acc, name) => acc + svcPrice(name, eq.serviceData), 0);
}

export function equipmentPrice(eq: Equipment): number {
  if (eq.priceOverride != null && eq.priceOverride !== ("" as unknown)) return Number(eq.priceOverride);
  return equipmentServiceTotal(eq);
}

export function jobTotal(job: Job): number {
  return job.equipment.reduce((acc, eq) => acc + equipmentPrice(eq), 0);
}

/** What is still owed on a job — the whole-job figure the Collected gate checks. */
export function jobBalance(job: Job): number {
  return jobTotal(job) - (job.paid || 0);
}

/** Whether one specific equipment item's own services are all ticked done — used for the
 * per-item move guards (Awaiting Collection / Collected). See `jobFullyComplete` for the
 * whole-job variant (kept for reuse, no longer used by the per-item guards). */
export function equipmentFullyComplete(eq: Equipment): boolean {
  return eq.services.length > 0 && eq.doneFlags.every(Boolean);
}

export function jobFullyComplete(job: Job): boolean {
  return job.equipment.every((eq) => eq.services.length > 0 && eq.doneFlags.every(Boolean));
}

export function jobHasNoServices(job: Job): boolean {
  return job.equipment.every((eq) => eq.services.length === 0);
}
