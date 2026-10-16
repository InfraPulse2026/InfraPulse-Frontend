import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Network, Search } from 'lucide-react';
import { api, unwrap, emptyQuery } from '../../api/client';
import GraphCanvas, { type Selection } from './GraphCanvas';
import { useFilters } from '../../hooks/useFilters';
import {
  PageHeader,
  Panel,
  QueryState,
  Badge,
  Facts,
  JsonView,
  DataTable,
  Empty,
  Notice,
  Tabs,
  Pagination,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
export default function Topology() {
  const { params, update, offset } = useFilters();
  const [selection, setSelected] = useState<Selection | null>(null);
  const [search, setSearch] = useState('');
  const scope = (params.get('scope') || 'all') as 'all' | 'real' | 'simulated';
  const mode = params.get('view') || 'graph';
  const assetID = params.get('asset_id') || '';
  const expired = params.get('expired') === 'true';
  const scopeKey = JSON.stringify([assetID, scope, expired, offset]);
  const query = useQuery({
    queryKey: ['topology', assetID, scope, expired, offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/topology/global', {
          params: {
            query: emptyQuery({
              asset_id: assetID || undefined,
              scope,
              include_expired: expired,
              limit: 500,
              offset,
            }),
          },
          signal,
        }),
      ),
    refetchInterval: 30_000,
  });
  const selected: Selection | null =
    selection?.kind === 'node'
      ? (() => {
          const value = query.data?.nodes.find((n) => n.id === selection.data.id);
          return value ? { kind: 'node', data: value } : null;
        })()
      : selection?.kind === 'edge'
        ? (() => {
            const value = query.data?.edges.find((e) => e.id === selection.data.id);
            return value ? { kind: 'edge', data: value } : null;
          })()
        : null;
  return (
    <>
      <PageHeader
        eyebrow="Сеть / Наблюдаемое соседство"
        title="Топология сети"
        description="L2-соседство из LLDP, CDP и MNDP с происхождением каждой связи."
        actions={
          <span className="source-badge">
            <Network size={14} />
            {query.data?.nodes.length ?? '—'} узлов · {query.data?.edges.length ?? '—'} связей
          </span>
        }
      />
      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            aria-label="Найти узел"
            placeholder="Выделить узел по имени…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Scope топологии"
          value={scope}
          onChange={(e) => update('scope', e.target.value)}
        >
          <option value="all">Все наблюдения</option>
          <option value="real">Реальные</option>
          <option value="simulated">Симуляция</option>
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={params.get('expired') === 'true'}
            onChange={(e) => update('expired', String(e.target.checked))}
          />
          Истёкшие наблюдения
        </label>
        <Tabs
          items={[
            { value: 'graph', label: 'Граф' },
            { value: 'table', label: 'Таблица связей' },
          ]}
          active={mode}
          onChange={(v) => update('view', v)}
        />
      </div>
      <QueryState query={query}>
        {query.data?.truncated && (
          <Notice>
            Данные ограничены backend: показана часть графа. Используйте карточку Asset для
            локальной выборки.
          </Notice>
        )}
        {query.data?.inventory_truncated && (
          <Notice>Инвентаризация неполная: сопоставление соседей может быть ограничено.</Notice>
        )}
        {query.data?.observations_truncated && (
          <Notice>
            Backend ограничил набор наблюдений. Счётчики относятся к загруженным данным, не ко всей
            сети.
          </Notice>
        )}
        {!query.data?.nodes.length ? (
          <Panel>
            <Empty title="Топология ещё не построена">
              Для карты нужны наблюдения соседства от Collector и привязки оборудования в backend.
            </Empty>
          </Panel>
        ) : mode === 'table' ? (
          <Panel>
            <DataTable
              data={query.data?.edges || []}
              columns={[
                { header: 'От', accessorKey: 'from' },
                { header: 'К', accessorKey: 'to' },
                { header: 'Протоколы', cell: ({ row }) => row.original.protocols.join(', ') },
                { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.status} /> },
                { header: 'Подтверждение', accessorKey: 'confirmation' },
                {
                  header: 'Детали',
                  cell: ({ row }) => (
                    <Button
                      variant="ghost"
                      onClick={() => setSelected({ kind: 'edge', data: row.original })}
                    >
                      Evidence
                    </Button>
                  ),
                },
              ]}
            />
          </Panel>
        ) : (
          <div className="topology-workspace">
            <Panel className="graph-panel">
              <GraphCanvas
                key={scopeKey}
                scopeKey={scopeKey}
                data={query.data!}
                search={search}
                select={setSelected}
              />
              <div className="graph-legend">
                <span>
                  <i className="legend-dot teal" />
                  Asset
                </span>
                <span>
                  <i className="legend-dot amber" />
                  Не сопоставлен
                </span>
                <span>— Одностороннее наблюдение</span>
                <span>╌ Истекло / неизвестно</span>
              </div>
            </Panel>
            <Panel
              title={
                selected
                  ? selected.kind === 'node'
                    ? 'Узел сети'
                    : 'Доказательства связи'
                  : 'Контекст сети'
              }
              className="graph-context"
            >
              {selected ? (
                selected.kind === 'node' ? (
                  <>
                    <h3>{selected.data.label}</h3>
                    <Badge value={selected.data.kind === 'asset' ? 'observed' : 'unresolved'} />
                    <Facts
                      values={{
                        ID: selected.data.id,
                        Тип: selected.data.kind,
                        'Тип Asset': selected.data.asset_kind,
                        Происхождение: selected.data.scope || 'real',
                      }}
                    />
                    {selected.data.asset_id && (
                      <Link
                        className="button button-secondary"
                        to={`/assets/${selected.data.asset_id}`}
                      >
                        Карточка оборудования →
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Badge value={selected.data.status} />
                    <Facts
                      values={{
                        От: selected.data.from,
                        К: selected.data.to,
                        'Локальный порт': selected.data.from_port_key,
                        'Удалённый порт': selected.data.to_port_key,
                        Протоколы: selected.data.protocols.join(', '),
                        Подтверждение: selected.data.confirmation,
                        Уверенность: selected.data.confidence,
                      }}
                    />
                    <JsonView
                      value={selected.data.evidence}
                      title="Направленные observations и TTL"
                    />
                  </>
                )
              ) : (
                <>
                  <div className="context-illustration">
                    <Network size={44} />
                  </div>
                  <h3>Всё связано с фактами</h3>
                  <p className="muted">
                    Выберите узел или связь, чтобы увидеть идентичность, порты, источники и
                    подтверждение.
                  </p>
                  <Notice>
                    Наблюдаемое соседство не доказывает физический кабель. Management relations не
                    изображены сетевыми связями.
                  </Notice>
                </>
              )}
            </Panel>
          </div>
        )}
        {mode === 'table' && selected && (
          <Panel title="Выбранная связь">
            <JsonView value={selected.data} title="Evidence и параметры" />
          </Panel>
        )}
        <Pagination
          offset={offset}
          count={query.data?.edges.length || 0}
          size={500}
          onChange={(n) => update('offset', n)}
        />
        {!!query.data?.management_relations?.length && (
          <Panel title="Связи управления BMC">
            <Notice>
              Это отношения управления системой/шасси, а не сетевые кабели. Они не добавляются к
              L2-рёбрам.
            </Notice>
            <DataTable
              data={query.data.management_relations}
              columns={[
                { header: 'Тип', accessorKey: 'type' },
                { header: 'От', accessorKey: 'from' },
                { header: 'К', accessorKey: 'to' },
                { header: 'Статус', cell: ({ row }) => <Badge value={row.original.status} /> },
                {
                  header: 'Основания',
                  cell: ({ row }) => (
                    <JsonView value={row.original.evidence} title="Evidence управления" />
                  ),
                },
              ]}
            />
          </Panel>
        )}
      </QueryState>
    </>
  );
}
