import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError, unwrap, type Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { Button } from '../../components/ui/button';
import {
  ConfirmDialog,
  DataTable,
  Drawer,
  Facts,
  Notice,
  PageHeader,
  Panel,
  QueryState,
  Tabs,
  Time,
} from '../../components/shared';
import { credentialState, validAgentUUID } from './pki-state';

type Revoke = { kind: 'token' | 'certificate'; id: string; agent: string };
export default function PKI() {
  const auth = useAuth();
  const [params, setParams] = useSearchParams();
  const initial = params.get('agent_id') || '';
  const [agentInput, setAgentInput] = useState(initial);
  const agent = validAgentUUID(initial) ? initial : '';
  const requestedTab = params.get('tab');
  const tab = requestedTab === 'tokens' || requestedTab === 'audit' ? requestedTab : 'certificates';
  const allowed =
    can(auth.session?.permissions, 'access.manage') && auth.session?.user.role === 'admin';
  const [adding, setAdding] = useState(false);
  const [revoke, setRevoke] = useState<Revoke | null>(null);
  const client = useQueryClient();
  const queryParams = { limit: 200, ...(agent ? { agent_id: agent } : {}) };
  const certificates = useQuery({
    refetchInterval: 30_000,
    queryKey: ['pki', 'certificates', agent],
    enabled: allowed && tab === 'certificates',
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/pki/certificates', { params: { query: queryParams }, signal })),
  });
  const tokens = useQuery({
    refetchInterval: 30_000,
    queryKey: ['pki', 'tokens', agent],
    enabled: allowed && tab === 'tokens',
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/pki/bootstrap-tokens', { params: { query: queryParams }, signal }),
      ),
  });
  const audit = useQuery({
    refetchInterval: 30_000,
    queryKey: ['pki', 'audit', agent],
    enabled: allowed && tab === 'audit',
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/pki/audit', { params: { query: queryParams }, signal })),
  });
  const refresh = () => void client.invalidateQueries({ queryKey: ['pki'] });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!revoke) throw new Error('Выберите запись');
      if (revoke.kind === 'token')
        unwrap(
          await api.POST('/api/pki/bootstrap-tokens/{id}/revoke', {
            params: { path: { id: revoke.id } },
            body: { confirmed: true },
          }),
        );
      else
        unwrap(
          await api.POST('/api/pki/certificates/{id}/revoke', {
            params: { path: { id: revoke.id } },
            body: { confirmed: true },
          }),
        );
    },
    onSuccess: () => {
      setRevoke(null);
      refresh();
    },
  });
  const choose = (value: Revoke) => {
    mutation.reset();
    setRevoke(value);
  };
  if (!allowed)
    return (
      <Notice>
        Управление PKI доступно только администратору с access.manage. Права проверяет backend.
      </Notice>
    );
  const current = tab === 'tokens' ? tokens : tab === 'audit' ? audit : certificates;
  const disabled = current.error instanceof ApiError && current.error.code === 'pki_disabled';
  return (
    <>
      <PageHeader
        eyebrow="Управление / Коллекторы"
        title="Сертификаты коллекторов"
        description="Регистрация, сроки действия и отзыв учётных данных mTLS. Состояние соединения смотрите в карточке коллектора."
        actions={
          <Button disabled={disabled} onClick={() => setAdding(true)}>
            Выдать токен подключения
          </Button>
        }
      />
      <Panel title="Отбор по Agent UUID">
        <Facts values={{ 'Применённый фильтр': agent || 'Все коллекторы' }} />
        <form
          className="filter-bar"
          onSubmit={(e) => {
            e.preventDefault();
            if (!agentInput || validAgentUUID(agentInput)) {
              const p = new URLSearchParams(params);
              if (agentInput) p.set('agent_id', agentInput);
              else p.delete('agent_id');
              setParams(p);
            }
          }}
        >
          <label>
            Agent UUID
            <input
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="Все коллекторы"
            />
          </label>
          <Button
            type="submit"
            variant="secondary"
            disabled={!!agentInput && !validAgentUUID(agentInput)}
          >
            Применить фильтр
          </Button>
          <Button type="button" variant="ghost" onClick={refresh}>
            Перечитать PKI
          </Button>
        </form>
        {agentInput && !validAgentUUID(agentInput) && (
          <Notice>Нужен ненулевой UUID в нижнем регистре. Фильтр ещё не применён.</Notice>
        )}
        <Notice>
          Выводится не более 200 записей. API не предоставляет пагинацию: если записей 200, сузьте
          отбор по Agent UUID. Срок по часам браузера не доказывает успешное подключение.
        </Notice>
      </Panel>
      <Tabs
        active={tab}
        onChange={(value) => {
          const p = new URLSearchParams(params);
          p.set('tab', value);
          setParams(p);
        }}
        items={[
          { value: 'certificates', label: 'Сертификаты' },
          { value: 'tokens', label: 'Токены подключения' },
          { value: 'audit', label: 'Аудит PKI' },
        ]}
      />
      {disabled ? (
        <Notice>
          PKI отключён на backend. Для управления сертификатами команда должна настроить PKI_ENABLED
          и удостоверяющий центр. Это не означает отсутствие зарегистрированных коллекторов.
        </Notice>
      ) : (
        <Panel
          title={
            tab === 'tokens'
              ? 'Одноразовые токены'
              : tab === 'audit'
                ? 'Действия с учётными данными'
                : 'Сертификаты mTLS'
          }
        >
          {tab === 'certificates' && (
            <QueryState query={certificates}>
              <DataTable
                data={certificates.data?.items || []}
                columns={[
                  { header: 'Agent UUID', accessorKey: 'agent_id' },
                  { header: 'Fingerprint', accessorKey: 'fingerprint' },
                  { header: 'Serial', accessorKey: 'serial' },
                  {
                    header: 'Действует с',
                    cell: ({ row }) => <Time value={row.original.not_before} />,
                  },
                  { header: 'До', cell: ({ row }) => <Time value={row.original.not_after} /> },
                  { header: 'Состояние', cell: ({ row }) => credentialState(row.original) },
                  { header: 'Предыдущий сертификат', accessorKey: 'renewed_from' },
                  {
                    header: 'Действие',
                    cell: ({ row }) => (
                      <Button
                        variant="ghost"
                        disabled={!!row.original.revoked_at}
                        onClick={() =>
                          choose({
                            kind: 'certificate',
                            id: row.original.fingerprint,
                            agent: row.original.agent_id,
                          })
                        }
                      >
                        Отозвать сертификат
                      </Button>
                    ),
                  },
                ]}
              />
            </QueryState>
          )}
          {tab === 'tokens' && (
            <QueryState query={tokens}>
              <DataTable
                data={tokens.data?.items || []}
                columns={[
                  { header: 'Token ID', accessorKey: 'id' },
                  { header: 'Agent UUID', accessorKey: 'agent_id' },
                  { header: 'Создан', cell: ({ row }) => <Time value={row.original.created_at} /> },
                  {
                    header: 'Истекает',
                    cell: ({ row }) => <Time value={row.original.expires_at} />,
                  },
                  { header: 'Состояние', cell: ({ row }) => credentialState(row.original) },
                  {
                    header: 'Действие',
                    cell: ({ row }) => (
                      <Button
                        variant="ghost"
                        disabled={!!row.original.revoked_at || !!row.original.used_at}
                        onClick={() =>
                          choose({
                            kind: 'token',
                            id: row.original.id,
                            agent: row.original.agent_id,
                          })
                        }
                      >
                        Отозвать токен
                      </Button>
                    ),
                  },
                ]}
              />
            </QueryState>
          )}
          {tab === 'audit' && (
            <QueryState query={audit}>
              <DataTable
                data={audit.data?.items || []}
                columns={[
                  { header: 'Время', cell: ({ row }) => <Time value={row.original.at} /> },
                  { header: 'Agent UUID', accessorKey: 'agent_id' },
                  { header: 'Действие', accessorKey: 'action' },
                  { header: 'Ресурс', accessorKey: 'resource' },
                  { header: 'Инициатор', accessorKey: 'actor_id' },
                ]}
              />
            </QueryState>
          )}
        </Panel>
      )}
      <ConfirmDialog
        open={!!revoke}
        onClose={() => {
          setRevoke(null);
          mutation.reset();
        }}
        title={
          revoke?.kind === 'certificate'
            ? 'Отозвать сертификат коллектора?'
            : 'Отозвать токен подключения?'
        }
        description={
          revoke?.kind === 'certificate'
            ? 'Backend закроет поток агента. Для повторного подключения нужен другой действующий сертификат. Операция не отменяется.'
            : 'Токен больше нельзя будет использовать для первичной регистрации. Существующий сертификат не отзывается.'
        }
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.isError}
        onConfirm={() => mutation.mutate()}
      >
        <Facts values={{ 'Agent UUID': revoke?.agent, Ресурс: revoke?.id }} />
        {mutation.isError && (
          <Notice>
            Автоматического повтора нет. Закройте подтверждение и перечитайте состояние перед новым
            решением.
          </Notice>
        )}
      </ConfirmDialog>
      {adding && (
        <Drawer open title="Выдать одноразовый токен" onClose={() => setAdding(false)}>
          <TokenIssuer initialAgent={agent} onCreated={refresh} />
        </Drawer>
      )}
    </>
  );
}

function TokenIssuer({ initialAgent, onCreated }: { initialAgent: string; onCreated: () => void }) {
  const [agent, setAgent] = useState(initialAgent);
  const [ttl, setTTL] = useState('900');
  const [review, setReview] = useState(false);
  const [issued, setIssued] = useState<Model<'PKIBootstrapToken'> | null>(null);
  const [show, setShow] = useState(false);
  const [copy, setCopy] = useState('');
  const valid =
    validAgentUUID(agent) && /^\d+$/.test(ttl) && Number(ttl) >= 60 && Number(ttl) <= 86400;
  const mutation = useMutation({
    mutationFn: async () => {
      // Do not return the secret to MutationCache. It lives only in this mounted form.
      const result = unwrap(
        await api.POST('/api/pki/bootstrap-tokens', {
          body: { agent_id: agent, ttl_seconds: Number(ttl) },
        }),
      );
      setIssued(result);
    },
    onSuccess: () => {
      setReview(false);
      onCreated();
    },
  });
  if (issued)
    return (
      <div className="stack-form">
        <Notice>
          Токен показывается только сейчас. Передайте его владельцу агента защищённым способом через
          настроенную token_env. После закрытия формы восстановить значение нельзя; в списке
          останутся только метаданные.
        </Notice>
        <Facts
          values={{
            'Token ID': issued.id,
            'Agent UUID': issued.agent_id,
            Истекает: issued.expires_at,
          }}
        />
        {issued.token ? (
          <>
            <label>
              Одноразовый секрет
              <input
                readOnly
                type={show ? 'text' : 'password'}
                autoComplete="off"
                value={issued.token}
              />
            </label>
            <Button variant="secondary" onClick={() => setShow(!show)}>
              {show ? 'Скрыть секрет' : 'Показать секрет'}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(issued.token!);
                  setCopy('Скопировано. Буфер обмена находится под вашим контролем.');
                } catch {
                  setCopy('Не удалось скопировать. Можно показать и выделить секрет вручную.');
                }
              }}
            >
              Скопировать секрет
            </Button>
            {copy && <p role="status">{copy}</p>}
          </>
        ) : (
          <Notice>
            Backend не вернул секрет. Не создавайте второй токен автоматически: проверьте метаданные
            и при необходимости отзовите эту запись.
          </Notice>
        )}
        <Button
          onClick={() => {
            setIssued(null);
            setShow(false);
            setCopy('');
          }}
        >
          Удалить секрет из формы
        </Button>
      </div>
    );
  return (
    <div className="stack-form">
      <Notice>
        Новая регистрация требует заранее согласованного Agent UUID. Токен одноразовый; выпуск не
        подключает агента и не заменяет его конфигурацию автоматически.
      </Notice>
      <label>
        UUID для регистрации
        <input
          value={agent}
          disabled={review || mutation.isSuccess}
          onChange={(e) => setAgent(e.target.value)}
        />
      </label>
      <label>
        Срок токена, секунд
        <input
          type="number"
          min={60}
          max={86400}
          step={1}
          value={ttl}
          disabled={review || mutation.isSuccess}
          onChange={(e) => setTTL(e.target.value)}
        />
      </label>
      <small>От 60 до 86 400 секунд. По умолчанию — 15 минут.</small>
      {mutation.isSuccess ? (
        <Notice>
          Секрет удалён из формы. Чтобы выдать новый токен, закройте и заново откройте форму.
        </Notice>
      ) : (
        <Button disabled={!valid || mutation.isError} onClick={() => setReview(true)}>
          Проверить выпуск токена
        </Button>
      )}
      <ConfirmDialog
        open={review}
        onClose={() => setReview(false)}
        title="Выдать токен этому агенту?"
        description="Создаётся новая одноразовая учётная запись регистрации. Запрос не повторяется автоматически."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={!valid || mutation.isError}
        onConfirm={() => mutation.mutate()}
      >
        <Facts values={{ 'Agent UUID': agent, 'Срок, секунд': Number(ttl) }} />
        {mutation.isError && (
          <Notice>
            Результат выпуска может быть неизвестен при потере связи. Закройте форму, перечитайте
            список токенов и проверьте запись перед новым выпуском.
          </Notice>
        )}
      </ConfirmDialog>
    </div>
  );
}
