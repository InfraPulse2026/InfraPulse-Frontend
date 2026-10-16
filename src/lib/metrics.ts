export function memoryPercent(
  used: string | null | undefined,
  total: string | null | undefined,
): number | null {
  if (!used || !total || !/^\d+$/.test(used) || !/^\d+$/.test(total)) return null;
  const u = BigInt(used);
  const t = BigInt(total);
  if (t === 0n || u > t) return null;
  return Number((u * 10000n) / t) / 100;
}
export function chartNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (
    /^-?\d+$/.test(value) &&
    (BigInt(value) > BigInt(Number.MAX_SAFE_INTEGER) ||
      BigInt(value) < BigInt(Number.MIN_SAFE_INTEGER))
  )
    return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
