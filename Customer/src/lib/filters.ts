import type { Customer } from '../types';

export const CUSTOMER_FILTERS = [
  'All Customers',
  'City Branch',
  'Mountain Branch',
  'SMS opted-in',
  'Email opted-in',
  'Has equipment',
] as const;

export type CustomerFilter = (typeof CUSTOMER_FILTERS)[number];

function matchesFilter(customer: Customer, filter: CustomerFilter): boolean {
  switch (filter) {
    case 'City Branch':
    case 'Mountain Branch':
      return customer.branch === filter;
    case 'SMS opted-in':
      return customer.prefs.smsEquip || customer.prefs.smsPromo;
    case 'Email opted-in':
      return customer.prefs.emailEquip || customer.prefs.emailPromo;
    case 'Has equipment':
      return customer.equipment.length > 0;
    case 'All Customers':
      return true;
  }
}

/** Search matches name, email or phone; search and filter apply together. */
export function filterCustomers(
  customers: Customer[],
  filter: CustomerFilter,
  search: string,
): Customer[] {
  const query = search.trim().toLowerCase();
  return customers.filter((customer) => {
    if (!matchesFilter(customer, filter)) return false;
    if (!query) return true;
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    );
  });
}
