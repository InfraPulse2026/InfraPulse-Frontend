import { lazy, Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Network, GitCompareArrows } from 'lucide-react';
import { api, unwrap, type Model } from '../../api/client';
import { useFilters } from '../../hooks/useFilters';
import {
  PageHeader,
  Panel,
  QueryState,
  Badge,
  Tabs,
  Facts,
  DataTable,
  Time,
  JsonView,
  CopyId,
  Empty,
  Notice,
  Pagination,
} from '../../components/shared';
import { measurement, text } from '../../lib/format';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import PlacementEditor from '../locations/PlacementEditor';
import IdentityReview from './IdentityReview';
const HardwareHistory = lazy(() => import('./HardwareHistory'));
const Metrics = lazy(() => import('../metrics/Metrics'));
const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'sources', label: 'Источники и идентичность' },
  { value: 'inventory', label: 'Инвентаризация' },
  { value: 'metrics', label: 'Метрики' },
  { value: 'hardware', label: 'Аппаратное здоровье' },
  { value: 'logs', label: 'Логи' },
  { value: 'location', label: 'Размещение' },
];
export default function AssetDetail() {
  const id = useParams().assetId || '';
  const { params, update } = useFilters();
  const tab = params.get('tab') || 'overview';
  const asset = useQuery({
    queryKey: ['asset', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/assets/{id}', { params: { path: { id } }, signal })),
  });
  return (
    <>
      <PageHeader
        eyebrow="Оборудование / Карточка Asset"
        title={asset.data?.canonical_name || id}
        description={<CopyId value={id} />}
        actions={
          <>
            <Link
              className="button button-secondary"
              to={`/topology?asset_id=${encodeURIComponent(id)}`}
            >
              <Network size={16} />
              На карте
            </Link>
            <Link className="button button-secondary" to={`/configuration/${id}`}>
              <GitCompareArrows size={16} />
              Конфигурация
            </Link>
          </>
        }
      />
      <QueryState query={asset}>
        <div className="asset-summary">
          <span className="source-badge">{asset.data?.vendor || 'Производитель не указан'}</span>
          <span>{asset.data?.model || 'Модель не указана'}</span>
          <Badge
            value={asset.data?.resolution_status}
            label={asset.data?.resolution_status === 'resolved' ? 'Сопоставлено' : undefined}
          />
          <Badge value={asset.data?.scope ? 'simulated' : 'real'} />
          <span className="muted">{asset.data?.source_count ?? '—'} привязок источников</span>
        </div>
        {asset.data?.lifecycle_status === 'merged' && (
          <Notice>
            Эта карточка стала историческим alias.
            {asset.data.merged_into_id && (
              <Link
                className="entity-link"
                to={`/assets/${encodeURIComponent(asset.data.merged_into_id)}?tab=sources`}
              >
                {' '}
                Открыть канонический Asset →
              </Link>
            )}
          </Notice>
        )}
      </QueryState>
      <Tabs items={tabs} active={tab} onChange={(v) => update('tab', v)} />
      {tab === 'overview' && (
        <Panel title="Идентичность оборудования">
          <Facts
            values={{
              Имя: asset.data?.canonical_name,
              Тип: asset.data?.kind,
              Производитель: asset.data?.vendor,
              Модель: asset.data?.model,
              'Серийный номер': asset.data?.serial,
              Firmware: asset.data?.firmware_version,
              Software: asset.data?.software_version,
              'Жизненный цикл': asset.data?.lifecycle_status,
              Ревизия: asset.data?.revision,
            }}
          />
          <Notice>
            Inventory lifecycle и resolution не являются состоянием online. Доступность и аппаратное
            здоровье смотрите в соответствующих наблюдениях.
          </Notice>
          <Link className="entity-link" to={`/incidents?asset_id=${encodeURIComponent(id)}`}>
            Связанные инциденты →
          </Link>
        </Panel>
      )}
      {tab === 'sources' && <AssetSources key={id} id={id} />}{' '}
      {tab === 'inventory' && <Inventory id={id} />} {tab === 'hardware' && <Hardware id={id} />}{' '}
      {tab === 'metrics' && (
        <Suspense fallback={<Empty title="Подготавливаем графики…" />}>
          <Metrics key={id} id={id} />
        </Suspense>
      )}
      {tab === 'logs' && <AssetLogs id={id} />} {tab === 'location' && <Placement id={id} />}
    </>
  );
}
function AssetSources({ id }: { id: string }) {
  const [identityOffset, setIdentityOffset] = useState(0);
  const query = useQuery({
    queryKey: ['asset-sources', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/sources', {
          params: { path: { id }, query: { limit: 50 } },
          signal,
        }),
      ),
  });
  const identities = useQuery({
    queryKey: ['asset-identities', id, identityOffset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/identities', {
          params: { path: { id }, query: { limit: 50, offset: identityOffset } },
          signal,
        }),
      ),
  });
  return (
    <>
      <Panel title="Источник каждого наблюдения">
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              { header: 'Источник', accessorKey: 'source_name' },
              { header: 'Тип', accessorKey: 'source_type' },
              { header: 'Внешний объект', accessorKey: 'external_id' },
              { header: 'Уверенность', accessorKey: 'confidence' },
              {
                header: 'Происхождение',
                cell: ({ row }) => <Badge value={row.original.provenance} />,
              },
              {
                header: 'Последнее наблюдение',
                cell: ({ row }) => <Time value={row.original.last_seen} />,
              },
              {
                header: 'Evidence',
                cell: ({ row }) => <JsonView value={row.original} title="Binding" />,
              },
            ]}
          />
        </QueryState>
      </Panel>
      <Panel title="Идентификаторы и доказательства">
        <QueryState query={identities}>
          <DataTable
            data={identities.data?.items || []}
            columns={[
              { header: 'Тип', accessorKey: 'kind' },
              { header: 'Значение источника', accessorKey: 'value' },
              { header: 'Нормализовано', accessorKey: 'normalized_value' },
              { header: 'Binding', accessorKey: 'binding_id' },
              { header: 'Субъект', accessorKey: 'subject_id' },
              { header: 'Уверенность', accessorKey: 'confidence' },
              {
                header: 'Текущее / пригодно',
                cell: ({ row }) => (
                  <Facts
                    values={{
                      Текущее: row.original.current,
                      'Пригодно по синтаксису': row.original.usable,
                    }}
                  />
                ),
              },
              {
                header: 'Наблюдалось',
                cell: ({ row }) => <Time value={row.original.observed_at} />,
              },
            ]}
          />
          <Notice>
            Usable означает пригодность нормализованного значения, а не доказательство уникальности.
            Идентификаторы компонентов и интерфейсов не становятся идентичностью корневого
            устройства.
          </Notice>
          <Pagination
            offset={identityOffset}
            count={identities.data?.items?.length || 0}
            onChange={setIdentityOffset}
          />
        </QueryState>
      </Panel>
      <IdentityReview key={id} id={id} />
    </>
  );
}
function Inventory({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ['inventory', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/resolved-inventory', { params: { path: { id } }, signal }),
      ),
  });
  return (
    <Panel title="Сводная инвентаризация" actions={<Badge value={query.data?.status} />}>
      <QueryState query={query}>
        <DataTable
          data={Object.entries(query.data?.attributes || {}).map(([name, a]) => ({ name, ...a }))}
          columns={[
            { header: 'Свойство', accessorKey: 'name' },
            {
              header: 'Значение',
              cell: ({ row }) => <span>{text(row.original.value, 'Нет данных')}</span>,
            },
            { header: 'Качество', cell: ({ row }) => <Badge value={row.original.status} /> },
            {
              header: 'Источник и claims',
              cell: ({ row }) => <JsonView value={row.original.claims} title="Происхождение" />,
            },
          ]}
        />
        {query.data?.missing?.length ? (
          <Notice>Отсутствуют: {query.data.missing.join(', ')}</Notice>
        ) : null}
      </QueryState>
    </Panel>
  );
}
function Hardware({ id }: { id: string }) {
  const [selected, setSelected] = useState<Model<'AssetHardwareItem'> | null>(null);
  const { offset, update } = useFilters();
  const query = useQuery({
    queryKey: ['hardware', id, offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/hardware', {
          params: { path: { id }, query: { limit: 50, offset, include_related: true } },
          signal,
        }),
      ),
    refetchInterval: 30_000,
  });
  return (
    <>
      <Panel
        title="Аппаратные наблюдения"
        subtitle="Health, power и freshness сохраняют отдельный смысл"
      >
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              {
                header: 'Компонент',
                cell: ({ row }) => (
                  <div>
                    <strong>{row.original.name || row.original.resource_id}</strong>
                    <small className="cell-sub">
                      {row.original.resource_type || row.original.kind}
                    </small>
                  </div>
                ),
              },
              {
                header: 'Значение',
                cell: ({ row }) => measurement(row.original.value, row.original.unit),
              },
              { header: 'Health', cell: ({ row }) => <Badge value={row.original.health} /> },
              { header: 'Power', accessorKey: 'power_state' },
              {
                header: 'Актуальность',
                cell: ({ row }) => <Badge value={row.original.freshness} />,
              },
              { header: 'Источник', accessorKey: 'source_name' },
              {
                header: 'Наблюдение',
                cell: ({ row }) => <Time value={row.original.observed_at} />,
              },
              {
                header: 'История',
                cell: ({ row }) => (
                  <button className="text-link" onClick={() => setSelected(row.original)}>
                    Открыть →
                  </button>
                ),
              },
              {
                header: 'Evidence',
                cell: ({ row }) => <JsonView value={row.original} title="Детали" />,
              },
            ]}
          />
          <div className="pagination">
            <span>{query.data?.has_more ? 'Есть ещё наблюдения' : 'Конец выборки'}</span>
            <button disabled={!offset} onClick={() => update('offset', Math.max(0, offset - 50))}>
              ← Назад
            </button>
            <button disabled={!query.data?.has_more} onClick={() => update('offset', offset + 50)}>
              Далее →
            </button>
          </div>
          {query.data?.relations_truncated && (
            <Notice>
              Backend ограничил набор связей. Часть связанных компонентов не вошла в ответ.
            </Notice>
          )}
        </QueryState>
      </Panel>
      {selected && (
        <Suspense fallback={<Empty title="Загрузка истории…" />}>
          <HardwareHistory
            key={id + ':' + selected.observation_key}
            id={id}
            observation={selected}
          />
        </Suspense>
      )}
    </>
  );
}
function AssetLogs({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ['asset-logs', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/logs', {
          params: { path: { id }, query: { limit: 50 } },
          signal,
        }),
      ),
  });
  return (
    <Panel title="Последние логи Asset">
      <QueryState query={query}>
        <JsonView value={query.data} title="Наблюдения и source attribution" />
        <Link to="/logs" className="entity-link">
          Открыть поиск в логах →
        </Link>
      </QueryState>
    </Panel>
  );
}
function Placement({ id }: { id: string }) {
  const auth = useAuth();
  const query = useQuery({
    queryKey: ['placement', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/assets/{id}/placement', { params: { path: { id } }, signal })),
  });
  return (
    <Panel
      title="Физическое размещение"
      actions={
        query.data &&
        can(auth.session?.permissions, 'access.manage') && <PlacementEditor initial={query.data} />
      }
    >
      <QueryState query={query}>
        <Facts
          values={{
            Размещение: query.data?.mode,
            Путь: query.data?.path.map((l) => l.name).join(' / '),
            'Начальный юнит': query.data?.start_unit,
            'Высота, U': query.data?.height_units,
            Позиция: query.data?.position,
          }}
        />
        {query.data?.location_id && (
          <Link className="entity-link" to={`/locations/${query.data.location_id}`}>
            Открыть локацию →
          </Link>
        )}
      </QueryState>
    </Panel>
  );
}
export type Binding = Model<'AssetSourceBinding'>;
