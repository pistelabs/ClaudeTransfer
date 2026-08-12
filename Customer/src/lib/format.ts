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
