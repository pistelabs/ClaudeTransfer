/**
 * Wire shapes for the Django REST API.
 *
 * These mirror what DRF serializers emit — snake_case keys, ISO dates, decimal
 * strings for money, and lowercase choice values — and are deliberately kept
 * separate from the UI types in `src/types.ts`. `mappers.ts` converts between
 * the two, so a change on either side of the wire stays in one place.
 *
 * See `docs/api-contract.md` for the endpoints and example payloads.
 */

export type BranchValue = 'city' | 'mountain';
export type PreferredContactValue = 'email' | 'sms' | 'phone';
export type AppointmentStatusValue = 'confirmed' | 'completed' | 'cancelled' | 'pending';
export type EquipmentStatusValue = 'active' | 'retired';
export type SkierAbilityValue = 'type_1' | 'type_2' | 'type_3';

export interface ContactPrefsDto {
  email_equipment: boolean;
  sms_equipment: boolean;
  email_promotions: boolean;
  sms_promotions: boolean;
}

export interface JobDto {
  id: string;
  /** Job number within the branch; the display ID is built from it. */
  sequence: string;
  service: string;
  technician: string;
  /** ISO date, `YYYY-MM-DD`. */
  completed_on: string;
}

export interface EquipmentDto {
  id: string;
  status: EquipmentStatusValue;
  name: string;
  size: string;
  notes: string;
  jobs: JobDto[];
}

export interface AppointmentDto {
  id: string;
  /** ISO date, `YYYY-MM-DD`. */
  scheduled_on: string;
  /** 24-hour local time, `HH:MM`. */
  scheduled_at: string;
  service: string;
  status: AppointmentStatusValue;
  technician: string;
  notes: string;
  /** Decimal string, e.g. `"65.00"`. */
  price: string;
}

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: BranchValue;
  preferred_contact: PreferredContactValue;
  /** ISO date of the most recent activity. */
  last_activity_on: string;
  /** ISO date the customer record was created. */
  member_since: string;
  prefs: ContactPrefsDto;
  equipment: EquipmentDto[];
  appointments: AppointmentDto[];
}

/** Body for `POST /api/customers/`. */
export interface CustomerCreateDto {
  name: string;
  email: string;
  phone: string;
  branch: BranchValue;
  preferred_contact: PreferredContactValue;
  prefs: ContactPrefsDto;
}

/** Body for `PATCH /api/customers/{id}/` — every field optional. */
export type CustomerUpdateDto = Partial<
  Pick<CustomerDto, 'name' | 'email' | 'phone' | 'branch' | 'preferred_contact'>
>;

export interface DinMeasurementsDto {
  height_cm: string;
  weight_kg: string;
  age: number;
  boot_sole_mm: string;
  ability: SkierAbilityValue;
}

export interface DinRecordDto {
  customer: string;
  measurements: DinMeasurementsDto;
  /** Decimal string when overridden, `null` while the calculated value stands. */
  custom_value: string | null;
  /** ISO 8601 timestamp of the sign-off, or `null` if unsigned. */
  signed_at: string | null;
  /** URL of the stored signature image, or `null` if unsigned. */
  signature_url: string | null;
  /** Staff member who signed the override off. */
  signed_by: string | null;
}

/** Body for `PATCH /api/customers/{id}/din/`. */
export interface DinRecordUpdateDto {
  measurements?: Partial<DinMeasurementsDto>;
  custom_value?: string | null;
}

/* ---- choice mappings ---- */

export const BRANCH_FROM_VALUE = {
  city: 'City Branch',
  mountain: 'Mountain Branch',
} as const;

export const BRANCH_TO_VALUE = {
  'City Branch': 'city',
  'Mountain Branch': 'mountain',
} as const;

export const PREFERRED_FROM_VALUE = {
  email: 'Email',
  sms: 'SMS',
  phone: 'Phone',
} as const;

export const PREFERRED_TO_VALUE = {
  Email: 'email',
  SMS: 'sms',
  Phone: 'phone',
} as const;

export const APPOINTMENT_STATUS_FROM_VALUE = {
  confirmed: 'CONFIRMED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  pending: 'PENDING',
} as const;

export const EQUIPMENT_STATUS_FROM_VALUE = {
  active: 'ACTIVE',
  retired: 'RETIRED',
} as const;

export const ABILITY_FROM_VALUE = {
  type_1: 'Type I — Cautious',
  type_2: 'Type II — Moderate',
  type_3: 'Type III — Aggressive',
} as const;

export const ABILITY_TO_VALUE = {
  'Type I — Cautious': 'type_1',
  'Type II — Moderate': 'type_2',
  'Type III — Aggressive': 'type_3',
} as const;
