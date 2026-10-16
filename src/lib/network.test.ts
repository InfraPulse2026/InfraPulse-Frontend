import { describe, it, expect } from 'vitest';
import { interfacesFromSample, uint64 } from './network';
const one = (item: Record<string, unknown>) =>
  interfacesFromSample({ interfaces: [{ id: 'i1', ...item }] }).interfaces[0]!;
describe('Collector network protobuf JSON availability and precision', () => {
  it('keeps uint64 precision and rejects unsafe or out-of-range values', () => {
    expect(uint64('18446744073709551615')).toBe('18446744073709551615');
    expect(uint64(0)).toBe('0');
    for (const v of ['18446744073709551616', '-1', '1.5', 'x', 9007199254740992, Infinity, null])
      expect(uint64(v)).toBeNull();
  });
  it('honors legacy omitted-zero counters and rates only when their messages exist', () => {
    const item = one({ counters: {}, rates: {} });
    expect(item.counters.rx_bytes).toBe('0');
    expect(item.rates.rx_bytes).toBe(0);
    expect(item.widths.rx_bytes).toBe(64);
    expect(one({}).counters.rx_bytes).toBeNull();
    expect(one({}).rates.rx_bytes).toBeNull();
  });
  it('treats a present empty availability mask as unavailable', () => {
    const item = one({
      counter_metadata: { available: {} },
      counters: { rx_bytes: '42' },
      rates: { rx_bytes_per_second: 4 },
    });
    expect(item.counters.rx_bytes).toBeNull();
    expect(item.rates.rx_bytes).toBeNull();
  });
  it('keeps measured zero when its availability flag is true', () => {
    const item = one({
      counter_metadata: { available: { rx_bytes: true } },
      counters: {},
      rates: { available: { rx_bytes: true } },
    });
    expect(item.counters.rx_bytes).toBe('0');
    expect(item.rates.rx_bytes).toBe(0);
    expect(item.rates.tx_bytes).toBeNull();
  });
  it('does not use values disabled by the rate mask', () => {
    const item = one({
      counters: { rx_bytes: '42' },
      rates: { available: { tx_bytes: true }, rx_bytes_per_second: 4 },
    });
    expect(item.rates.rx_bytes).toBeNull();
    expect(item.rates.tx_bytes).toBe(0);
  });
  it('preserves unknown counter width and rejects a counter outside declared 32-bit range', () => {
    const item = one({
      counter_metadata: { available: { rx_bytes: true, tx_bytes: true }, widths: { rx_bytes: 32 } },
      counters: { rx_bytes: '4294967296', tx_bytes: '50' },
    });
    expect(item.counters.rx_bytes).toBeNull();
    expect(item.counters.tx_bytes).toBe('50');
    expect(item.widths.tx_bytes).toBe(0);
  });
  it('requires qualification for omitted false admin status', () => {
    expect(one({ metadata: { admin_status: true } }).adminUp).toBe(false);
    expect(one({ metadata: {}, admin_up: true }).adminUp).toBeNull();
    expect(one({}).adminUp).toBeNull();
    expect(one({ admin_up: false }).adminUp).toBe(false);
  });
  it('rejects nonfinite, negative and string rates', () => {
    for (const rx_bytes_per_second of [NaN, Infinity, -1, '4', null])
      expect(one({ rates: { rx_bytes_per_second } }).rates.rx_bytes).toBeNull();
    expect(one({ rates: { rx_bytes_per_second: 4.5 } }).rates.rx_bytes).toBe(4.5);
  });
  it('does not join duplicate or absent interface IDs', () => {
    const parsed = interfacesFromSample({
      interfaces: [{ id: 'x' }, { id: 'x' }, { name: 'missing' }, null, { id: 'y' }],
    });
    expect(parsed.interfaces.map((i) => i.id)).toEqual(['y']);
    expect(parsed.omitted).toBe(4);
  });
  it('bounds the UI and distinguishes optional speed from measured zero', () => {
    const parsed = interfacesFromSample({
      interfaces: Array.from({ length: 600 }, (_, i) => ({ id: String(i) })),
    });
    expect(parsed.interfaces).toHaveLength(500);
    expect(parsed.truncated).toBe(true);
    expect(one({}).speed).toBeNull();
    expect(one({ speed_bits_per_second: '0' }).speed).toBe('0');
  });
});
