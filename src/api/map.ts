/**
 * Wire ↔ domain. The only place the two vocabularies meet.
 *
 * Three conversions matter, and all of them are here rather than scattered:
 *  - people are primary keys on the wire and ids in the app; the grid's column
 *    positions are worked out from the staff list at render time, never stored;
 *  - a booking is an instant on the wire, and stays one in the app — its day,
 *    week and minute are derived by `placed`, because they are relative to today;
 *  - money is a DecimalField string on the wire and whole cents in the app.
 */
import { placed } from '../lib/schedule';
import { centsFromDecimal, decimalFromCents } from '../lib/money';
import type {
  Appointment,
  BookingSource,
  CheckInSource,
  Customer,
  Payment,
  PaymentMethod,
  Service,
  Staff,
  WalkIn,
} from '../types';
import type { ApiAppointment, ApiCustomer, ApiPayment, ApiService, ApiStaff, ApiWalkIn } from './types';

export function toStaff(a: ApiStaff): Staff {
  return {
    id: a.id,
    name: a.name,
    role: a.role,
    dot: a.colour,
    initials: a.initials,
    shift: [a.shift_start, a.shift_end],
    brk: [a.break_start, a.break_end],
  };
}

export function toService(a: ApiService): Service {
  return {
    id: a.id,
    name: a.name,
    t: a.type,
    du: a.duration_minutes,
    price: centsFromDecimal(a.price),
    bb: a.buffer_before_minutes || undefined,
    ba: a.buffer_after_minutes || undefined,
    seats: a.seats > 1 ? a.seats : undefined,
  };
}

/** `now` is injectable so a fixture can be mapped against a fixed date in a test. */
export function toAppointment(a: ApiAppointment, now = new Date()): Appointment {
  return placed(
    {
      id: a.id,
      startsAt: a.starts_at,
      // filled in by `placed` from starts_at; never read from the wire
      d: 0,
      w: 0,
      st: 0,
      du: a.duration_minutes,
      staffId: a.staff_id,
      assistIds: a.assist_staff_ids.length ? a.assist_staff_ids : undefined,
      t: a.type,
      svc: a.service_id ?? undefined,
      c: a.customer_name,
      n: a.note,
      party: a.party.length > 1 ? a.party : undefined,
      bb: a.buffer_before_minutes,
      ba: a.buffer_after_minutes,
      bookedAt: a.booked_at,
      bookedVia: a.booked_via as BookingSource,
    },
    now,
  );
}

/** What the server needs to create or move a booking. Derived fields are not sent. */
export function fromAppointment(a: Appointment): Omit<ApiAppointment, 'id' | 'booked_at'> {
  return {
    starts_at: a.startsAt,
    duration_minutes: a.du,
    staff_id: a.staffId,
    assist_staff_ids: a.assistIds ?? [],
    type: a.t,
    service_id: a.svc ?? null,
    customer_name: a.c,
    party: a.party ?? [],
    note: a.n,
    buffer_before_minutes: a.bb,
    buffer_after_minutes: a.ba,
    booked_via: String(a.bookedVia),
  };
}

export function toWalkIn(a: ApiWalkIn): WalkIn {
  return {
    id: a.id,
    t: a.type,
    svc: a.service_id ?? undefined,
    c: a.customer_name,
    n: a.note,
    party: a.party.length > 1 ? a.party : undefined,
    du: a.duration_minutes,
    checkedInAt: a.checked_in_at,
    checkedInBy: a.checked_in_by as CheckInSource,
  };
}

export function toCustomer(a: ApiCustomer): Customer {
  return {
    id: a.id,
    first: a.first_name,
    last: a.last_name,
    email: a.email,
    phone: a.phone,
    visits: a.visit_count,
    channel: a.preferred_channel === 'sms' ? 'SMS' : 'Email',
  };
}

export function toPayment(a: ApiPayment): Payment {
  return {
    method: a.method as PaymentMethod,
    amount: centsFromDecimal(a.amount),
    at: a.taken_at,
    by: a.taken_by,
    source: a.source ?? undefined,
    pending: a.pending || undefined,
  };
}

export function fromPayment(appointmentId: string, p: Payment): ApiPayment {
  return {
    appointment_id: appointmentId,
    method: p.method,
    amount: decimalFromCents(p.amount),
    taken_at: p.at,
    taken_by: p.by,
    source: p.source ?? null,
    pending: !!p.pending,
  };
}
