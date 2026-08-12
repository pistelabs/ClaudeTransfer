import { describe, expect, it } from 'vitest';
import { computeDin, formatDin } from './din';
import type { DinMeasurements } from '../types';

const base: DinMeasurements = {
  height: 175,
  weight: 75,
  age: 34,
  bsl: 305,
  ability: 'Type II — Moderate',
};

describe('computeDin', () => {
  it('rounds to the nearest half and shows one decimal', () => {
    // 75*0.08 + 5*0.01 + 0 + 0 + (-5)*0.005 + 0.5 = 6.525 → 6.5
    expect(computeDin(base)).toBe('6.5');
  });

  it('adds half a point for aggressive skiers and takes one off for cautious', () => {
    expect(computeDin({ ...base, ability: 'Type III — Aggressive' })).toBe('7.0');
    expect(computeDin({ ...base, ability: 'Type I — Cautious' })).toBe('6.0');
  });

  it('takes half a point off for skiers under 10 or 50 and over', () => {
    expect(computeDin({ ...base, age: 9 })).toBe('6.0');
    expect(computeDin({ ...base, age: 50 })).toBe('6.0');
    expect(computeDin({ ...base, age: 49 })).toBe('6.5');
  });

  it('clamps to the 3.0–8.0 range', () => {
    expect(computeDin({ ...base, weight: 20 })).toBe('3.0');
    expect(computeDin({ ...base, weight: 200 })).toBe('8.0');
  });

  it('accepts the string values that come out of number inputs', () => {
    expect(computeDin({ ...base, weight: '75', height: '175' })).toBe('6.5');
  });

  it('falls back to averages when a field has been cleared', () => {
    // Empty fields default to 70kg / 170cm / age 30 / 300mm.
    expect(computeDin({ height: '', weight: '', age: '', bsl: '', ability: base.ability })).toBe(
      '6.0',
    );
  });
});

describe('formatDin', () => {
  it('formats overrides to one decimal', () => {
    expect(formatDin(7)).toBe('7.0');
    expect(formatDin('6.5')).toBe('6.5');
  });

  it('renders an em dash when there is no override', () => {
    expect(formatDin(null)).toBe('—');
    expect(formatDin('')).toBe('—');
  });
});
