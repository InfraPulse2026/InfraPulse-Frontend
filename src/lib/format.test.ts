import { describe, expect, it } from 'vitest';
import { measurement, safeInternalPath, timestamp } from './format';
import { status, can } from './status';
import { idempotencySlot } from './idempotency';
describe('honest data semantics', () => {
  it('distinguishes zero, absent and non-finite values', () => {
    expect(measurement(0, '°C')).toBe('0 °C');
    expect(measurement(null)).toBe('Нет данных');
    expect(measurement(undefined)).toBe('Нет данных');
    expect(measurement(NaN)).toBe('Нет данных');
  });
  it('keeps uint64 decimal strings exact', () => {
    expect(measurement('18446744073709551615')).toBe('18446744073709551615');
  });
  it('does not replace missing timestamps', () => {
    expect(timestamp(undefined)).toBe('Не указано');
    expect(timestamp('bad')).toBe('Не указано');
  });
  it('keeps unknown distinct from healthy', () => {
    expect(status(undefined)[1]).toBe('muted');
    expect(status('stale')[1]).toBe('warning');
    expect(status('uncertain')[0]).toBe('Исход неизвестен');
    expect(status('Off')[1]).toBe('muted');
  });
  it('only allows permissions actually issued by server', () => {
    expect(can(['data.read'], 'access.manage')).toBe(false);
    expect(can(undefined, 'data.read')).toBe(false);
    expect(can(['analysis.write'], 'analysis.write')).toBe(true);
  });
});
describe('routing and safe retries', () => {
  it.each(['https://evil.example', '//evil.example', '/\\evil', '/\n/evil', 'javascript:alert(1)'])(
    'rejects unsafe redirect %s',
    (path) => expect(safeInternalPath(path)).toBeUndefined(),
  );
  it('retains an internal evidence path', () =>
    expect(safeInternalPath('/assets/a?tab=hardware')).toBe('/assets/a?tab=hardware'));
  it('retains key for retries and changes it for a new payload', () => {
    const slot = idempotencySlot();
    const a = slot({ revision: 2 });
    expect(slot({ revision: 2 })).toBe(a);
    expect(slot({ revision: 3 })).not.toBe(a);
  });
});
