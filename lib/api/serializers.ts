import type {
  AppointmentDto,
  NotificationEventDto,
  NotificationEventPayload,
  AppointmentFieldDto,
  AppointmentGroupDto,
  AppointmentPayload,
  EquipmentTypeDto,
  RequiredFieldDto,
  ServiceDto,
  ServiceGroupDto,
  ServicePayload,
} from "./dto"
import type {
  Appointment,
  AppointmentGroup,
  NotificationEvent,
  NotificationEventInput,
  AppointmentInput,
  EquipmentType,
  Questionnaire,
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
    completionConfirmationRequired: !!dto.completion_confirmation_required,
    docketCount: dto.docket_count ?? 0,
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
    completion_confirmation_required: input.completionConfirmationRequired,
    docket_count: input.docketCount,
    is_hidden: input.disabled,
  }
}

function toQuestionnaire(
  fields: AppointmentFieldDto[],
  role: AppointmentFieldDto["role"],
  signatureRequired: boolean,
  terms: string,
): Questionnaire {
  return {
    fields: fields.filter((field) => field.role === role).map(toRequiredField),
    signatureRequired,
    terms,
  }
}

function fromAppointmentField(
  field: RequiredField,
  index: number,
  role: AppointmentFieldDto["role"],
): AppointmentFieldDto {
  return {
    ...fromRequiredField(field, index),
    role,
    ...(role === "booking" ? { copy_to_customer: !!field.copyToCustomer } : {}),
  }
}

export function toAppointment(dto: AppointmentDto): Appointment {
  const fields = dto.fields ?? []
  return {
    id: String(dto.id),
    groupId: String(dto.group),
    position: dto.position ?? 0,
    mode: dto.mode ?? "work",
    name: dto.name ?? "",
    description: dto.description ?? "",
    color: dto.color ?? "#0284c7",
    duration: dto.duration ?? 0,
    durationUnit: dto.duration_unit ?? "min",

    price: Number(dto.price ?? 0),
    bufferAmount: dto.buffer_amount ?? 0,
    bufferUnit: dto.buffer_unit ?? "min",
    bufferPosition: dto.buffer_position ?? "after",
    bookingAskName: dto.booking_ask_name ?? true,
    bookingAskEmail: dto.booking_ask_email ?? true,
    bookingAskPhone: dto.booking_ask_phone ?? true,
    bookingFields: fields
      .filter((field) => field.role === "booking")
      .map((field) => ({ ...toRequiredField(field), copyToCustomer: !!field.copy_to_customer })),
    maxCustomers: dto.max_customers ?? 1,
    staffRequired: dto.staff_required ?? 1,
    customerQuestionnaire: toQuestionnaire(
      fields,
      "customer",
      !!dto.customer_signature_required,
      dto.customer_terms ?? "",
    ),
    staffQuestionnaire: toQuestionnaire(
      fields,
      "staff",
      !!dto.staff_signature_required,
      dto.staff_terms ?? "",
    ),
    equipmentTypeIds: (dto.equipment_types ?? []).map(String),

    checkinAskName: dto.checkin_ask_name ?? true,
    checkinAskEmail: dto.checkin_ask_email ?? true,
    checkinAskPhone: dto.checkin_ask_phone ?? true,
    checkinAskBrand: dto.checkin_ask_brand ?? true,
    checkinAskModel: dto.checkin_ask_model ?? true,
    checkinAskSize: dto.checkin_ask_size ?? true,
    checkinAskColour: dto.checkin_ask_colour ?? true,
    checkinAskNotes: dto.checkin_ask_notes ?? true,
    allowServiceBooking: !!dto.allow_service_booking,
    bookableServiceIds: (dto.bookable_services ?? []).map(String),

    disabled: !!dto.is_hidden,
  }
}

export function fromAppointmentInput(groupId: string, input: AppointmentInput): AppointmentPayload {
  return {
    group: groupId,
    mode: input.mode,
    name: input.name,
    description: input.description,
    color: input.color,
    duration: input.duration,
    duration_unit: input.durationUnit,

    price: input.price.toFixed(2),
    buffer_amount: input.bufferAmount,
    buffer_unit: input.bufferUnit,
    buffer_position: input.bufferPosition,
    booking_ask_name: input.bookingAskName,
    booking_ask_email: input.bookingAskEmail,
    booking_ask_phone: input.bookingAskPhone,
    max_customers: input.maxCustomers,
    staff_required: input.staffRequired,
    customer_signature_required: input.customerQuestionnaire.signatureRequired,
    customer_terms: input.customerQuestionnaire.terms,
    staff_signature_required: input.staffQuestionnaire.signatureRequired,
    staff_terms: input.staffQuestionnaire.terms,
    equipment_types: input.equipmentTypeIds,

    checkin_ask_name: input.checkinAskName,
    checkin_ask_email: input.checkinAskEmail,
    checkin_ask_phone: input.checkinAskPhone,
    checkin_ask_brand: input.checkinAskBrand,
    checkin_ask_model: input.checkinAskModel,
    checkin_ask_size: input.checkinAskSize,
    checkin_ask_colour: input.checkinAskColour,
    checkin_ask_notes: input.checkinAskNotes,
    allow_service_booking: input.allowServiceBooking,
    bookable_services: input.bookableServiceIds,

    fields: [
      ...input.bookingFields.map((field, index) => fromAppointmentField(field, index, "booking")),
      ...input.customerQuestionnaire.fields.map((field, index) =>
        fromAppointmentField(field, index, "customer"),
      ),
      ...input.staffQuestionnaire.fields.map((field, index) =>
        fromAppointmentField(field, index, "staff"),
      ),
    ],
    is_hidden: input.disabled,
  }
}

export function toAppointmentGroup(dto: AppointmentGroupDto): AppointmentGroup {
  return {
    id: String(dto.id),
    name: dto.name ?? "",
    position: dto.position ?? 0,
    appointments: (dto.appointments ?? []).map(toAppointment),
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

export function toNotificationEvent(dto: NotificationEventDto): NotificationEvent {
  return {
    id: String(dto.id),
    key: dto.key ?? "",
    name: dto.name ?? "",
    audience: dto.audience ?? "customer",
    description: dto.description ?? "",
    position: dto.position ?? 0,

    enabled: !!dto.enabled,
    smsEnabled: !!dto.sms_enabled,
    emailEnabled: !!dto.email_enabled,

    smsMode: dto.sms_mode ?? "default",
    smsBody: dto.sms_body ?? "",
    smsDefaultBody: dto.sms_default_body ?? "",

    emailMode: dto.email_mode ?? "default",
    emailSubject: dto.email_subject ?? "",
    emailBody: dto.email_body ?? "",
    emailDefaultSubject: dto.email_default_subject ?? "",
    emailDefaultBody: dto.email_default_body ?? "",
    emailImages: (dto.email_images ?? []).map((image) => ({
      id: image.id === undefined ? undefined : String(image.id),
      key: image.id === undefined ? fieldKey() : "image-" + image.id,
      src: image.src ?? "",
      placement: image.placement ?? "header",
    })),

    timing:
      dto.timing_hours === null || dto.timing_hours === undefined
        ? null
        : {
            hours: dto.timing_hours,
            when: dto.timing_when ?? "before",
            anchor: dto.timing_anchor ?? "",
          },
  }
}

export function fromNotificationEventInput(
  input: NotificationEventInput,
): NotificationEventPayload {
  return {
    enabled: input.enabled,
    sms_enabled: input.smsEnabled,
    email_enabled: input.emailEnabled,
    sms_mode: input.smsMode,
    sms_body: input.smsBody,
    email_mode: input.emailMode,
    email_subject: input.emailSubject,
    email_body: input.emailBody,
    email_images: input.emailImages.map((image, index) => ({
      ...(image.id ? { id: image.id } : {}),
      src: image.src,
      placement: image.placement,
      position: index,
    })),
    ...(input.timing ? { timing_hours: input.timing.hours } : {}),
  }
}
