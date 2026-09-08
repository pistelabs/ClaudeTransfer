import { STAFF, TYPES, serviceFor } from '../../data/catalogue';
import { initialsOf } from '../../lib/dates';
import { formatMoney, normalizeName, partyOf, priceValue } from '../../lib/schedule';
import { TODAY_IDX, equipListOf, useScheduler, type SchedulerStore } from '../../store/useScheduler';
import type { Appointment, ApptType, CheckInSource, Customer, EquipItem, Payment, Service } from '../../types';

export interface PartyMember {
  name: string;
  initials: string;
  customer: Customer | null;
  /** stable key for check-in / saved-answer lookups */
  key: string;
}

export interface DetailInfo {
  appt: Appointment;
  type: ApptType;
  /** internal team-meeting block: no customer, no fitting or equipment tabs */
  isMeeting: boolean;
  /** waiting in the check-in queue with no day, time or fitter assigned */
  isWalkIn: boolean;
  /** when they checked in, for walk-ins only */
  checkedInAt: string | null;
  /** who checked them in — the portal or a staff member — for walk-ins only */
  checkedInBy: CheckInSource | null;
  party: PartyMember[];
  /** index of the person currently being viewed, clamped to the party */
  custIdx: number;
  attendees: string;
  status: { label: string; modifier: 'today' | 'past' | 'upcoming' | 'waiting' };
  equipment: EquipItem[];
  totals: {
    balance: string;
    subtotal: string;
    paid: string;
    /** what is still outstanding, as a number, for the payment dialog */
    due: number;
    /** the booked service, when the booking names one */
    service: Service | null;
    servicePrice: string;
    extras: string;
    payment: Payment | null;
  };
}

/** Every equipment entry recorded against this booking, one list per person. */
function equipmentByPerson(store: SchedulerStore, id: string, partySize: number): EquipItem[][] {
  return Array.from({ length: partySize }, (_, i) => store.equipment[`${id}:${i}`] ?? []);
}

/**
 * What the booking comes to: the price of the appointment itself, plus any
 * equipment work billed on top. Services marked as included in the appointment
 * price are recorded but not charged again. Payment is all or nothing, so the
 * balance is the subtotal until it is taken and zero afterwards.
 */
export function totalsFor(
  store: SchedulerStore,
  id: string,
  partySize: number,
  appt?: Pick<Appointment, 'svc' | 't'>,
) {
  const service = appt && appt.t !== 'MT' ? serviceFor(appt) : null;
  const servicePrice = service ? priceValue(service.price) : 0;

  let extras = 0;
  for (const list of equipmentByPerson(store, id, partySize)) {
    for (const e of list) for (const sv of e.services) if (sv.charged) extras += priceValue(sv.price);
  }

  const subtotal = servicePrice + extras;
  const payment = store.payments[id] ?? null;
  // A link that has gone out is not money in, so it leaves the balance owing.
  const paid = payment && !payment.pending ? payment.amount : 0;

  return {
    balance: formatMoney(Math.max(0, subtotal - paid)),
    subtotal: formatMoney(subtotal),
    paid: formatMoney(paid),
    /** the raw figure the payment dialog would take */
    due: Math.max(0, subtotal - paid),
    service,
    servicePrice: formatMoney(servicePrice),
    extras: formatMoney(extras),
    payment,
  };
}

/**
 * Resolves everything the detail sheet needs about whatever is open — a
 * scheduled appointment or a walk-in. A walk-in is presented through the same
 * shape with placeholder scheduling fields that the sheet never reads, guarded
 * by `isWalkIn`.
 */
export function useDetail(): DetailInfo | null {
  const store = useScheduler((s) => s as SchedulerStore);
  const scheduled = store.appts.find((a) => a.id === store.detailId);
  const walkIn = scheduled ? undefined : store.walkIns.find((w) => w.id === store.detailId);

  const appt: Appointment | undefined =
    scheduled ??
    (walkIn && {
      id: walkIn.id,
      d: 0,
      s: 0,
      st: 0,
      du: walkIn.du,
      t: walkIn.t,
      svc: walkIn.svc,
      c: walkIn.c,
      n: walkIn.n,
      party: walkIn.party,
      bb: 0,
      ba: 0,
      bookedAt: walkIn.checkedInAt,
      bookedVia: 'walkin',
    });
  if (!appt) return null;

  const type = TYPES[appt.t];
  const isMeeting = appt.t === 'MT';
  const names = partyOf(appt);
  const custIdx = Math.min(store.detailCust, names.length - 1);

  const party: PartyMember[] = names.map((name, i) => ({
    name,
    initials: initialsOf(name),
    customer: store.customers.find((c) => normalizeName(`${c.first} ${c.last}`) === normalizeName(name)) ?? null,
    key: `${appt.id}:${i}`,
  }));

  // Meeting blocks share a group id prefix, one block per attendee.
  const groupId = isMeeting ? String(appt.id).split('-')[0] : null;
  const attendees = isMeeting
    ? store.appts
        .filter((x) => String(x.id).split('-')[0] === groupId)
        .map((x) => STAFF[x.s].name)
        .join(', ')
    : '';

  // A walk-in is here now and waiting, which says more than Today/Upcoming/Past.
  // Everything else is placed against today, week included.
  const week = appt.w ?? 0;
  const past = week < 0 || (week === 0 && appt.d < TODAY_IDX);
  const status = walkIn
    ? { label: 'Waiting', modifier: 'waiting' as const }
    : past
      ? { label: 'Completed', modifier: 'past' as const }
      : week === 0 && appt.d === TODAY_IDX
        ? { label: 'Today', modifier: 'today' as const }
        : { label: 'Upcoming', modifier: 'upcoming' as const };

  return {
    appt,
    type,
    isMeeting,
    isWalkIn: !!walkIn,
    checkedInAt: walkIn ? walkIn.checkedInAt : null,
    checkedInBy: walkIn ? walkIn.checkedInBy : null,
    party,
    custIdx,
    attendees,
    status,
    equipment: equipListOf(store),
    totals: totalsFor(store, appt.id, names.length, appt),
  };
}
