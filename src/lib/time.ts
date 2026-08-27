/** Grid geometry. Hours run well outside the shift so the view can scroll past opening hours. */
export const GRID = {
  /** first hour label, 24h */
  START_HOUR: 6,
  /** number of hour rows drawn */
  HOURS: 17,
  /** px per hour */
  HOUR_PX: 64,
  /** width of the time gutter */
  GUTTER: 66,
  SNAP: 15,
} as const;

export const GRID_START_MIN = GRID.START_HOUR * 60;
export const GRID_END_MIN = (GRID.START_HOUR + GRID.HOURS) * 60;

/** Minutes from midnight → px offset in the grid body. */
export function minsToPx(mins: number): number {
  return ((mins - GRID_START_MIN) / 60) * GRID.HOUR_PX;
}

export function durToPx(mins: number): number {
  return (mins / 60) * GRID.HOUR_PX;
}

/** `570` → `9:30`, or `9:30 AM` with the meridiem. */
export function fmtTime(m: number, withMeridiem = true): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const mer = h < 12 ? 'AM' : 'PM';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  const s = `${hh}:${mm < 10 ? '0' : ''}${mm}`;
  return withMeridiem ? `${s} ${mer}` : s;
}

/** `9:30–11:00 AM`, dropping the first meridiem when both ends share it. */
export function rangeLabel(st: number, en: number): string {
  const sameMeridiem = st < 720 === en < 720;
  return `${fmtTime(st, !sameMeridiem)}–${fmtTime(en, true)}`;
}

/**
 * `45` → `45 min`, `90` → `1.5 hr`, `75` → `1 hr 15 min`.
 *
 * Whole and half hours keep the decimal form the service catalogue uses; the
 * quarter-hour values a per-booking adjustment can produce spell themselves out,
 * because "1.3 hr" reads as neither 1:18 nor 1:15.
 */
export function durationLabel(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (rest === 0) return `${hours} hr`;
  if (rest === 30) return `${hours + 0.5} hr`;
  return `${hours} hr ${rest} min`;
}

/** `HH:MM` → minutes from midnight. */
export function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Minutes from midnight → `HH:MM`. */
export function toTimeValue(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

/** Snaps a pointer position inside a column to the nearest 15 minutes. */
export function minsAtOffset(clientY: number, rectTop: number): number {
  const raw = GRID_START_MIN + ((clientY - rectTop) / GRID.HOUR_PX) * 60;
  const snapped = Math.round(raw / GRID.SNAP) * GRID.SNAP;
  return Math.max(GRID_START_MIN, Math.min(snapped, GRID_END_MIN));
}

/** `4:07 PM` — used for check-in and save timestamps. */
export function stampNow(now = new Date()): string {
  let h = now.getHours();
  const m = now.getMinutes();
  const mer = h < 12 ? 'AM' : 'PM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m < 10 ? '0' : ''}${m} ${mer}`;
}

export function minutesSinceMidnight(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function hourLabels(): string[] {
  const out: string[] = [];
  for (let k = 0; k < GRID.HOURS; k++) {
    const h = GRID.START_HOUR + k;
    const mer = h < 12 ? 'AM' : 'PM';
    let hh = h % 12;
    if (hh === 0) hh = 12;
    out.push(`${hh} ${mer}`);
  }
  return out;
}
