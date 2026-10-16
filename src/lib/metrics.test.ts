import { describe, it, expect } from 'vitest';
import { memoryPercent, chartNumber } from './metrics';
describe('metric units and precision', () => {
  it('calculates RAM ratio with integer arithmetic before bounded conversion', () => {
    expect(memoryPercent('9223372036854775807', '18446744073709551614')).toBe(50);
    expect(memoryPercent('0', '100')).toBe(0);
  });
  it('rejects missing, zero denominator and inconsistent observations', () => {
    expect(memoryPercent(null, '100')).toBeNull();
    expect(memoryPercent('0', '0')).toBeNull();
    expect(memoryPercent('101', '100')).toBeNull();
  });
  it('never silently rounds a uint64 chart point', () => {
    expect(chartNumber('18446744073709551615')).toBeNull();
    expect(chartNumber('0')).toBe(0);
    expect(chartNumber('2.5')).toBe(2.5);
    expect(chartNumber('NaN')).toBeNull();
  });
});
