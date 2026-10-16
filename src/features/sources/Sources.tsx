import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Database, Plus, RefreshCw, FlaskConical } from 'lucide-react';
import { sourcesQuery } from '../../api/queries';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { useFilters } from '../../hooks/useFilters';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Time,
  Pagination,
  Facts,
  CopyId,
  JsonView,
  Notice,
  Drawer,
  ErrorState,
  ConfirmDialog,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import SourceSettings from './SourceSettings';

export default function Sources() {
  const { offset, update } = useFilters();
  const query = useQuery(sourcesQuery(offset));
  const auth = useAuth();
  const [adding, setAdding] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Интеграции"
        title="Источники данных"
        description="Существующие системы мониторинга — часть единой инфраструктуры."
        actions={
          can(auth.session?.permissions, 'access.manage') && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} />
              Добавить источник
            </Button>
          )
        }
      />
      <div className="integration-strip">
        <Database size={20} />
        <div>
          <strong>Подключайте системы, которые уже работают</strong>
          <p>Zabbix · Prometheus · Collector · Ansible</p>
        </div>
        <span className="source-badge">REST + gRPC через backend</span>
      </div>
      <Panel
        title="Подключения"
        subtitle="Статус источника не определяет здоровье всех его устройств"
      >
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              {
                header: 'Источник',
                cell: ({ row }) => (
                  <Link className="name-cell" to={`/sources/${row.original.id}`}>
                    <span className={`source-logo ${row.original.type.toLowerCase()}`}>
                      {row.original.type[0]}
                    </span>
                    <span>
                      <strong>{row.original.name}</strong>
                      <small>
                        {row.original.endpoint ||
                          row.original.connection_ref ||
                          'Endpoint не указан'}
                      </small>
                    </span>
                  </Link>
                ),
              },
              { header: 'Тип', accessorKey: 'type' },
              {
                header: 'Подключение',
                cell: ({ row }) => <Badge value={row.original.connection_status} />,
              },
              {
                header: 'Интервал синхронизации',
                cell: ({ row }) => `${row.original.sync_interval_seconds} сек.`,
              },
              {
                header: 'Последний успех',
                cell: ({ row }) => <Time value={row.original.last_successful_sync} />,
              },
              {
                header: 'Диагностика',
                cell: ({ row }) => <span className="muted">{row.original.last_error || '—'}</span>,
              },
            ]}
          />
          <Pagination
            offset={offset}
            count={query.data?.items?.length || 0}
            onChange={(n) => update('offset', n)}
          />
        </QueryState>
      </Panel>
      <Drawer title="Новый источник данных" open={adding} onClose={() => setAdding(false)}>
        {adding && (
          <SourceForm
            onDone={() => {
              setAdding(false);
              void query.refetch();
            }}
          />
        )}
      </Drawer>
    </>
  );
}
export function SourceDetail() {
  const id = useParams().sourceId || '';
  const auth = useAuth();
  const client = useQueryClient();
  const source = useQuery({
    queryKey: ['source', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/data-sources/{id}', { params: { path: { id } }, signal })),
    refetchInterval: 15_000,
  });
  const jobs = useQuery({
    queryKey: ['source-jobs', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/data-sources/{id}/jobs', {
          params: { path: { id }, query: { limit: 20 } },
          signal,
        }),
      ),
    refetchInterval: 5_000,
  });
  const [keys, setKeys] = useState({ test: crypto.randomUUID(), sync: crypto.randomUUID() });
  const action = useMutation({
    mutationFn: async (kind: 'test' | 'sync') =>
      unwrap(
        await api.POST(
          kind === 'test' ? '/api/data-sources/{id}/test' : '/api/data-sources/{id}/sync',
          { params: { path: { id }, header: { 'Idempotency-Key': keys[kind] } } },
        ),
      ),
    onSuccess: (_, operation) => {
      setKeys((previous) => ({ ...previous, [operation]: crypto.randomUUID() }));
      void client.invalidateQueries({ queryKey: ['source-jobs', id] });
    },
  });
  const [editing, setEditing] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Источники данных / Подключение"
        title={source.data?.name || 'Источник данных'}
        description={id}
        actions={
          can(auth.session?.permissions, 'access.manage') && (
            <>
              <Button
                variant="secondary"
                disabled={
                  action.isPending ||
                  !source.data?.enabled ||
                  !source.data?.capabilities.includes('test')
                }
                onClick={() => action.mutate('test')}
              >
                <FlaskConical size={16} />
                Проверить связь
              </Button>
              <Button
                disabled={
                  action.isPending ||
                  !source.data?.enabled ||
                  !source.data?.capabilities.includes('sync')
                }
                onClick={() => action.mutate('sync')}
              >
                <RefreshCw size={16} />
                Синхронизировать
              </Button>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Настроить
              </Button>
            </>
          )
        }
      />
      {action.error && <ErrorState error={action.error} />}{' '}
      {action.data && (
        <Notice>
          Задача {action.data.id} принята. Смотрите её фактический статус ниже; это ещё не результат
          проверки.
        </Notice>
      )}
      <QueryState query={source}>
        <Panel title="Подключение и политика">
          <Facts
            values={{
              Тип: source.data?.type,
              Адрес: source.data?.endpoint,
              Состояние: source.data?.connection_status,
              Включён: source.data?.enabled,
              Ревизия: source.data?.revision,
              'Есть credentials': source.data?.has_credential,
              'Интервал, сек.': source.data?.sync_interval_seconds,
              'Последняя ошибка': source.data?.last_error,
            }}
          />
          <JsonView value={source.data?.configuration} title="Разрешённые параметры подключения" />
        </Panel>
      </QueryState>
      <Panel
        title="Синхронизация и проверки"
        subtitle="В очереди → выполняется → завершена / ошибка"
      >
        <QueryState query={jobs}>
          <DataTable
            data={jobs.data?.items || []}
            columns={[
              { header: 'Задание', cell: ({ row }) => <CopyId value={row.original.id} /> },
              { header: 'Операция', accessorKey: 'operation' },
              { header: 'Статус', cell: ({ row }) => <Badge value={row.original.state} /> },
              { header: 'Код результата', accessorKey: 'code' },
              { header: 'Создано', cell: ({ row }) => <Time value={row.original.created_at} /> },
            ]}
          />
        </QueryState>
      </Panel>
      <Drawer title="Настройки источника" open={editing} onClose={() => setEditing(false)}>
        {editing && source.data && (
          <SourceForm
            source={source.data}
            onDone={() => {
              setEditing(false);
              void client.invalidateQueries({ queryKey: ['source', id] });
              void client.invalidateQueries({ queryKey: ['sources'] });
            }}
          />
        )}
      </Drawer>
    </>
  );
}
function SourceForm({ source, onDone }: { source?: Model<'DataSource'>; onDone: () => void }) {
  const [type, setType] = useState<Model<'DataSourceInput'>['type']>(source?.type || 'ZABBIX');
  const [name, setName] = useState(source?.name || '');
  const [endpoint, setEndpoint] = useState(source?.endpoint || '');
  const [ref, setRef] = useState(source?.connection_ref || '');
  const [interval, setInterval] = useState(source?.sync_interval_seconds || 30);
  const [credential, setCredential] = useState('');
  const [credentialAction, setCredentialAction] = useState<'keep' | 'replace' | 'clear'>(
    source ? 'keep' : 'replace',
  );
  const [configuration, setConfiguration] = useState<
    NonNullable<Model<'DataSourceInput'>['configuration']>
  >(structuredClone(source?.configuration || { timeout_seconds: 15 }));
  const [review, setReview] = useState<Model<'DataSourceInput'> | null>(null);
  const [baseRevision] = useState(source?.revision);
  const [enabled, setEnabled] = useState(source?.enabled ?? true);
  const [hosts, setHosts] = useState(source?.configuration.zabbix?.host_ids?.join(', ') || '');
  const buildBody = () => {
    const body: Model<'DataSourceInput'> = {
      type,
      name,
      endpoint: type === 'COLLECTOR' ? '' : endpoint,
      connection_ref: type === 'COLLECTOR' ? ref : '',
      enabled,
      sync_interval_seconds: interval,
      configuration: type === 'COLLECTOR' ? { timeout_seconds: 15 } : configuration,
      ...(credentialAction === 'clear'
        ? { credential: '' }
        : credentialAction === 'replace' && credential
          ? { credential }
          : {}),
    };
    if (type === 'ZABBIX')
      body.configuration = {
        timeout_seconds: 15,
        ...body.configuration,
        zabbix: {
          page_size: 20,
          device_type: 'unknown',
          verified_inventory: false,
          ...body.configuration?.zabbix,
          host_ids: hosts
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      };
    return body;
  };
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте настройки источника');
      const result = source
        ? await api.PUT('/api/data-sources/{id}', {
            params: { path: { id: source.id } },
            body: review,
          })
        : await api.POST('/api/data-sources', { body: review });
      return unwrap(result);
    },
    onSuccess: () => {
      setCredential('');
      onDone();
    },
  });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        const body = buildBody();
        setReview({ ...body, ...(source ? { revision: baseRevision } : {}) });
      }}
    >
      <Notice>
        HTTPS endpoint должен быть разрешён политикой backend. Секрет передаётся только backend и не
        возвращается в интерфейс.
      </Notice>
      <label>
        Тип
        <select
          value={type}
          disabled={!!source}
          onChange={(e) => {
            setType(e.target.value as typeof type);
            setConfiguration({ timeout_seconds: 15 });
          }}
        >
          {['ZABBIX', 'PROMETHEUS', 'COLLECTOR', 'ANSIBLE'].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        Название
        <input required maxLength={128} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      {type === 'COLLECTOR' ? (
        <label>
          Agent ID
          <input required value={ref} onChange={(e) => setRef(e.target.value)} />
        </label>
      ) : (
        <>
          <label>
            Действие с credential
            <select
              value={credentialAction}
              onChange={(e) => {
                setCredentialAction(e.target.value as typeof credentialAction);
                setCredential('');
              }}
            >
              {source && <option value="keep">Сохранить прежний</option>}
              <option value="replace">Передать новый</option>
              <option value="clear">Удалить credential</option>
            </select>
          </label>
          <label>
            HTTPS endpoint
            <input
              required
              type="url"
              pattern="https://.*"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://monitoring.example.org/api_jsonrpc.php"
            />
          </label>
          {credentialAction === 'replace' && (
            <label>
              {source
                ? 'Новый credential (пусто — сохранить прежний)'
                : 'Credential, если требуется'}
              <input
                type="password"
                required={!!source?.has_credential || (!!source && endpoint !== source.endpoint)}
                autoComplete="new-password"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
              />
            </label>
          )}
        </>
      )}
      {type === 'ZABBIX' && (
        <label>
          Разрешённые host_id через запятую
          <input
            value={hosts}
            onChange={(e) => setHosts(e.target.value)}
            placeholder="10101, 10102"
          />
        </label>
      )}
      <SourceSettings type={type} value={configuration} onChange={setConfiguration} />
      {source &&
        endpoint !== source.endpoint &&
        type !== 'COLLECTOR' &&
        credentialAction === 'keep' && (
          <Notice>
            При смене endpoint backend требует заменить или явно удалить credential. Выберите
            действие выше.
          </Notice>
        )}
      <label>
        Интервал синхронизации, секунды
        <input
          type="number"
          min={3}
          max={86400}
          required
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Источник включён
      </label>
      {mutation.error && <ErrorState error={mutation.error} />}
      <Button
        type="submit"
        disabled={
          mutation.isPending ||
          (source !== undefined &&
            endpoint !== source.endpoint &&
            type !== 'COLLECTOR' &&
            credentialAction === 'keep')
        }
      >
        Проверить настройки источника
      </Button>
      <p className="muted">
        Сохранение записи не подтверждает успешное подключение. После сохранения запустите отдельную
        проверку связи и синхронизацию.
      </p>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Сохранить настройки источника?"
        description="Проверьте адрес, соответствия метрик и действие с credential. Изменение регистрационной записи Collector не отключает поток агента."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={
          mutation.error instanceof ApiError &&
          (mutation.error.status === 409 || mutation.error.status === 0)
        }
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            Название: review?.name,
            Тип: review?.type,
            Адрес: review?.endpoint || review?.connection_ref,
            Интервал: review?.sync_interval_seconds,
            Ревизия: review?.revision ?? 'Создание',
            Credential:
              review?.credential === ''
                ? 'Удалить'
                : review?.credential
                  ? 'Заменить (скрыт)'
                  : 'Сохранить прежний',
          }}
        />
        <JsonView value={review?.configuration} title="Проверяемые параметры и mappings" />
      </ConfirmDialog>
    </form>
  );
}
