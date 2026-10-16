import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Server, ArrowUpRight } from 'lucide-react';
import { assetsQuery } from '../../api/queries';
import { type Model } from '../../api/client';
import { useFilters } from '../../hooks/useFilters';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Pagination,
  Time,
  Notice,
} from '../../components/shared';
export default function Assets() {
  const { params, update, offset } = useFilters();
  const kind = (params.get('kind') || undefined) as Model<'Asset'>['kind'];
  const scope = (params.get('scope') || 'all') as 'all' | 'real' | 'simulated';
  const query = useQuery(assetsQuery({ kind, scope, limit: 50, offset }));
  const search = params.get('q') || '';
  const items = (query.data?.items || []).filter(
    (a) =>
      !search ||
      [a.canonical_name, a.vendor, a.model, a.serial, a.id].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  return (
    <>
      <PageHeader
        eyebrow="Реестр инфраструктуры"
        title="Оборудование"
        description="Единые Assets из нескольких источников. Идентичность и сопоставление определяет backend."
      />
      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            aria-label="Поиск на странице"
            placeholder="Имя, модель, серийный номер…"
            value={search}
            onChange={(e) => update('q', e.target.value)}
          />
        </div>
        <select
          aria-label="Тип оборудования"
          value={kind || ''}
          onChange={(e) => update('kind', e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="host">Хост</option>
          <option value="network_device">Сетевое устройство</option>
          <option value="system">Система</option>
          <option value="bmc">BMC</option>
          <option value="chassis">Шасси</option>
          <option value="component">Компонент</option>
          <option value="unknown">Неизвестный</option>
        </select>
        <select
          aria-label="Происхождение"
          value={scope}
          onChange={(e) => update('scope', e.target.value)}
        >
          <option value="all">Все данные</option>
          <option value="real">Реальные</option>
          <option value="simulated">Симуляция</option>
        </select>
        <span className="toolbar-count">{query.data?.items?.length ?? '—'} на странице</span>
      </div>
      {search && (
        <Notice>
          Поиск по имени работает в пределах загруженной страницы: backend не предоставляет
          текстовый фильтр Assets. Тип и происхождение фильтруются на сервере.
        </Notice>
      )}
      <Panel>
        <QueryState query={query}>
          <DataTable
            data={items}
            columns={[
              {
                header: 'Оборудование',
                cell: ({ row }) => (
                  <Link className="name-cell" to={`/assets/${row.original.id}`}>
                    <span className="asset-icon">
                      <Server size={17} />
                    </span>
                    <span>
                      <strong>{row.original.canonical_name || row.original.id}</strong>
                      <small>{row.original.id}</small>
                    </span>
                  </Link>
                ),
              },
              { header: 'Тип', accessorKey: 'kind' },
              {
                header: 'Производитель / модель',
                cell: ({ row }) => (
                  <div>
                    {row.original.vendor || 'Не указан'}
                    <small className="cell-sub">{row.original.model || 'Модель не указана'}</small>
                  </div>
                ),
              },
              {
                header: 'Сопоставление',
                cell: ({ row }) => (
                  <Badge
                    value={row.original.resolution_status}
                    label={
                      row.original.resolution_status === 'resolved' ? 'Сопоставлено' : undefined
                    }
                  />
                ),
              },
              {
                header: 'Источники',
                cell: ({ row }) => (
                  <span className="count-chip">{row.original.source_count ?? '—'}</span>
                ),
              },
              {
                header: 'Происхождение',
                cell: ({ row }) => <Badge value={row.original.scope ? 'simulated' : 'real'} />,
              },
              { header: 'Обновлено', cell: ({ row }) => <Time value={row.original.updated_at} /> },
              {
                header: '',
                id: 'open',
                cell: ({ row }) => (
                  <Link
                    aria-label={`Открыть ${row.original.canonical_name}`}
                    to={`/assets/${row.original.id}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                ),
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
