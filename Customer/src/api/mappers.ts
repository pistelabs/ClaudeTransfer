import {
  ABILITY_FROM_VALUE,
  ABILITY_TO_VALUE,
  APPOINTMENT_STATUS_FROM_VALUE,
  BRANCH_FROM_VALUE,
  BRANCH_TO_VALUE,
  EQUIPMENT_STATUS_FROM_VALUE,
  PREFERRED_FROM_VALUE,
  PREFERRED_TO_VALUE,
} from './dto';
import type {
  AppointmentDto,
  CustomerCreateDto,
  CustomerDto,
  CustomerUpdateDto,
  DinMeasurementsDto,
  DinRecordDto,
  EquipmentDto,
  JobDto,
} from './dto';
import {
  formatIsoDate,
  formatIsoLongDate,
  formatIsoTime,
  formatIsoTimestamp,
  formatPrice,
} from '../lib/format';
import type {
  Appointment,
  Customer,
  CustomerEdit,
  DinMeasurements,
  DinRecord,
  Equipment,
  Job,
  NewCustomerInput,
} from '../types';

/* ---- server → UI ---- */

function toJob(dto: JobDto): Job {
  return {
    sequence: dto.sequence,
    date: formatIsoDate(dto.completed_on),
    tech: dto.technician,
    service: dto.service,
  };
}

function toEquipment(dto: EquipmentDto): Equipment {
  return {
    status: EQUIPMENT_STATUS_FROM_VALUE[dto.status],
    name: dto.name,
    size: dto.size,
    notes: dto.notes,
    jobs: dto.jobs.map(toJob),
  };
}

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    date: formatIsoDate(dto.scheduled_on),
    time: formatIsoTime(dto.scheduled_at),
    service: dto.service,
    status: APPOINTMENT_STATUS_FROM_VALUE[dto.status],
    tech: dto.technician,
    notes: dto.notes,
    price: formatPrice(dto.price),
  };
}

export function toCustomer(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    branch: BRANCH_FROM_VALUE[dto.branch],
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    last: formatIsoDate(dto.last_activity_on),
    memberSince: formatIsoLongDate(dto.member_since),
    preferred: PREFERRED_FROM_VALUE[dto.preferred_contact],
    prefs: {
      emailEquip: dto.prefs.email_equipment,
      smsEquip: dto.prefs.sms_equipment,
      emailPromo: dto.prefs.email_promotions,
      smsPromo: dto.prefs.sms_promotions,
    },
    equipment: dto.equipment.map(toEquipment),
    appointments: dto.appointments.map(toAppointment),
  };
}

function toMeasurements(dto: DinMeasurementsDto): DinMeasurements {
  return {
    height: dto.height_cm,
    weight: dto.weight_kg,
    age: dto.age,
    bsl: dto.boot_sole_mm,
    ability: ABILITY_FROM_VALUE[dto.ability],
  };
}

export function toDinRecord(dto: DinRecordDto): DinRecord {
  return {
    measurements: toMeasurements(dto.measurements),
    custom: dto.custom_value,
    signedAt: dto.signed_at ? formatIsoTimestamp(dto.signed_at) : '',
    signatureUrl: dto.signature_url ?? '',
  };
}

/* ---- UI → server ---- */

export function toCustomerCreateDto(input: NewCustomerInput): CustomerCreateDto {
  const isEmail = input.channel === 'Email';
  return {
    name: `${input.first.trim()} ${input.last.trim()}`.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    branch: 'city',
    preferred_contact: isEmail ? 'email' : 'sms',
    prefs: {
      email_equipment: isEmail,
      sms_equipment: !isEmail,
      email_promotions: false,
      sms_promotions: false,
    },
  };
}

export function toCustomerUpdateDto(edit: CustomerEdit): CustomerUpdateDto {
  return {
    name: edit.name,
    email: edit.email,
    phone: edit.phone,
    branch: BRANCH_TO_VALUE[edit.branch],
    preferred_contact: PREFERRED_TO_VALUE[edit.preferred],
  };
}

export function toMeasurementsDto(patch: Partial<DinMeasurements>): Partial<DinMeasurementsDto> {
  const dto: Partial<DinMeasurementsDto> = {};
  if (patch.height !== undefined) dto.height_cm = String(patch.height);
  if (patch.weight !== undefined) dto.weight_kg = String(patch.weight);
  if (patch.age !== undefined) dto.age = Number(patch.age) || 0;
  if (patch.bsl !== undefined) dto.boot_sole_mm = String(patch.bsl);
  if (patch.ability !== undefined) dto.ability = ABILITY_TO_VALUE[patch.ability];
  return dto;
}

export function toCustomValueDto(value: number | string | null): string | null {
  if (value === null || value === '') return null;
  return String(value);
}
