/**
 * Wire format ⇄ domain model.
 *
 * DRF serializers are snake_case; the UI is camelCase. Every field the backend
 * sends is mapped here, so a serializer rename is a one-file change.
 */
import type {
  BookingInterval,
  Break,
  DocketSettings,
  Day,
  Integration,
  LeadTime,
  LeadUnit,
  LeaveEntry,
  LeaveType,
  NotifyPreference,
  PrinterConnection,
  PrinterProtocol,
  PrinterSettings,
  RollSize,
  Service,
  ServiceCategory,
  StaffMember,
  StaffStatus,
  StoreSettings,
  TimeBlock,
} from "../types"
import { countDays, formatDateRange } from "../time"

/* ------------------------------------------------------------------ staff */

export interface StaffDTO {
  id: string | number
  name: string
  role: string
  initials?: string
  email: string
  phone?: string
  status?: StaffStatus
  color?: string
  available_hours: number
  days_off: Day[]
  booking_notify: NotifyPreference
  can_check_equipment: boolean
  can_complete_appointments: boolean
}

export function toStaff(dto: StaffDTO): StaffMember {
  return {
    id: String(dto.id),
    name: dto.name,
    role: dto.role,
    initials: dto.initials ?? "",
    email: dto.email,
    phone: dto.phone ?? "",
    status: dto.status ?? "Active",
    color: dto.color ?? "#78716c",
    availableHours: dto.available_hours,
    daysOff: dto.days_off ?? [],
    bookingNotify: dto.booking_notify ?? "every",
    canCheckEquipment: dto.can_check_equipment ?? true,
    canCompleteAppointments: dto.can_complete_appointments ?? true,
  }
}

/**
 * What a form may send. `initials`, `color` and `status` are owned by the
 * server (generated on create, preserved on update), so they are never part of
 * a form payload — sending them blank would overwrite the stored values.
 */
export type StaffInput = Omit<
  StaffMember,
  "id" | "initials" | "color" | "status"
>

export function fromStaff(
  staff: Partial<
    StaffInput & Pick<StaffMember, "initials" | "color" | "status">
  >,
): Partial<StaffDTO> {
  const dto: Partial<StaffDTO> = {}
  if (staff.name !== undefined) dto.name = staff.name
  if (staff.role !== undefined) dto.role = staff.role
  if (staff.initials !== undefined) dto.initials = staff.initials
  if (staff.email !== undefined) dto.email = staff.email
  if (staff.phone !== undefined) dto.phone = staff.phone
  if (staff.status !== undefined) dto.status = staff.status
  if (staff.color !== undefined) dto.color = staff.color
  if (staff.availableHours !== undefined)
    dto.available_hours = staff.availableHours
  if (staff.daysOff !== undefined) dto.days_off = staff.daysOff
  if (staff.bookingNotify !== undefined)
    dto.booking_notify = staff.bookingNotify
  if (staff.canCheckEquipment !== undefined)
    dto.can_check_equipment = staff.canCheckEquipment
  if (staff.canCompleteAppointments !== undefined)
    dto.can_complete_appointments = staff.canCompleteAppointments
  return dto
}

/* --------------------------------------------------------------- services */

export interface ServiceDTO {
  id: string | number
  name: string
  category: ServiceCategory
  duration_minutes: number
  price_display: string
  enabled: boolean
}

export function toService(dto: ServiceDTO): Service {
  return {
    id: String(dto.id),
    name: dto.name,
    category: dto.category,
    duration: dto.duration_minutes,
    price: dto.price_display,
    enabled: dto.enabled,
  }
}

/* ------------------------------------------------------------ time blocks */

export interface LeadTimeDTO {
  custom: boolean
  min_value: number
  min_unit: LeadUnit
  max_value: number
  max_unit: LeadUnit
}

export interface TimeBlockDTO {
  id: string | number
  staff: string | number
  day: Day
  start_time: string
  end_time: string
  categories: ServiceCategory[]
  service_ids: (string | number)[]
  recurring: boolean
  enabled: boolean
  interval_minutes: BookingInterval
  online: boolean
  breaks: { start_time: string; end_time: string }[]
  lead_times: Record<string, LeadTimeDTO>
}

/** Django returns "HH:MM:SS"; the UI works in "HH:MM". */
function trimSeconds(time: string): string {
  return time.length > 5 ? time.slice(0, 5) : time
}

export function toTimeBlock(dto: TimeBlockDTO): TimeBlock {
  const lead: Record<string, LeadTime> = {}
  for (const [serviceId, value] of Object.entries(dto.lead_times ?? {})) {
    lead[serviceId] = {
      custom: value.custom,
      min: value.min_value,
      minUnit: value.min_unit,
      max: value.max_value,
      maxUnit: value.max_unit,
    }
  }

  return {
    id: String(dto.id),
    staffId: String(dto.staff),
    day: dto.day,
    start: trimSeconds(dto.start_time),
    end: trimSeconds(dto.end_time),
    services: dto.categories ?? [],
    appointments: (dto.service_ids ?? []).map(String),
    recurring: dto.recurring,
    enabled: dto.enabled,
    interval: dto.interval_minutes,
    online: dto.online,
    breaks: (dto.breaks ?? []).map((b) => ({
      start: trimSeconds(b.start_time),
      end: trimSeconds(b.end_time),
    })),
    lead,
  }
}

export type TimeBlockInput = Omit<TimeBlock, "id">

export function fromTimeBlock(
  block: Partial<TimeBlockInput>,
): Partial<TimeBlockDTO> {
  const dto: Partial<TimeBlockDTO> = {}
  if (block.staffId !== undefined) dto.staff = block.staffId
  if (block.day !== undefined) dto.day = block.day
  if (block.start !== undefined) dto.start_time = block.start
  if (block.end !== undefined) dto.end_time = block.end
  if (block.services !== undefined) dto.categories = block.services
  if (block.appointments !== undefined) dto.service_ids = block.appointments
  if (block.recurring !== undefined) dto.recurring = block.recurring
  if (block.enabled !== undefined) dto.enabled = block.enabled
  if (block.interval !== undefined) dto.interval_minutes = block.interval
  if (block.online !== undefined) dto.online = block.online
  if (block.breaks !== undefined) {
    dto.breaks = block.breaks.map((b: Break) => ({
      start_time: b.start,
      end_time: b.end,
    }))
  }
  if (block.lead !== undefined) {
    const lead: Record<string, LeadTimeDTO> = {}
    for (const [serviceId, value] of Object.entries(block.lead)) {
      lead[serviceId] = {
        custom: value.custom,
        min_value: value.min,
        min_unit: value.minUnit,
        max_value: value.max,
        max_unit: value.maxUnit,
      }
    }
    dto.lead_times = lead
  }
  return dto
}

/* ------------------------------------------------------------------ leave */

export interface LeaveDTO {
  id: string | number
  staff: string | number
  leave_type: LeaveType
  start_date: string
  end_date: string
  /** Optional: the backend may compute the span itself. */
  days?: number
}

export function toLeave(dto: LeaveDTO): LeaveEntry {
  return {
    id: String(dto.id),
    staffId: String(dto.staff),
    type: dto.leave_type,
    startDate: dto.start_date,
    endDate: dto.end_date,
    dates: formatDateRange(dto.start_date, dto.end_date),
    days: dto.days ?? countDays(dto.start_date, dto.end_date),
  }
}

export interface LeaveInput {
  staffId: string
  type: LeaveType
  startDate: string
  endDate: string
}

export function fromLeave(input: Partial<LeaveInput>): Partial<LeaveDTO> {
  const dto: Partial<LeaveDTO> = {}
  if (input.staffId !== undefined) dto.staff = input.staffId
  if (input.type !== undefined) dto.leave_type = input.type
  if (input.startDate !== undefined) dto.start_date = input.startDate
  if (input.endDate !== undefined) dto.end_date = input.endDate
  return dto
}

/* --------------------------------------------------------- store settings */

export interface StoreSettingsDTO {
  store_name: string
  online_booking_enabled: boolean
  booking_url: string
  min_notice_value: number
  min_notice_unit: LeadUnit
  max_ahead_value: number
  max_ahead_unit: LeadUnit
  walk_in_enabled: boolean
  walk_in_url: string
  walk_in_max_queue: number
  walk_in_cutoff_when_full: boolean
  walk_in_notify_when_close: boolean
  walk_in_service_ids: (string | number)[]
  no_payment_software: boolean
}

export function toStoreSettings(dto: StoreSettingsDTO): StoreSettings {
  return {
    storeName: dto.store_name,
    booking: {
      onlineEnabled: dto.online_booking_enabled,
      url: dto.booking_url,
      minNotice: { value: dto.min_notice_value, unit: dto.min_notice_unit },
      maxAhead: { value: dto.max_ahead_value, unit: dto.max_ahead_unit },
    },
    walkIn: {
      enabled: dto.walk_in_enabled,
      url: dto.walk_in_url,
      maxQueue: dto.walk_in_max_queue,
      cutoffWhenFull: dto.walk_in_cutoff_when_full,
      notifyWhenClose: dto.walk_in_notify_when_close,
      serviceIds: (dto.walk_in_service_ids ?? []).map(String),
    },
    noPaymentSoftware: dto.no_payment_software,
  }
}

export function fromStoreSettings(
  settings: Partial<StoreSettings>,
): Partial<StoreSettingsDTO> {
  const dto: Partial<StoreSettingsDTO> = {}
  if (settings.storeName !== undefined) dto.store_name = settings.storeName
  if (settings.booking) {
    const { onlineEnabled, url, minNotice, maxAhead } = settings.booking
    if (onlineEnabled !== undefined) dto.online_booking_enabled = onlineEnabled
    if (url !== undefined) dto.booking_url = url
    if (minNotice) {
      dto.min_notice_value = minNotice.value
      dto.min_notice_unit = minNotice.unit
    }
    if (maxAhead) {
      dto.max_ahead_value = maxAhead.value
      dto.max_ahead_unit = maxAhead.unit
    }
  }
  if (settings.walkIn) {
    const w = settings.walkIn
    if (w.enabled !== undefined) dto.walk_in_enabled = w.enabled
    if (w.url !== undefined) dto.walk_in_url = w.url
    if (w.maxQueue !== undefined) dto.walk_in_max_queue = w.maxQueue
    if (w.cutoffWhenFull !== undefined)
      dto.walk_in_cutoff_when_full = w.cutoffWhenFull
    if (w.notifyWhenClose !== undefined)
      dto.walk_in_notify_when_close = w.notifyWhenClose
    if (w.serviceIds !== undefined) dto.walk_in_service_ids = w.serviceIds
  }
  if (settings.noPaymentSoftware !== undefined)
    dto.no_payment_software = settings.noPaymentSoftware
  return dto
}

/* ----------------------------------------------------------- integrations */

export interface IntegrationDTO {
  id: string
  name: string
  category: string
  description: string
  connected: boolean
  account: string
  color?: string
  initial?: string
}

export function toIntegration(dto: IntegrationDTO): Integration {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    description: dto.description,
    connected: dto.connected,
    account: dto.account ?? "",
    color: dto.color ?? "#78716c",
    initial: dto.initial ?? dto.name.charAt(0).toUpperCase(),
  }
}

/* --------------------------------------------------------------- printing */

export interface PrinterSettingsDTO {
  connection: PrinterConnection
  roll_size: RollSize
  ip_address: string
  port: string | number
  model: string
  protocol: PrinterProtocol
}

export function toPrinterSettings(dto: PrinterSettingsDTO): PrinterSettings {
  return {
    connection: dto.connection,
    roll: dto.roll_size,
    ip: dto.ip_address,
    port: String(dto.port),
    model: dto.model,
    protocol: dto.protocol,
  }
}

export function fromPrinterSettings(
  settings: Partial<PrinterSettings>,
): Partial<PrinterSettingsDTO> {
  const dto: Partial<PrinterSettingsDTO> = {}
  if (settings.connection !== undefined) dto.connection = settings.connection
  if (settings.roll !== undefined) dto.roll_size = settings.roll
  if (settings.ip !== undefined) dto.ip_address = settings.ip
  if (settings.port !== undefined) dto.port = settings.port
  if (settings.model !== undefined) dto.model = settings.model
  if (settings.protocol !== undefined) dto.protocol = settings.protocol
  return dto
}

export interface DocketSettingsDTO {
  customer_copy_enabled: boolean
  header_text: string
  footer_text: string
  customer_elements: Record<string, boolean>
  shop_elements: Record<string, boolean>
}

export function toDocketSettings(dto: DocketSettingsDTO): DocketSettings {
  return {
    customerCopy: dto.customer_copy_enabled,
    header: dto.header_text,
    footer: dto.footer_text,
    customerEls: dto.customer_elements as DocketSettings["customerEls"],
    shopEls: dto.shop_elements as DocketSettings["shopEls"],
  }
}

export function fromDocketSettings(
  settings: Partial<DocketSettings>,
): Partial<DocketSettingsDTO> {
  const dto: Partial<DocketSettingsDTO> = {}
  if (settings.customerCopy !== undefined)
    dto.customer_copy_enabled = settings.customerCopy
  if (settings.header !== undefined) dto.header_text = settings.header
  if (settings.footer !== undefined) dto.footer_text = settings.footer
  if (settings.customerEls !== undefined)
    dto.customer_elements = settings.customerEls
  if (settings.shopEls !== undefined) dto.shop_elements = settings.shopEls
  return dto
}
