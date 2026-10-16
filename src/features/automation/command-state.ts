import type { Model } from '../../api/client';

export const commandStates = [
  'queued',
  'dispatching',
  'sent',
  'accepted',
  'running',
  'success',
  'failed',
  'rejected',
  'unsupported',
  'timeout',
  'expired',
  'uncertain',
] as const;
export const validCommandID = (id: string) => /^cmd_[a-f0-9]{32}$/.test(id);
export const commandActive = (state: string) =>
  ['queued', 'dispatching', 'sent', 'accepted', 'running'].includes(state);
export const adminState = (value: boolean | null | undefined) =>
  value === true
    ? 'Административно разрешён'
    : value === false
      ? 'Административно выключен'
      : 'Неизвестно';

export function rollbackBlocks(
  command: Model<'CommandRecord'>,
  snapshot: Model<'CommandSnapshot'>,
  policy: Model<'CommandPolicy'>,
): string[] {
  const reasons: string[] = [];
  if (!policy.enabled || !policy.allow_rollback || !policy.allow_disable)
    reasons.push(
      'Политика backend не разрешает откат: нужны enabled, allow_rollback и allow_disable.',
    );
  if (command.operation === 'rollback')
    reasons.push('Повторный откат отката в этой форме не поддерживается.');
  if (
    command.state !== 'success' ||
    !command.result ||
    command.result.uncertain ||
    !command.result.verification?.verified ||
    command.result.verification.uncertain
  )
    reasons.push('Исходная команда не имеет однозначно подтверждённого результата.');
  if (snapshot.status !== 'candidate' || snapshot.rollback_command_id)
    reasons.push('Ссылка на снимок уже занята, использована или недоступна.');
  if (
    snapshot.origin_command_id !== command.id ||
    snapshot.agent_id !== command.agent_id ||
    snapshot.device_id !== command.device_id ||
    snapshot.interface_id !== command.interface_id ||
    snapshot.snapshot_id !== command.result?.snapshot_id ||
    !snapshot.snapshot_id
  )
    reasons.push('Снимок не соответствует исходной команде и её ресурсу.');
  if (typeof snapshot.after_admin_up !== 'boolean')
    reasons.push('После исходной команды не зафиксировано административное состояние интерфейса.');
  const verification = command.result?.verification;
  if (
    verification &&
    (verification.interface_id !== command.interface_id ||
      typeof verification.observed_admin_up !== 'boolean' ||
      verification.observed_admin_up !== snapshot.after_admin_up ||
      verification.expected_admin_up !== verification.observed_admin_up)
  )
    reasons.push('Проверка результата не соответствует интерфейсу и наблюдению снимка.');
  if (
    snapshot.expires_at !== null &&
    (!Number.isFinite(Date.parse(snapshot.expires_at)) ||
      Date.parse(snapshot.expires_at) <= Date.now())
  )
    reasons.push('Указанный срок снимка истёк или некорректен.');
  if (
    policy.protected_devices.includes(command.device_id) ||
    policy.protected_interfaces.includes(command.interface_id)
  )
    reasons.push('Ресурс входит в защищённый список backend.');
  return reasons;
}

export function reviewedCommandContext(
  command: Model<'CommandRecord'>,
  snapshot: Model<'CommandSnapshot'>,
) {
  // This is a local comparison, not an invented API revision or client identity resolver.
  return JSON.stringify({
    id: command.id,
    agent: command.agent_id,
    device: command.device_id,
    interface: command.interface_id,
    operation: command.operation,
    state: command.state,
    result: command.result,
    snapshot,
  });
}
