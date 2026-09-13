/**
 * The resources the console needs, and the shape it needs them in.
 *
 * Each function is one endpoint plus its mapping, so a change in the backend's
 * URL or serialiser is a change here and nowhere else. Nothing in this folder
 * knows about React or the store — `loadSchedule` returns plain data, and
 * whoever called it decides what to do with it.
 */
import { request, requestAll } from './client';
import { toAppointment, toCustomer, toPayment, toService, toStaff, toWalkIn, fromAppointment } from './map';
import type { ApiAppointment, ApiCustomer, ApiPayment, ApiService, ApiStaff, ApiWalkIn } from './types';
import type { Appointment, Customer, Payment, Service, Staff, WalkIn } from '../types';

export { ApiError, API_BASE } from './client';
export type * from './types';

/** Everything needed to draw the console for a window of dates. */
export interface ScheduleData {
  staff: Staff[];
  services: Service[];
  appointments: Appointment[];
  walkIns: WalkIn[];
  customers: Customer[];
  payments: Record<string, Payment>;
}

export interface ScheduleQuery {
  /** ISO date, inclusive — `2026-09-07` */
  from: string;
  /** ISO date, inclusive */
  to: string;
  signal?: AbortSignal;
}

/**
 * One round trip's worth of everything, for a date window.
 *
 * Fetched together on purpose: an appointment names a staff id and a service id,
 * and both have to be in hand before it can be drawn, so loading them separately
 * only creates a moment where the schedule is half-resolved.
 */
export async function loadSchedule(q: ScheduleQuery, now = new Date()): Promise<ScheduleData> {
  const { from, to, signal } = q;
  const [staff, services, appointments, walkIns, customers, payments] = await Promise.all([
    requestAll<ApiStaff>('/staff/', { signal }),
    requestAll<ApiService>('/services/', { signal }),
    requestAll<ApiAppointment>('/appointments/', { params: { from, to }, signal }),
    requestAll<ApiWalkIn>('/walk-ins/', { signal }),
    requestAll<ApiCustomer>('/customers/', { signal }),
    requestAll<ApiPayment>('/payments/', { params: { from, to }, signal }),
  ]);

  return {
    staff: staff.map(toStaff),
    services: services.map(toService),
    appointments: appointments.map((a) => toAppointment(a, now)),
    walkIns: walkIns.map(toWalkIn),
    customers: customers.map(toCustomer),
    payments: Object.fromEntries(payments.map((p) => [p.appointment_id, toPayment(p)])),
  };
}

export async function createAppointment(a: Appointment, now = new Date()): Promise<Appointment> {
  const created = await request<ApiAppointment>('/appointments/', { method: 'POST', body: fromAppointment(a) });
  return toAppointment(created, now);
}

/**
 * Moving or editing a booking. PATCH rather than PUT so a drag sends the two
 * fields that changed instead of a whole booking that might be stale elsewhere.
 */
export async function updateAppointment(
  id: string,
  changes: Partial<ReturnType<typeof fromAppointment>>,
  now = new Date(),
): Promise<Appointment> {
  const saved = await request<ApiAppointment>(`/appointments/${id}/`, { method: 'PATCH', body: changes });
  return toAppointment(saved, now);
}

export async function deleteAppointment(id: string): Promise<void> {
  await request<void>(`/appointments/${id}/`, { method: 'DELETE' });
}
