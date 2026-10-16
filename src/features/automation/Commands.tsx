import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, ApiError, unwrap, type Model } from '../../api/client';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { idempotencySlot } from '../../lib/idempotency';
import { Button } from '../../components/ui/button';
import {
  Badge,
  ConfirmDialog,
  DataTable,
  Facts,
  Notice,
  PageHeader,
  Pagination,
  Panel,
  QueryState,
  Tabs,
  Time,
} from '../../components/shared';
import {
  adminState,
  commandActive,
  commandStates,
  reviewedCommandContext,
  rollbackBlocks,
  validCommandID,
} from './command-state';

const policyQuery = {
  queryKey: ['command-policy'],
  queryFn: async ({ signal }: { signal: AbortSignal }) =>
    unwrap(await api.GET('/api/commands/policy', { signal })),
};

export default function Commands() {
  const { params, update, offset } = useFilters();
  const [, setParams] = useSearchParams();
  const agent = params.get('agent_id') || '',
    device = params.get('device_id') || '';
  const rawState = params.get('state') || '';
  const state = commandStates.find((v) => v === rawState);
  const snapshots = params.get('tab') === 'snapshots';
  const [draft, setDraft] = useState({ agent, device });
  const policy = useQuery(policyQuery);
  const list = useQuery({
    queryKey: ['commands', agent, device, state, offset],
    enabled: !snapshots,
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/commands', {
          params: {
            query: {
              agent_id: agent || undefined,
              device_id: device || undefined,
              state,
              limit: 50,
              offset,
            },
          },
          signal,
        }),
      ),
    refetchInterval: 5_000,
  });
  const refs = useQuery({
    queryKey: ['command-snapshots', agent, device, offset],
    enabled: snapshots,
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/snapshots', {
          params: {
            query: {
              agent_id: agent || undefined,
              device_id: device || undefined,
              limit: 50,
              offset,
            },
          },
          signal,
        }),
      ),
    refetchInterval: 10_000,
  });
  return (
    <>
      <PageHeader
        eyebrow="Эксплуатация / Agent"
        title="Команды и откат"
        description="Журнал типизированных команд агента. Снимки Agent и конфигурационные снимки Ansible — отдельные сущности."
      />
      <Panel title="Политика команд">
        <QueryState query={policy}>
          <Facts
            values={{
              'Команды включены': policy.data?.enabled,
              'Откат разрешён': policy.data?.allow_rollback,
              'Отключение разрешено': policy.data?.allow_disable,
            }}
          />
        </QueryState>
      </Panel>
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          const next = new URLSearchParams(params);
          for (const [key, value] of [
            ['agent_id', draft.agent.trim()],
            ['device_id', draft.device.trim()],
          ]) {
            if (value) next.set(key!, value);
            else next.delete(key!);
          }
          next.delete('offset');
          setParams(next);
        }}
      >
        <label>
          Agent ID
          <input
            maxLength={256}
            value={draft.agent}
            onChange={(e) => setDraft({ ...draft, agent: e.target.value })}
          />
        </label>
        <label>
          Device ID
          <input
            maxLength={128}
            value={draft.device}
            onChange={(e) => setDraft({ ...draft, device: e.target.value })}
          />
        </label>
        <Button type="submit" variant="secondary">
          Применить отбор команд
        </Button>
        {!snapshots && (
          <label>
            Состояние команды
            <select value={state || ''} onChange={(e) => update('state', e.target.value)}>
              <option value="">Все состояния</option>
              {commandStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
      </form>
      <Facts
        values={{
          'Применённый Agent ID': agent || 'Все',
          'Применённый Device ID': device || 'Все',
        }}
      />
      <Tabs
        active={snapshots ? 'snapshots' : 'commands'}
        onChange={(v) => {
          const next = new URLSearchParams(params);
          next.delete('offset');
          next.set('tab', v);
          setParams(next);
        }}
        items={[
          { value: 'commands', label: 'Журнал команд' },
          { value: 'snapshots', label: 'Ссылки на снимки Agent' },
        ]}
      />
      {snapshots ? (
        <Panel title="Метаданные снимков">
          <Notice>
            Содержимое снимка и срок хранения остаются у агента. expires_at=null означает
            неизвестный срок, а не бессрочное хранение.
          </Notice>
          <QueryState query={refs}>
            <DataTable
              data={refs.data?.items || []}
              columns={[
                {
                  header: 'Исходная команда',
                  cell: ({ row }) => <CommandLink id={row.original.origin_command_id} />,
                },
                { header: 'Agent', accessorKey: 'agent_id' },
                { header: 'Устройство', accessorKey: 'device_id' },
                { header: 'Интерфейс', accessorKey: 'interface_id' },
                { header: 'Snapshot ID', accessorKey: 'snapshot_id' },
                { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.status} /> },
                {
                  header: 'Зафиксирован',
                  cell: ({ row }) => <Time value={row.original.recorded_at} />,
                },
                {
                  header: 'Срок хранения',
                  cell: ({ row }) =>
                    row.original.expires_at ? (
                      <Time value={row.original.expires_at} />
                    ) : (
                      'Не передан агентом'
                    ),
                },
              ]}
            />
            <Pagination
              offset={offset}
              count={refs.data?.items.length || 0}
              onChange={(n) => update('offset', n)}
            />
          </QueryState>
        </Panel>
      ) : (
        <Panel title="Сохранённые команды">
          <QueryState query={list}>
            <DataTable
              data={list.data?.items || []}
              columns={[
                { header: 'Команда', cell: ({ row }) => <CommandLink id={row.original.id} /> },
                { header: 'Agent', accessorKey: 'agent_id' },
                { header: 'Устройство', accessorKey: 'device_id' },
                { header: 'Интерфейс', accessorKey: 'interface_id' },
                { header: 'Операция', accessorKey: 'operation' },
                { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
                { header: 'Создана', cell: ({ row }) => <Time value={row.original.created_at} /> },
                {
                  header: 'Откат команды',
                  cell: ({ row }) =>
                    row.original.rollback_of_command_id ? (
                      <CommandLink id={row.original.rollback_of_command_id} />
                    ) : (
                      '—'
                    ),
                },
              ]}
            />
            <Pagination
              offset={offset}
              count={list.data?.items.length || 0}
              onChange={(n) => update('offset', n)}
            />
          </QueryState>
        </Panel>
      )}
    </>
  );
}

function CommandLink({ id }: { id: string }) {
  return validCommandID(id) ? (
    <Link className="entity-link" to={`/automation/commands/${encodeURIComponent(id)}`}>
      {id}
    </Link>
  ) : (
    <span>{id}</span>
  );
}
export function CommandDetail() {
  const id = useParams().commandId || '';
  return validCommandID(id) ? (
    <CommandRecord key={id} id={id} />
  ) : (
    <Notice>
      Неверный ID команды. Ожидается cmd_ и 32 шестнадцатеричных символа. Запрос не отправлен.
    </Notice>
  );
}
function CommandRecord({ id }: { id: string }) {
  const auth = useAuth();
  const client = useQueryClient();
  const policy = useQuery(policyQuery);
  const command = useQuery({
    queryKey: ['command', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/commands/{id}', { params: { path: { id } }, signal })),
    refetchInterval: (q) => (commandActive(q.state.data?.state || '') ? 3_000 : false),
  });
  const events = useQuery({
    queryKey: ['command-events', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/commands/{id}/events', { params: { path: { id } }, signal })),
    refetchInterval: commandActive(command.data?.state || '') ? 3_000 : false,
  });
  const snapshot = useQuery({
    queryKey: ['command-snapshot', id],
    enabled: !!command.data?.result?.snapshot_id && command.data?.operation !== 'rollback',
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/commands/{id}/snapshot', { params: { path: { id } }, signal })),
    refetchInterval: 10_000,
  });
  const refresh = () => {
    void command.refetch();
    void events.refetch();
    void policy.refetch();
    if (command.data?.result?.snapshot_id && command.data.operation !== 'rollback')
      void snapshot.refetch();
  };
  const [expected, setExpected] = useState('');
  const [timeout, setTimeout] = useState('30');
  type Review = {
    command: Model<'CommandRecord'>;
    snapshot: Model<'CommandSnapshot'>;
    body: Model<'RollbackRequest'>;
  };
  const [review, setReview] = useState<Review | null>(null);
  const [getKey] = useState(idempotencySlot);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Нет просмотренного отката');
      const [freshCommand, freshSnapshot, freshPolicy] = await Promise.all([
        api.GET('/api/commands/{id}', { params: { path: { id } } }).then(unwrap),
        api.GET('/api/commands/{id}/snapshot', { params: { path: { id } } }).then(unwrap),
        api.GET('/api/commands/policy').then(unwrap),
      ]);
      if (
        reviewedCommandContext(freshCommand, freshSnapshot) !==
          reviewedCommandContext(review.command, review.snapshot) ||
        rollbackBlocks(freshCommand, freshSnapshot, freshPolicy).length
      )
        throw new ApiError(
          409,
          'review_changed',
          'Контекст отката изменился. Перечитайте команду и снимок; запрос исполнения не отправлен.',
        );
      return unwrap(
        await api.POST('/api/commands/{id}/rollback', {
          params: {
            path: { id },
            header: {
              'Idempotency-Key': getKey({
                id,
                snapshot: review.snapshot.snapshot_id,
                body: review.body,
              }),
            },
          },
          body: review.body,
        }),
      );
    },
    onSuccess: (result) => {
      setReview(null);
      client.setQueryData(['command', result.id], result);
      void client.invalidateQueries({ queryKey: ['commands'] });
      void client.invalidateQueries({ queryKey: ['command-snapshots'] });
      refresh();
    },
  });
  const blocks =
    command.data && snapshot.data && policy.data
      ? rollbackBlocks(command.data, snapshot.data, policy.data)
      : ['Для решения нужны успешно загруженные команда, её снимок и политика backend.'];
  const validExpected =
    (expected === 'true' || expected === 'false') &&
    (expected === 'true') === snapshot.data?.after_admin_up;
  const validTimeout = /^\d+$/.test(timeout) && Number(timeout) >= 1 && Number(timeout) <= 60;
  const result = command.data?.result;
  return (
    <>
      <PageHeader
        eyebrow="Команды Agent / Результат"
        title="Карточка команды"
        description={id}
        actions={
          <Button variant="secondary" onClick={refresh}>
            Перечитать команду и снимок
          </Button>
        }
      />
      <Panel title="Контекст команды" actions={<Badge value={command.data?.state} />}>
        <QueryState query={command}>
          <Facts
            values={{
              'Agent ID': command.data?.agent_id,
              'Device ID': command.data?.device_id,
              Интерфейс: command.data?.interface_id,
              Операция: command.data?.operation,
              'Ожидалось перед запуском': adminState(command.data?.expected_admin_up),
              'Состояние backend': command.data?.state,
              Причина: command.data?.reason,
              'Session ID': command.data?.session_id,
              Автор: command.data?.actor_id,
              'Срок исполнения': command.data?.deadline_at,
            }}
          />
          {command.data?.rollback_of_command_id && (
            <p>
              Откат исходной команды: <CommandLink id={command.data.rollback_of_command_id} />
            </p>
          )}
          {command.data?.rollback_snapshot_id && (
            <Facts values={{ 'Ссылка на снимок отката': command.data.rollback_snapshot_id }} />
          )}
          {result ? (
            <>
              <Facts
                values={{
                  'Статус результата Agent': result.status,
                  'Изменение заявлено': result.changed,
                  Неопределённость: result.uncertain,
                  'Код ошибки': result.error_code,
                  Сообщение: result.error_message,
                  'Snapshot ID': result.snapshot_id,
                }}
              />
              {result.verification && (
                <Facts
                  values={{
                    'Проверка интерфейса': result.verification.interface_id,
                    'Ожидалось после исполнения': adminState(result.verification.expected_admin_up),
                    'Наблюдалось после исполнения': adminState(
                      result.verification.observed_admin_up,
                    ),
                    'Проверено Agent': result.verification.verified,
                    'Неопределённость проверки': result.verification.uncertain,
                    'Время проверки': result.verification.observed_at,
                    'Основание проверки': result.verification.evidence,
                  }}
                />
              )}
            </>
          ) : (
            <Notice>
              Результат агента ещё не получен. Принятие запроса не означает выполненное изменение.
            </Notice>
          )}
          {command.data?.state === 'uncertain' || result?.uncertain ? (
            <Notice>
              Исход неизвестен. Не повторяйте действие автоматически: перечитайте команду и
              фактическое состояние оборудования. Автоматический откат недоступен.
            </Notice>
          ) : null}
        </QueryState>
      </Panel>
      <Panel
        title="История состояний"
        subtitle="Сервер отдаёт не более 1000 событий, начиная с первого"
      >
        <QueryState query={events}>
          <DataTable
            data={events.data?.items || []}
            columns={[
              { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
              { header: 'Причина', accessorKey: 'reason' },
              { header: 'Время', cell: ({ row }) => <Time value={row.original.at} /> },
            ]}
          />
        </QueryState>
      </Panel>
      {command.data?.operation !== 'rollback' && command.data?.result?.snapshot_id && (
        <Panel title="Ссылка на снимок агента">
          <QueryState query={snapshot}>
            <Facts
              values={{
                'Snapshot ID': snapshot.data?.snapshot_id,
                Статус: snapshot.data?.status,
                Причина: snapshot.data?.reason,
                'Начальное наблюдение backend': adminState(
                  snapshot.data?.initial_observed_admin_up,
                ),
                'Наблюдение после команды': adminState(snapshot.data?.after_admin_up),
                Зафиксировано: snapshot.data?.recorded_at,
                Истекает: snapshot.data?.expires_at || 'Срок не передан агентом',
              }}
            />
            <Notice>
              Начальное наблюдение backend — справочная информация, а не содержимое снимка. Какое
              состояние восстановит снимок, определяет Agent. Неизвестный срок хранения не
              гарантирует, что снимок ещё доступен.
            </Notice>
            {snapshot.data?.rollback_command_id && (
              <p>
                Связанный откат: <CommandLink id={snapshot.data.rollback_command_id} />
              </p>
            )}
          </QueryState>
        </Panel>
      )}
      {can(auth.session?.permissions, 'commands.write') &&
        command.data?.operation !== 'rollback' && (
          <Panel title="Контролируемый откат Agent">
            {blocks.map((reason) => (
              <Notice key={reason}>{reason}</Notice>
            ))}
            <Notice>
              Backend заново проверит свежесть телеметрии, подключение агента, capability,
              защищённые интерфейсы и политику. Этот экран не восстанавливает конфигурационный
              снимок Ansible и не меняет baseline.
            </Notice>
            <label>
              Ожидаемое состояние перед откатом
              <select
                value={expected}
                disabled={!!review}
                onChange={(e) => setExpected(e.target.value)}
              >
                <option value="">Выберите явно…</option>
                <option value="true">Административно разрешён</option>
                <option value="false">Административно выключен</option>
              </select>
            </label>
            {expected && !validExpected && (
              <Notice>
                Выбранное состояние отличается от зафиксированного после исходной команды. Проверьте
                оборудование; подменять условие автоматически нельзя.
              </Notice>
            )}
            <label>
              Таймаут отката, секунд
              <input
                type="number"
                min={1}
                max={60}
                step={1}
                value={timeout}
                disabled={!!review}
                onChange={(e) => setTimeout(e.target.value)}
              />
            </label>
            <Button
              disabled={
                !!blocks.length ||
                !validExpected ||
                !validTimeout ||
                mutation.isPending ||
                mutation.isSuccess ||
                command.isError ||
                snapshot.isError ||
                policy.isError
              }
              onClick={() => {
                if (command.data && snapshot.data) {
                  mutation.reset();
                  setReview({
                    command: structuredClone(command.data),
                    snapshot: structuredClone(snapshot.data),
                    body: {
                      expected_admin_up: expected === 'true',
                      timeout_seconds: Number(timeout),
                      confirmed: true,
                    },
                  });
                }
              }}
            >
              Проверить откат
            </Button>
            {mutation.data && (
              <Notice>
                Backend принял запрос. Итог нужно проверить в карточке новой команды:{' '}
                <CommandLink id={mutation.data.id} />
              </Notice>
            )}
          </Panel>
        )}
      <ConfirmDialog
        open={!!review}
        onClose={() => setReview(null)}
        title="Отправить откат агенту?"
        description="Будет создана отдельная команда для этого ресурса. Перед отправкой перечитываются исходная команда, ссылка на снимок и политика. Автоматического повтора нет."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.isError}
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            'Исходная команда': review?.command.id,
            'Agent ID': review?.command.agent_id,
            'Device ID': review?.command.device_id,
            Интерфейс: review?.command.interface_id,
            'Snapshot ID': review?.snapshot.snapshot_id,
            'Ожидается перед откатом': adminState(review?.body.expected_admin_up),
            'Таймаут, секунд': review?.body.timeout_seconds,
            'Срок хранения': 'Не гарантирован; проверяет Agent',
          }}
        />
        {mutation.isError && (
          <Notice>
            Старое подтверждение заблокировано. После потери связи запрос мог сохраниться: закройте
            диалог и перечитайте ссылку на снимок и журнал, прежде чем принимать новое решение.
          </Notice>
        )}
      </ConfirmDialog>
    </>
  );
}
