/** Primary keys arrive from Django as integers; the UI keeps them as strings. */
export type Id = string

export type FieldType = "free" | "options" | "file"
export type SelectMode = "single" | "multi"
export type PricingType = "fixed" | "quoted"
export type DurationUnit = "min" | "hr"
/** Built-in capture forms, stored on the service as codes. */
export type StandardEntryCode = "din" | "snowboard_stance"

export interface EquipmentType {
  id: Id
  name: string
  /** Whether the workshop offers this type (toggled in the Equipment Types section). */
  enabled: boolean
}

export interface FieldOption {
  /** Absent until the option has been saved. */
  id?: Id
  /** Stable React key while the option is unsaved. */
  key: string
  value: string
}

/** A single repeatable "required information" field on a service or appointment. */
export interface RequiredField {
  id?: Id
  /** Stable key for React while the field is unsaved. */
  key: string
  label: string
  type: FieldType
  selectMode: SelectMode
  options: FieldOption[]
  /** Booking fields only: also ask this on the Customer information questionnaire. */
  copyToCustomer?: boolean
}

/** Everything the service editor can change — the write payload, minus the id. */
export interface ServiceInput {
  name: string
  description: string
  color: string
  pricingType: PricingType
  price: number
  duration: number
  durationUnit: DurationUnit
  allowMultiples: boolean
  equipmentTypeIds: Id[]
  standardEntries: StandardEntryCode[]
  requiredInfo: RequiredField[]
  /** Check-in waiver */
  signatureRequired: boolean
  terms: string
  checkinCustomerSig: boolean
  checkinStaffSig: boolean
  /** Release waiver */
  releaseWaiverRequired: boolean
  releaseTerms: string
  releaseCustomerSig: boolean
  releaseStaffSig: boolean
  /** Dockets */
  docketCount: number
  /** Hidden from booking when true */
  disabled: boolean
}

export interface Service extends ServiceInput {
  id: Id
  groupId: Id
  position: number
}

export interface ServiceGroup {
  id: Id
  name: string
  position: number
  services: Service[]
}

export interface GeneralSettings {
  name: string
  email: string
  phone: string
  address: string
  logo: string | null
  currency: "CHF" | "EUR" | "GBP" | "USD"
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
}

export type AppointmentMode = "work" | "checkin"
export type BufferPosition = "before" | "after" | "both"

/** A repeatable question set with an optional terms-and-signature step. */
export interface Questionnaire {
  fields: RequiredField[]
  signatureRequired: boolean
  terms: string
}

/** Everything the appointment editor can change — the write payload, minus the id. */
export interface AppointmentInput {
  mode: AppointmentMode
  name: string
  description: string
  color: string
  duration: number
  durationUnit: DurationUnit

  /* Carry out work */
  price: number
  bufferAmount: number
  bufferUnit: DurationUnit
  bufferPosition: BufferPosition
  bookingAskName: boolean
  bookingAskEmail: boolean
  bookingAskPhone: boolean
  /** Custom fields asked at booking; those flagged copyToCustomer are mirrored below. */
  bookingFields: RequiredField[]
  maxCustomers: number
  staffRequired: number
  customerQuestionnaire: Questionnaire
  staffQuestionnaire: Questionnaire
  equipmentTypeIds: Id[]

  /* Workshop check-in */
  checkinAskName: boolean
  checkinAskEmail: boolean
  checkinAskPhone: boolean
  checkinAskBrand: boolean
  checkinAskModel: boolean
  checkinAskSize: boolean
  checkinAskColour: boolean
  checkinAskNotes: boolean
  allowServiceBooking: boolean
  bookableServiceIds: Id[]

  /** Hidden from booking when true */
  disabled: boolean
}

export interface Appointment extends AppointmentInput {
  id: Id
  groupId: Id
  position: number
}

export interface AppointmentGroup {
  id: Id
  name: string
  position: number
  appointments: Appointment[]
}
