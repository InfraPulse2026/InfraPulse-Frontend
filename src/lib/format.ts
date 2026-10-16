import { format, formatDistanceToNowStrict, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
export function timestamp(value?: string | null, utc = false) {
  if (!value || !isValid(new Date(value))) return 'Не указано';
  if (utc) return new Date(value).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
  return format(new Date(value), 'dd.MM.yyyy HH:mm:ss');
}
export function relative(value?: string | null) {
  if (!value || !isValid(new Date(value))) return 'Нет наблюдения';
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true, locale: ru });
}
export function measurement(value: unknown, unit = '') {
  if (value === null || value === undefined || value === '') return 'Нет данных';
  if (typeof value === 'number')
    return Number.isFinite(value)
      ? `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value)}${unit ? ` ${unit}` : ''}`
      : 'Нет данных';
  if (typeof value === 'string') return `${value}${unit ? ` ${unit}` : ''}`;
  return 'Нет данных';
}
export function text(value: unknown, fallback = 'Не указано'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
export const shortId = (value?: string) =>
  value ? (value.length > 24 ? `${value.slice(0, 12)}…${value.slice(-6)}` : value) : '—';
export function safeInternalPath(value: string): string | undefined {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    [...value].some((c) => c.charCodeAt(0) < 32)
  )
    return undefined;
  const url = new URL(value, 'https://infrapulse.invalid');
  return url.origin === 'https://infrapulse.invalid'
    ? `${url.pathname}${url.search}${url.hash}`
    : undefined;
}
