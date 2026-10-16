import { z } from 'zod';
import type { Model } from '../../api/client';
const text = (min: number, max: number) =>
  z.string().refine((v) => {
    const n = new TextEncoder().encode(v).length;
    const control = Array.from(v).some(
      (c) => c.codePointAt(0)! < 32 || (c.codePointAt(0)! >= 127 && c.codePointAt(0)! <= 159),
    );
    return n >= min && n <= max && v === v.trim() && !control;
  }, `Нужна строка ${min}–${max} байт без управляющих символов.`);
const rowSchema = z
  .object({
    asset_id: text(1, 128),
    mode: z.enum(['unplaced', 'rack', 'outside_rack']),
    location_id: text(1, 128).nullable().optional(),
    start_unit: z.number().int().min(0).max(100).optional(),
    height_units: z.number().int().min(0).max(100).optional(),
    position: text(0, 256).optional(),
    expected_revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
const fileSchema = z
  .object({ placements: z.array(rowSchema).min(1).max(50), reason: text(3, 1000).optional() })
  .strict();
export type ImportRow = z.infer<typeof rowSchema>;
export type ImportReview = {
  body: Model<'PlacementImport'>;
  rows: {
    desired: ImportRow;
    current: Model<'AssetPlacement'>;
    location?: Model<'PhysicalLocation'>;
  }[];
};
export function parsePlacementFile(value: string, reason: string) {
  if (new TextEncoder().encode(value).length > 65536) throw new Error('Файл ограничен 64 КиБ.');
  let decoded: unknown;
  try {
    decoded = JSON.parse(value);
  } catch {
    throw new Error('Файл должен содержать корректный JSON-объект с placements.');
  }
  const file = fileSchema.parse(decoded);
  const seen = new Set<string>();
  for (const row of file.placements) {
    if (seen.has(row.asset_id))
      throw new Error('Каждый Asset должен встречаться в партии только один раз.');
    seen.add(row.asset_id);
    if (
      row.mode === 'unplaced' &&
      (row.location_id != null ||
        (row.start_unit || 0) !== 0 ||
        (row.height_units || 0) !== 0 ||
        (row.position || '') !== '')
    )
      throw new Error('unplaced явно освобождает место: локация null, юниты 0 и пустая позиция.');
    if (
      row.mode === 'outside_rack' &&
      (!row.location_id || (row.start_unit || 0) !== 0 || (row.height_units || 0) !== 0)
    )
      throw new Error('Вне стойки нужна локация помещения без юнитов.');
    if (
      row.mode === 'rack' &&
      (!row.location_id ||
        !row.start_unit ||
        !row.height_units ||
        row.start_unit + row.height_units - 1 > 100)
    )
      throw new Error('В стойке нужны локация и допустимый диапазон 1–100 U.');
  }
  const body = { placements: file.placements, reason: text(3, 1000).parse(reason.trim()) };
  if (new TextEncoder().encode(JSON.stringify(body)).length > 65536)
    throw new Error('Партия с обоснованием превышает 64 КиБ.');
  return body;
}
export function validateImportRows(
  body: ReturnType<typeof parsePlacementFile>,
  current: Map<string, Model<'AssetPlacement'>>,
  locations: Map<string, Model<'PhysicalLocation'>>,
  racks: Map<string, Model<'RackLayout'>>,
): ImportReview {
  const changing = new Set(body.placements.map((p) => p.asset_id));
  const desiredSlots = new Map<string, string>();
  const rows = body.placements.map((desired) => {
    const previous = current.get(desired.asset_id);
    if (
      !previous ||
      previous.asset_id !== desired.asset_id ||
      previous.revision !== desired.expected_revision
    )
      throw new Error(
        `Ревизия размещения ${desired.asset_id} изменилась: в файле ${desired.expected_revision}, backend ${previous?.revision ?? 'неизвестно'}. Файл не обновляется автоматически.`,
      );
    const location = desired.location_id ? locations.get(desired.location_id) : undefined;
    if (desired.mode === 'outside_rack' && location?.kind !== 'room')
      throw new Error(`${desired.asset_id}: вне стойки допускается только помещение (room).`);
    if (desired.mode === 'rack') {
      if (
        location?.kind !== 'rack' ||
        !desired.start_unit ||
        !desired.height_units ||
        desired.start_unit + desired.height_units - 1 > location.rack_units
      )
        throw new Error(`${desired.asset_id}: диапазон не помещается в выбранную стойку.`);
      const rack = racks.get(location.id);
      if (!rack || rack.location.id !== location.id)
        throw new Error('Не загружено фактическое заполнение стойки.');
      for (
        let unit = desired.start_unit;
        unit < desired.start_unit + desired.height_units;
        unit++
      ) {
        const key = `${location.id}:${unit}`;
        if (desiredSlots.has(key))
          throw new Error(`Юнит ${unit} занят двумя строками этой партии.`);
        desiredSlots.set(key, desired.asset_id);
        if (
          rack.placements.some(
            (p) =>
              !changing.has(p.asset_id) &&
              p.mode === 'rack' &&
              p.start_unit <= unit &&
              p.start_unit + p.height_units > unit,
          )
        )
          throw new Error(`Юнит ${unit} уже занят Asset вне этой партии.`);
      }
    }
    return { desired, current: previous, location };
  });
  return { body, rows };
}
