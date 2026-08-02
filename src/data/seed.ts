import type { Appointment, ApptRecord, Customer, TypeCode } from '../types';

/**
 * Seeded bookings. `d` is the day index in the source week; the busy day is
 * shifted so it lands on today when the app boots (see {@link seedAppointments}).
 * Replace this whole module with the bookings API.
 */
const BASE: Omit<Appointment, 'id' | 'bb' | 'ba'>[] = [
  // Tuesday (day 1) — busy
  { d: 1, s: 0, st: 540, du: 90, t: 'BF', c: 'Daniel Reyes', n: 'New Lange RX 120, narrow heel. Bring old boots.' },
  { d: 1, s: 0, st: 660, du: 45, t: 'HM', c: 'Lena Fischer', n: 'Heat mold liners, session 2.' },
  { d: 1, s: 0, st: 810, du: 90, t: 'AL', c: 'Marco Bianchi', n: 'Canting assessment on ramp.' },
  { d: 1, s: 1, st: 870, du: 90, t: 'BF', c: 'Nils Berg', n: '' },
  { d: 1, s: 1, st: 570, du: 45, t: 'FB', c: 'Sofia Marin', n: '' },
  { d: 1, s: 1, st: 630, du: 90, t: 'BF', c: 'Greg Palmer', n: 'Race stock fit, GS boots.' },
  { d: 1, s: 1, st: 780, du: 45, t: 'HM', c: 'Aisha Khan', n: '' },
  { d: 1, s: 0, st: 930, du: 45, t: 'SH', c: 'Tom O’Neil', n: '6th toe punch, right shell.' },
  { d: 1, s: 2, st: 900, du: 90, t: 'AL', c: 'Luca Rossi', n: '' },
  { d: 1, s: 2, st: 540, du: 60, t: 'TU', c: 'Rachel Kim', n: 'Mount Shift bindings, boot sole 305.' },
  { d: 1, s: 2, st: 630, du: 45, t: 'SH', c: 'Owen Clarke', n: '' },
  { d: 1, s: 2, st: 720, du: 90, t: 'BF', c: 'Hannah Weber', n: 'Touring boot, walk mode check.' },
  { d: 1, s: 3, st: 555, du: 90, t: 'FB', c: 'Emma Stone', n: 'Cork footbed cast.', party: ['Emma Stone', 'Jack Turner'] },
  { d: 1, s: 2, st: 810, du: 90, t: 'BF', c: 'The Doyle Family', n: 'Family fit — three sets of boots.', party: ['Chris Doyle', 'Cara Doyle', 'Owen Clarke'] },
  { d: 1, s: 3, st: 660, du: 90, t: 'FB', c: 'Jack Turner', n: '' },
  { d: 1, s: 3, st: 810, du: 45, t: 'FB', c: 'Yuki Tanaka', n: 'Follow-up grind.' },
  { d: 1, s: 3, st: 900, du: 60, t: 'FB', c: 'Chris Doyle', n: '' },
  // Monday
  { d: 0, s: 0, st: 600, du: 90, t: 'BF', c: 'Paul Adams', n: '' },
  { d: 0, s: 1, st: 780, du: 60, t: 'HM', c: 'Nina Roth', n: '' },
  { d: 0, s: 3, st: 570, du: 90, t: 'FB', c: 'Sam Lee', n: '' },
  // Wednesday
  { d: 2, s: 2, st: 540, du: 90, t: 'BF', c: 'Kate Lin', n: '' },
  { d: 2, s: 0, st: 660, du: 60, t: 'AL', c: 'Diego Morales', n: '' },
  { d: 2, s: 1, st: 840, du: 90, t: 'BF', c: 'Ivan Petrov', n: '' },
  // Thursday
  { d: 3, s: 3, st: 600, du: 90, t: 'FB', c: 'Mona Karlsson', n: '' },
  { d: 3, s: 2, st: 780, du: 90, t: 'TU', c: 'Alex Rivera', n: '' },
  // Friday
  { d: 4, s: 0, st: 570, du: 90, t: 'BF', c: 'Wendy Shaw', n: '' },
  { d: 4, s: 1, st: 690, du: 45, t: 'HM', c: 'Otto Braun', n: '' },
  { d: 4, s: 2, st: 900, du: 90, t: 'SH', c: 'Freya Lund', n: '' },
  // Saturday
  { d: 5, s: 0, st: 540, du: 90, t: 'BF', c: 'Bruno Gallo', n: '' },
  { d: 5, s: 1, st: 600, du: 90, t: 'BF', c: 'Cara Doyle', n: '' },
  { d: 5, s: 2, st: 660, du: 90, t: 'BF', c: 'Ravi Nair', n: '' },
  { d: 5, s: 3, st: 780, du: 90, t: 'FB', c: 'Tess Wood', n: '' },
  // Sunday
  { d: 6, s: 1, st: 600, du: 60, t: 'HM', c: 'Igor Volkov', n: '' },
];

/** Buffers the shop keeps around each kind of work. */
function buffersFor(t: TypeCode): { bb: number; ba: number } {
  if (t === 'HM') return { bb: 15, ba: 20 };
  if (t === 'BF' || t === 'FB' || t === 'TU') return { bb: 0, ba: 15 };
  return { bb: 0, ba: 0 };
}

/** Shifts the seeded week so the busy Tuesday lands on today. */
export function seedAppointments(todayIdx: number): Appointment[] {
  const offset = (todayIdx - 1 + 7) % 7;
  return BASE.map((a, i) => ({
    ...a,
    d: (a.d + offset) % 7,
    id: 'b' + i,
    ...buffersFor(a.t),
  }));
}

export const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1', first: 'Test', last: 'Customer', email: 'test.customer@pistelabs.com', phone: '+353 86 000 0001', visits: 3, channel: 'Email' },
  { id: 'c2', first: 'Daniel', last: 'Reyes', email: 'd.reyes@gmail.com', phone: '+353 87 214 8890', visits: 5, channel: 'SMS' },
  { id: 'c3', first: 'Lena', last: 'Fischer', email: 'lena.fischer@outlook.com', phone: '+353 85 776 1204', visits: 2, channel: 'Email' },
  { id: 'c4', first: 'Marco', last: 'Bianchi', email: 'm.bianchi@ski.it', phone: '+39 348 552 9910', visits: 8, channel: 'SMS' },
  { id: 'c5', first: 'Hannah', last: 'Weber', email: 'h.weber@web.de', phone: '+49 171 445 2278', visits: 1, channel: 'Email' },
  { id: 'c6', first: 'Rachel', last: 'Kim', email: 'rachel.kim@gmail.com', phone: '+353 89 330 4471', visits: 4, channel: 'Email' },
  { id: 'c7', first: 'Tom', last: 'O’Neil', email: 't.oneil@gmail.com', phone: '+353 86 771 3320', visits: 6, channel: 'SMS' },
  { id: 'c8', first: 'Sofia', last: 'Marin', email: 'sofia.marin@gmail.com', phone: '+34 611 208 774', visits: 2, channel: 'Email' },
  { id: 'c9', first: 'Greg', last: 'Palmer', email: 'g.palmer@racing.ie', phone: '+353 87 445 1092', visits: 9, channel: 'SMS' },
  { id: 'c10', first: 'Aisha', last: 'Khan', email: 'aisha.khan@outlook.com', phone: '+353 85 220 6613', visits: 1, channel: 'Email' },
  { id: 'c11', first: 'Nils', last: 'Berg', email: 'nils.berg@telia.se', phone: '+46 70 118 4472', visits: 3, channel: 'Email' },
  { id: 'c12', first: 'Owen', last: 'Clarke', email: 'owen.clarke@gmail.com', phone: '+353 83 990 2214', visits: 2, channel: 'SMS' },
  { id: 'c13', first: 'Luca', last: 'Rossi', email: 'l.rossi@sciclub.it', phone: '+39 335 771 0284', visits: 5, channel: 'Email' },
  { id: 'c14', first: 'Emma', last: 'Stone', email: 'emma.stone@gmail.com', phone: '+353 86 334 7781', visits: 1, channel: 'Email' },
  { id: 'c15', first: 'Jack', last: 'Turner', email: 'jack.turner@gmail.com', phone: '+353 89 006 5512', visits: 2, channel: 'SMS' },
  { id: 'c16', first: 'Yuki', last: 'Tanaka', email: 'y.tanaka@nifty.jp', phone: '+81 90 3345 1180', visits: 4, channel: 'Email' },
  { id: 'c17', first: 'Chris', last: 'Doyle', email: 'chris.doyle@gmail.com', phone: '+353 87 662 9043', visits: 3, channel: 'Email' },
  { id: 'c18', first: 'Cara', last: 'Doyle', email: 'cara.doyle@gmail.com', phone: '+353 87 662 9044', visits: 2, channel: 'Email' },
];

/** Information already captured against a few of the seeded bookings. */
export const SEED_RECORDS: Record<string, ApptRecord> = {
  b0: {
    bookedBy: 0,
    questionnaire: 'email',
    fittingByCustomer: {
      0: { height: '182 cm', weight: '81 kg', ability: 'Advanced', days: '16–40', terrain: 'All-mountain', injuries: 'Left ankle fracture, 2019' },
    },
    staffByCustomer: {
      0: { s_footlen: '273', s_footwid: '101', s_instep: 'High', s_arch: 'Neutral', s_shell: 'Performance — 1.5', s_flexrec: '120', s_canting: 'Varus (bow-legged)', s_work: 'Heel pocket punch, 2 mm navicular grind' },
    },
    details: { mondo: '27.5 / EU 43', current: 'Salomon S/Pro 120, 4 seasons', issues: 'Narrow heel / heel lift', orthotic: 'No' },
  },
  b1: {
    bookedBy: 1,
    questionnaire: 'now',
    fittingByCustomer: {
      0: { height: '168 cm', weight: '62 kg', ability: 'Intermediate', days: '6–15', terrain: 'Groomed piste', injuries: '' },
    },
    details: { boots: 'Nordica Speedmachine 95', liner: 'Stock liner', session: 'Re-mold / adjustment' },
  },
  b2: {
    bookedBy: 0,
    questionnaire: 'email',
    fittingByCustomer: {
      0: { height: '175 cm', weight: '78 kg', ability: 'Expert / Race', days: '40+', terrain: 'Race', injuries: '' },
    },
    staffByCustomer: {
      0: { s_footlen: '268', s_footwid: '97', s_instep: 'Average', s_arch: 'High', s_shell: 'Race — 1 finger', s_flexrec: '130', s_canting: 'Varus (bow-legged)', s_work: '2° sole plane, left cuff aligned' },
    },
    details: { boots: 'Head Raptor WCR 4', knee: 'Bow-legged (varus)', discipline: 'Race' },
  },
};
