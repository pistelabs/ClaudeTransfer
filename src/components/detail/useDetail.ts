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
  party: PartyMember[];
  /** index of the person currently being viewed, clamped to the party */
  custIdx: number;
  attendees: string;
  status: { label: string; modifier: 'today' | 'past' | 'upcoming' };
  equipment: EquipItem[];
  totals: { balance: string; subtotal: string; paid: string };
}

/** Every equipment entry recorded against this booking, one list per person. */
function equipmentByPerson(store: SchedulerStore, id: string, partySize: number): EquipItem[][] {
  return Array.from({ length: partySize }, (_, i) => store.equipment[`${id}:${i}`] ?? []);
}

/** Live subtotal across every priced service on every person's equipment. */
export function totalsFor(store: SchedulerStore, id: string, partySize: number) {
  let subtotal = 0;
  for (const list of equipmentByPerson(store, id, partySize)) {
    for (const e of list) for (const sv of e.services) subtotal += priceValue(sv.price);
  }
  return { balance: formatMoney(subtotal), subtotal: formatMoney(subtotal), paid: formatMoney(0) };
}

/** Resolves everything the detail sheet needs about the open appointment. */
export function useDetail(): DetailInfo | null {
  const store = useScheduler((s) => s as SchedulerStore);
  const appt = store.appts.find((a) => a.id === store.detailId);
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

  const status =
    appt.d < TODAY_IDX
      ? { label: 'Completed', modifier: 'past' as const }
      : appt.d === TODAY_IDX
        ? { label: 'Today', modifier: 'today' as const }
        : { label: 'Upcoming', modifier: 'upcoming' as const };

  return {
    appt,
    type,
    isMeeting,
    party,
    custIdx,
    attendees,
    status,
    equipment: equipListOf(store),
    totals: totalsFor(store, appt.id, names.length),
  };
}
