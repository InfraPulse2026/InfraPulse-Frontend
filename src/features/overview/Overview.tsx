import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Activity,
  Database,
  Layers,
  RadioTower,
  ShieldAlert,
  Network,
} from 'lucide-react';
import {
  assetsQuery,
  sourcesQuery,
  collectorsQuery,
  casesQuery,
  caseSummaryQuery,
} from '../../api/queries';
import { Badge, Panel, PageHeader, QueryState, Empty, Time } from '../../components/shared';
import { measurement } from '../../lib/format';
const Chart = lazy(() => import('../metrics/Chart'));
export default function Overview() {
  const assets = useQuery(assetsQuery({ limit: 50 }));
  const sources = useQuery(sourcesQuery());
  const collectors = useQuery(collectorsQuery);
  const cases = useQuery(casesQuery({ state: 'open', limit: 5 }));
  const summary = useQuery(caseSummaryQuery);
  const agents = collectors.data?.items || [];
  const sourceItems = sources.data?.items || [];
  const cards = [
    {
      label: 'Открытые инциденты',
      value: summary.data?.open,
      foot: 'Коррелированные случаи',
      icon: ShieldAlert,
      color: 'red',
      to: '/incidents',
    },
    {
      label: 'Оборудование',
      value: assets.data?.items?.length,
      foot: 'В первых 50 записях',
      icon: Layers,
      color: 'teal',
      to: '/assets',
    },
    {
      label: 'Коллекторы на связи',
      value: collectors.data ? agents.filter((a) => a.connected).length : undefined,
      foot: `Из ${collectors.data ? agents.length : '—'} зарегистрированных`,
      icon: RadioTower,
      color: 'blue',
      to: '/collectors',
    },
    {
      label: 'Источники подключены',
      value: sources.data
        ? sourceItems.filter((s) => s.connection_status === 'connected').length
        : undefined,
      foot: 'На текущей странице источников',
      icon: Database,
      color: 'amber',
      to: '/sources',
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Центр мониторинга"
        title="Обзор инфраструктуры"
        description="Единая картина событий, оборудования и источников данных."
        actions={
          <Link className="button button-secondary" to="/topology">
            <Network size={16} />
            Открыть топологию
          </Link>
        }
      />
      <div className="live-context">
        <span className="tiny-dot" />
        <span>Данные из backend</span>
        <span className="context-divider" />
        Автообновление 15–30 сек.
        <span className="context-right">
          {new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}
        </span>
      </div>
      <div className="stat-grid">
        {cards.map((card) => (
          <Link to={card.to} className="stat-card" key={card.label}>
            <div className="stat-top">
              <span>{card.label}</span>
              <span className={`stat-icon ${card.color}`}>
                <card.icon size={18} />
              </span>
            </div>
            <strong>{measurement(card.value)}</strong>
            <div className="stat-foot">
              {card.foot}
              <ArrowUpRight size={14} />
            </div>
          </Link>
        ))}
      </div>
      <div className="dashboard-main">
        <Panel
          title="Требуют внимания"
          subtitle="Последние открытые коррелированные инциденты"
          actions={
            <Link className="text-link" to="/incidents">
              Все инциденты <ArrowUpRight size={14} />
            </Link>
          }
        >
          <QueryState query={cases}>
            {!cases.data?.items?.length ? (
              <Empty title="Открытых случаев нет">
                Backend не вернул открытые случаи. Проверьте актуальность источников перед выводом о
                состоянии сети.
              </Empty>
            ) : (
              <div className="incident-list">
                {cases.data.items.map((item) => (
                  <Link className="incident-row" to={`/incidents/${item.id}`} key={item.id}>
                    <span className={`incident-marker ${item.severity}`} />
                    <div>
                      <strong>{item.title || item.id}</strong>
                      <p>
                        {item.source_count ?? '—'} источника · {item.active_signal_count ?? '—'}{' '}
                        активных сигналов
                      </p>
                    </div>
                    <div>
                      <Badge value={item.severity} />
                      <small>
                        <Time value={item.updated_at} />
                      </small>
                    </div>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </QueryState>
        </Panel>
        <Panel
          title="Состояние источников"
          subtitle="Подключение отдельно от здоровья устройств"
          actions={<Database size={17} />}
        >
          <QueryState query={sources}>
            {sourceItems.length ? (
              <div className="source-health-list">
                {sourceItems.slice(0, 5).map((s) => (
                  <Link to={`/sources/${s.id}`} key={s.id}>
                    <span className={`source-logo ${s.type.toLowerCase()}`}>
                      {s.type.slice(0, 1)}
                    </span>
                    <div>
                      <strong>{s.name}</strong>
                      <small>{s.type}</small>
                    </div>
                    <Badge value={s.connection_status} />
                  </Link>
                ))}
              </div>
            ) : (
              <Empty title="Источники ещё не подключены" />
            )}
          </QueryState>
          <Link to="/sources" className="panel-bottom-link">
            Управление источниками
            <ArrowUpRight size={14} />
          </Link>
        </Panel>
      </div>
      <div className="dashboard-bottom">
        <Panel title="Сигналы и корреляция" subtitle="Текущий срез · не временной график">
          <QueryState query={summary}>
            <Suspense fallback={<div className="chart-placeholder" />}>
              <Chart
                label="Текущие агрегаты корреляции"
                height={230}
                option={{
                  xAxis: { type: 'category', data: ['Открыто', 'Закрыто', 'Несколько источников'] },
                  yAxis: {
                    type: 'value',
                    minInterval: 1,
                    splitLine: { lineStyle: { color: '#26313e' } },
                  },
                  series: [
                    {
                      type: 'bar',
                      barWidth: 32,
                      itemStyle: { borderRadius: [5, 5, 0, 0] },
                      data: [
                        summary.data?.open ?? null,
                        summary.data?.resolved ?? null,
                        summary.data?.multi_source ?? null,
                      ],
                    },
                  ],
                }}
              />
            </Suspense>
          </QueryState>
        </Panel>
        <Panel
          title="Коллекторы"
          subtitle="Состояние входящих сессий"
          actions={<Activity size={17} />}
        >
          <QueryState query={collectors}>
            {agents.length ? (
              agents.slice(0, 4).map((a) => (
                <Link
                  className="collector-row"
                  to={`/collectors/${encodeURIComponent(a.agent_id)}`}
                  key={a.agent_id}
                >
                  <span className="collector-icon">
                    <Activity size={18} />
                  </span>
                  <div>
                    <strong>{a.name || a.agent_id}</strong>
                    <small>
                      <Time value={a.last_seen} />
                    </small>
                  </div>
                  <Badge value={a.connected ? 'online' : 'offline'} />
                </Link>
              ))
            ) : (
              <Empty title="Нет зарегистрированных коллекторов" />
            )}
          </QueryState>
        </Panel>
      </div>
    </>
  );
}
