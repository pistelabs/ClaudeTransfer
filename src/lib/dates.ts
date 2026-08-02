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

/** The real Mon–Sun week containing `now`. */
export function weekDays(now = new Date()): DayInfo[] {
  const ti = mondayIndex(now);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ti);
  return SHORT.map((s, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return {
      short: s,
      long: LONG[i],
      date: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      past: i < ti,
      year: d.getFullYear(),
      iso: d,
    };
  });
}

export function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface MonthCell {
  blank: boolean;
  date?: number;
  /** Monday-indexed weekday column this date maps onto, or null when unbookable */
  dayIdx: number | null;
  past: boolean;
  /** falls beyond the currently scheduled week */
  next: boolean;
  key: string;
  isToday: boolean;
}

/**
 * Month grid for the booking calendar, Monday-first. Any date from today
 * onward is bookable and maps onto that weekday's column.
 */
export function monthCells(monthOffset: number, now = new Date()): MonthCell[] {
  const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const y = first.getFullYear();
  const m = first.getMonth();
  const lead = mondayIndex(first);
  const dayCount = new Date(y, m + 1, 0).getDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayIndex(today));

  const cells: MonthCell[] = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ blank: true, dayIdx: null, past: false, next: false, key: `blank-${i}`, isToday: false });
  }
  for (let d = 1; d <= dayCount; d++) {
    const dt = new Date(y, m, d);
    const diff = Math.round((dt.getTime() - weekStart.getTime()) / 86400000);
    const past = dt < today;
    cells.push({
      blank: false,
      date: d,
      dayIdx: past ? null : mondayIndex(dt),
      past,
      next: diff > 6,
      key: `${y}-${m}-${d}`,
      isToday: dt.getTime() === today.getTime(),
    });
  }
  return cells;
}

export function monthLabel(monthOffset: number, now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  return `${d.toLocaleString('en-GB', { month: 'long' })} ${d.getFullYear()}`;
}

/** `Emma Stone` → `ES`. */
export function initialsOf(name: string): string {
  const parts = String(name || '?').trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '?';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}
