import { STAFF, TYPES } from '../../data/catalogue';
import { initialsOf } from '../../lib/dates';
import { formatMoney, normalizeName, partyOf, priceValue } from '../../lib/schedule';
import { TODAY_IDX, equipListOf, useScheduler, type SchedulerStore } from '../../store/useScheduler';
import type { Appointment, ApptType, Customer, EquipItem } from '../../types';

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
  /** checked in at the portal with no day, time or fitter assigned */
  isWalkIn: boolean;
  /** when they checked in, for walk-ins only */
  checkedInAt: string | null;
  party: PartyMember[];
  /** index of the person currently being viewed, clamped to the party */
  custIdx: number;
  attendees: string;
  status: { label: string; modifier: 'today' | 'past' | 'upcoming' | 'waiting' };
  equipment: EquipItem[];
  totals: { balance: string; subtotal: string; paid: string };
}

/** Every equipment entry recorded against this booking, one list per person. */
function equipmentByPerson(store: SchedulerStore, id: string, partySize: number): EquipItem[][] {
  return Array.from({ length: partySize }, (_, i) => store.equipment[`${id}:${i}`] ?? []);
}

/**
 * Live subtotal across every person's equipment. Services marked as included in
 * the appointment price are recorded but not billed on top.
 */
export function totalsFor(store: SchedulerStore, id: string, partySize: number) {
  let subtotal = 0;
  for (const list of equipmentByPerson(store, id, partySize)) {
    for (const e of list) for (const sv of e.services) if (sv.charged) subtotal += priceValue(sv.price);
  }
  return { balance: formatMoney(subtotal), subtotal: formatMoney(subtotal), paid: formatMoney(0) };
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
  const status = walkIn
    ? { label: 'Waiting', modifier: 'waiting' as const }
    : appt.d < TODAY_IDX
      ? { label: 'Completed', modifier: 'past' as const }
      : appt.d === TODAY_IDX
        ? { label: 'Today', modifier: 'today' as const }
        : { label: 'Upcoming', modifier: 'upcoming' as const };

  return {
    appt,
    type,
    isMeeting,
    isWalkIn: !!walkIn,
    checkedInAt: walkIn ? walkIn.checkedInAt : null,
    party,
    custIdx,
    attendees,
    status,
    equipment: equipListOf(store),
    totals: totalsFor(store, appt.id, names.length),
  };
}
