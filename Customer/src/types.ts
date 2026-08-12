export type Branch = 'City Branch' | 'Mountain Branch';

export type PreferredContact = 'Email' | 'SMS' | 'Phone';

export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';

export type EquipmentStatus = 'ACTIVE' | 'RETIRED';

export type SkierAbility = 'Type I — Cautious' | 'Type II — Moderate' | 'Type III — Aggressive';

/** Communication opt-ins. Drives the "SMS/Email opted-in" directory filters. */
export interface ContactPrefs {
  emailEquip: boolean;
  smsEquip: boolean;
  emailPromo: boolean;
  smsPromo: boolean;
}

/** A completed job against a piece of equipment. */
export interface Job {
  /** Sequence number only — the display ID is built by `formatJobId`. */
  sequence: string;
  date: string;
  tech: string;
  service: string;
}

export interface Equipment {
  status: EquipmentStatus;
  name: string;
  size: string;
  jobs: Job[];
}

export interface Appointment {
  date: string;
  time: string;
  service: string;
  status: AppointmentStatus;
  tech: string;
  notes: string;
  price: string;
}

/** The measurements a DIN release value is calculated from. */
export interface DinMeasurements {
  height: number | string;
  weight: number | string;
  age: number | string;
  bsl: number | string;
  ability: SkierAbility;
}

/**
 * Per-customer DIN record. In a real backend this is its own table: the
 * measurements, the override, and the signature that authorises it.
 */
export interface DinRecord {
  measurements: DinMeasurements;
  /** `null` while the calculated value stands; a value once overridden. */
  custom: number | string | null;
  signedAt: string;
  /** PNG data URL in the prototype; an uploaded asset URL in production. */
  signatureUrl: string;
}

export interface Customer {
  id: string;
  branch: Branch;
  name: string;
  email: string;
  phone: string;
  /** Last activity date, as a display string. */
  last: string;
  memberSince: string;
  preferred: PreferredContact;
  prefs: ContactPrefs;
  equipment: Equipment[];
  appointments: Appointment[];
}

/** The subset of a customer the sidebar edit form writes back. */
export type CustomerEdit = Pick<Customer, 'name' | 'branch' | 'phone' | 'email' | 'preferred'>;

/** Payload for the "Add a customer" dialog. */
export interface NewCustomerInput {
  first: string;
  last: string;
  email: string;
  phone: string;
  channel: 'Email' | 'SMS';
}
