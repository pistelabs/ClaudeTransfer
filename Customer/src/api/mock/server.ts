import { MOCK_LATENCY_MS } from '../config';
import { customerFixtures, defaultMeasurements, dinRecordFixtures } from './fixtures';
import { ApiError } from '../http';
import {
  toCustomValueDto,
  toCustomer,
  toCustomerCreateDto,
  toCustomerUpdateDto,
  toDinRecord,
  toMeasurementsDto,
} from '../mappers';
import { toIsoDate } from '../../lib/format';
import type { CustomerDto, DinRecordDto } from '../dto';
import type { CustomersApi } from '../types';

/**
 * In-memory stand-in for the Django API. It stores wire-shaped records and
 * goes through the same mappers as the live client, so the UI cannot tell the
 * two apart. State lives for the lifetime of the page — a reload resets it.
 */
const customers: CustomerDto[] = structuredClone(customerFixtures);
const dinRecords: Record<string, DinRecordDto> = dinRecordFixtures();

const delay = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

function findCustomer(id: string): CustomerDto {
  const customer = customers.find((c) => c.id === id);
  if (!customer) throw new ApiError(404, `No customer with id ${id}`, null);
  return customer;
}

function findDinRecord(customerId: string): DinRecordDto {
  findCustomer(customerId);
  dinRecords[customerId] ??= {
    customer: customerId,
    measurements: { ...defaultMeasurements },
    custom_value: null,
    signed_at: null,
    signature_url: null,
    signed_by: null,
  };
  return dinRecords[customerId];
}

export const mockApi: CustomersApi = {
  async listCustomers() {
    await delay();
    return customers.map(toCustomer);
  },

  async getCustomer(id) {
    await delay();
    return toCustomer(findCustomer(id));
  },

  async createCustomer(input) {
    await delay();
    const payload = toCustomerCreateDto(input);
    const created: CustomerDto = {
      id: `c${Date.now()}`,
      ...payload,
      last_activity_on: toIsoDate(),
      member_since: toIsoDate(),
      equipment: [],
      appointments: [],
    };
    customers.unshift(created);
    return toCustomer(created);
  },

  async updateCustomer(id, edit) {
    await delay();
    const customer = findCustomer(id);
    Object.assign(customer, toCustomerUpdateDto(edit));
    return toCustomer(customer);
  },

  async getDinRecord(customerId) {
    await delay();
    return toDinRecord(findDinRecord(customerId));
  },

  async updateDinMeasurements(customerId, patch) {
    await delay();
    const record = findDinRecord(customerId);
    Object.assign(record.measurements, toMeasurementsDto(patch));
    return toDinRecord(record);
  },

  async setDinCustomValue(customerId, value) {
    await delay();
    const record = findDinRecord(customerId);
    record.custom_value = toCustomValueDto(value);
    // A changed override invalidates the signature that authorised the old one.
    record.signed_at = null;
    record.signature_url = null;
    record.signed_by = null;
    return toDinRecord(record);
  },

  async uploadDinSignature(customerId, signaturePng) {
    await delay();
    const record = findDinRecord(customerId);
    if (record.custom_value === null) {
      throw new ApiError(400, 'There is no custom DIN to sign off', null);
    }
    record.signature_url = signaturePng;
    record.signed_at = new Date().toISOString();
    record.signed_by = 'Front desk';
    return toDinRecord(record);
  },
};
