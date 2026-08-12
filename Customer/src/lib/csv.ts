import type { Customer } from '../types';

export type ExportFieldKey = 'name' | 'branch' | 'email' | 'phone' | 'last' | 'preferred';

export interface ExportField {
  key: ExportFieldKey;
  /** Label in the dialog's checkbox list. */
  label: string;
  /** Column heading in the exported file. */
  header: string;
}

export const EXPORT_FIELDS: ExportField[] = [
  { key: 'name', label: 'Name', header: 'Name' },
  { key: 'branch', label: 'Branch', header: 'Branch' },
  { key: 'email', label: 'Email address', header: 'Email' },
  { key: 'phone', label: 'Phone number', header: 'Phone' },
  { key: 'last', label: 'Last activity', header: 'Last Activity' },
  { key: 'preferred', label: 'Preferred contact', header: 'Preferred' },
];

export const DEFAULT_EXPORT_FIELDS: Record<ExportFieldKey, boolean> = {
  name: true,
  branch: true,
  email: true,
  phone: true,
  last: true,
  preferred: false,
};

/** Quotes a value if it contains a quote, comma or newline (RFC 4180). */
export function escapeCsvValue(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(customers: Customer[], fields: Record<ExportFieldKey, boolean>): string {
  const columns = EXPORT_FIELDS.filter((f) => fields[f.key]);
  const header = columns.map((c) => c.header).join(',');
  const rows = customers.map((c) => columns.map((col) => escapeCsvValue(c[col.key])).join(','));
  return [header, ...rows].join('\n');
}
