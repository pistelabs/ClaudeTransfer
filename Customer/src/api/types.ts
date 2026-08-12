import type {
  Customer,
  CustomerEdit,
  DinMeasurements,
  DinRecord,
  NewCustomerInput,
} from '../types';

/**
 * Everything the UI needs from the backend. Both the live client and the mock
 * server implement this, so swapping between them is a one-line change in
 * `api/index.ts` driven by `VITE_API_BASE_URL`.
 */
export interface CustomersApi {
  listCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer>;
  createCustomer(input: NewCustomerInput): Promise<Customer>;
  updateCustomer(id: string, edit: CustomerEdit): Promise<Customer>;

  getDinRecord(customerId: string): Promise<DinRecord>;
  updateDinMeasurements(customerId: string, patch: Partial<DinMeasurements>): Promise<DinRecord>;
  /** `null` drops the override and restores the calculated value. */
  setDinCustomValue(customerId: string, value: number | string | null): Promise<DinRecord>;
  /** Uploads the captured PNG; the server stamps who signed and when. */
  uploadDinSignature(customerId: string, signaturePng: string): Promise<DinRecord>;
}
