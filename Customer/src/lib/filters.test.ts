import { describe, expect, it } from 'vitest';
import { filterCustomers } from './filters';
import { customerFixtures } from '../api/mock/fixtures';
import { toCustomer } from '../api/mappers';

const customers = customerFixtures.map(toCustomer);

describe('filterCustomers', () => {
  it('returns everyone by default', () => {
    expect(filterCustomers(customers, 'All Customers', '')).toHaveLength(customers.length);
  });

  it('matches name, email or phone case-insensitively', () => {
    expect(filterCustomers(customers, 'All Customers', 'maya')[0]?.name).toBe('Maya Fournier');
    expect(filterCustomers(customers, 'All Customers', '@SHAW.CA')[0]?.name).toBe(
      'Priya Anand',
    );
    expect(filterCustomers(customers, 'All Customers', '555-0112')[0]?.name).toBe(
      'Chris Barnett',
    );
  });

  it('applies the filter and the search together', () => {
    const results = filterCustomers(customers, 'Mountain Branch', 'a');
    expect(results.every((c) => c.branch === 'Mountain Branch')).toBe(true);
    expect(results.every((c) => /a/i.test(`${c.name}${c.email}${c.phone}`))).toBe(true);
  });

  it('treats opt-ins as equipment OR promo', () => {
    const smsOptedIn = filterCustomers(customers, 'SMS opted-in', '');
    expect(smsOptedIn.every((c) => c.prefs.smsEquip || c.prefs.smsPromo)).toBe(true);
    expect(smsOptedIn.map((c) => c.id)).not.toContain('c12');
  });

  it('keeps only customers with equipment', () => {
    const withEquipment = filterCustomers(customers, 'Has equipment', '');
    expect(withEquipment.every((c) => c.equipment.length > 0)).toBe(true);
    expect(withEquipment.map((c) => c.id)).not.toContain('c8');
  });
});
