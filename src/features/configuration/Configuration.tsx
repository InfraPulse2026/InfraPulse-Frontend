import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { GitCompareArrows, ShieldCheck } from 'lucide-react';
import { assetsQuery } from '../../api/queries';
import { api, unwrap, type Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { idempotencySlot } from '../../lib/idempotency';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Facts,
  Notice,
  ConfirmDialog,
  ErrorState,
  Time,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import ConfigurationSetup from './ConfigurationSetup';
import CancelAction from '../automation/CancelAction';
export default function Configuration() {
  const id = useParams().assetId;
  const navigate = useNavigate();
  const assets = useQuery(assetsQuery());
  return (
    <>
      <PageHeader
        eyebrow="Управление / Контроль изменений"
        title="Конфигурации и отклонения"
        description="Эталон, фактический снимок, разрешённое исправление и повторная проверка."
      />
      <div className="toolbar">
        <GitCompareArrows size={18} />
        <select
          aria-label="Выберите Asset для конфигурации"
          value={id || ''}
          onChange={(e) => {
            if (e.target.value) navigate(`/configuration/${e.target.value}`);
          }}
        >
          <option value="">Выберите оборудование…</option>
          {assets.data?.items?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.canonical_name || a.id}
            </option>
          ))}
        </select>
        <span className="muted">Backend предоставляет drift по конкретному Asset</span>
      </div>
      {id ? (
        <Drift key={id} id={id} />
      ) : (
        <Panel title="Выберите оборудование">
          <p className="panel-copy">
            В контракте нет общего списка drift. Выберите Asset, чтобы получить его проверенное
            состояние. Интерфейс не опрашивает все устройства скрыто.
          </p>
          <QueryState query={assets}>
            <DataTable
              data={assets.data?.items || []}
              columns={[
                {
                  header: 'Оборудование',
                  cell: ({ row }) => (
                    <Link className="entity-link" to={`/configuration/${row.original.id}`}>
                      {row.original.canonical_name || row.original.id}
                    </Link>
                  ),
                },
                { header: 'Производитель', accessorKey: 'vendor' },
                { header: 'Модель', accessorKey: 'model' },
              ]}
            />
          </QueryState>
        </Panel>
      )}
    </>
  );
}
function Drift({ id }: { id: string }) {
  const auth = useAuth();
  const client = useQueryClient();
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [review, setReview] = useState<Model<'ConfigurationRemediationInput'> | null>(null);
  const [getKey] = useState(idempotencySlot);
  const drift = useQuery({
    queryKey: ['drift', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/configuration/drift', { params: { path: { id } }, signal }),
      ),
    refetchInterval: 15_000,
  });
  const allowed = can(auth.session?.permissions, 'access.manage');
  const policy = useQuery({
    queryKey: ['remediation-policy', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/configuration/remediation-policy', {
          params: { path: { id } },
          signal,
        }),
      ),
    enabled: allowed,
  });
  const history = useQuery({
    queryKey: ['remediations', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/configuration/remediations', {
          params: { path: { id } },
          signal,
        }),
      ),
    refetchInterval: 5_000,
  });
  const create = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Отсутствует просмотренный запрос');
      return unwrap(
        await api.POST('/api/assets/{id}/configuration/remediations', {
          params: { path: { id }, header: { 'Idempotency-Key': getKey(review) } },
          body: review,
        }),
      );
    },
    onSuccess: () => {
      setConfirm(false);
      void client.invalidateQueries({ queryKey: ['remediations', id] });
    },
  });
  return (
    <>
      <Panel title="Состояние конфигурации" actions={<Badge value={drift.data?.status} />}>
        <QueryState query={drift}>
          <Facts
            values={{
              Asset: id,
              Состояние: drift.data?.status,
              Причина: drift.data?.reason,
              'Свежие данные': drift.data?.fresh,
              'Эталонная ревизия': drift.data?.latest?.baseline_revision,
              'Снимок фактического состояния': drift.data?.latest?.actual_snapshot_id,
              Сравнено: drift.data?.latest?.compared_at,
            }}
          />
          <DataTable
            data={drift.data?.latest?.changes || []}
            columns={[
              {
                header: 'Контекст / интерфейс',
                cell: ({ row }) => row.original.interface || row.original.path || '—',
              },
              { header: 'Изменение', accessorKey: 'kind' },
              {
                header: 'Ожидаемый VLAN',
                cell: ({ row }) => (
                  <span className="diff-expected">
                    {row.original.expected_vlan ?? 'Нет данных'}
                  </span>
                ),
              },
              {
                header: 'Фактический VLAN',
                cell: ({ row }) => (
                  <span className="diff-actual">{row.original.actual_vlan ?? 'Нет данных'}</span>
                ),
              },
              {
                header: 'Редактировано',
                cell: ({ row }) => (row.original.redacted ? 'Чувствительные данные скрыты' : '—'),
              },
            ]}
          />
          {drift.data?.latest?.truncated && (
            <Notice>
              Backend ограничил список изменений. Всего контекстов:{' '}
              {drift.data.latest.total_changes}.
            </Notice>
          )}
        </QueryState>
      </Panel>
      {allowed && <ConfigurationSetup id={id} />}
      {drift.data?.latest?.proposal && (
        <Panel title="Разрешённое предложение" actions={<ShieldCheck size={18} />}>
          <Facts
            values={{
              Действие: drift.data.latest.proposal.action,
              Интерфейс: drift.data.latest.proposal.interface,
              'Сейчас VLAN': drift.data.latest.proposal.actual_vlan,
              'Восстановить VLAN': drift.data.latest.proposal.expected_vlan,
            }}
          />
          <Notice>
            {drift.data.latest.proposal.limitation ||
              'Требуются policy, актуальное evidence и отдельное одобрение администратора.'}
          </Notice>
          {allowed ? (
            <>
              <QueryState query={policy}>
                <label className="reason-field">
                  Причина запроса
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    minLength={3}
                    maxLength={512}
                    placeholder="Почему требуется исправление"
                  />
                </label>
                <Button
                  disabled={
                    !policy.data?.enabled ||
                    !drift.data.fresh ||
                    reason.trim().length < 3 ||
                    create.isPending ||
                    !!create.data
                  }
                  onClick={() => {
                    if (drift.data?.latest?.id && policy.data?.revision) {
                      setReview({
                        drift_result_id: drift.data.latest.id,
                        policy_revision: policy.data.revision,
                        reason,
                      });
                      setConfirm(true);
                    }
                  }}
                >
                  Создать запрос на одобрение
                </Button>
              </QueryState>
            </>
          ) : (
            <Notice>
              Для этого экрана требуется просмотр закрытой policy администратором. Ваша роль не
              может получить её ревизию.
            </Notice>
          )}
        </Panel>
      )}
      <Panel
        title="Запросы исправления"
        subtitle="Только verified означает подтверждённое повторным чтением соответствие"
      >
        <QueryState query={history}>
          <DataTable
            data={history.data?.items || []}
            columns={[
              {
                header: 'Запрос',
                cell: ({ row }) => (
                  <Link className="entity-link" to={`/automation/remediations/${row.original.id}`}>
                    {row.original.id}
                  </Link>
                ),
              },
              { header: 'Действие', accessorKey: 'action' },
              { header: 'Интерфейс', accessorKey: 'interface' },
              { header: 'Состояние', cell: ({ row }) => <Badge value={row.original.state} /> },
              { header: 'Создан', cell: ({ row }) => <Time value={row.original.created_at} /> },
            ]}
          />
        </QueryState>
      </Panel>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Создать запрос исправления?"
        description="Это сохранит конкретное предложение backend. Выполнение начнётся только после отдельного административного одобрения."
        onConfirm={() => create.mutate()}
        pending={create.isPending}
        error={create.error}
      >
        <Facts
          values={{
            Asset: id,
            'Drift result': review?.drift_result_id,
            'Policy revision': review?.policy_revision,
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </>
  );
}
export function RemediationDetail() {
  const id = useParams().remediationId || '';
  const auth = useAuth();
  const client = useQueryClient();
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [review, setReview] = useState<{
    record: Model<'ConfigurationRemediation'>;
    reason: string;
  } | null>(null);
  const [getKey] = useState(idempotencySlot);
  const query = useQuery({
    queryKey: ['remediation', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/configuration/remediations/{remediation_id}', {
          params: { path: { remediation_id: id } },
          signal,
        }),
      ),
    refetchInterval: 3_000,
  });
  const approve = useMutation({
    mutationFn: async () => {
      if (!review?.record.revision) throw new Error('Нет просмотренной ревизии запроса');
      const body = {
        expected_revision: review.record.revision,
        confirmed: true as const,
        timeout_seconds: 120,
        reason: review.reason,
      };
      return unwrap(
        await api.POST('/api/configuration/remediations/{remediation_id}/approve', {
          params: { path: { remediation_id: id }, header: { 'Idempotency-Key': getKey(body) } },
          body,
        }),
      );
    },
    onSuccess: () => {
      setConfirm(false);
      void client.invalidateQueries({ queryKey: ['remediation', id] });
    },
  });
  const item = query.data;
  return (
    <>
      <PageHeader
        eyebrow="Автоматизация / Контролируемое исправление"
        title="Запрос исправления"
        description={id}
        actions={<Badge value={item?.state} />}
      />
      <QueryState query={query}>
        <Panel title="Неизменяемый контекст действия">
          <Facts
            values={{
              Asset: item?.asset_id,
              Действие: item?.action,
              Интерфейс: item?.interface,
              'Фактический VLAN': item?.actual_vlan,
              'Ожидаемый VLAN': item?.expected_vlan,
              'Эталонная ревизия': item?.baseline_revision,
              'Policy revision': item?.policy_revision,
              Снимок: item?.actual_snapshot_id,
              'Автор запроса': item?.requester_id,
              Причина: item?.reason,
              Approver: item?.approver_id,
              Ошибка: item?.error_code,
              'Проверка drift result': item?.verification_drift_result_id,
            }}
          />
          {item?.automation_job_id && (
            <Link className="entity-link" to={`/automation/jobs/${item.automation_job_id}`}>
              Задание Ansible →
            </Link>
          )}
          <Notice>
            Queued, running и успешный job не заменяют verified. Backend повторно проверяет права,
            ревизии, policy и свежесть перед исполнением.
          </Notice>
        </Panel>
        {can(auth.session?.permissions, 'access.manage') && item?.state === 'pending_approval' && (
          <Panel title="Одобрение администратора">
            <label className="reason-field">
              Обоснование одобрения
              <input
                maxLength={512}
                minLength={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <Button
              disabled={reason.trim().length < 3 || approve.isPending}
              onClick={() => {
                if (item) {
                  setReview({ record: structuredClone(item), reason });
                  setConfirm(true);
                }
              }}
            >
              Проверить и одобрить действие
            </Button>
          </Panel>
        )}
      </QueryState>
      {approve.error && <ErrorState error={approve.error} />}
      {can(auth.session?.permissions, 'commands.write') &&
        item &&
        ['pending_approval', 'queued', 'running'].includes(item.state || '') && (
          <CancelAction key={id} id={id} revision={item.revision} kind="remediation" />
        )}
      <ConfirmDialog
        title="Одобрить изменение оборудования?"
        description="Разрешается только показанное действие для этого интерфейса. Backend проверит снимок и ограничения повторно. Автоматического повтора при конфликте не будет."
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => approve.mutate()}
        pending={approve.isPending}
        error={approve.error}
        confirmLabel="Одобряю это изменение"
      >
        <Facts
          values={{
            Asset: review?.record.asset_id,
            Интерфейс: review?.record.interface,
            'Из VLAN': review?.record.actual_vlan,
            'В VLAN': review?.record.expected_vlan,
            Revision: review?.record.revision,
          }}
        />
      </ConfirmDialog>
    </>
  );
}
export type Remediation = Model<'ConfigurationRemediation'>;
