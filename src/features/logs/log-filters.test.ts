import { describe, it, expect } from 'vitest';
import { eventTime, logQuery, localTime } from './log-filters';
describe('log and audit search contract', () => {
  it('preserves zero-valued IDs, false outcome and facility zero', () => {
    expect(
      logQuery(new URLSearchParams('uid=0&auid=0&pid=0&facility=0&success=false')),
    ).toMatchObject({ uid: 0, auid: 0, pid: 0, facility: 0, success: 'false' });
  });
  it('accepts RFC3339 offsets/nanoseconds without rewriting the wire filter', () => {
    const from = '2026-10-15T12:00:00.123456789+03:00';
    expect(eventTime(from)).toBe(Date.parse('2026-10-15T09:00:00.123Z'));
    expect(logQuery(new URLSearchParams({ from })).from).toBe(from);
    expect(localTime('invalid')).toBe('');
  });
  it('rejects absent timezone, invalid calendar dates and clock fields', () => {
    for (const value of [
      '2026-10-15T12:00:00',
      '2026-02-29T00:00:00Z',
      '2026-04-31T00:00:00Z',
      '2026-10-15T24:00:00Z',
      '2026-10-15T00:00:00+24:00',
    ])
      expect(() => eventTime(value)).toThrow();
    expect(Number.isFinite(eventTime('2028-02-29T00:00:00Z'))).toBe(true);
  });
  it('requires a bounded window for contains and excludes full-text q', () => {
    expect(() => logQuery(new URLSearchParams('contains=x'))).toThrow();
    expect(() => logQuery(new URLSearchParams('q=x&contains=y'))).toThrow();
    expect(() =>
      logQuery(
        new URLSearchParams({
          contains: 'x',
          from: '2026-10-01T00:00:00Z',
          to: '2026-10-08T00:00:01Z',
        }),
      ),
    ).toThrow();
    expect(
      logQuery(
        new URLSearchParams({
          contains: 'x',
          from: '2026-10-01T00:00:00Z',
          to: '2026-10-08T00:00:00Z',
        }),
      ).contains,
    ).toBe('x');
    expect(() =>
      logQuery(new URLSearchParams({ from: '2026-10-08T00:00:00Z', to: '2026-10-01T00:00:00Z' })),
    ).toThrow();
  });
  it('enforces UTF-8 byte bounds instead of character count', () => {
    expect(logQuery(new URLSearchParams({ q: 'ю'.repeat(128) })).q).toHaveLength(128);
    expect(() => logQuery(new URLSearchParams({ q: 'ю'.repeat(129) }))).toThrow(/256/);
  });
  it('rejects invalid numeric and enum filters and unsafe cursor rounding', () => {
    for (const value of [
      'uid=-1',
      'pid=1.5',
      'auid=1e3',
      'facility=4294967296',
      'before_id=9007199254740992',
      'before_id=0',
      'severity=8',
      'success=yes',
    ])
      expect(() => logQuery(new URLSearchParams(value))).toThrow();
  });
  it('does not turn absent values into numeric zero filters', () => {
    expect(logQuery(new URLSearchParams())).toEqual({ limit: 50 });
    expect(logQuery(new URLSearchParams('uid=&before_id='))).toEqual({ limit: 50 });
  });
});
