/**
 * The wire format: what Django sends and expects.
 *
 * Deliberately separate from the types in `src/types.ts`. Those describe what
 * this app works with; these describe what crosses the network, in the shape
 * Django REST Framework produces by default — snake_case keys, primary keys
 * rather than positions, ISO 8601 instants, and DecimalFields as strings so no
 * precision is lost on the way.
 *
 * Keeping them apart means the backend can rename a field without the schedule
 * grid caring, and the mapping stays in one file where it can be read.
 */
import type { TypeCode } from '../types';

/** DRF's default list envelope (`PageNumberPagination`). */
export interface ApiPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiStaff {
  id: string;
  name: string;
  role: string;
  /** hex, drawn as the fitter's dot and their bookings' accent */
  colour: string;
  initials: string;
  /** minutes from midnight, local to the shop */
  shift_start: number;
  shift_end: number;
  break_start: number;
  break_end: number;
}

export interface ApiService {
  id: string;
  name: string;
  /** which group of work it belongs to */
  type: TypeCode;
  duration_minutes: number;
  /** DecimalField, e.g. "120.00" */
  price: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  /** how many customers it takes; 1 unless stated */
  seats: number;
}

export interface ApiAppointment {
  id: string;
  /** ISO 8601 with an offset — the booking itself, not a position on a grid */
  starts_at: string;
  duration_minutes: number;
  /** the fitter leading it */
  staff_id: string;
  /** anyone else working it; each of them is busy for the duration */
  assist_staff_ids: string[];
  type: TypeCode;
  service_id: string | null;
  customer_name: string;
  /** everybody on the booking when it is more than one person */
  party: string[];
  note: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  booked_at: string;
  /** a staff id, or one of 'online' | 'internal' | 'walkin' */
  booked_via: string;
}

export interface ApiWalkIn {
  id: string;
  type: TypeCode;
  service_id: string | null;
  customer_name: string;
  party: string[];
  note: string;
  duration_minutes: number;
  checked_in_at: string;
  /** a staff id, or 'self' when they used the portal */
  checked_in_by: string;
}

export interface ApiCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  visit_count: number;
  preferred_channel: 'email' | 'sms';
}

export interface ApiPayment {
  appointment_id: string;
  method: 'shopify' | 'shopify-link' | 'square' | 'stripe' | 'external';
  /** DecimalField, e.g. "120.00" */
  amount: string;
  taken_at: string;
  /** the staff id who took it, null for an online payment */
  taken_by: string | null;
  source: string | null;
  /** a link has gone out but nothing has arrived */
  pending: boolean;
}
