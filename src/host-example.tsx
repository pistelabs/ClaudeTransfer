/**
 * A worked example of embedding the console in another application.
 *
 * This is the sequence a host follows, and the one `src/index.ts` documents:
 * load the shop, put the catalogue in place, hand over the bookings, then mount.
 * Served at /host.html by `npm run dev` so the path can be exercised without a
 * backend — swap `fixtures()` for `loadSchedule({ from, to })` and it is real.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Scheduler, hydrateScheduler } from './Scheduler';
import { configureCatalogue } from './data/catalogue';
import { toAppointment, toService, toStaff } from './api/map';
import type { ApiAppointment, ApiService, ApiStaff } from './api/types';
import './styles/index.css';

/** Stands in for the responses; shaped exactly as Django would send them. */
function fixtures(): { staff: ApiStaff[]; services: ApiService[]; appointments: ApiAppointment[] } {
  const at = (h: number, m: number) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return {
    staff: [
      { id: 'pk-1', name: 'Chloe Marchand', role: 'Head Fitter', colour: '#0369a1', initials: 'CM',
        shift_start: 540, shift_end: 1020, break_start: 720, break_end: 780 },
      { id: 'pk-2', name: 'Tomas Weber', role: 'Technician', colour: '#15803d', initials: 'TW',
        shift_start: 540, shift_end: 1020, break_start: 780, break_end: 840 },
    ],
    services: [
      { id: 'sv-1', name: 'Alpine Fit', type: 'BF', duration_minutes: 60, price: '99.50',
        buffer_before_minutes: 0, buffer_after_minutes: 15, seats: 1 },
    ],
    appointments: [
      { id: 'pk-a1', starts_at: at(10, 0), duration_minutes: 60, staff_id: 'pk-1', assist_staff_ids: [],
        type: 'BF', service_id: 'sv-1', customer_name: 'Margot Vidal', party: [], note: 'Straight off the API.',
        buffer_before_minutes: 0, buffer_after_minutes: 15, booked_at: at(9, 0), booked_via: 'pk-2' },
      // two fitters, so it is drawn in both their columns
      { id: 'pk-a2', starts_at: at(13, 30), duration_minutes: 60, staff_id: 'pk-2', assist_staff_ids: ['pk-1'],
        type: 'BF', service_id: 'sv-1', customer_name: 'Otto Lang', party: [], note: '',
        buffer_before_minutes: 0, buffer_after_minutes: 0, booked_at: at(9, 0), booked_via: 'online' },
    ],
  };
}

const data = fixtures();

// 1. the catalogue first — the screens read it as a module constant, so it has
//    to be right before anything renders
configureCatalogue({
  staff: data.staff.map(toStaff),
  services: [{ key: 'all', label: 'Services', items: data.services.map(toService) }],
});

// 2. the bookings, which name staff by the ids the catalogue now knows
hydrateScheduler({
  appointments: data.appointments.map((a) => toAppointment(a)),
  walkIns: [],
  customers: [],
  payments: {},
  records: {},
});

// 3. mount wherever the host wants it
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Scheduler />
  </StrictMode>,
);
