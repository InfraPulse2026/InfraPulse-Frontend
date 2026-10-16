import { lazy, Suspense, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileChartColumn, Save } from 'lucide-react';
import { api, unwrap, type Model } from '../../api/client';
import { idempotencySlot } from '../../lib/idempotency';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { measurement } from '../../lib/format';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Time,
  Notice,
  JsonView,
  ErrorState,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import Schedules from './Schedules';
const Chart = lazy(() => import('../metrics/Chart'));
export default function Reports() {
  const { params, update } = useFilters();
  const auth = useAuth();
  const [end] = useState(() => new Date().toISOString());
  const days = Number(params.get('days')) || 1;
  const from = new Date(Date.parse(end) - Math.min(31, Math.max(1, days)) * 86400000).toISOString();
  const scope = (params.get('scope') || 'real') as 'real' | 'simulated' | 'all';
  const filter = { from, to: end, scope, limit: 50 };
  const query = useQuery({
    queryKey: ['reports', filter],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/reports/v2/summary', { params: { query: filter }, signal })),
  });
  const snapshots = useQuery({
    queryKey: ['report-snapshots'],
    queryFn: async ({ signal }) => unwrap(await api.GET('/api/reports/v2/snapshots', { signal })),
  });
  const [getKey] = useState(idempotencySlot);
  const [savedFilter, setSavedFilter] = useState('');
  const save = useMutation({
    mutationFn: async (payload: Model<'ReportV2Filter'>) =>
      unwrap(
        await api.POST('/api/reports/v2/snapshots', {
          params: { header: { 'Idempotency-Key': getKey(payload) } },
          body: payload,
        }),
      ),
    onSuccess: (_, payload) => {
      setSavedFilter(JSON.stringify(payload));
      void snapshots.refetch();
    },
  });
  const option = useMemo(
    () => ({
      xAxis: { type: 'category', data: query.data?.categories?.map((c) => c.category) || [] },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#26313e' } } },
      series: [
        {
          type: 'bar',
          barWidth: 28,
          data: query.data?.categories?.map((c) => c.case_occurrences ?? null) || [],
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [query.data],
  );
  return (
    <>
      <PageHeader
        eyebrow="Аналитика / Результаты эксплуатации"
        title="Отчёты и повторные проблемы"
        description="Отдельные эпизоды, затронутое оборудование и хронические симптомы."
        actions={
          can(auth.session?.permissions, 'reports.write') && (
            <Button
              disabled={save.isPending || savedFilter === JSON.stringify(filter) || !query.data}
              onClick={() => save.mutate(filter)}
            >
              <Save size={15} />
              Сохранить снимок
            </Button>
          )
        }
      />
      <div className="toolbar">
        <select
          aria-label="Период отчёта"
          value={days}
          onChange={(e) => update('days', e.target.value)}
        >
          <option value={1}>Последние 24 часа</option>
          <option value={7}>7 дней</option>
          <option value={31}>31 день</option>
        </select>
        <select
          aria-label="Данные отчёта"
          value={scope}
          onChange={(e) => update('scope', e.target.value)}
        >
          <option value="real">Реальные данные</option>
          <option value="simulated">Симуляция</option>
          <option value="all">Все пространства</option>
        </select>
      </div>
      {save.error && <ErrorState error={save.error} />}{' '}
      {save.data && (
        <Notice>
          Снимок сохранён: {save.data.id}. Это неизменяемый результат на момент формирования.
        </Notice>
      )}
      <QueryState query={query}>
        <div className="stat-grid">
          {[
            ['Эпизоды', query.data?.stats?.overlapping_cases],
            ['Затронутые Assets', query.data?.stats?.affected_assets],
            ['Исходные сигналы', query.data?.stats?.signal_occurrences],
            ['Активны на конец периода', query.data?.stats?.active_cases_at_end],
          ].map(([label, value]) => (
            <div className="stat-card" key={String(label)}>
              <div className="stat-top">
                {label}
                <FileChartColumn size={16} />
              </div>
              <strong>{measurement(value)}</strong>
              <small>Расчёт backend</small>
            </div>
          ))}
        </div>
        <div className="detail-grid">
          <Panel title="Эпизоды по категориям">
            <Suspense fallback={<div className="chart-placeholder" />}>
              <Chart label="Количество эпизодов по категориям" option={option} />
            </Suspense>
          </Panel>
          <Panel title="Методика подсчёта">
            {query.data?.methodology?.map((m, i) => (
              <p className="methodology" key={i}>
                {m}
              </p>
            ))}
            <Notice>
              Сумма длительностей эпизодов не является downtime/SLA. Отсутствие incidents не
              доказывает непрерывную доступность.
            </Notice>
          </Panel>
        </div>
        <Panel title="Хронические проблемы" subtitle="Повторные разные эпизоды по методике backend">
          <DataTable
            data={query.data?.chronic_problems || []}
            columns={[
              {
                header: 'Asset',
                cell: ({ row }) => (
                  <Link className="entity-link" to={`/assets/${row.original.asset_id}`}>
                    {row.original.asset_id}
                  </Link>
                ),
              },
              { header: 'Категория', accessorKey: 'category' },
              { header: 'Эпизоды', accessorKey: 'case_occurrences' },
              { header: 'Источники', accessorKey: 'observation_sources' },
              {
                header: 'Последний эпизод',
                cell: ({ row }) => <Time value={row.original.last_opened_at} />,
              },
            ]}
          />
          {query.data?.truncated && <Notice>Ответ ограничен backend, часть групп не вошла.</Notice>}
        </Panel>
      </QueryState>
      <Panel title="Сохранённые отчёты">
        <QueryState query={snapshots}>
          <DataTable
            data={snapshots.data?.items || []}
            columns={[
              {
                header: 'Снимок отчёта',
                cell: ({ row }) => <JsonView value={row.original} title="Снимок" />,
              },
            ]}
          />
        </QueryState>
      </Panel>
      {can(auth.session?.permissions, 'access.manage') && <Schedules />}
    </>
  );
}
