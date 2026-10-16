import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { api, unwrap } from '../../api/client';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Pagination,
  Facts,
} from '../../components/shared';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import LocationEditor from './LocationEditor';
import PlacementImport from './PlacementImport';
export default function Locations() {
  const auth = useAuth();
  const { params, update, offset } = useFilters();
  const parent = params.get('parent_id') || undefined;
  const query = useQuery({
    queryKey: ['locations', parent, offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/locations', {
          params: { query: { limit: 50, offset, parent_id: parent } },
          signal,
        }),
      ),
  });
  return (
    <>
      <PageHeader
        eyebrow="Физическая инфраструктура"
        title="Размещение"
        description="Площадки → здания → помещения → стойки → оборудование."
        actions={
          can(auth.session?.permissions, 'access.manage') && (
            <>
              <LocationEditor />
              <PlacementImport />
            </>
          )
        }
      />
      <Panel title="Локации" actions={<MapPin size={18} />}>
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              {
                header: 'Название',
                cell: ({ row }) => (
                  <Link className="entity-link" to={`/locations/${row.original.id}`}>
                    {row.original.name}
                  </Link>
                ),
              },
              { header: 'Тип', accessorKey: 'kind' },
              {
                header: 'Родитель',
                cell: ({ row }) =>
                  row.original.parent_id ? (
                    <Link to={`/locations/${row.original.parent_id}`}>
                      {row.original.parent_id}
                    </Link>
                  ) : (
                    '—'
                  ),
              },
              {
                header: 'Высота стойки',
                cell: ({ row }) =>
                  row.original.kind === 'rack' ? `${row.original.rack_units} U` : '—',
              },
            ]}
          />
          <Pagination
            offset={offset}
            count={query.data?.items?.length || 0}
            onChange={(n) => update('offset', n)}
          />
        </QueryState>
      </Panel>
    </>
  );
}
export function LocationDetail() {
  const auth = useAuth();
  const id = useParams().locationId || '';
  const query = useQuery({
    queryKey: ['location', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/locations/{id}', { params: { path: { id } }, signal })),
  });
  const rack = useQuery({
    queryKey: ['rack', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/locations/{id}/rack-layout', { params: { path: { id } }, signal }),
      ),
    enabled: query.data?.kind === 'rack',
  });
  return (
    <>
      <PageHeader
        eyebrow="Размещение / Локация"
        title={query.data?.name || id}
        description={query.data?.kind}
        actions={
          query.data &&
          can(auth.session?.permissions, 'access.manage') && <LocationEditor initial={query.data} />
        }
      />
      <Panel title="Расположение">
        <QueryState query={query}>
          <Facts
            values={{
              ID: id,
              Тип: query.data?.kind,
              Родитель: query.data?.parent_id,
              Ревизия: query.data?.revision,
            }}
          />
          {query.data?.kind !== 'rack' && (
            <Link className="entity-link" to={`/locations?parent_id=${id}`}>
              Дочерние локации →
            </Link>
          )}
        </QueryState>
      </Panel>
      {query.data?.kind === 'rack' && (
        <Panel
          title="Стойка · вид спереди"
          subtitle={`Занято ${rack.data?.occupied_units ?? '—'} U · свободно ${rack.data?.free_units ?? '—'} U`}
        >
          <QueryState query={rack}>
            <div className="rack-view">
              {Array.from(
                { length: query.data.rack_units },
                (_, i) => query.data!.rack_units - i,
              ).map((unit) => {
                const placement = rack.data?.placements.find(
                  (p) => unit >= p.start_unit && unit < p.start_unit + p.height_units,
                );
                return (
                  <div className={`rack-unit ${placement ? 'occupied' : ''}`} key={unit}>
                    <span>{unit}</span>
                    {placement ? (
                      <Link to={`/assets/${placement.asset_id}`}>
                        {placement.asset_id} · {placement.height_units} U
                      </Link>
                    ) : (
                      <i />
                    )}
                  </div>
                );
              })}
            </div>
          </QueryState>
        </Panel>
      )}
    </>
  );
}
