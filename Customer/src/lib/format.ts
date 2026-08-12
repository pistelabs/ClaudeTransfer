import { COMPANY_INITIALS } from './config';
import type { Branch } from '../types';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Up to two initials from a name, for the directory avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

/** `Jun 26, 2026 · 9:04 AM` — the signature timestamp format. */
export function timestamp(date = new Date()): string {
  const hours24 = date.getHours();
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${hours}:${minutes} ${meridiem}`;
}

/** `Jun 26, 2026` — the "last activity" display format. */
export function shortDate(date = new Date()): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Splits `YYYY-MM-DD` without going through Date, which would shift zones. */
function parseIsoDate(iso: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** `2026-06-26` → `Jun 26, 2026`. */
export function formatIsoDate(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const [year, month, day] = parts;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** `2019-03-12` → `March 12, 2019`. */
export function formatIsoLongDate(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const [year, month, day] = parts;
  return `${LONG_MONTHS[month - 1]} ${day}, ${year}`;
}

/** `14:30` → `2:30 PM`. */
export function formatIsoTime(time: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return time;
  const hours24 = Number(match[1]);
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours24 % 12 || 12}:${match[2]} ${meridiem}`;
}

/** ISO 8601 timestamp → `Jun 26, 2026 · 9:05 AM`. */
export function formatIsoTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : timestamp(date);
}

/** `65.00` → `$65`; `64.50` → `$64.50`. */
export function formatPrice(amount: string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

/** `YYYY-MM-DD` for today, for records created client-side. */
export function toIsoDate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function branchInitials(branch: Branch): string {
  return branch === 'Mountain Branch' ? 'MB' : 'CB';
}

/** `AP-CB-0042` — company initials, branch initials, job sequence. */
export function formatJobId(branch: Branch, sequence: string): string {
  return `${COMPANY_INITIALS}-${branchInitials(branch)}-${sequence.replace('#', '')}`;
}

/** `2 items` / `1 item` */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Rough byte size of a data URL's payload, for the stored-signature metadata. */
export function dataUrlSizeKb(dataUrl: string): string {
  if (!dataUrl) return '—';
  const payload = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return `${Math.max(1, Math.round((payload.length * 0.75) / 1024))} KB`;
}
