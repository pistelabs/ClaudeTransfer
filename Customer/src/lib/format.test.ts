import { describe, expect, it } from 'vitest';
import { dataUrlSizeKb, formatJobId, initials, pluralize, timestamp } from './format';

describe('initials', () => {
  it('takes the first letter of the first two names', () => {
    expect(initials('Chris Barnett')).toBe('CB');
    expect(initials('maya fournier')).toBe('MF');
  });

  it('copes with a single name', () => {
    expect(initials('Prince')).toBe('P');
  });
});

describe('formatJobId', () => {
  it('builds {company}-{branch}-{sequence}', () => {
    expect(formatJobId('City Branch', '0042')).toBe('AP-CB-0042');
    expect(formatJobId('Mountain Branch', '0001')).toBe('AP-MB-0001');
  });
});

describe('pluralize', () => {
  it('drops the plural for one', () => {
    expect(pluralize(1, 'item')).toBe('1 item');
    expect(pluralize(2, 'item')).toBe('2 items');
    expect(pluralize(0, 'record')).toBe('0 records');
  });
});

describe('timestamp', () => {
  it('formats as "Jun 26, 2026 · 9:05 AM"', () => {
    expect(timestamp(new Date(2026, 5, 26, 9, 5))).toBe('Jun 26, 2026 · 9:05 AM');
    expect(timestamp(new Date(2026, 11, 1, 0, 0))).toBe('Dec 1, 2026 · 12:00 AM');
    expect(timestamp(new Date(2026, 0, 8, 13, 30))).toBe('Jan 8, 2026 · 1:30 PM');
  });
});

describe('dataUrlSizeKb', () => {
  it('estimates the decoded size of a data URL', () => {
    expect(dataUrlSizeKb(`data:image/png;base64,${'A'.repeat(4096)}`)).toBe('3 KB');
  });

  it('renders an em dash when there is nothing stored', () => {
    expect(dataUrlSizeKb('')).toBe('—');
  });
});
