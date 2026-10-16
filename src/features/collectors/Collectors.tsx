import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import ManagedEditor from './ManagedEditor';
import { Button } from '../../components/ui/button';
import { collectorsQuery } from '../../api/queries';
import { api, unwrap } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Time,
  Facts,
  JsonView,
  Notice,
} from '../../components/shared';
export default function Collectors() {
  const query = useQuery(collectorsQuery);
  return (
    <>
      <PageHeader
        eyebrow="Сбор данных"
        title="Коллекторы"
        description="Исходящие gRPC-сессии сборщиков. Подключение не означает свежесть всех наблюдений."
      />
      <Panel title="Зарегистрированные коллекторы" actions={<Activity size={18} />}>
        <QueryState query={query}>
          <DataTable
            data={query.data?.items || []}
            columns={[
              {
                header: 'Коллектор',
                cell: ({ row }) => (
                  <Link
                    className="entity-link"
                    to={`/collectors/${encodeURIComponent(row.original.agent_id)}`}
                  >
                    {row.original.name || row.original.agent_id}
                  </Link>
                ),
              },
              { header: 'Agent ID', accessorKey: 'agent_id' },
              {
                header: 'Сессия',
                cell: ({ row }) => <Badge value={row.original.connected ? 'online' : 'offline'} />,
              },
              { header: 'Версия', accessorKey: 'version' },
              { header: 'Протокол', accessorKey: 'protocol_version' },
              {
                header: 'Последняя связь',
                cell: ({ row }) => <Time value={row.original.last_seen} />,
              },
            ]}
          />
        </QueryState>
      </Panel>
    </>
  );
}
export function CollectorDetail() {
  const id = useParams().collectorId || '';
  const auth = useAuth();
  const agents = useQuery(collectorsQuery);
  const [editing, setEditing] = useState(false);
  const agent = agents.data?.items?.find((a) => a.agent_id === id);
  const health = useQuery({
    queryKey: ['collector-health', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/agents/{id}/health', { params: { path: { id } }, signal })),
    refetchInterval: 15_000,
  });
  const config = useQuery({
    queryKey: ['collector-config', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/collectors/{id}/config', { params: { path: { id } }, signal })),
    enabled: can(auth.session?.permissions, 'access.manage'),
    refetchInterval: 10_000,
  });
  return (
    <>
      <PageHeader
        eyebrow="Коллекторы / Сессия"
        title={agent?.name || id}
        description="Agent ID сохраняется между запусками. Session ID относится к одному запуску."
        actions={
          can(auth.session?.permissions, 'access.manage') && (
            <Link className="entity-link" to={`/security/pki?agent_id=${encodeURIComponent(id)}`}>
              Сертификаты и аудит PKI
            </Link>
          )
        }
      />
      <Panel title="Состояние сессии">
        <Link
          className="entity-link"
          to={`/automation/commands?agent_id=${encodeURIComponent(id)}`}
        >
          Журнал команд этого коллектора →
        </Link>
        <QueryState query={agents}>
          <Facts
            values={{
              'Agent ID': id,
              'Session ID': agent?.session_id,
              Версия: agent?.version,
              Подключён: agent?.connected,
              'Последняя связь': agent?.last_seen,
            }}
          />
        </QueryState>
        <QueryState query={health}>
          <JsonView value={health.data} title="Heartbeat и health от backend" />
        </QueryState>
      </Panel>
      {can(auth.session?.permissions, 'access.manage') ? (
        <Panel
          title="Управляемая конфигурация"
          subtitle="Desired и applied — разные состояния"
          actions={
            <Button
              variant="secondary"
              disabled={
                !config.data?.backend_enabled ||
                !config.data?.remote_management_enabled ||
                !config.data?.managed_config_v1
              }
              onClick={() => setEditing(true)}
            >
              Редактировать Targets
            </Button>
          }
        >
          <QueryState query={config}>
            <div className="config-revisions">
              <div>
                <small>Требуемая ревизия</small>
                <strong>{config.data?.desired?.revision ?? '—'}</strong>
              </div>
              <span>→</span>
              <div>
                <small>Применённая ревизия</small>
                <strong>{config.data?.applied_revision ?? '—'}</strong>
              </div>
              <Badge value={config.data?.status} />
            </div>
            <Facts
              values={{
                'Backend B9': config.data?.backend_enabled,
                'Capability managed_config_v1': config.data?.managed_config_v1,
                'Local opt-in': config.data?.remote_management_enabled,
                'Подтверждено in_sync': config.data?.in_sync,
                'Ошибка применения': config.data?.error_code,
              }}
            />
            <DataTable
              data={config.data?.desired?.snapshot?.targets || []}
              columns={[
                { header: 'Target ID', accessorKey: 'target_id' },
                { header: 'Протокол', accessorKey: 'protocol' },
                { header: 'Разрешён', cell: ({ row }) => String(row.original.enabled) },
                {
                  header: 'Настройки',
                  cell: ({ row }) => <JsonView value={row.original} title="Target" />,
                },
              ]}
            />
          </QueryState>
        </Panel>
      ) : (
        <Notice>
          Просмотр backend-managed конфигурации требует access.manage. Состояние сессии доступно
          вашей роли.
        </Notice>
      )}
      {editing && config.data && (
        <ManagedEditor key={id} id={id} state={config.data} close={() => setEditing(false)} />
      )}
    </>
  );
}
