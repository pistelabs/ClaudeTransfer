import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import type {
  Customer,
  CustomerEdit,
  DinMeasurements,
  DinRecord,
  NewCustomerInput,
} from '../types';

export type LoadStatus = 'loading' | 'ready' | 'error';

interface CustomerStore {
  customers: Customer[];
  status: LoadStatus;
  error: string | null;
  reload: () => void;

  getCustomer: (id: string | undefined) => Customer | undefined;
  addCustomer: (input: NewCustomerInput) => Promise<Customer>;
  updateCustomer: (id: string, edit: CustomerEdit) => Promise<void>;

  /** `undefined` until the record has been fetched for that customer. */
  getDinRecord: (customerId: string) => DinRecord | undefined;
  loadDinRecord: (customerId: string) => Promise<void>;
  updateDinMeasurements: (customerId: string, patch: Partial<DinMeasurements>) => Promise<void>;
  /** `null` drops the override. Any change clears the signature server-side. */
  setDinCustom: (customerId: string, value: number | string | null) => Promise<void>;
  /** Uploads the captured PNG; the server records who signed and when. */
  signDin: (customerId: string, signaturePng: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerStore | null>(null);

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [dinRecords, setDinRecords] = useState<Record<string, DinRecord>>({});

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    api
      .listCustomers()
      .then((loaded) => {
        if (cancelled) return;
        setCustomers(loaded);
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(message(cause));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const getCustomer = useCallback(
    (id: string | undefined) => (id ? customers.find((c) => c.id === id) : undefined),
    [customers],
  );

  const addCustomer = useCallback(async (input: NewCustomerInput) => {
    const created = await api.createCustomer(input);
    setCustomers((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCustomer = useCallback(async (id: string, edit: CustomerEdit) => {
    const updated = await api.updateCustomer(id, edit);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const getDinRecord = useCallback((customerId: string) => dinRecords[customerId], [dinRecords]);

  const storeRecord = useCallback((customerId: string, record: DinRecord) => {
    setDinRecords((prev) => ({ ...prev, [customerId]: record }));
  }, []);

  const loadDinRecord = useCallback(
    async (customerId: string) => {
      storeRecord(customerId, await api.getDinRecord(customerId));
    },
    [storeRecord],
  );

  /**
   * These two fire on every keystroke, so the local value stays authoritative
   * and the response body is discarded — a slow PATCH must never overwrite
   * newer input. A failure resyncs from the server instead.
   */
  const persist = useCallback(
    async (customerId: string, patch: (record: DinRecord) => DinRecord, save: () => Promise<unknown>) => {
      setDinRecords((prev) => {
        const current = prev[customerId];
        return current ? { ...prev, [customerId]: patch(current) } : prev;
      });
      try {
        await save();
      } catch (cause) {
        await loadDinRecord(customerId).catch(() => undefined);
        throw cause;
      }
    },
    [loadDinRecord],
  );

  const updateDinMeasurements = useCallback(
    (customerId: string, patch: Partial<DinMeasurements>) =>
      persist(
        customerId,
        (record) => ({ ...record, measurements: { ...record.measurements, ...patch } }),
        () => api.updateDinMeasurements(customerId, patch),
      ),
    [persist],
  );

  const setDinCustom = useCallback(
    (customerId: string, value: number | string | null) =>
      persist(
        customerId,
        // Changing the override invalidates the signature that authorised it.
        (record) => ({ ...record, custom: value, signedAt: '', signatureUrl: '' }),
        () => api.setDinCustomValue(customerId, value),
      ),
    [persist],
  );

  const signDin = useCallback(
    async (customerId: string, signaturePng: string) => {
      storeRecord(customerId, await api.uploadDinSignature(customerId, signaturePng));
    },
    [storeRecord],
  );

  const store = useMemo<CustomerStore>(
    () => ({
      customers,
      status,
      error,
      reload,
      getCustomer,
      addCustomer,
      updateCustomer,
      getDinRecord,
      loadDinRecord,
      updateDinMeasurements,
      setDinCustom,
      signDin,
    }),
    [
      customers,
      status,
      error,
      reload,
      getCustomer,
      addCustomer,
      updateCustomer,
      getDinRecord,
      loadDinRecord,
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
