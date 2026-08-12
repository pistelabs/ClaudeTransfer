import type { EquipmentCategory } from "../types";

/**
 * Every physical piece of equipment carries a short code so two identical items (same brand,
 * model and size) can still be told apart. It is a record-keeping identifier for the backend —
 * nothing in the UI branches on it.
 *
 * Format: branch letter + equipment-type letters + a per-type counter from 0, e.g. `CAS0`
 * is the first Alpine Ski checked in at City Skis.
 */
export const COMPANY_INITIALS = "PL"; // PisteLabs
export const BRANCH_INITIALS = "CS"; // City Skis
export const BRANCH_CODE = BRANCH_INITIALS[0]; // single letter, used by equipment codes

/** Job numbers are scoped to the company and branch that raised them: `PLCS0221`. */
export const JOB_ID_PREFIX = `${COMPANY_INITIALS}${BRANCH_INITIALS}`;

export function formatJobId(n: number): string {
  return JOB_ID_PREFIX + String(n).padStart(4, "0");
}

export const CATEGORY_CODE: Record<EquipmentCategory, string> = {
  "Alpine Ski": "AS",
  "Touring Ski": "TS",
  "Race Ski": "RS",
  "Powder Board": "PB",
  "Split Board": "SB",
  Snowboard: "SN",
};

export function codePrefix(category: EquipmentCategory): string {
  return BRANCH_CODE + (CATEGORY_CODE[category] ?? "XX");
}

/** The next unused code for `category`, given every code issued so far. */
export function nextEquipmentCode(category: EquipmentCategory, issued: Iterable<string>): string {
  const prefix = codePrefix(category);
  let highest = -1;
  for (const code of issued) {
    if (!code || !code.startsWith(prefix)) continue;
    const n = Number(code.slice(prefix.length));
    if (Number.isInteger(n) && n > highest) highest = n;
  }
  return prefix + (highest + 1);
}
