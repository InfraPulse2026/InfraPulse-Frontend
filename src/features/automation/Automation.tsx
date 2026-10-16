import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import { api, unwrap } from '../../api/client';
import { assetsQuery } from '../../api/queries';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import CancelAction from './CancelAction';
import TargetSetup from './TargetSetup';
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
export default function Automation() {
  const { params, update } = useFilters();
  const id = params.get('asset_id') || '';
  const assets = useQuery(assetsQuery());
  const auth = useAuth();
  const jobs = useQuery({
    queryKey: ['automation-jobs', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/automation/jobs', { params: { path: { id } }, signal }),
      ),
    enabled: !!id,
    refetchInterval: 5_000,
  });
  const workers = useQuery({
    queryKey: ['automation-workers'],
    queryFn: async ({ signal }) => unwrap(await api.GET('/api/automation/workers', { signal })),
    enabled: can(auth.session?.permissions, 'access.manage'),
    refetchInterval: 15_000,
  });
  return (
    <>
      <PageHeader
        eyebrow="Управление / Исполнение"
        title="Автоматизация"
        description="Разрешённые задания Ansible и состояние Linux workers."
        actions={
          <Link className="entity-link" to="/automation/commands">
            Команды и откат Agent →
          </Link>
        }
      />
      <div className="toolbar">
        <Workflow size={17} />
        <select
          aria-label="Оборудование для списка заданий"
          value={id}
          onChange={(e) => update('asset_id', e.target.value)}
        >
          <option value="">Выберите Asset…</option>
          {assets.data?.items?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.canonical_name || a.id}
            </option>
          ))}
        </select>
      </div>
      {id ? (
        <Panel title="Задания выбранного Asset">
          <QueryState query={jobs}>
            <DataTable
              data={jobs.data?.items || []}
              columns={[
                {
                  header: 'Задание',
                  cell: ({ row }) => (
                    <Link className="entity-link" to={`/automation/jobs/${row.original.id}`}>
                      {row.original.id}
                    </Link>
                  ),
                },
                { header: 'Шаблон', accessorKey: 'template_id' },
                { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
                { header: 'Создано', cell: ({ row }) => <Time value={row.original.created_at} /> },
                { header: 'Код ошибки', accessorKey: 'error_code' },
              ]}
            />
          </QueryState>
        </Panel>
      ) : (
        <Notice>
          Общего списка всех automation jobs в API нет. Выберите оборудование или откройте job из
          конкретного запроса исправления.
        </Notice>
      )}
      {can(auth.session?.permissions, 'access.manage') && (
        <Panel title="Linux workers">
          <QueryState query={workers}>
            <DataTable
              data={workers.data?.items || []}
              columns={[
                {
                  header: 'Worker',
                  cell: ({ row }) => (
                    <JsonView value={row.original} title="Worker / capabilities / heartbeat" />
                  ),
                },
              ]}
            />
          </QueryState>
        </Panel>
      )}
      {id && can(auth.session?.permissions, 'access.manage') && <TargetSetup key={id} id={id} />}
    </>
  );
}
export function AutomationDetail() {
  const id = useParams().jobId || '';
  return <AutomationJobDetail key={id} id={id} />;
}
function AutomationJobDetail({ id }: { id: string }) {
  const [snapshot, setSnapshot] = useState(false);
  const auth = useAuth();
  const job = useQuery({
    queryKey: ['automation-job', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/automation/jobs/{job_id}', {
          params: { path: { job_id: id } },
          signal,
        }),
      ),
    refetchInterval: (q) =>
      ['queued', 'running'].includes(q.state.data?.state || '') ? 3_000 : false,
  });
  const events = useQuery({
    queryKey: ['automation-events', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/automation/jobs/{job_id}/events', {
          params: { path: { job_id: id } },
          signal,
        }),
      ),
    refetchInterval: 5_000,
  });
  const content = useQuery({
    queryKey: ['snapshot-content', snapshot ? job.data?.snapshot_id : undefined],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/automation/snapshots/{snapshot_id}/content', {
          params: { path: { snapshot_id: job.data?.snapshot_id || '' } },
          signal,
        }),
      ),
    enabled: snapshot && !!job.data?.snapshot_id && can(auth.session?.permissions, 'access.manage'),
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  return (
    <>
      <PageHeader
        eyebrow="Автоматизация / Задание"
        title="Исполнение Ansible"
        description={id}
        actions={<Badge value={job.data?.state} />}
      />
      <Panel title="Состояние задания">
        <QueryState query={job}>
          <Facts
            values={{
              Asset: job.data?.asset_id,
              Шаблон: job.data?.template_id,
              'Target revision': job.data?.target_revision,
              Причина: job.data?.reason,
              Ошибка: job.data?.error_code,
              Снимок: job.data?.snapshot_id,
            }}
          />
          <Notice>
            Для remediation состояние succeeded у job не равно verified у запроса. Итог проверяется
            отдельным workflow backend.
          </Notice>
        </QueryState>
      </Panel>
      <Panel title="События исполнения">
        <QueryState query={events}>
          <DataTable
            data={events.data?.items || []}
            columns={[
              {
                header: 'Событие',
                cell: ({ row }) => <JsonView value={row.original} title="Событие backend" />,
              },
            ]}
          />
        </QueryState>
      </Panel>
      {can(auth.session?.permissions, 'commands.write') &&
        ['queued', 'running'].includes(job.data?.state || '') && (
          <CancelAction key={id} id={id} kind="job" />
        )}
      {can(auth.session?.permissions, 'access.manage') && job.data?.snapshot_id && (
        <Panel title="Закрытый снимок конфигурации">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={snapshot}
              onChange={(e) => setSnapshot(e.target.checked)}
            />
            Открыть конфигурацию с административным аудитом
          </label>
          {snapshot && (
            <QueryState query={content}>
              <JsonView value={content.data} title="Содержимое снимка" />
            </QueryState>
          )}
        </Panel>
      )}
    </>
  );
}
