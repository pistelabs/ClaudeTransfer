import type {
  EquipmentTypeDto,
  RequiredFieldDto,
  ServiceDto,
  ServiceGroupDto,
  ServicePayload,
} from "./dto"
import type {
  EquipmentType,
  RequiredField,
  Service,
  ServiceGroup,
  ServiceInput,
  StandardEntryCode,
} from "@/lib/workshop/types"

const STANDARD_ENTRY_CODES: StandardEntryCode[] = ["din", "snowboard_stance"]

let keySeed = 0
/** Stable React key for a field that has no server id yet. */
export function fieldKey() {
  keySeed += 1
  return "field-" + keySeed
}

export function toEquipmentType(dto: EquipmentTypeDto): EquipmentType {
  return { id: String(dto.id), name: dto.name, enabled: !!dto.enabled }
}

function toRequiredField(dto: RequiredFieldDto): RequiredField {
  return {
    id: dto.id === undefined ? undefined : String(dto.id),
    key: dto.id === undefined ? fieldKey() : "field-" + dto.id,
    label: dto.label ?? "",
    type: dto.field_type ?? "free",
    selectMode: dto.select_mode ?? "single",
    options: (dto.options ?? []).map((option) => ({
      id: option.id === undefined ? undefined : String(option.id),
      key: option.id === undefined ? fieldKey() : "option-" + option.id,
      value: option.value ?? "",
    })),
  }
}

function fromRequiredField(field: RequiredField, index: number): RequiredFieldDto {
  return {
    ...(field.id ? { id: field.id } : {}),
    label: field.label,
    field_type: field.type,
    select_mode: field.selectMode,
    position: index,
    options:
      field.type === "options"
        ? field.options.map((option, optionIndex) => ({
            ...(option.id ? { id: option.id } : {}),
            value: option.value,
            position: optionIndex,
          }))
        : [],
  }
}

export function toService(dto: ServiceDto): Service {
  return {
    id: String(dto.id),
    groupId: String(dto.group),
    position: dto.position ?? 0,
    name: dto.name ?? "",
    description: dto.description ?? "",
    color: dto.color ?? "#3b82f6",
    pricingType: dto.pricing_type ?? "fixed",
    price: Number(dto.price ?? 0),
    duration: dto.duration ?? 0,
    durationUnit: dto.duration_unit ?? "min",
    allowMultiples: !!dto.allow_multiples,
    equipmentTypeIds: (dto.equipment_types ?? []).map(String),
    standardEntries: (dto.standard_entries ?? []).filter((code): code is StandardEntryCode =>
      STANDARD_ENTRY_CODES.includes(code as StandardEntryCode),
    ),
    requiredInfo: (dto.required_fields ?? []).map(toRequiredField),
    signatureRequired: !!dto.checkin_waiver_required,
    terms: dto.checkin_terms ?? "",
    checkinCustomerSig: !!dto.checkin_customer_signature,
    checkinStaffSig: !!dto.checkin_staff_signature,
    releaseWaiverRequired: !!dto.release_waiver_required,
    releaseTerms: dto.release_terms ?? "",
    releaseCustomerSig: !!dto.release_customer_signature,
    releaseStaffSig: !!dto.release_staff_signature,
    docketCount: dto.docket_count ?? 0,
    barcodeOnDocket: !!dto.barcode_on_docket,
    disabled: !!dto.is_hidden,
  }
}

export function fromServiceInput(groupId: string, input: ServiceInput): ServicePayload {
  return {
    group: groupId,
    name: input.name,
    description: input.description,
    color: input.color,
    pricing_type: input.pricingType,
    price: input.price.toFixed(2),
    duration: input.duration,
    duration_unit: input.durationUnit,
    allow_multiples: input.allowMultiples,
    equipment_types: input.equipmentTypeIds,
    standard_entries: input.standardEntries,
    required_fields: input.requiredInfo.map(fromRequiredField),
    checkin_waiver_required: input.signatureRequired,
    checkin_terms: input.terms,
    checkin_customer_signature: input.checkinCustomerSig,
    checkin_staff_signature: input.checkinStaffSig,
    release_waiver_required: input.releaseWaiverRequired,
    release_terms: input.releaseTerms,
    release_customer_signature: input.releaseCustomerSig,
    release_staff_signature: input.releaseStaffSig,
    docket_count: input.docketCount,
    barcode_on_docket: input.barcodeOnDocket,
    is_hidden: input.disabled,
  }
}

export function toServiceGroup(dto: ServiceGroupDto): ServiceGroup {
  return {
    id: String(dto.id),
    name: dto.name ?? "",
    position: dto.position ?? 0,
    services: (dto.services ?? []).map(toService),
  }
}
