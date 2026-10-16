import { lazy, Suspense, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { api, unwrap, emptyQuery } from '../../api/client';
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
  JsonView,
  Notice,
} from '../../components/shared';
import { measurement } from '../../lib/format';
import { Button } from '../../components/ui/button';
const Chart = lazy(() => import('../metrics/Chart'));
export default function Telephony() {
  const { offset, params, update } = useFilters();
  const query = useQuery({
    queryKey: ['sip', params.toString()],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/telephony/targets', {
          params: {
            query: {
              limit: 50,
              offset,
              transport: (params.get('transport') || undefined) as
                'udp' | 'tcp' | 'tls' | undefined,
            },
          },
          signal,
        }),
      ),
    refetchInterval: 15_000,
  });
  return (
    <>
      <PageHeader
        eyebrow="Сервисы / SIP OPTIONS"
        title="Телефония"
        description="Доступность SIP-точек, задержка и ответы. Свежесть отдельно от последнего reported состояния."
      />
      <div className="toolbar">
        <select
          aria-label="Транспорт SIP"
          value={params.get('transport') || ''}
          onChange={(e) => update('transport', e.target.value)}
        >
          <option value="">Все транспорты</option>
          {['udp', 'tcp', 'tls'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <span className="muted">
          SIP 401 может означать доступный сервис с требованием авторизации.
        </span>
      </div>
      <Panel title="SIP endpoints" actions={<Phone size={17} />}>
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              {
                header: 'Endpoint',
                cell: ({ row }) => (
                  <Link
                    className="entity-link"
                    to={`/telephony/${encodeURIComponent(row.original.target_id)}?agent_id=${encodeURIComponent(row.original.agent_id)}`}
                  >
                    {row.original.address || row.original.target_id}
                  </Link>
                ),
              },
              { header: 'Транспорт', accessorKey: 'transport' },
              {
                header: 'Состояние',
                cell: ({ row }) => <Badge value={row.original.health.status} />,
              },
              {
                header: 'Ответ',
                cell: ({ row }) => row.original.latest?.response_code ?? 'Нет данных',
              },
              {
                header: 'Задержка',
                cell: ({ row }) => measurement(row.original.latest?.latency_ms, 'мс'),
              },
              {
                header: 'Последняя проверка',
                cell: ({ row }) => <Time value={row.original.latest?.observed_at} />,
              },
              { header: 'Collector', accessorKey: 'agent_id' },
            ]}
          />
          <Pagination
            offset={offset}
            count={query.data?.items.length || 0}
            onChange={(n) => update('offset', n)}
          />
        </QueryState>
      </Panel>
    </>
  );
}
export function TelephonyDetail() {
  const id = useParams().targetId || '';
  const { params, update } = useFilters();
  const agent = params.get('agent_id') || undefined;
  const query = useQuery({
    queryKey: ['sip-target', id, agent],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/telephony/targets/{id}', {
          params: { path: { id }, query: { agent_id: agent } },
          signal,
        }),
      ),
    refetchInterval: 15_000,
  });
  const history = useQuery({
    queryKey: ['sip-history', id, params.toString()],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/telephony/targets/{id}/history', {
          params: {
            path: { id },
            query: emptyQuery({
              agent_id: agent,
              limit: 50,
              before_id: Number(params.get('before_id')) || undefined,
            }),
          },
          signal,
        }),
      ),
  });
  const option = useMemo(
    () => ({
      xAxis: { type: 'time' },
      yAxis: { type: 'value', name: 'мс', splitLine: { lineStyle: { color: '#26313e' } } },
      series: [
        {
          type: 'line',
          showSymbol: false,
          connectNulls: false,
          name: 'SIP latency',
          data: [...(history.data?.items || [])]
            .sort((a, b) => a.observed_at.localeCompare(b.observed_at))
            .map((p) => [p.observed_at, p.latency_ms]),
        },
      ],
    }),
    [history.data],
  );
  return (
    <>
      <PageHeader
        eyebrow="Телефония / Endpoint"
        title={query.data?.address || id}
        actions={<Badge value={query.data?.health.status} />}
      />
      <Panel title="Состояние проверки">
        <QueryState query={query}>
          <Facts
            values={{
              'Target ID': id,
              Agent: query.data?.agent_id,
              Транспорт: query.data?.transport,
              Причина: query.data?.health.reason,
              'Reported state': query.data?.health.reported_state,
              'Ответ SIP': query.data?.latest?.response_code,
              'Задержка, мс': query.data?.latest?.latency_ms,
            }}
          />
          <JsonView value={query.data?.health.freshness} title="Freshness и время" />
        </QueryState>
      </Panel>
      <Panel
        title="История задержки"
        subtitle="Timeout и отсутствующие samples не заменяются нулями"
      >
        <QueryState query={history}>
          <Suspense fallback={<div className="chart-placeholder" />}>
            <Chart option={option} label="Задержка SIP в миллисекундах" />
          </Suspense>
          <DataTable
            data={history.data?.items || []}
            columns={[
              {
                header: 'Наблюдение',
                cell: ({ row }) => <Time value={row.original.observed_at} />,
              },
              { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
              { header: 'Код', accessorKey: 'response_code' },
              { header: 'Latency', cell: ({ row }) => measurement(row.original.latency_ms, 'мс') },
              { header: 'Ошибка', accessorKey: 'error_category' },
            ]}
          />
          <div className="pagination">
            <Button variant="ghost" onClick={() => update('before_id', '')}>
              Последние
            </Button>
            <Button
              variant="secondary"
              disabled={!history.data?.next_before_id}
              onClick={() => update('before_id', history.data!.next_before_id!)}
            >
              Ранее →
            </Button>
          </div>
        </QueryState>
      </Panel>
      <Notice>
        Если source observation metadata отсутствуют в версии backend, интерфейс их не
        восстанавливает из received_at.
      </Notice>
    </>
  );
}
