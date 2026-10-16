import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape, { type Core } from 'cytoscape';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Maximize, Minus, Plus } from 'lucide-react';
import type { Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { Button } from '../../components/ui/button';
import { Notice } from '../../components/shared';
import { useLightTheme } from '../../hooks/useTheme';
import {
  graphSlice,
  positionFor,
  type Positions,
  type SavedLayout,
  type LayoutName,
} from './graph-state';
export type Selection =
  | { kind: 'node'; data: Model<'GlobalTopologyNode'> }
  | { kind: 'edge'; data: Model<'GlobalTopologyEdge'> };
export default function GraphCanvas({
  data,
  search,
  scopeKey,
  select,
}: {
  data: Model<'GlobalTopologyGraph'>;
  search: string;
  scopeKey: string;
  select: (value: Selection) => void;
}) {
  const auth = useAuth(),
    client = useQueryClient();
  const light = useLightTheme();
  const queryKey = ['ui-topology-layout', auth.session?.user.id, scopeKey];
  const saved = useQuery<SavedLayout | null>({
    queryKey,
    queryFn: async () => null,
    enabled: false,
    gcTime: Infinity,
  });
  const container = useRef<HTMLDivElement>(null),
    graph = useRef<Core | null>(null);
  const context = useRef({ data, select });
  const bounded = useMemo(() => graphSlice(data), [data]);
  const [layout, setLayout] = useState<LayoutName | ''>('');
  const chosen =
    layout || saved.data?.layout || (bounded.nodes.length < 80 ? 'breadthfirst' : 'grid');
  const [message, setMessage] = useState('');
  const [focusID, setFocusID] = useState('');
  const focus = bounded.nodes.find((n) => n.id === focusID);
  useEffect(() => {
    if (!container.current) return;
    const cy = cytoscape({
      container: container.current,
      elements: [],
      minZoom: 0.15,
      maxZoom: 3,
      style: [
        {
          selector: 'node',
          style: {
            width: 38,
            height: 38,
            'background-color': '#1e5d59',
            'border-width': 2,
            'border-color': '#4ad6b6',
            label: 'data(label)',
            color: '#b8c9dc',
            'font-size': 11,
            'text-valign': 'bottom',
            'text-margin-y': 12,
            'text-max-width': '130px',
            'text-wrap': 'ellipsis',
          },
        },
        {
          selector: 'node[?unresolved]',
          style: { 'background-color': '#4a3921', 'border-color': '#d4a35f', shape: 'diamond' },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#3c6470',
            'curve-style': 'bezier',
            label: 'data(label)',
            color: '#71909f',
            'font-size': 8,
            'text-rotation': 'autorotate',
            'text-margin-y': -9,
          },
        },
        {
          selector: 'edge[?stale]',
          style: { 'line-style': 'dashed', 'line-color': '#6b7280', opacity: 0.55 },
        },
        {
          selector: ':selected',
          style: { 'border-color': '#c3f9ea', 'border-width': 4, 'line-color': '#68dfc2' },
        },
        { selector: '.search-match', style: { 'background-color': '#3ab89c', 'border-width': 5 } },
      ],
    });
    cy.on('tap', 'node', (event) => {
      const item = context.current.data.nodes.find((n) => n.id === event.target.id());
      if (item) context.current.select({ kind: 'node', data: item });
    });
    cy.on('tap', 'edge', (event) => {
      const item = context.current.data.edges.find((e) => e.id === event.target.id());
      if (item) context.current.select({ kind: 'edge', data: item });
    });
    cy.on('dragfree', 'node', () =>
      setMessage('Положение изменено. Можно сохранить раскладку для этой сессии.'),
    );
    const observer = new ResizeObserver(() => cy.resize());
    observer.observe(container.current);
    graph.current = cy;
    return () => {
      observer.disconnect();
      cy.destroy();
      graph.current = null;
    };
  }, []);
  useEffect(() => {
    context.current = { data, select };
    const cy = graph.current;
    if (!cy) return;
    const initial = cy.nodes().length === 0,
      nodeIDs = new Set(bounded.nodes.map((n) => n.id)),
      edgeIDs = new Set(bounded.edges.map((e) => e.id));
    const box = cy.nodes().length ? cy.nodes().boundingBox() : { x2: 0, y1: 0 };
    let added = 0;
    cy.batch(() => {
      cy.edges()
        .filter((e) => !edgeIDs.has(e.id()))
        .remove();
      cy.nodes()
        .filter((n) => !nodeIDs.has(n.id()))
        .remove();
      for (const n of bounded.nodes) {
        const entry = cy.getElementById(n.id),
          fields = {
            id: n.id,
            label: (n.label || n.id).slice(0, 160),
            unresolved: n.kind !== 'asset',
          };
        if (entry.empty()) {
          const point = saved.data ? positionFor(saved.data.positions, n.id) : undefined;
          cy.add({
            group: 'nodes',
            data: fields,
            position: point || {
              x: box.x2 + 120 + (added % 10) * 100,
              y: box.y1 + Math.floor(added / 10) * 100,
            },
          });
          added++;
        } else if (
          entry.data('label') !== fields.label ||
          entry.data('unresolved') !== fields.unresolved
        )
          entry.data(fields);
      }
      for (const e of bounded.edges) {
        const entry = cy.getElementById(e.id),
          fields = {
            id: e.id,
            source: e.from,
            target: e.to,
            label: e.protocols.join(' / '),
            stale: e.status !== 'active',
            confirmation: e.confirmation,
          };
        if (entry.nonempty() && (entry.data('source') !== e.from || entry.data('target') !== e.to))
          entry.remove();
        const current = cy.getElementById(e.id);
        if (current.empty()) cy.add({ group: 'edges', data: fields });
        else current.data(fields);
      }
    });
    if (initial && bounded.nodes.length) {
      if (saved.data) cy.fit(undefined, 60);
      else
        cy.layout({
          name: bounded.nodes.length < 80 ? 'breadthfirst' : 'grid',
          padding: 60,
          animate: false,
        }).run();
    }
  }, [data, select, bounded, saved.data]);
  useEffect(() => {
    const cy = graph.current;
    if (!cy) return;
    cy.nodes().removeClass('search-match');
    if (search)
      cy.nodes()
        .filter((n) => String(n.data('label')).toLowerCase().includes(search.toLowerCase()))
        .addClass('search-match');
  }, [search, data]);
  useEffect(() => {
    const cy = graph.current;
    if (!cy) return;
    cy.style()
      .selector('node')
      .style({ color: light ? '#334155' : '#b8c9dc' })
      .selector('edge')
      .style({ color: light ? '#475569' : '#71909f' })
      .selector(':selected')
      .style({
        'border-color': light ? '#087f6c' : '#c3f9ea',
        'line-color': light ? '#087f6c' : '#68dfc2',
      })
      .update();
  }, [light]);
  const restore = () => {
    const cy = graph.current;
    if (!cy || !saved.data) return;
    cy.batch(() =>
      cy.nodes().forEach((n) => {
        const value = positionFor(saved.data!.positions, n.id());
        if (value) n.position(value);
      }),
    );
    cy.fit(undefined, 60);
    setMessage('Сохранённые позиции восстановлены для совпадающих ID.');
  };
  return (
    <>
      <div className="toolbar">
        <label>
          Перейти к узлу
          <select
            aria-label="Фокус узла"
            value={focus?.id || ''}
            onChange={(e) => {
              const id = e.target.value,
                cy = graph.current,
                node = bounded.nodes.find((n) => n.id === id);
              setFocusID(id);
              if (cy && node) {
                cy.elements().unselect();
                cy.getElementById(id).select();
                select({ kind: 'node', data: node });
              }
            }}
          >
            <option value="">Выберите узел…</option>
            {bounded.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {(n.label || n.id).slice(0, 160)}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          disabled={!focus}
          onClick={() => {
            const cy = graph.current,
              node = cy?.getElementById(focusID);
            if (cy && node?.nonempty()) {
              cy.elements().unselect();
              const neighbors = node.closedNeighborhood();
              neighbors.select();
              cy.fit(neighbors, 70);
              setMessage('Показана окрестность выбранного узла; координаты не изменены.');
            }
          }}
        >
          Показать соседей
        </Button>
        <label>
          Новая раскладка
          <select
            aria-label="Алгоритм раскладки"
            value={chosen}
            onChange={(e) => setLayout(e.target.value as LayoutName)}
          >
            <option value="breadthfirst">Дерево</option>
            <option value="grid">Сетка</option>
            <option value="circle">Круг</option>
            <option value="concentric">Концентрическая</option>
          </select>
        </label>
        <Button
          variant="secondary"
          disabled={!bounded.nodes.length}
          onClick={() => {
            graph.current?.layout({ name: chosen, padding: 60, animate: false }).run();
            setMessage('Новая раскладка применена. Сохранённая версия не заменена.');
          }}
        >
          Применить раскладку
        </Button>
        <Button
          variant="secondary"
          disabled={!bounded.nodes.length}
          onClick={() => {
            const cy = graph.current;
            if (!cy) return;
            const positions: Positions = Object.fromEntries(
              cy.nodes().map((n) => [n.id(), { ...n.position() }]),
            );
            client.setQueryData<SavedLayout>(queryKey, {
              positions,
              at: new Date().toISOString(),
              layout: chosen,
            });
            setMessage('Раскладка сохранена в памяти этой сессии.');
          }}
        >
          Сохранить раскладку
        </Button>
        <Button variant="ghost" disabled={!saved.data} onClick={restore}>
          Восстановить раскладку
        </Button>
        <Button
          variant="ghost"
          disabled={!saved.data}
          onClick={() => {
            client.setQueryData(queryKey, null);
            setMessage('Сохранённая раскладка удалена из памяти сессии.');
          }}
        >
          Сбросить сохранённую раскладку
        </Button>
      </div>
      {saved.data && (
        <p className="muted">
          Есть сохранённая раскладка этой выборки: {Object.keys(saved.data.positions).length} узлов.
          При выходе из учётной записи она удаляется.
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {(bounded.omittedNodes > 0 || bounded.omittedEdges > 0) && (
        <Notice>
          На графе ограничение 500 узлов / 1000 связей; пропущено узлов {bounded.omittedNodes},
          связей {bounded.omittedEdges}. В таблице доступна текущая страница backend.
        </Notice>
      )}
      <div className="graph-viewport">
        <div
          className="topology-canvas"
          ref={container}
          aria-label="Граф сетевых наблюдений. Доступная альтернатива — вкладка Таблица связей."
        />
        <div className="graph-controls">
          <Button
            variant="secondary"
            aria-label="Увеличить"
            onClick={() => {
              const cy = graph.current;
              if (cy) cy.zoom(cy.zoom() * 1.2);
            }}
          >
            <Plus size={17} />
          </Button>
          <Button
            variant="secondary"
            aria-label="Уменьшить"
            onClick={() => {
              const cy = graph.current;
              if (cy) cy.zoom(cy.zoom() / 1.2);
            }}
          >
            <Minus size={17} />
          </Button>
          <Button
            variant="secondary"
            aria-label="Показать весь граф"
            onClick={() => graph.current?.fit(undefined, 60)}
          >
            <Maximize size={17} />
          </Button>
        </div>
      </div>
      <Notice>
        Координаты — настройка вида, не физическое размещение. Раскладка хранится только в памяти
        frontend для пользователя и этой выборки; backend не изменяется. При обновлении наблюдений
        существующие позиции сохраняются без полной автораскладки.
      </Notice>
    </>
  );
}
