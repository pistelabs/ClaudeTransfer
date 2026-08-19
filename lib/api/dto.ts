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
  docket_count: number
  barcode_on_docket: boolean
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
