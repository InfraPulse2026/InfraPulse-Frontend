import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, unwrap, type Model } from '../../api/client';
import { useFilters } from '../../hooks/useFilters';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Time,
  Drawer,
  Facts,
  JsonView,
  Notice,
  Tabs,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import LogFilters from './LogFilters';
import AuditEvents from './AuditEvents';
import { logQuery, type LogQuery } from './log-filters';
export default function Logs() {
  const [params] = useSearchParams();
  const key = new URLSearchParams(params);
  key.delete('before_id');
  return <LogWorkspace key={key.toString()} />;
}
function LogWorkspace() {
  const { params, update } = useFilters();
  const [, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Model<'LogRecord'> | null>(null);
  const audit = params.get('tab') === 'audit';
  let filters: LogQuery = { limit: 50 };
  let filterError = '';
  try {
    filters = logQuery(params);
  } catch (e) {
    filterError = (e as Error).message;
  }
  const query = useQuery({
    queryKey: ['logs', params.toString()],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/logs', {
          params: {
            query: filters,
          },
          signal,
        }),
      ),
    enabled: !audit && !filterError,
  });
  return (
    <>
      <PageHeader
        eyebrow="Наблюдения / Журналы"
        title="Логи и аудит"
        description="Поиск по сохранённым записям с источниками и временем наблюдения."
      />
      <Tabs
        active={audit ? 'audit' : 'logs'}
        onChange={(v) => {
          const next = new URLSearchParams(params);
          next.set('tab', v);
          next.delete('before_id');
          setParams(next);
        }}
        items={[
          { value: 'logs', label: 'Системные логи' },
          { value: 'audit', label: 'События Linux Audit' },
        ]}
      />
      <LogFilters />
      {filterError ? (
        <Notice>{filterError} Запрос не отправлен; исправьте фильтры.</Notice>
      ) : audit ? (
        <AuditEvents filters={filters} />
      ) : (
        <Panel title="Поток событий" actions={<ScrollText size={17} />}>
          <QueryState query={query}>
            <DataTable
              data={query.data?.items || []}
              columns={[
                {
                  header: 'Время события',
                  cell: ({ row }) => <Time value={row.original.event_at} />,
                },
                {
                  header: 'Уровень',
                  cell: ({ row }) => <Badge value={row.original.severity_name} />,
                },
                {
                  header: 'Хост / процесс',
                  cell: ({ row }) => (
                    <span>
                      {row.original.host || 'Не указан'}
                      <small className="cell-sub">{row.original.process || '—'}</small>
                    </span>
                  ),
                },
                {
                  header: 'Сообщение',
                  cell: ({ row }) => (
                    <button className="log-message" onClick={() => setSelected(row.original)}>
                      {row.original.message || 'Сообщение отсутствует'}
                    </button>
                  ),
                },
                { header: 'Источник', accessorKey: 'source' },
              ]}
            />
            <div className="pagination">
              <span>По 50 записей · порядок по ID поступления</span>
              <Button
                variant="ghost"
                disabled={!params.get('before_id')}
                onClick={() => update('before_id', '')}
              >
                К новым
              </Button>
              <Button
                variant="secondary"
                disabled={
                  !Number.isSafeInteger(query.data?.next_before_id) ||
                  !query.data?.next_before_id ||
                  query.data.next_before_id < 1
                }
                onClick={() => update('before_id', query.data!.next_before_id!)}
              >
                Более ранние →
              </Button>
            </div>
          </QueryState>
        </Panel>
      )}
      <Drawer title="Запись журнала" open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <Badge value={selected.severity_name} />
            <pre className="log-body">{selected.message}</pre>
            <Facts
              values={{
                ID: selected.id,
                Событие: selected.event_at,
                Наблюдение: selected.observed_at,
                Получение: selected.received_at,
                'Основа времени': selected.time_basis,
                Agent: selected.agent_id,
                Device: selected.device_id,
                'Host (claim)': selected.host,
                Процесс: selected.process,
                'Скрыты поля': selected.redacted,
                Обрезано: selected.truncated,
              }}
            />
            <Notice>
              Hostname из сообщения — заявление источника. Проверенную идентичность peer смотрите в
              metadata.
            </Notice>
            <JsonView value={selected.syslog} title="Syslog peer metadata" />
            <JsonView value={selected.audit} title="Audit record" />
          </>
        )}
      </Drawer>
    </>
  );
}
