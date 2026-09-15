import type { Job } from "../types";

/**
 * Seams for the two external systems this app will talk to. Both are deliberately inert
 * placeholders — wire the real calls up here and nothing else in the app has to change.
 */

/** Set once a printer integration exists; until then check-in silently skips printing. */
export const PRINTING_CONNECTED = false;

/** Set once a payment terminal / provider is wired up. While false, "Create and Pay Now"
 * falls back to the in-app payment dialog. */
export const PAYMENT_SOFTWARE_CONNECTED = false;

/**
 * Prints the job ticket and the customer's barcode label. Called when a job is created with
 * "Create and Pay Later"; replace the body with the real print call.
 */
export function printJobTicket(job: Job): void {
  if (!PRINTING_CONNECTED) return;
  // TODO: hand `job` to the label/ticket printer once that integration lands.
  console.info("[printing] job ticket queued", job.id);
}

/**
 * Hands the job off to the payment software. Returns false when nothing is connected, which
 * is the caller's cue to fall back to the in-app payment dialog.
 */
export function openPaymentSoftware(job: Job, amountDue: number): boolean {
  if (!PAYMENT_SOFTWARE_CONNECTED) return false;
  // TODO: launch the provider with `job.id` and `amountDue` once that integration lands.
  console.info("[payments] handing off", job.id, amountDue);
  return true;
}

export const PAYMENT_METHODS = ["Card", "Cash", "Bank transfer", "Gift voucher"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
