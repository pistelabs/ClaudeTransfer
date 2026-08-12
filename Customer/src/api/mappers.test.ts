import { describe, expect, it } from 'vitest';
import { toCustomer, toCustomerUpdateDto, toDinRecord, toMeasurementsDto } from './mappers';
import { customerFixtures } from './mock/fixtures';
import type { CustomerDto, DinRecordDto } from './dto';

const dto: CustomerDto = customerFixtures[0];

describe('toCustomer', () => {
  const customer = toCustomer(dto);

  it('formats the wire dates for display', () => {
    expect(customer.last).toBe('Jun 26, 2026');
    expect(customer.memberSince).toBe('March 12, 2019');
    expect(customer.appointments[0].date).toBe('Jun 26, 2026');
    expect(customer.equipment[0].jobs[0].date).toBe('Jun 24, 2026');
  });

  it('turns 24-hour times into the displayed clock', () => {
    expect(customer.appointments[0].time).toBe('9:00 AM');
    expect(customer.appointments[1].time).toBe('2:30 PM');
  });

  it('formats decimal prices, dropping empty cents', () => {
    expect(customer.appointments[0].price).toBe('$65');
  });

  it('expands the choice values', () => {
    expect(customer.branch).toBe('City Branch');
    expect(customer.preferred).toBe('Email');
    expect(customer.appointments[1].status).toBe('COMPLETED');
    expect(customer.equipment[0].status).toBe('ACTIVE');
  });

  it('camel-cases the contact preferences', () => {
    expect(customer.prefs).toEqual({
      emailEquip: true,
      smsEquip: true,
      emailPromo: false,
      smsPromo: false,
    });
  });
});

describe('toDinRecord', () => {
  const base: DinRecordDto = {
    customer: 'c1',
    measurements: {
      height_cm: '178',
      weight_kg: '80',
      age: 34,
      boot_sole_mm: '312',
      ability: 'type_2',
    },
    custom_value: null,
    signed_at: null,
    signature_url: null,
    signed_by: null,
  };

  it('maps measurements and leaves an unsigned record empty', () => {
    const record = toDinRecord(base);
    expect(record.measurements.ability).toBe('Type II — Moderate');
    expect(record.measurements.bsl).toBe('312');
    expect(record.custom).toBeNull();
    expect(record.signedAt).toBe('');
    expect(record.signatureUrl).toBe('');
  });

  it('formats the signed timestamp for display', () => {
    const signed = toDinRecord({
      ...base,
      custom_value: '7.5',
      signed_at: new Date(2026, 5, 26, 9, 5).toISOString(),
      signature_url: 'https://example.test/sig.png',
      signed_by: 'Front desk',
    });
    expect(signed.custom).toBe('7.5');
    expect(signed.signedAt).toBe('Jun 26, 2026 · 9:05 AM');
    expect(signed.signatureUrl).toBe('https://example.test/sig.png');
  });
});

describe('outbound mapping', () => {
  it('collapses the customer edit back to choice values', () => {
    expect(
      toCustomerUpdateDto({
        name: 'Chris Barnett',
        branch: 'Mountain Branch',
        phone: '123',
        email: 'a@b.c',
        preferred: 'SMS',
      }),
    ).toEqual({
      name: 'Chris Barnett',
      email: 'a@b.c',
      phone: '123',
      branch: 'mountain',
      preferred_contact: 'sms',
    });
  });

  it('sends only the measurement fields that changed', () => {
    expect(toMeasurementsDto({ weight: '82' })).toEqual({ weight_kg: '82' });
    expect(toMeasurementsDto({ ability: 'Type III — Aggressive' })).toEqual({ ability: 'type_3' });
  });
});
