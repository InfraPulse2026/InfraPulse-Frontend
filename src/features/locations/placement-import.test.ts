import { describe, it, expect } from 'vitest';
import type { Model } from '../../api/client';
import { locations } from '../../mocks/fixtures';
import { parsePlacementFile, validateImportRows, type ImportRow } from './placement-import';
const row = (id = 'one', unit = 1): ImportRow => ({
  asset_id: id,
  mode: 'rack',
  location_id: 'rack_a01',
  start_unit: unit,
  height_units: 1,
  expected_revision: 0,
});
const parse = (rows: unknown[]) =>
  parsePlacementFile(JSON.stringify({ placements: rows }), 'Team placement');
const current = (id = 'one', unit = 0): Model<'AssetPlacement'> => ({
  asset_id: id,
  mode: unit ? 'rack' : 'unplaced',
  location_id: unit ? 'rack_a01' : null,
  start_unit: unit,
  height_units: unit ? 1 : 0,
  position: '',
  revision: 0,
  updated_at: null,
  path: [],
});
function check(
  rows: ImportRow[],
  previous = [current()],
  occupied: Model<'AssetPlacement'>[] = [],
) {
  const rack = locations.find((l) => l.id === 'rack_a01')!;
  return validateImportRows(
    parse(rows),
    new Map(previous.map((p) => [p.asset_id, p])),
    new Map(locations.map((l) => [l.id, l])),
    new Map([
      [
        rack.id,
        {
          location: rack,
          placements: occupied,
          occupied_units: occupied.length,
          free_units: 12 - occupied.length,
        },
      ],
    ]),
  );
}
describe('placement import review', () => {
  it('requires bounded JSON, strict fields and explicit safe revision', () => {
    expect(() => parsePlacementFile('no', 'reason')).toThrow('JSON');
    expect(() => parsePlacementFile(' '.repeat(65537), 'reason')).toThrow('64');
    expect(() => parse([{ ...row(), expected_revision: undefined }])).toThrow();
    expect(() => parse([{ ...row(), expected_revision: Number.MAX_SAFE_INTEGER + 1 }])).toThrow();
    expect(() => parse([{ ...row(), unexpected: true }])).toThrow();
    expect(() => parse(Array.from({ length: 51 }, (_, i) => row(String(i))))).toThrow();
  });
  it('checks duplicate IDs, UTF8 byte limits, whitespace and control characters', () => {
    expect(() => parse([row(), row()])).toThrow('один раз');
    expect(() => parse([row('я'.repeat(65))])).toThrow();
    expect(() => parse([row(' one')])).toThrow();
    expect(() => parse([row('one\u0085')])).toThrow();
  });
  it('requires explicit valid placement modes and unit ranges', () => {
    expect(() => parse([{ ...row(), mode: 'unplaced' }])).toThrow('явно');
    expect(() => parse([{ ...row(), mode: 'outside_rack' }])).toThrow('без юнитов');
    expect(() =>
      parse([row('one', 100), { ...row('two'), start_unit: 100, height_units: 2 }]),
    ).toThrow('1–100');
    expect(() =>
      check([{ ...row(), mode: 'outside_rack', start_unit: 0, height_units: 0 }]),
    ).toThrow('помещение');
  });
  it('rejects stale placement revisions and wrong asset identity', () => {
    expect(() => check([row()], [{ ...current(), revision: 1 }])).toThrow('Ревизия');
    expect(() => check([row()], [current('other')])).toThrow('Ревизия');
  });
  it('checks capacity and overlaps within the batch and with other assets', () => {
    expect(() => check([row('one', 13)])).toThrow('не помещается');
    expect(() => check([row(), row('two')], [current(), current('two')])).toThrow('двумя строками');
    expect(() => check([row()], [current()], [current('other', 1)])).toThrow('вне этой партии');
  });
  it('permits an atomic swap and explicit freeing without treating old batch slots as occupied', () => {
    const old = [current('one', 1), current('two', 2)];
    expect(check([row('one', 2), row('two', 1)], old, old).rows).toHaveLength(2);
    const clear: ImportRow = {
      asset_id: 'two',
      mode: 'unplaced',
      expected_revision: 0,
      location_id: null,
    };
    expect(check([row('one', 2), clear], old, old).rows[1]!.desired.mode).toBe('unplaced');
  });
});
