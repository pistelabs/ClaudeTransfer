import { describe, expect, it } from 'vitest';
import { buildCsv, escapeCsvValue } from './csv';
import { seedCustomers } from '../data/seed';
import type { Customer } from '../types';

const fields = {
  name: true,
  branch: true,
  email: false,
  phone: false,
  last: false,
  preferred: false,
};

describe('escapeCsvValue', () => {
  it('leaves plain values alone', () => {
    expect(escapeCsvValue('Chris Barnett')).toBe('Chris Barnett');
  });

  it('quotes values containing a comma, quote or newline', () => {
    expect(escapeCsvValue('Barnett, Chris')).toBe('"Barnett, Chris"');
    expect(escapeCsvValue('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvValue('line\nbreak')).toBe('"line\nbreak"');
  });

  it('renders nullish values as empty', () => {
    expect(escapeCsvValue(null)).toBe('');
    expect(escapeCsvValue(undefined)).toBe('');
  });
});

describe('buildCsv', () => {
  it('writes a header row and only the selected fields', () => {
    const csv = buildCsv(seedCustomers.slice(0, 2), fields);
    expect(csv.split('\n')).toEqual([
      'Name,Branch',
      'Chris Barnett,City Branch',
      'Test Tester,Mountain Branch',
    ]);
  });

  it('escapes values inside rows', () => {
    const awkward: Customer = { ...seedCustomers[0], name: 'Barnett, Chris' };
    expect(buildCsv([awkward], fields)).toContain('"Barnett, Chris",City Branch');
  });
});
