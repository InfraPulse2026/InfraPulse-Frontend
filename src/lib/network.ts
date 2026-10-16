// Collector 215d33a protobuf JSON. Only Agent-provided rates are shown; no browser deltas.
export const counterFields = [
  'rx_bytes',
  'tx_bytes',
  'rx_packets',
  'tx_packets',
  'rx_errors',
  'tx_errors',
  'rx_dropped',
  'tx_dropped',
] as const;
export type CounterField = (typeof counterFields)[number];
const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
export function uint64(value: unknown): string | null {
  if (typeof value === 'number')
    return Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,19})$/.test(value)) return null;
  return BigInt(value) <= 18446744073709551615n ? value : null;
}
export type NetworkInterface = {
  id: string;
  name: string;
  alias: string;
  mac: string;
  description: string;
  operState: string;
  adminUp: boolean | null;
  mtu: number | null;
  index: number | null;
  type: number | null;
  speed: string | null;
  addresses: string[];
  counters: Record<CounterField, string | null>;
  rates: Record<CounterField, number | null>;
  widths: Record<CounterField, number>;
};
export function interfacesFromSample(sample: Record<string, unknown>) {
  const raw = Array.isArray(sample.interfaces) ? sample.interfaces : [];
  const items = raw.slice(0, 500);
  const counts = new Map<string, number>();
  for (const item of items) {
    const id = record(item)?.id;
    if (typeof id === 'string') counts.set(id, (counts.get(id) || 0) + 1);
  }
  const interfaces: NetworkInterface[] = [];
  let omitted = 0;
  for (const value of items) {
    const item = record(value);
    if (!item || typeof item.id !== 'string' || !item.id || counts.get(item.id) !== 1) {
      omitted++;
      continue;
    }
    const metadata = record(item.metadata),
      counterMeta = record(item.counter_metadata),
      counterMask = counterMeta ? record(counterMeta.available) || {} : undefined;
    const counters = record(item.counters),
      rates = record(item.rates),
      rateMask = rates ? record(rates.available) : undefined,
      rawWidths = record(counterMeta?.widths);
    const c = {} as NetworkInterface['counters'],
      r = {} as NetworkInterface['rates'],
      widths = {} as NetworkInterface['widths'];
    for (const key of counterFields) {
      const available = !counterMask || counterMask[key] === true;
      const width = counterMeta ? (rawWidths?.[key] ?? 0) : 64;
      widths[key] = width === 32 || width === 64 ? width : 0;
      c[key] =
        available && counters ? uint64(counters[key] === undefined ? '0' : counters[key]) : null;
      if (width === 32 && c[key] !== null && BigInt(c[key]!) > 4294967295n) c[key] = null;
      const rate = rates?.[`${key}_per_second`];
      const rateAvailable = !!rates && available && (!rateMask || rateMask[key] === true);
      r[key] =
        rateAvailable && rate === undefined
          ? 0
          : rateAvailable && typeof rate === 'number' && Number.isFinite(rate) && rate >= 0
            ? rate
            : null;
    }
    const string = (key: string) => (typeof item[key] === 'string' ? (item[key] as string) : '');
    const integer = (key: string, mask: string) =>
      metadata && metadata[mask] !== true
        ? null
        : Number.isSafeInteger(item[key]) && Number(item[key]) >= 0
          ? Number(item[key])
          : null;
    const adminUp = metadata
      ? metadata.admin_status === true
        ? item.admin_up === undefined
          ? false
          : typeof item.admin_up === 'boolean'
            ? item.admin_up
            : null
        : null
      : typeof item.admin_up === 'boolean'
        ? item.admin_up
        : null;
    interfaces.push({
      id: item.id,
      name: string('name'),
      alias: string('alias'),
      mac: string('mac'),
      description: string('description'),
      operState: string('oper_state'),
      adminUp,
      mtu: integer('mtu', 'mtu'),
      index: integer('index', 'index'),
      type:
        typeof item.type === 'number' && Number.isSafeInteger(item.type) && item.type >= 0
          ? item.type
          : null,
      speed: item.speed_bits_per_second === undefined ? null : uint64(item.speed_bits_per_second),
      addresses: Array.isArray(item.addresses)
        ? item.addresses.filter((v): v is string => typeof v === 'string').slice(0, 64)
        : [],
      counters: c,
      rates: r,
      widths,
    });
  }
  return { interfaces, omitted, truncated: raw.length > items.length };
}
