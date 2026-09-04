/** Wire format of the Django REST API (snake_case, as DRF serializes it). */

export interface EquipmentTypeDto {
  id: number | string
  name: string
  enabled: boolean
}

export interface FieldOptionDto {
  id?: number | string
  value: string
  position?: number
}

export interface RequiredFieldDto {
  id?: number | string
  label: string
  field_type: "free" | "options" | "file"
  select_mode: "single" | "multi"
  options: FieldOptionDto[]
  position?: number
}

export interface ServiceDto {
  id: number | string
  group: number | string
  name: string
  description: string
  color: string
  pricing_type: "fixed" | "quoted"
  /** DecimalField — DRF serializes it as a string by default. */
  price: string | number
  duration: number
  duration_unit: "min" | "hr"
  allow_multiples: boolean
  equipment_types: Array<number | string>
  standard_entries: string[]
  required_fields: RequiredFieldDto[]
  checkin_waiver_required: boolean
  checkin_terms: string
  checkin_customer_signature: boolean
  checkin_staff_signature: boolean
  release_waiver_required: boolean
  release_terms: string
  release_customer_signature: boolean
  release_staff_signature: boolean
  completion_confirmation_required: boolean
  docket_count: number
  is_hidden: boolean
  position: number
}

/** Write payload — the server owns id, group is set from the URL/body on create. */
export type ServicePayload = Omit<ServiceDto, "id" | "position" | "price"> & {
  price: string
  position?: number
}

export interface ServiceGroupDto {
  id: number | string
  name: string
  position: number
  /** Nested read-only list; see docs/django-api.md. */
  services: ServiceDto[]
}

/** Appointment fields carry the questionnaire they belong to. */
export interface AppointmentFieldDto extends RequiredFieldDto {
  role: "booking" | "customer" | "staff"
  copy_to_customer?: boolean
}

export interface AppointmentDto {
  id: number | string
  group: number | string
  mode: "work" | "checkin"
  name: string
  description: string
  color: string
  duration: number
  duration_unit: "min" | "hr"

  price: string | number
  buffer_amount: number
  buffer_unit: "min" | "hr"
  buffer_position: "before" | "after" | "both"
  booking_ask_name: boolean
  booking_ask_email: boolean
  booking_ask_phone: boolean
  max_customers: number
  staff_required: number
  customer_signature_required: boolean
  customer_terms: string
  staff_signature_required: boolean
  staff_terms: string
  equipment_types: Array<number | string>

  checkin_ask_name: boolean
  checkin_ask_email: boolean
  checkin_ask_phone: boolean
  checkin_ask_brand: boolean
  checkin_ask_model: boolean
  checkin_ask_size: boolean
  checkin_ask_colour: boolean
  checkin_ask_notes: boolean
  allow_service_booking: boolean
  bookable_services: Array<number | string>

  /** Booking, customer and staff questions in one list, split by `role`. */
  fields: AppointmentFieldDto[]
  is_hidden: boolean
  position: number
}

export type AppointmentPayload = Omit<AppointmentDto, "id" | "position" | "price"> & {
  price: string
  position?: number
}

export interface AppointmentGroupDto {
  id: number | string
  name: string
  position: number
  appointments: AppointmentDto[]
}

export interface EmailImageDto {
  id?: number | string
  src: string
  placement: "header" | "above_body" | "below_body" | "footer"
  position?: number
}

export interface NotificationEventDto {
  id: number | string
  key: string
  name: string
  audience: "customer" | "staff"
  description: string
  position: number

  enabled: boolean
  sms_enabled: boolean
  email_enabled: boolean

  sms_mode: "default" | "custom"
  sms_body: string
  sms_default_body: string

  email_mode: "default" | "custom"
  email_subject: string
  email_body: string
  email_default_subject: string
  email_default_body: string
  email_images: EmailImageDto[]

  /** Null on events that fire immediately. */
  timing_hours: number | null
  timing_when: "before" | "after" | null
  timing_anchor: string | null
}

/** PATCH body — only the editable fields are ever sent. */
export interface NotificationEventPayload {
  enabled: boolean
  sms_enabled: boolean
  email_enabled: boolean
  sms_mode: "default" | "custom"
  sms_body: string
  email_mode: "default" | "custom"
  email_subject: string
  email_body: string
  email_images: EmailImageDto[]
  timing_hours?: number | null
}

export interface CompanySendingDomainDto {
  address: string
}
