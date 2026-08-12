import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { defaultDinMeasurements, seedCustomers, seedDinMeasurements } from '../data/seed';
import { shortDate } from '../lib/format';
import type {
  Customer,
  CustomerEdit,
  DinMeasurements,
  DinRecord,
  NewCustomerInput,
} from '../types';

function emptyDinRecord(measurements: DinMeasurements): DinRecord {
  return { measurements, custom: null, signedAt: '', signatureUrl: '' };
}

function seedDinRecords(): Record<string, DinRecord> {
  const records: Record<string, DinRecord> = {};
  for (const customer of seedCustomers) {
    records[customer.id] = emptyDinRecord(
      seedDinMeasurements[customer.id] ?? defaultDinMeasurements,
    );
  }
  return records;
}

interface CustomerStore {
  customers: Customer[];
  getCustomer: (id: string | undefined) => Customer | undefined;
  addCustomer: (input: NewCustomerInput) => Customer;
  updateCustomer: (id: string, edit: CustomerEdit) => void;

  getDinRecord: (id: string) => DinRecord;
  updateDinMeasurements: (id: string, patch: Partial<DinMeasurements>) => void;
  /** `null` restores the calculated value. Any change clears the signature. */
  setDinCustom: (id: string, value: number | string | null) => void;
  signDin: (id: string, signedAt: string, signatureUrl: string) => void;
}

const CustomerContext = createContext<CustomerStore | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [dinRecords, setDinRecords] = useState<Record<string, DinRecord>>(seedDinRecords);

  const getCustomer = useCallback(
    (id: string | undefined) => (id ? customers.find((c) => c.id === id) : undefined),
    [customers],
  );

  const addCustomer = useCallback((input: NewCustomerInput): Customer => {
    const name = `${input.first.trim()} ${input.last.trim()}`.trim();
    const isEmail = input.channel === 'Email';
    const customer: Customer = {
      id: `c${Date.now()}`,
      branch: 'City Branch',
      name,
      email: input.email.trim() || '—',
      phone: input.phone.trim() || '—',
      last: shortDate(),
      memberSince: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      preferred: isEmail ? 'Email' : 'SMS',
      prefs: {
        emailEquip: isEmail,
        smsEquip: !isEmail,
        emailPromo: false,
        smsPromo: false,
      },
      equipment: [],
      appointments: [],
    };

    setCustomers((prev) => [customer, ...prev]);
    setDinRecords((prev) => ({ ...prev, [customer.id]: emptyDinRecord(defaultDinMeasurements) }));
    return customer;
  }, []);

  const updateCustomer = useCallback((id: string, edit: CustomerEdit) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...edit } : c)));
  }, []);

  const getDinRecord = useCallback(
    (id: string) => dinRecords[id] ?? emptyDinRecord(defaultDinMeasurements),
    [dinRecords],
  );

  const updateDinMeasurements = useCallback((id: string, patch: Partial<DinMeasurements>) => {
    setDinRecords((prev) => {
      const record = prev[id] ?? emptyDinRecord(defaultDinMeasurements);
      return {
        ...prev,
        [id]: { ...record, measurements: { ...record.measurements, ...patch } },
      };
    });
  }, []);

  const setDinCustom = useCallback((id: string, value: number | string | null) => {
    setDinRecords((prev) => {
      const record = prev[id] ?? emptyDinRecord(defaultDinMeasurements);
      // Changing the override invalidates whoever signed off the previous one.
      return { ...prev, [id]: { ...record, custom: value, signedAt: '', signatureUrl: '' } };
    });
  }, []);

  const signDin = useCallback((id: string, signedAt: string, signatureUrl: string) => {
    setDinRecords((prev) => {
      const record = prev[id] ?? emptyDinRecord(defaultDinMeasurements);
      return { ...prev, [id]: { ...record, signedAt, signatureUrl } };
    });
  }, []);

  const store = useMemo<CustomerStore>(
    () => ({
      customers,
      getCustomer,
      addCustomer,
      updateCustomer,
      getDinRecord,
      updateDinMeasurements,
      setDinCustom,
      signDin,
    }),
    [
      customers,
      getCustomer,
      addCustomer,
      updateCustomer,
      getDinRecord,
      updateDinMeasurements,
      setDinCustom,
      signDin,
    ],
  );

  return <CustomerContext.Provider value={store}>{children}</CustomerContext.Provider>;
}

export function useCustomers(): CustomerStore {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be used inside a CustomerProvider');
  return ctx;
}
