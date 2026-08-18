import type { GeneralSettings, RequiredField, Service, ServiceGroup } from "./types"

/** The fixed list of equipment types a workshop can enable (Equipment Types section). */
export const EQUIPMENT_TYPES = [
  "Alpine Ski",
  "Touring Ski",
  "Race Ski",
  "Snowboard",
  "Powder Board",
  "Splitboard",
  "Kids Ski",
  "Kids Board",
  "Mountain Bike",
  "Road Bike",
  "Electric Bike",
  "Kids Bike",
  "Alpine Ski Boots",
  "Touring Ski Boots",
  "Snowboard Boots",
  "Other",
] as const

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
export const STANDARD_ENTRIES = [
  { name: "DIN", hint: "Binding release setting" },
  { name: "Snowboard Stance", hint: "Width, angles and setback" },
] as const

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

export function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9)
}

export function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: uid("s"),
    name: "",
    description: "",
    color: SERVICE_COLORS[0],
    pricingType: "fixed",
    price: 0,
    duration: 0,
    durationUnit: "min",
    allowMultiples: false,
    equipmentTypes: {},
    standardEntries: {},
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
    ...overrides,
  }
}

export function makeRequiredField(): RequiredField {
  return { id: uid("f"), label: "", type: "free", selectMode: "single", options: [] }
}

export function formatPrice(service: Service, symbol: string) {
  const amount = symbol + Number(service.price || 0).toFixed(2)
  return service.pricingType === "quoted" ? "From " + amount : amount
}

export function formatDuration(service: Service) {
  if (!service.duration) return ""
  return service.durationUnit === "hr" ? service.duration + " h" : service.duration + " min"
}

export const DEFAULT_GENERAL: GeneralSettings = {
  name: "Alpine Werks",
  email: "hello@alpinewerks.com",
  phone: "+41 79 000 00 00",
  address: "Dorfstrasse 12, Zermatt",
  logo: null,
  currency: "CHF",
  dateFormat: "DD/MM/YYYY",
}

export const DEFAULT_EQUIPMENT_TYPES: Record<string, boolean> = {
  "Alpine Ski": true,
  "Touring Ski": true,
  Snowboard: true,
  "Alpine Ski Boots": true,
  "Snowboard Boots": true,
}

export const DEFAULT_SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "g1",
    name: "Standard tunes",
    services: [
      makeService({
        id: "s1",
        name: "Full Tune",
        description: "Base grind, edge sharpen, hot wax",
        price: 170,
        color: "#3b82f6",
        duration: 45,
        equipmentTypes: { "Alpine Ski": true, "Touring Ski": true },
      }),
      makeService({
        id: "s2",
        name: "Hot Wax",
        price: 40,
        color: "#22c55e",
        duration: 15,
        equipmentTypes: { "Alpine Ski": true, Snowboard: true },
      }),
    ],
  },
  { id: "g2", name: "Bootwork", services: [] },
  { id: "g3", name: "Extras", services: [] },
]
