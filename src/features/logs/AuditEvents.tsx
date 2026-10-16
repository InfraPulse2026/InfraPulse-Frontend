import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api, unwrap, type Model } from '../../api/client';
import {
  Badge,
  DataTable,
  Drawer,
  Facts,
  JsonView,
  Notice,
  Panel,
  QueryState,
  Time,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import type { LogQuery } from './log-filters';
const outcome = (value: string) =>
  ({ success: 'Успех', failure: 'Ошибка', mixed: 'Смешанный', unknown: 'Неизвестно' })[value] ||
  value;
export default function AuditEvents({ filters }: { filters: LogQuery }) {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Model<'AuditEvent'> | null>(null);
  const query = useQuery({
    queryKey: ['audit-events', filters],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/audit/events', { params: { query: filters }, signal })),
  });
  return (
    <>
      <Panel title="Группированные события auditd">
        <Notice>
          Результат и количество относятся к выбранным записям. Полнота audit-события неизвестна:
          транспорт не гарантирует сбор всех строк. Это Linux Audit, а не журнал исполнения команд.
        </Notice>
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              {
                header: 'Событие',
                cell: ({ row }) => (
                  <button className="text-link" onClick={() => setSelected(row.original)}>
                    {row.original.event_id || row.original.key}
                  </button>
                ),
              },
              {
                header: 'Agent / Device',
                cell: ({ row }) => (
                  <span>
                    {row.original.agent_id}
                    <small className="cell-sub">{row.original.device_id}</small>
                  </span>
                ),
              },
              { header: 'Host claim', accessorKey: 'host' },
              { header: 'Источник', accessorKey: 'source' },
              { header: 'Записей', accessorKey: 'record_count' },
              { header: 'Типы', cell: ({ row }) => row.original.record_types?.join(', ') },
              {
                header: 'Исход',
                cell: ({ row }) => (
                  <Badge
                    value={
                      row.original.outcome === 'success'
                        ? 'ok'
                        : row.original.outcome === 'failure'
                          ? 'failed'
                          : 'unknown'
                    }
                    label={outcome(row.original.outcome)}
                  />
                ),
              },
              {
                header: 'Последнее событие',
                cell: ({ row }) => <Time value={row.original.last_event_at} />,
              },
            ]}
          />
          <div className="pagination">
            <span>До 50 групп; новые строки могут обновлять существующую группу.</span>
            <Button
              variant="ghost"
              disabled={!filters.before_id}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete('before_id');
                setParams(next);
              }}
            >
              К новым группам
            </Button>
            <Button
              variant="secondary"
              disabled={
                !query.data?.next_before_id ||
                !Number.isSafeInteger(query.data.next_before_id) ||
                query.data.next_before_id < 1
              }
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('before_id', String(query.data!.next_before_id));
                setParams(next);
              }}
            >
              Более ранние группы →
            </Button>
          </div>
        </QueryState>
      </Panel>
      {selected && (
        <Drawer open title="Событие Linux Audit" onClose={() => setSelected(null)}>
          <AuditRecords key={selected.key} event={selected} filters={filters} />
        </Drawer>
      )}
    </>
  );
}
function AuditRecords({ event, filters }: { event: Model<'AuditEvent'>; filters: LogQuery }) {
  const [before, setBefore] = useState<number | undefined>();
  const valid = /^audit:[a-f0-9]{64}$/.test(event.key);
  const query = useQuery({
    queryKey: ['audit-group-records', event.key, filters, before],
    enabled: valid,
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/audit/events/{key}', {
          params: { path: { key: event.key }, query: { ...filters, before_id: before, limit: 50 } },
          signal,
        }),
      ),
  });
  if (!valid)
    return (
      <Notice>Backend не вернул корректный ключ audit-группы. Запрос деталей не отправлен.</Notice>
    );
  return (
    <>
      <Facts
        values={{
          'Ключ группы': event.key,
          'Event ID': event.event_id,
          'Agent ID': event.agent_id,
          'Device ID': event.device_id,
          'Host claim': event.host,
          Источник: event.source,
          'Source ID': event.source_id,
          'File identity': event.file_identity,
          'Выбранных записей': event.record_count,
          Исход: outcome(event.outcome),
          Полнота: 'Неизвестна',
          'Первое событие': event.first_event_at,
          'Последнее событие': event.last_event_at,
          'Получено впервые': event.first_received_at,
          'Получено последнее': event.last_received_at,
        }}
      />
      <Notice>
        Детали сохраняют применённые фильтры. Здесь выбранные строки одной группы, а не
        доказательство полного системного события.
      </Notice>
      <QueryState query={query}>
        <DataTable
          data={query.data?.items || []}
          columns={[
            {
              header: 'Тип / время',
              cell: ({ row }) => (
                <span>
                  {row.original.audit?.record_type}
                  <small className="cell-sub">
                    <Time value={row.original.event_at} />
                  </small>
                </span>
              ),
            },
            {
              header: 'UID / AUID / PID',
              cell: ({ row }) =>
                [row.original.audit?.uid, row.original.audit?.auid, row.original.audit?.pid]
                  .map((v) => v ?? '—')
                  .join(' / '),
            },
            { header: 'Executable', cell: ({ row }) => row.original.audit?.executable },
            {
              header: 'Результат',
              cell: ({ row }) =>
                row.original.audit?.success === true
                  ? 'Успех'
                  : row.original.audit?.success === false
                    ? 'Ошибка'
                    : 'Неизвестно',
            },
            {
              header: 'Запись',
              cell: ({ row }) => (
                <>
                  <p>{row.original.message}</p>
                  <JsonView value={row.original.audit} title="Поля audit-записи" />
                </>
              ),
            },
          ]}
        />
        <div className="pagination">
          <Button variant="ghost" disabled={!before} onClick={() => setBefore(undefined)}>
            К началу группы
          </Button>
          <Button
            variant="secondary"
            disabled={
              !query.data?.next_before_id ||
              !Number.isSafeInteger(query.data.next_before_id) ||
              query.data.next_before_id === before
            }
            onClick={() => setBefore(query.data?.next_before_id || undefined)}
          >
            Более ранние записи группы →
          </Button>
        </div>
      </QueryState>
    </>
  );
}
