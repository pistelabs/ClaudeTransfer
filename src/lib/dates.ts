const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface DayInfo {
  short: string;
  long: string;
  /** `Aug 2` */
  date: string;
  past: boolean;
  year: number;
  iso: Date;
}

/** Monday-indexed weekday of a date. */
export function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function todayIndex(now = new Date()): number {
  return mondayIndex(now);
}

/**
 * A real Mon–Sun week: the one containing `now`, or `offsetWeeks` away from it.
 * `past` is measured against today, not against the start of the week, so a
 * whole week in the past reads as past.
 */
export function weekDays(now = new Date(), offsetWeeks = 0): DayInfo[] {
  const ti = mondayIndex(now);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ti + offsetWeeks * 7);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return SHORT.map((s, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return {
      short: s,
      long: LONG[i],
      date: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      past: d < today,
      year: d.getFullYear(),
      iso: d,
    };
  });
}

/** Cached weeks, so every render of a column header is not a fresh date walk. */
const WEEK_CACHE = new Map<number, DayInfo[]>();

/** Dropped when the date rolls over: every entry is relative to today. */
export function clearWeekCache(): void {
  WEEK_CACHE.clear();
}

/** The week `offset` weeks from the one containing today. */
export function weekAt(offset: number): DayInfo[] {
  let week = WEEK_CACHE.get(offset);
  if (!week) {
    week = weekDays(new Date(), offset);
    WEEK_CACHE.set(offset, week);
  }
  return week;
}

/**
 * Where an absolute start time falls on the grid: which weekday column, how many
 * weeks from the one containing today, and how far down the day.
 *
 * The datetime is what a booking stores and what the backend exchanges; these
 * three are a rendering position, recomputed from it rather than kept alongside.
 */
export function gridOf(startsAt: string, now = new Date()): { d: number; w: number; st: number } {
  const at = new Date(startsAt);
  const day = new Date(at.getFullYear(), at.getMonth(), at.getDate());
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayIndex(now));
  const diff = Math.round((day.getTime() - weekStart.getTime()) / 86400000);
  return {
    d: mondayIndex(at),
    w: Math.floor(diff / 7),
    st: at.getHours() * 60 + at.getMinutes(),
  };
}

/** The inverse: an absolute start time for a position on the grid. */
export function isoAt(d: number, w: number, st: number, now = new Date()): string {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayIndex(now));
  const at = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + w * 7 + d);
  at.setHours(Math.floor(st / 60), st % 60, 0, 0);
  return at.toISOString();
}

export function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface MonthCell {
  blank: boolean;
  date?: number;
  /** Monday-indexed weekday of this date */
  dayIdx: number | null;
  /** weeks from the one containing today; negative in the past */
  weekOffset: number;
  past: boolean;
  /** falls beyond the current week */
  next: boolean;
  key: string;
  isToday: boolean;
}

/**
 * Month grid for the booking calendar, Monday-first. Any date from today
 * onward is bookable and maps onto that weekday's column.
 */
export function monthCells(monthOffset: number, now = new Date()): MonthCell[] {
  const first = monthAt(monthOffset, now);
  const y = first.getFullYear();
  const m = first.getMonth();
  const lead = mondayIndex(first);
  const dayCount = new Date(y, m + 1, 0).getDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayIndex(today));

  const cells: MonthCell[] = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ blank: true, dayIdx: null, weekOffset: 0, past: false, next: false, key: `blank-${i}`, isToday: false });
  }
  for (let d = 1; d <= dayCount; d++) {
    const dt = new Date(y, m, d);
    const diff = Math.round((dt.getTime() - weekStart.getTime()) / 86400000);
    const past = dt < today;
    cells.push({
      blank: false,
      date: d,
      dayIdx: mondayIndex(dt),
      weekOffset: Math.floor(diff / 7),
      past,
      next: diff > 6,
      key: `${y}-${m}-${d}`,
      isToday: dt.getTime() === today.getTime(),
    });
  }
  return cells;
}

/**
 * How many months a date sits from the current one — the month a calendar has to
 * open on for that date to be on screen at all.
 */
export function monthOffsetOf(d: Date, now = new Date()): number {
  return (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
}

/** The first of the month `monthOffset` months from the current one. */
export function monthAt(monthOffset: number, now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
}

export function monthLabel(monthOffset: number, now = new Date()): string {
  const d = monthAt(monthOffset, now);
  return `${d.toLocaleString('en-GB', { month: 'long' })} ${d.getFullYear()}`;
}

/** `2026-07-28T14:14:00Z` → `28 Jul 2026, 2:14 PM` — when a booking was taken. */
export function formatBookedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const mer = d.getHours() < 12 ? 'AM' : 'PM';
  let h = d.getHours() % 12;
  if (h === 0) h = 12;
  return `${date}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${mer}`;
}

/**
 * `2026-08-04T10:42:00Z` → `4 Aug, 10:42 AM` — compact enough for the walk-in
 * card, but still carrying the date: a queue entry outlives the day it was made.
 */
export function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const mer = d.getHours() < 12 ? 'AM' : 'PM';
  let h = d.getHours() % 12;
  if (h === 0) h = 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${mer}`;
}

/** `Emma Stone` → `ES`. */
export function initialsOf(name: string): string {
  const parts = String(name || '?').trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '?';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}
