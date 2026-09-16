/**
 * Money, in minor units.
 *
 * Prices used to be display strings — `'€120.00'` — parsed back with a regex
 * that stripped everything non-numeric. That breaks the moment a price is
 * written `1.234,56`, and it invites float drift in the totals. An integer count
 * of cents does neither, and it is what a Django `DecimalField` should be
 * mapped to at the boundary rather than carried around as text.
 *
 * One currency for one till. Where a second one is ever needed, a booking would
 * have to carry its own code and these helpers take it as an argument; until
 * then saying so once here is more honest than threading a constant everywhere.
 */

/** An integer number of minor units: 12000 is €120.00. */
export type Cents = number;

export const CURRENCY = 'EUR';
export const LOCALE = 'en-IE';

const FORMAT = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

/** `12000` → `€120.00`. Display only — never parse this back. */
export function formatMoney(cents: Cents): string {
  return FORMAT.format((cents ?? 0) / 100).replace(/ | /g, '');
}

/**
 * `'120.00'` → `12000`. The shape a DRF DecimalField arrives in.
 * Rounded rather than truncated so a half-cent from the backend lands predictably.
 */
export function centsFromDecimal(value: string | number): Cents {
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** `12000` → `'120.00'`, for sending back to a DecimalField. */
export function decimalFromCents(cents: Cents): string {
  return ((cents ?? 0) / 100).toFixed(2);
}

/**
 * The smallest balance worth stopping a member of staff for. Below it a booking
 * is treated as costing nothing and is confirmed without asking about payment —
 * every real service price clears it, so in practice this reads as "charges
 * anything at all", while still giving rounding somewhere to land.
 */
export const PAY_PROMPT_MIN: Cents = 3;

/** Euros as authored in the catalogue → cents. Keeps the seed readable. */
export function eur(amount: number): Cents {
  return Math.round(amount * 100);
}
