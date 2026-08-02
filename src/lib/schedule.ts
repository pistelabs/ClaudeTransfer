import { STAFF } from '../data/catalogue';
import type { Appointment, LaidOutAppt } from '../types';

/**
 * Greedy lane packing: appointments that overlap in time share a column,
 * split evenly across as many lanes as the busiest cluster needs.
 */
export function layout(list: Appointment[]): LaidOutAppt[] {
  const items = list
    .slice()
    .sort((a, b) => a.st - b.st || a.st + a.du - (b.st + b.du))
    .map((a) => ({ ...a, lane: 0, lanes: 1 }) as LaidOutAppt);

  let i = 0;
  while (i < items.length) {
    let j = i;
    let clusterEnd = items[i].st + items[i].du;
    while (j + 1 < items.length && items[j + 1].st < clusterEnd) {
      j++;
      clusterEnd = Math.max(clusterEnd, items[j].st + items[j].du);
    }
    const cluster = items.slice(i, j + 1);
    const laneEnd: number[] = [];
    for (const it of cluster) {
      let lane = laneEnd.findIndex((end) => end <= it.st);
      if (lane === -1) {
        lane = laneEnd.length;
        laneEnd.push(0);
      }
      laneEnd[lane] = it.st + it.du;
      it.lane = lane;
    }
    for (const it of cluster) it.lanes = laneEnd.length;
    i = j + 1;
  }
  return items;
}

/** Ids of appointments that overlap another booking for the same fitter on the same day. */
export function conflictIds(list: Appointment[]): Set<string> {
  const bad = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (a.d !== b.d || a.s !== b.s) continue;
      if (a.st < b.st + b.du && b.st < a.st + a.du) {
        bad.add(a.id);
        bad.add(b.id);
      }
    }
  }
  return bad;
}

export interface Candidate {
  id?: string | null;
  d: number;
  s: number;
  st: number;
  du: number;
  bb?: number;
  ba?: number;
}

/** What a candidate slot would collide with — drives the drag preview and the booking form. */
export function collisionsFor(appts: Appointment[], cand: Candidate): Appointment[] {
  return appts.filter(
    (a) =>
      a.id !== cand.id &&
      a.d === cand.d &&
      a.s === cand.s &&
      a.st < cand.st + cand.du &&
      cand.st < a.st + a.du,
  );
}

/** Buffer-only clashes: legal for in-store staff, blocked for online self-booking. */
export function bufferClashesFor(appts: Appointment[], cand: Candidate): Appointment[] {
  const cb = cand.bb ?? 0;
  const ca = cand.ba ?? 0;
  return appts.filter((a) => {
    if (a.id === cand.id || a.d !== cand.d || a.s !== cand.s) return false;
    const aFrom = a.st - (a.bb || 0);
    const aTo = a.st + a.du + (a.ba || 0);
    const cFrom = cand.st - cb;
    const cTo = cand.st + cand.du + ca;
    const overlapsWithBuffer = aFrom < cTo && cFrom < aTo;
    const overlapsHard = a.st < cand.st + cand.du && cand.st < a.st + a.du;
    return overlapsWithBuffer && !overlapsHard;
  });
}

/**
 * Is the named fitter — or anyone, when `staffIdx` is null — free for this window?
 * Checks the shift, the lunch break and existing bookings.
 */
export function slotOpen(
  appts: Appointment[],
  staffIdx: number | null,
  dayIdx: number,
  start: number,
  dur: number,
  excludeId?: string | null,
): boolean {
  const list = staffIdx === null ? STAFF.map((_, i) => i) : [staffIdx];
  return list.some((si) => {
    const s = STAFF[si];
    if (start < s.shift[0] || start + dur > s.shift[1]) return false;
    if (start < s.brk[1] && s.brk[0] < start + dur) return false;
    return collisionsFor(appts, { id: excludeId ?? null, d: dayIdx, s: si, st: start, du: dur }).length === 0;
  });
}

export interface Slot {
  min: number;
  ok: boolean;
}

/** Every 15-minute start across the relevant shift, flagged with availability. */
export function slotsFor(
  appts: Appointment[],
  staffIdx: number | null,
  dayIdx: number,
  dur: number,
  excludeId?: string | null,
): Slot[] {
  const shifts = STAFF.map((s) => s.shift);
  const from = staffIdx === null ? Math.min(...shifts.map((s) => s[0])) : shifts[staffIdx][0];
  const to = staffIdx === null ? Math.max(...shifts.map((s) => s[1])) : shifts[staffIdx][1];
  const out: Slot[] = [];
  for (let t = from; t + dur <= to; t += 15) {
    out.push({ min: t, ok: slotOpen(appts, staffIdx, dayIdx, t, dur, excludeId) });
  }
  return out;
}

/** Every customer on a booking; single-customer bookings yield one name. */
export function partyOf(a: Pick<Appointment, 'c' | 'party'>): string[] {
  return a.party && a.party.length ? a.party : [a.c];
}

/** Loose name match between a booking's customer text and the customer book. */
export function normalizeName(s: string): string {
  return (s || '').replace(/’/g, "'").trim().toLowerCase();
}

const CURRENCY = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

export function formatMoney(n: number): string {
  return CURRENCY.format(n).replace(/ /g, '');
}

/** `€120.00` → `120`. */
export function priceValue(price: string): number {
  return Number(String(price || '').replace(/[^0-9.]/g, '')) || 0;
}
