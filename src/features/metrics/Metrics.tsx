import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '../../api/client';
import {
  Panel,
  QueryState,
  DataTable,
  Badge,
  Time,
  Empty,
  Notice,
  Pagination,
} from '../../components/shared';
import { measurement } from '../../lib/format';
import Chart from './Chart';
import PrometheusHistory from './PrometheusHistory';
import NetworkMetrics from './NetworkMetrics';
import { memoryPercent } from '../../lib/metrics';
export default function Metrics({ id }: { id: string }) {
  const [bindingId, setBinding] = useState('');
  const [metricOffset, setMetricOffset] = useState(0);
  const bindings = useQuery({
    queryKey: ['asset-sources', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/sources', {
          params: { path: { id }, query: { limit: 50 } },
          signal,
        }),
      ),
  });
  const native = bindings.data?.items?.filter((b) => b.legacy_agent_id && b.legacy_device_id) || [];
  const binding = native.find((b) => b.id === bindingId) || native[0];
  const external = useQuery({
    queryKey: ['metrics', id, metricOffset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/external-metrics', {
          params: { path: { id }, query: { limit: 50, offset: metricOffset } },
          signal,
        }),
      ),
    refetchInterval: 15_000,
  });
  const history = useQuery({
    queryKey: ['native-history', binding?.legacy_agent_id, binding?.legacy_device_id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/devices/{id}/metrics/history', {
          params: {
            path: { id: binding?.legacy_device_id || '' },
            query: { agent_id: binding?.legacy_agent_id || '', limit: 100 },
          },
          signal,
        }),
      ),
    enabled: !!binding,
    refetchInterval: 15_000,
  });
  const option = useMemo(
    () => ({
      legend: { textStyle: { color: '#98a6b8' } },
      xAxis: { type: 'time' },
      yAxis: {
        type: 'value',
        name: '%',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#26313e' } },
      },
      series: [
        {
          type: 'line',
          name: 'CPU',
          showSymbol: false,
          connectNulls: false,
          data: [...(history.data?.items || [])]
            .reverse()
            .map((p) => [p.observed_at, p.cpu_usage_percent]),
          areaStyle: { opacity: 0.07 },
        },
        {
          type: 'line',
          name: 'RAM',
          showSymbol: false,
          connectNulls: false,
          data: [...(history.data?.items || [])]
            .reverse()
            .map((p) => [p.observed_at, memoryPercent(p.memory_used_bytes, p.memory_total_bytes)]),
        },
      ],
    }),
    [history.data],
  );
  return (
    <>
      <Panel
        title="История Collector"
        subtitle="Последние 100 samples · CPU и RAM в процентах, пропуски не заполняются нулями"
      >
        {native.length > 0 && (
          <select
            aria-label="Источник истории"
            value={binding?.id}
            onChange={(e) => setBinding(e.target.value)}
          >
            {native.map((b) => (
              <option key={b.id} value={b.id}>
                {b.source_name} · {b.legacy_device_id}
              </option>
            ))}
          </select>
        )}
        {!binding ? (
          <Empty title="Нет привязки к Collector">
            История Collector доступна для source binding с agent_id и device_id. Внешние метрики
            показаны ниже.
          </Empty>
        ) : (
          <QueryState query={history}>
            <Chart label="История загрузки CPU" option={option} />
          </QueryState>
        )}
      </Panel>
      {binding && history.data && <NetworkMetrics key={binding.id} items={history.data.items} />}
      <Panel
        title="Внешние метрики"
        subtitle="Значения сохраняют единицы, качество и точность десятичных строк"
      >
        <QueryState query={external}>
          <DataTable
            data={external.data?.items || []}
            columns={[
              { header: 'Метрика', accessorKey: 'name' },
              {
                header: 'Значение',
                cell: ({ row }) => measurement(row.original.value, row.original.unit),
              },
              { header: 'Качество', cell: ({ row }) => <Badge value={row.original.quality} /> },
              { header: 'Источник', accessorKey: 'source_type' },
              {
                header: 'Наблюдение',
                cell: ({ row }) => <Time value={row.original.observed_at} />,
              },
            ]}
          />
          <Notice>
            Счётчики не преобразуются в скорость без временной и единичной семантики источника.
            История внешних mapping — отдельный API, не смешивается с историей Collector.
          </Notice>
          <Pagination
            offset={metricOffset}
            count={external.data?.items?.length || 0}
            onChange={setMetricOffset}
          />
        </QueryState>
      </Panel>
      <PrometheusHistory
        key={id + ':' + metricOffset}
        id={id}
        bindings={bindings.data?.items || []}
        metrics={external.data?.items || []}
      />
    </>
  );
}
