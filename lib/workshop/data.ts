import type {
  GeneralSettings,
  RequiredField,
  Service,
  ServiceInput,
  StandardEntryCode,
} from "./types"

/** Kanban column / calendar job colours. */
export const SERVICE_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#db2777",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0d9488",
  "#0284c7",
  "#64748b",
] as const

/** Built-in, pre-formatted capture forms offered in the Required information section. */
export const STANDARD_ENTRIES: Array<{ code: StandardEntryCode; name: string; hint: string }> = [
  { code: "din", name: "DIN", hint: "Binding release setting" },
  { code: "snowboard_stance", name: "Snowboard Stance", hint: "Width, angles and setback" },
]

export const CURRENCY_SYMBOLS: Record<GeneralSettings["currency"], string> = {
  CHF: "CHF ",
  EUR: "€",
  GBP: "£",
  USD: "$",
}

export const FIELD_TYPE_LABELS: Record<RequiredField["type"], string> = {
  free: "Free entry",
  options: "Predefined options",
  file: "File upload",
}

/** Groups and services are ordered by the position the backend assigns. */
export function byPosition<T extends { position: number; id: string }>(a: T, b: T) {
  return a.position - b.position || Number(a.id) - Number(b.id)
}

let localSeed = 0
/** Client-side id for unsaved rows; the database assigns the real one on save. */
export function localId(prefix: string) {
  localSeed += 1
  return prefix + "-local-" + localSeed
}

export function emptyServiceInput(): ServiceInput {
  return {
    name: "",
    description: "",
    color: SERVICE_COLORS[0],
    pricingType: "fixed",
    price: 0,
    duration: 0,
    durationUnit: "min",
    allowMultiples: false,
    equipmentTypeIds: [],
    standardEntries: [],
    requiredInfo: [],
    signatureRequired: false,
    terms: "",
    checkinCustomerSig: true,
    checkinStaffSig: false,
    releaseWaiverRequired: false,
    releaseTerms: "",
    releaseCustomerSig: true,
    releaseStaffSig: false,
    docketCount: 1,
    barcodeOnDocket: true,
    disabled: false,
  }
}

/** The editable half of a saved service — what create/update send back. */
export function toServiceInput(service: Service): ServiceInput {
  const { id, groupId, position, ...input } = service
  void id
  void groupId
  void position
  return structuredClone(input)
}

export function makeRequiredField(): RequiredField {
  return { key: localId("field"), label: "", type: "free", selectMode: "single", options: [] }
}

export function formatPrice(service: Pick<ServiceInput, "price" | "pricingType">, symbol: string) {
  const amount = symbol + Number(service.price || 0).toFixed(2)
  return service.pricingType === "quoted" ? "From " + amount : amount
}

export function formatDuration(service: Pick<ServiceInput, "duration" | "durationUnit">) {
  if (!service.duration) return ""
  return service.durationUnit === "hr" ? service.duration + " h" : service.duration + " min"
}

/**
 * General settings still live in the client until the General section is wired
 * to Django; the currency drives the price formatting shown here.
 */
export const DEFAULT_GENERAL: GeneralSettings = {
  name: "Alpine Werks",
  email: "hello@alpinewerks.com",
  phone: "+41 79 000 00 00",
  address: "Dorfstrasse 12, Zermatt",
  logo: null,
  currency: "CHF",
  dateFormat: "DD/MM/YYYY",
}
