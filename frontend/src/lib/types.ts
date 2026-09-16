/**
 * Domain model for Store Management.
 *
 * These are the camelCase types the UI works with. The wire format used by the
 * Django/DRF backend is snake_case and lives in `api/dto.ts`, with mappers in
 * both directions, so renaming a serializer field never reaches a component.
 */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
export type Day = (typeof DAYS)[number]

export const SERVICE_CATEGORIES = [
  "rental",
  "tuning",
  "lessons",
  "fitting",
] as const
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

/** Minutes between the start of one bookable slot and the next. */
export type BookingInterval = 15 | 30 | 60 | 90 | 120

export type LeadUnit = "min" | "h" | "d"

export type NotifyPreference = "every" | "daily" | "none"

export type LeaveType = "Vacation" | "Sick" | "Personal"

export type StaffStatus = "Active" | "Inactive"

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  /** Minutes. */
  duration: number
  /** Display string as priced by the shop, e.g. "$45/day". */
  price: string
  enabled: boolean
}

export interface StaffMember {
  id: string
  name: string
  role: string
  initials: string
  email: string
  phone: string
  status: StaffStatus
  /** Hex, assigned per person and stable across the app. */
  color: string
  availableHours: number
  daysOff: Day[]
  bookingNotify: NotifyPreference
  canCheckEquipment: boolean
  canCompleteAppointments: boolean
}

export interface Break {
  start: string
  end: string
}

export interface LeadTime {
  custom: boolean
  min: number
  minUnit: LeadUnit
  max: number
  maxUnit: LeadUnit
}

export interface TimeBlock {
  id: string
  staffId: string
  day: Day
  /** "HH:MM", 15-minute increments. */
  start: string
  end: string
  /** Categories bookable during this block. */
  services: ServiceCategory[]
  /** Individually selected service ids. */
  appointments: string[]
  recurring: boolean
  enabled: boolean
  interval: BookingInterval
  online: boolean
  breaks: Break[]
  /** Per-service lead-time overrides, keyed by service id. */
  lead: Record<string, LeadTime>
}

/** Blocks grouped for the weekly grid: staff id → day → blocks. */
export type WeeklySchedule = Record<string, Record<Day, TimeBlock[]>>

export interface LeaveEntry {
  id: string
  staffId: string
  type: LeaveType
  /** ISO dates; `dates` is the display label derived from them. */
  startDate: string
  endDate: string
  dates: string
  days: number
}

export interface LeadTimeSetting {
  value: number
  unit: LeadUnit
}

export interface BookingSettings {
  onlineEnabled: boolean
  url: string
  minNotice: LeadTimeSetting
  maxAhead: LeadTimeSetting
}

export interface WalkInSettings {
  enabled: boolean
  maxQueue: number
  cutoffWhenFull: boolean
  notifyWhenClose: boolean
  url: string
  /** Service ids bookable on walk-in. */
  serviceIds: string[]
}

export interface StoreSettings {
  storeName: string
  booking: BookingSettings
  walkIn: WalkInSettings
  noPaymentSoftware: boolean
}

export interface Integration {
  id: string
  name: string
  category: string
  description: string
  connected: boolean
  account: string
  /** Placeholder lettermark until real brand SVGs land. */
  color: string
  initial: string
}

export type PrinterConnection = "network" | "wired"

export const ROLL_SIZES = ["Sticker Print", "Receipt Paper"] as const
export type RollSize = (typeof ROLL_SIZES)[number]

/** The medium a new printer defaults to. */
export const DEFAULT_ROLL_SIZE: RollSize = "Receipt Paper"

export const PRINTER_PROTOCOLS = ["ESC/POS", "Star Line", "ZPL", "Raw"] as const
export type PrinterProtocol = (typeof PRINTER_PROTOCOLS)[number]

export interface PrinterSettings {
  connection: PrinterConnection
  roll: RollSize
  ip: string
  port: string
  model: string
  protocol: PrinterProtocol
}

export const CUSTOMER_DOCKET_ELEMENTS = [
  "logo",
  "jobNumber",
  "checkedIn",
  "equipment",
  "specs",
  "services",
  "prices",
  "total",
  "payNotice",
  "barcode",
  "footer",
] as const
export type CustomerDocketElement = (typeof CUSTOMER_DOCKET_ELEMENTS)[number]

export const SHOP_DOCKET_ELEMENTS = [
  "jobNumber",
  "itemCount",
  "timestamp",
  "equipment",
  "specs",
  "services",
  "serviceDetail",
  "notes",
  "customer",
  "barcode",
] as const
export type ShopDocketElement = (typeof SHOP_DOCKET_ELEMENTS)[number]

export interface DocketSettings {
  customerCopy: boolean
  header: string
  footer: string
  customerEls: Record<CustomerDocketElement, boolean>
  shopEls: Record<ShopDocketElement, boolean>
}

/**
 * Notification templates. The nav item was deliberately removed from this
 * release, but the data and the {Token} concept are retained — the screen is
 * expected to return. See the handoff README.
 */
export interface NotificationEvent {
  id: string
  name: string
  audience: "Customer" | "Staff"
  description: string
  sms: boolean
  email: boolean
  enabled: boolean
  subject: string
  header: string
  body: string
  footer: string
  smsBody: string
  timingValue?: number
  timingUnit?: LeadUnit
  timingWhen?: "before" | "after"
  timingAnchor?: string
}
