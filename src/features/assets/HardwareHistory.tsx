import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, unwrap, type Model } from '../../api/client';
import { Panel, QueryState, Notice, Facts, JsonView } from '../../components/shared';
import { Button } from '../../components/ui/button';
import Chart from '../metrics/Chart';
export default function HardwareHistory({
  id,
  observation,
}: {
  id: string;
  observation: Model<'AssetHardwareItem'>;
}) {
  const [trail, setTrail] = useState<number[]>([0]);
  const after = trail.at(-1) || 0;
  const query = useQuery({
    queryKey: ['hardware-history', id, observation.observation_key, after],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/hardware/history', {
          params: {
            path: { id },
            query: {
              observation_key: observation.observation_key,
              limit: 200,
              include_related: true,
              after_id: after || undefined,
            },
          },
          signal,
        }),
      ),
  });
  const option = useMemo(
    () => ({
      xAxis: { type: 'time' },
      yAxis: {
        type: 'value',
        name: observation.unit,
        splitLine: { lineStyle: { color: '#26313e' } },
      },
      series: [
        {
          type: 'line',
          showSymbol: false,
          connectNulls: false,
          name: observation.name,
          data: [...(query.data?.items || [])]
            .filter(
              (item) =>
                item.observation_key === observation.observation_key &&
                item.unit === observation.unit,
            )
            .sort((a, b) => a.observed_at.localeCompare(b.observed_at))
            .map((item) => [item.observed_at, item.value]),
        },
      ],
    }),
    [query.data, observation],
  );
  return (
    <Panel
      title={`История · ${observation.name || observation.resource_id}`}
      subtitle="Страница до 200 наблюдений выбранного observation key; график относится к этой странице"
    >
      <Facts
        values={{
          'Asset ID': id,
          'Observation key': observation.observation_key,
          'Resource ID': observation.resource_id,
          'Binding ID': observation.binding_id,
          'Device ID': observation.device_id,
          Источник: observation.source_name,
          'Тип источника': observation.source_type,
          Scope: observation.scope,
          Health: observation.health,
          'Health rollup': observation.health_rollup,
          Power: observation.power_state,
          'Operational state': observation.operational_state,
          Freshness: observation.freshness,
          'Качество данных': observation.data_quality,
          'Качество часов': observation.clock_quality,
          Наблюдение: observation.observed_at,
          'Время источника': observation.source_timestamp,
          Собрано: observation.collected_at,
          Получено: observation.received_at,
          'Связанное наблюдение': observation.related,
          'Relation IDs': observation.relation_ids?.join(', '),
          'Источник включён': observation.source_enabled,
          'Агент подключён': observation.agent_connected,
        }}
      />
      <Notice>
        Health, power и freshness — отдельные факты. Отключённое питание не превращается в Critical,
        а подключённый агент не гарантирует свежесть датчика.
      </Notice>
      <JsonView
        value={{
          source_ref: observation.source_ref,
          observation_time: observation.observation_time,
          payload: observation.payload,
        }}
        title="Дополнительные факты источника"
      />
      <QueryState query={query}>
        <Chart option={option} label={`История ${observation.name}`} />
        {query.data?.has_more && (
          <Notice>
            У источника есть дополнительные записи; продолжение использует next_after_id backend, не
            вычисляется из времени.
          </Notice>
        )}
        <div className="pagination">
          <span>
            Страница {trail.length} · {query.data?.items.length || 0} наблюдений
          </span>
          <Button
            variant="ghost"
            disabled={trail.length < 2}
            onClick={() => setTrail(trail.slice(0, -1))}
          >
            Предыдущие наблюдения
          </Button>
          <Button
            variant="secondary"
            disabled={
              !query.data?.has_more ||
              !Number.isSafeInteger(query.data.next_after_id) ||
              query.data.next_after_id <= 0 ||
              trail.includes(query.data.next_after_id) ||
              trail.length >= 100
            }
            onClick={() => {
              if (query.data?.next_after_id) setTrail([...trail, query.data.next_after_id]);
            }}
          >
            Следующие наблюдения
          </Button>
        </div>
      </QueryState>
    </Panel>
  );
}
