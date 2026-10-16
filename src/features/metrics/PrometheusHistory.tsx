import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, unwrap, type Model } from '../../api/client';
import { chartNumber } from '../../lib/metrics';
import { Panel, QueryState, Badge, Notice, Facts } from '../../components/shared';
import Chart from './Chart';
import { Button } from '../../components/ui/button';
export default function PrometheusHistory({
  id,
  bindings,
  metrics,
}: {
  id: string;
  bindings: Model<'AssetSourceBinding'>[];
  metrics: Model<'ExternalMetric'>[];
}) {
  const sources = bindings.filter((b) => b.source_type?.toUpperCase() === 'PROMETHEUS');
  const [bindingId, setBinding] = useState('');
  const binding = sources.find((b) => b.id === bindingId) || sources[0];
  const mapped = metrics.filter(
    (m) => m.source_instance_id === binding?.source_instance_id && !!m.mapping_id,
  );
  const [metricId, setMetric] = useState('');
  const metric = mapped.find((m) => m.mapping_id === metricId) || mapped[0];
  const [hours, setHours] = useState(1);
  const [end, setEnd] = useState(() => new Date().toISOString());
  const start = new Date(Date.parse(end) - hours * 3600000).toISOString();
  const query = useQuery({
    queryKey: ['prom-range', id, binding?.id, metric?.mapping_id, start, end],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/prometheus/range', {
          params: {
            path: { id },
            query: {
              source_instance_id: binding?.source_instance_id || '',
              target_id: binding?.external_id || '',
              mapping_id: metric?.mapping_id || '',
              from: start,
              to: end,
              step_seconds: Math.max(3, Math.ceil((hours * 3600) / 500)),
            },
          },
          signal,
        }),
      ),
    enabled: !!binding?.external_id && !!metric?.mapping_id,
  });
  const option = useMemo(
    () => ({
      xAxis: { type: 'time' },
      yAxis: {
        type: 'value',
        name: query.data?.unit || '',
        splitLine: { lineStyle: { color: '#26313e' } },
      },
      series: [
        {
          type: 'line',
          name: query.data?.metric,
          showSymbol: false,
          connectNulls: false,
          data: query.data?.points?.map((p) => [p.at, chartNumber(p.value)]) || [],
        },
      ],
    }),
    [query.data],
  );
  if (!binding) return null;
  return (
    <Panel
      title="История Prometheus"
      subtitle="Только сохранённые mappings выбранного источника"
      actions={<Badge value={query.data?.quality} />}
    >
      <div className="inline-actions">
        <Button
          variant="secondary"
          disabled={!metric || query.isFetching}
          onClick={() => setEnd(new Date().toISOString())}
        >
          Обновить временное окно
        </Button>
        <select
          aria-label="Binding Prometheus"
          value={binding.id}
          onChange={(e) => setBinding(e.target.value)}
        >
          {sources.map((b) => (
            <option key={b.id} value={b.id}>
              {b.source_name} · {b.external_id}
            </option>
          ))}
        </select>
        <select
          aria-label="Метрика Prometheus"
          value={metric?.mapping_id || ''}
          onChange={(e) => setMetric(e.target.value)}
        >
          {!mapped.length && <option value="">Нет mapping в выборке</option>}
          {mapped.map((m) => (
            <option key={m.mapping_id} value={m.mapping_id}>
              {m.name || m.metric}
            </option>
          ))}
        </select>
        <select
          aria-label="Период Prometheus"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        >
          <option value={1}>1 час</option>
          <option value={6}>6 часов</option>
          <option value={24}>24 часа</option>
          <option value={168}>7 дней</option>
          <option value={336}>14 дней</option>
        </select>
      </div>
      <Facts
        values={{
          Источник: binding.source_instance_id,
          Target: binding.external_id,
          Mapping: metric?.mapping_id,
          'Начало UTC': start,
          'Конец UTC': end,
          'Шаг, секунд': Math.max(3, Math.ceil((hours * 3600) / 500)),
        }}
      />
      {metric ? (
        <QueryState query={query}>
          <Chart option={option} label="Исторические метрики Prometheus" />
        </QueryState>
      ) : (
        <Notice>
          У выбранного binding нет доступного mapping в текущей странице метрик. Произвольный PromQL
          или URL не отправляется.
        </Notice>
      )}
      <Notice>
        Время — evaluation time PromQL, не время физического измерения. Точные большие целые
        остаются в таблице; небезопасные для Number значения на графике пропускаются.
      </Notice>
    </Panel>
  );
}
