export type FieldType = "free" | "options" | "file"
export type SelectMode = "single" | "multi"
export type PricingType = "fixed" | "quoted"
export type DurationUnit = "min" | "hr"

export interface FieldOption {
  id: string
  value: string
}

/** A single repeatable "required information" field on a service or appointment. */
export interface RequiredField {
  id: string
  label: string
  type: FieldType
  selectMode: SelectMode
  options: FieldOption[]
}

export interface Service {
  id: string
  name: string
  description: string
  color: string
  pricingType: PricingType
  price: number
  duration: number
  durationUnit: DurationUnit
  allowMultiples: boolean
  equipmentTypes: Record<string, boolean>
  standardEntries: Record<string, boolean>
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
  barcodeOnDocket: boolean
  /** Hidden from booking when true */
  disabled: boolean
}

export interface ServiceGroup {
  id: string
  name: string
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
