export const validAgentUUID = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value) &&
  value !== '00000000-0000-0000-0000-000000000000';

export function credentialState(
  value: {
    revoked_at: string | null;
    used_at?: string | null;
    expires_at?: string;
    not_before?: string;
    not_after?: string;
  },
  now = Date.now(),
): string {
  if (value.revoked_at) return 'Отозван';
  if (value.used_at) return 'Использован';
  const end = Date.parse(value.expires_at ?? value.not_after ?? '');
  const start = value.not_before === undefined ? null : Date.parse(value.not_before);
  if (!Number.isFinite(end) || (start !== null && !Number.isFinite(start)))
    return 'Срок неизвестен';
  if (end <= now) return 'Истёк';
  if (start !== null && start > now) return 'Ещё не действует';
  return 'Действует по сроку';
}
