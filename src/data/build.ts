import type { Equipment, EquipmentCategory, EquipmentType, Job, LineItem, ServiceData } from "../types";
import { isQuoted, svcPrice, TUNING_LIKE } from "../lib/serviceCatalog";
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

export function buildEquip(e: RawEquip, jobStatus: string | undefined): Equipment {
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
  };
}

export function normalizeJob(j: RawJob): Job {
  const first = (j.customer || "").trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") || "customer";
  const statusFromStage: Record<string, string> = {
    kiosk: "Booked",
    pending: "Checked-in",
    in_progress: "In progress",
    awaiting: "Ready",
    archive: "Complete",
  };
  const workStatus = statusFromStage[j.stage] || "Booked";
  const equipSrc: RawEquip[] =
    j.equipment ||
    [{ type: j.type || "SKI", brand: j.brand || "New", model: j.model || "Equipment", size: j.size || "—", services: j.services || [] }];
  return {
    id: j.id,
    customer: j.customer,
    email: first + "@pistelabs.com",
    phone: "+353 86 863 3044",
    stage: j.stage,
    status: j.status,
    workStatus,
    due: j.due,
    pickup: j.pickup,
    dropoff: j.dropoff || "",
    notes: j.notes || "",
    tech: "Dan Sweetnam",
    updatedAt: "29/06/26 2:32 PM",
    updates: [],
    equipment: equipSrc.map((e) => buildEquip(e, j.status)),
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

export function jobFullyComplete(job: Job): boolean {
  return job.equipment.every((eq) => eq.services.length > 0 && eq.doneFlags.every(Boolean));
}

export function jobHasNoServices(job: Job): boolean {
  return job.equipment.every((eq) => eq.services.length === 0);
}
