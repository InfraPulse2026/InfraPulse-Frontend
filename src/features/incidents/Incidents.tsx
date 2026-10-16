import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'react-router-dom';
import { AlertTriangle, Layers } from 'lucide-react';
import { casesQuery, incidentsQuery } from '../../api/queries';
import { api, unwrap } from '../../api/client';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Time,
  Pagination,
  Facts,
  Notice,
  Tabs,
  ConfirmDialog,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Assessment, CorrelationFacts } from './Evidence';
import AIAnalysis from '../ai/AIAnalysis';
export default function Incidents() {
  const { params, update, offset } = useFilters();
  const leaf = params.get('tab') === 'signals';
  const state = params.get('state') || undefined;
  const cases = useQuery({
    ...casesQuery({
      state,
      severity: params.get('severity') || undefined,
      asset_id: params.get('asset_id') || undefined,
      limit: 50,
      offset,
    }),
    enabled: !leaf,
  });
  const signals = useQuery({ ...incidentsQuery({ state, limit: 50, offset }), enabled: leaf });
  return (
    <>
      <PageHeader
        eyebrow="Центр эксплуатации"
        title="Инциденты"
        description="Связанные сигналы, доказательства и история восстановления."
      />
      <Tabs
        active={leaf ? 'signals' : 'cases'}
        onChange={(v) => update('tab', v)}
        items={[
          { value: 'cases', label: 'Объединённые инциденты' },
          { value: 'signals', label: 'Исходные симптомы' },
        ]}
      />
      <div className="toolbar">
        <select
          aria-label="Состояние инцидента"
          value={state || ''}
          onChange={(e) => update('state', e.target.value)}
        >
          <option value="">Все состояния</option>
          <option value="open">Открытые</option>
          {leaf && <option value="acknowledged">В работе</option>}
          <option value="resolved">Закрытые</option>
        </select>
        {!leaf && (
          <select
            aria-label="Критичность"
            value={params.get('severity') || ''}
            onChange={(e) => update('severity', e.target.value)}
          >
            <option value="">Любая критичность</option>
            <option value="critical">Критичные</option>
            <option value="warning">Предупреждения</option>
          </select>
        )}
        <span className="muted">
          {leaf
            ? 'Первичные симптомы по ресурсу и правилу'
            : 'Корреляция выполнена backend, не браузером'}
        </span>
      </div>
      <Panel
        title={leaf ? 'Симптомы' : 'Коррелированные случаи'}
        actions={leaf ? <AlertTriangle size={17} /> : <Layers size={17} />}
      >
        {leaf ? (
          <QueryState query={signals}>
            <DataTable
              data={signals.data?.items || []}
              columns={[
                {
                  header: 'Симптом',
                  cell: ({ row }) => (
                    <Link className="entity-link" to={`/incidents/signals/${row.original.id}`}>
                      {row.original.rule_id || row.original.id}
                    </Link>
                  ),
                },
                { header: 'Ресурс', accessorKey: 'resource_kind' },
                {
                  header: 'Критичность',
                  cell: ({ row }) => <Badge value={row.original.severity} />,
                },
                { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
                {
                  header: 'Evidence',
                  cell: ({ row }) => <Badge value={row.original.evidence_status} />,
                },
                { header: 'Начало', cell: ({ row }) => <Time value={row.original.opened_at} /> },
              ]}
            />
            <Pagination
              offset={offset}
              count={signals.data?.items?.length || 0}
              onChange={(n) => update('offset', n)}
            />
          </QueryState>
        ) : (
          <QueryState query={cases}>
            <DataTable
              data={cases.data?.items || []}
              columns={[
                {
                  header: 'Инцидент',
                  cell: ({ row }) => (
                    <Link className="name-cell" to={`/incidents/${row.original.id}`}>
                      <span className={`incident-marker ${row.original.severity}`} />
                      <span>
                        <strong>{row.original.title || row.original.id}</strong>
                        <small>{row.original.id}</small>
                      </span>
                    </Link>
                  ),
                },
                {
                  header: 'Критичность',
                  cell: ({ row }) => <Badge value={row.original.severity} />,
                },
                { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
                {
                  header: 'Источники / сигналы',
                  cell: ({ row }) =>
                    `${row.original.source_count ?? '—'} / ${row.original.signal_count ?? '—'}`,
                },
                { header: 'Уверенность', accessorKey: 'confidence' },
                { header: 'Начало', cell: ({ row }) => <Time value={row.original.opened_at} /> },
              ]}
            />
            <Pagination
              offset={offset}
              count={cases.data?.items?.length || 0}
              onChange={(n) => update('offset', n)}
            />
          </QueryState>
        )}
      </Panel>
    </>
  );
}
export function IncidentDetail() {
  const id = useParams().incidentId || '';
  const hash = useLocation().hash;
  const scrolled = useRef('');
  const query = useQuery({
    queryKey: ['case', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/correlation/incidents/{id}', { params: { path: { id } }, signal }),
      ),
    refetchInterval: 10_000,
  });
  const item = query.data?.incident;
  useEffect(() => {
    if (!/^#correlation-evidence-[1-9]\d*$/.test(hash)) {
      scrolled.current = '';
      return;
    }
    const key = `${id}:${hash}`,
      element = document.getElementById(hash.slice(1));
    if (element && scrolled.current !== key) {
      element.scrollIntoView({ block: 'center' });
      scrolled.current = key;
    }
  }, [id, hash, query.data]);
  return (
    <>
      <PageHeader
        eyebrow="Инциденты / Коррелированный случай"
        title={item?.title || id}
        description={id}
        actions={
          <>
            <Badge value={item?.severity} />
            <Badge value={item?.state} />
          </>
        }
      />
      <QueryState query={query}>
        <div className="detail-grid">
          <Panel title="Контекст и основания">
            <Facts
              values={{
                'Активные сигналы': item?.active_signal_count,
                'Всего сигналов': item?.signal_count,
                Источники: item?.source_count,
                Уверенность: item?.confidence,
                'Качество времени': item?.time_confidence,
                'Оценка backend': item?.confidence_score,
                Начало: item?.opened_at,
              }}
            />
            {item?.primary_asset_id && (
              <Link className="entity-link" to={`/assets/${item.primary_asset_id}`}>
                Основное оборудование →
              </Link>
            )}
            <Notice>
              Корреляция показывает основания связи симптомов. Она не доказывает единую физическую
              причину.
            </Notice>
            {query.data?.limitations?.map((v, i) => (
              <p className="muted" key={i}>
                {v}
              </p>
            ))}
          </Panel>
          <Panel title="Хронология">
            <ol className="timeline">
              {query.data?.timeline?.map((e, i) => (
                <li key={e.id || i}>
                  <span className="timeline-point" />
                  <small>
                    <Time value={e.occurred_at} /> · {e.time_quality}
                  </small>
                  <strong>{e.summary || e.event_kind}</strong>
                </li>
              ))}
            </ol>
            {!query.data?.timeline?.length && (
              <p className="muted">Хронология отсутствует в ответе backend.</p>
            )}
          </Panel>
        </div>
        <Panel title="Состав инцидента" subtitle="Состояние каждого симптома остаётся независимым">
          <DataTable
            data={query.data?.signals || []}
            columns={[
              {
                header: 'Симптом',
                cell: ({ row }) => (
                  <Link
                    className="entity-link"
                    to={`/incidents/signals/${row.original.signal?.incident_id}`}
                  >
                    {row.original.signal?.category || row.original.signal?.id}
                  </Link>
                ),
              },
              { header: 'Источник', cell: ({ row }) => row.original.signal?.source_kind },
              {
                header: 'Состояние',
                cell: ({ row }) => <Badge value={row.original.signal?.status} />,
              },
              {
                header: 'Оборудование',
                cell: ({ row }) =>
                  row.original.signal?.asset_ids?.map((asset) => (
                    <Link className="asset-inline-link" key={asset} to={`/assets/${asset}`}>
                      {asset}
                    </Link>
                  )),
              },
              {
                header: 'Evidence',
                cell: ({ row }) => <CorrelationFacts items={row.original.evidence || []} />,
              },
            ]}
          />
        </Panel>
        <Panel title="Доказательства корреляции">
          <DataTable
            data={query.data?.evidence || []}
            columns={[
              {
                header: 'Основание',
                cell: ({ row }) => (
                  <div id={`correlation-evidence-${row.original.id}`} className="evidence-anchor">
                    <CorrelationFacts items={[row.original]} />
                  </div>
                ),
              },
              { header: 'Вес', accessorKey: 'score' },
              {
                header: 'Сохранено',
                cell: ({ row }) => <Time value={row.original.created_at} />,
              },
            ]}
          />
        </Panel>
        <AIAnalysis
          key={id}
          id={id}
          correlated
          evidenceIDs={query.data?.evidence?.flatMap((e) => (e.id ? [e.id] : []))}
        />
      </QueryState>
    </>
  );
}
export function SignalDetail() {
  const id = useParams().incidentId || '';
  const auth = useAuth();
  const client = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const query = useQuery({
    queryKey: ['signal-detail', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/incidents/{id}', { params: { path: { id } }, signal })),
    refetchInterval: 15_000,
  });
  const evidence = useQuery({
    queryKey: ['signal-evidence', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/incidents/{id}/evidence', { params: { path: { id } }, signal })),
  });
  const transitions = useQuery({
    queryKey: ['signal-transitions', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/incidents/{id}/transitions', { params: { path: { id } }, signal }),
      ),
    refetchInterval: 15_000,
  });
  const ack = useMutation({
    mutationFn: async () =>
      unwrap(
        await api.POST('/api/incidents/{id}/acknowledge', {
          params: { path: { id } },
          body: { confirmed: true },
        }),
      ),
    onSuccess: () => {
      setConfirm(false);
      void client.invalidateQueries({ queryKey: ['signal-detail', id] });
      void client.invalidateQueries({ queryKey: ['signal-transitions', id] });
      void client.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
  return (
    <>
      <PageHeader
        eyebrow="Инциденты / Исходный симптом"
        title={query.data?.rule_id || id}
        actions={
          <>
            {query.data?.severity && <Badge value={query.data.severity} />}
            <Badge value={query.data?.state} />
            {can(auth.session?.permissions, 'incidents.write') && query.data?.state === 'open' && (
              <Button onClick={() => setConfirm(true)}>Принять в работу</Button>
            )}
          </>
        }
      />
      <Panel title="Симптом и ресурс">
        <QueryState query={query}>
          <Facts
            values={{
              Agent: query.data?.agent_id,
              Device: query.data?.device_id,
              Ресурс: query.data?.resource_id,
              Источник: query.data?.source,
              Открыт: query.data?.opened_at,
              'Последнее наблюдение': query.data?.last_observed_at,
              'Свежесть evidence': query.data?.evidence_status,
            }}
          />
          <Notice>
            Принятие в работу не означает восстановление. Backend закрывает симптом по правилам и
            последующим наблюдениям.
          </Notice>
        </QueryState>
      </Panel>
      <Panel title="Evidence">
        <QueryState query={evidence}>
          {query.data?.signal && <Assessment value={query.data.signal} />}
          {!query.data?.signal && <Notice>Текущая оценка отсутствует в ответе backend.</Notice>}
          {evidence.data?.items?.map((item, i) => (
            <details className="json-view" key={item.id ?? i}>
              <summary>
                Сохранённое наблюдение · <Time value={item.observed_at || item.at} />
              </summary>
              {item.assessment && <Assessment value={item.assessment} />}
            </details>
          ))}
          {!evidence.data?.items?.length && (
            <Notice>Сохранённая история доказательств пока отсутствует.</Notice>
          )}
        </QueryState>
      </Panel>
      <AIAnalysis key={id} id={id} />
      <Panel title="История состояний симптома">
        <QueryState query={transitions}>
          <DataTable
            data={transitions.data?.items || []}
            columns={[
              { header: 'Время', cell: ({ row }) => <Time value={row.original.at} /> },
              { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
              { header: 'Причина', accessorKey: 'reason' },
              { header: 'Автор', accessorKey: 'actor_id' },
            ]}
          />
        </QueryState>
      </Panel>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Принять симптом в работу?"
        description="Действие будет записано в аудит. Оно не изменит оборудование и не закроет инцидент."
        pending={ack.isPending}
        error={ack.error}
        onConfirm={() => ack.mutate()}
      />
    </>
  );
}
