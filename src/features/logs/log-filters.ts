import type { operations } from '../../api/generated/schema';
export type LogQuery = NonNullable<operations['getLogs']['parameters']['query']>;
export const textFilters = [
  'agent_id',
  'device_id',
  'source',
  'source_id',
  'host',
  'process',
  'record_type',
  'event_id',
  'executable',
  'q',
  'contains',
] as const;
export const numericFilters = ['facility', 'uid', 'auid', 'pid'] as const;
export const filterKeys = [
  ...textFilters,
  ...numericFilters,
  'severity',
  'success',
  'from',
  'to',
] as const;
export function eventTime(value: string): number {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    );
  if (!match) throw new Error('Время должно быть RFC3339 с часовым поясом.');
  const [y, m, d, h, min, s] = match.slice(1, 7).map(Number);
  const days = [
    31,
    y! % 4 === 0 && (y! % 100 !== 0 || y! % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (!y || m! < 1 || m! > 12 || d! < 1 || d! > days[m! - 1]! || h! > 23 || min! > 59 || s! > 59)
    throw new Error('Некорректная дата или время.');
  const offset = match[7]!;
  if (offset !== 'Z' && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59))
    throw new Error('Некорректный часовой пояс.');
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) throw new Error('Некорректная дата.');
  return ms;
}
export function logQuery(params: URLSearchParams): LogQuery {
  const result: LogQuery = { limit: 50 };
  for (const key of textFilters) {
    const value = params.get(key);
    if (value) {
      if (new TextEncoder().encode(value).length > 256)
        throw new Error('Текстовые фильтры ограничены 256 байтами UTF-8.');
      result[key] = value;
    }
  }
  if (result.q && result.contains)
    throw new Error('Выберите поиск по словам или подстроке, одновременно они не отправляются.');
  for (const key of numericFilters) {
    const raw = params.get(key);
    if (raw) {
      if (!/^\d+$/.test(raw) || Number(raw) > 4294967295)
        throw new Error('Facility/UID/AUID/PID должны быть целыми от 0 до 4294967295.');
      result[key] = Number(raw);
    }
  }
  const severity = params.get('severity');
  if (severity) {
    if (!['0', '1', '2', '3', '4', '5', '6', '7', 'unknown'].includes(severity))
      throw new Error('Недопустимый уровень важности.');
    result.severity = severity as LogQuery['severity'];
  }
  const success = params.get('success');
  if (success) {
    if (!['true', 'false', 'unknown'].includes(success))
      throw new Error('Недопустимый результат audit.');
    result.success = success as LogQuery['success'];
  }
  const from = params.get('from'),
    to = params.get('to');
  const a = from ? eventTime(from) : null,
    b = to ? eventTime(to) : null;
  if (from) result.from = from;
  if (to) result.to = to;
  if (a !== null && b !== null && a >= b)
    throw new Error('Начало периода должно быть раньше конца.');
  if (result.contains && (a === null || b === null || b - a > 7 * 86400000))
    throw new Error('Поиск подстроки требует начала и конца периода не длиннее 7 дней.');
  const before = params.get('before_id');
  if (before) {
    const n = Number(before);
    if (!/^\d+$/.test(before) || !Number.isSafeInteger(n) || n < 1)
      throw new Error('Курсор должен быть положительным точным целым.');
    result.before_id = n;
  }
  return result;
}
export function localTime(value: string | null) {
  if (!value) return '';
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return '';
  const date = new Date(ms);
  return new Date(ms - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}
