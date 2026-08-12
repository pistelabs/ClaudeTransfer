import { request } from './http';
import {
  toCustomValueDto,
  toCustomer,
  toCustomerCreateDto,
  toCustomerUpdateDto,
  toDinRecord,
  toMeasurementsDto,
} from './mappers';
import type { CustomerDto, DinRecordDto } from './dto';
import type { CustomersApi } from './types';

/** Paginated list response, as DRF emits with the default pagination class. */
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function unwrap<T>(payload: T[] | Paginated<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results;
}

/** Talks to the Django API described in `docs/api-contract.md`. */
export const liveApi: CustomersApi = {
  async listCustomers() {
    const payload = await request<CustomerDto[] | Paginated<CustomerDto>>('/customers/');
    return unwrap(payload).map(toCustomer);
  },

  async getCustomer(id) {
    return toCustomer(await request<CustomerDto>(`/customers/${id}/`));
  },

  async createCustomer(input) {
    const dto = await request<CustomerDto>('/customers/', {
      method: 'POST',
      body: JSON.stringify(toCustomerCreateDto(input)),
    });
    return toCustomer(dto);
  },

  async updateCustomer(id, edit) {
    const dto = await request<CustomerDto>(`/customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toCustomerUpdateDto(edit)),
    });
    return toCustomer(dto);
  },

  async getDinRecord(customerId) {
    return toDinRecord(await request<DinRecordDto>(`/customers/${customerId}/din/`));
  },

  async updateDinMeasurements(customerId, patch) {
    const dto = await request<DinRecordDto>(`/customers/${customerId}/din/`, {
      method: 'PATCH',
      body: JSON.stringify({ measurements: toMeasurementsDto(patch) }),
    });
    return toDinRecord(dto);
  },

  async setDinCustomValue(customerId, value) {
    const dto = await request<DinRecordDto>(`/customers/${customerId}/din/`, {
      method: 'PATCH',
      body: JSON.stringify({ custom_value: toCustomValueDto(value) }),
    });
    return toDinRecord(dto);
  },

  async uploadDinSignature(customerId, signaturePng) {
    const body = new FormData();
    body.append('signature', await dataUrlToBlob(signaturePng), `signature-${customerId}-din.png`);
    const dto = await request<DinRecordDto>(`/customers/${customerId}/din/signature/`, {
      method: 'POST',
      body,
    });
    return toDinRecord(dto);
  },
};

/** The pad hands us a data URL; the API wants a file upload. */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}
