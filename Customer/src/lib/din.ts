import type { DinMeasurements, SkierAbility } from '../types';

export const DIN_MIN = 3;
export const DIN_MAX = 8;

export const SKIER_ABILITIES: SkierAbility[] = [
  'Type I — Cautious',
  'Type II — Moderate',
  'Type III — Aggressive',
];

function abilityAdjustment(ability: string): number {
  if (ability.startsWith('Type III')) return 0.5;
  if (ability.startsWith('Type I ') || ability.startsWith('Type I—')) return -0.5;
  return 0;
}

function ageAdjustment(age: number): number {
  return age < 10 || age >= 50 ? -0.5 : 0;
}

/**
 * Binding release value from the skier's measurements, clamped to 3.0–8.0 and
 * rounded to the nearest 0.5. Returned as a 1-decimal display string, which is
 * how the DIN is shown everywhere in the UI.
 */
export function computeDin(m: DinMeasurements): string {
  const weight = toNumber(m.weight, 70);
  const height = toNumber(m.height, 170);
  const age = toNumber(m.age, 30);
  const bsl = toNumber(m.bsl, 300);

  const raw =
    weight * 0.08 +
    (height - 170) * 0.01 +
    abilityAdjustment(m.ability) +
    ageAdjustment(age) +
    (300 - bsl) * 0.005 +
    0.5;

  const clamped = Math.max(DIN_MIN, Math.min(DIN_MAX, raw));
  return (Math.round(clamped * 2) / 2).toFixed(1);
}

/** Formats an override value for display, falling back to an em dash. */
export function formatDin(value: number | string | null): string {
  if (value === null || value === '') return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : '—';
}

function toNumber(value: number | string, fallback: number): number {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}
