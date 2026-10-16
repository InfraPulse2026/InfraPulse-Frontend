import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { idempotencySlot } from '../../lib/idempotency';
import { Button } from '../../components/ui/button';
import {
  Badge,
  ConfirmDialog,
  DataTable,
  Drawer,
  Facts,
  Notice,
  Pagination,
  Panel,
  QueryState,
  Time,
} from '../../components/shared';

export default function IdentityReview({ id }: { id: string }) {
  const auth = useAuth();
  const [editing, setEditing] = useState<{ operation: 'merge' | 'split'; other?: string } | null>(
    null,
  );
  const [offset, setOffset] = useState(0);
  const [eventOffset, setEventOffset] = useState(0);
  const asset = useQuery({
    queryKey: ['asset', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/assets/{id}', { params: { path: { id } }, signal })),
  });
  const bindings = useQuery({
    queryKey: ['identity-bindings', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/sources', {
          params: { path: { id }, query: { limit: 200, offset: 0 } },
          signal,
        }),
      ),
    staleTime: 0,
  });
  const candidates = useQuery({
    queryKey: ['asset-candidates', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/candidates', {
          params: { path: { id }, query: { limit: 50 } },
          signal,
        }),
      ),
  });
  const decisions = useQuery({
    queryKey: ['asset-decisions', id, offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/decisions', {
          params: { path: { id }, query: { limit: 50, offset } },
          signal,
        }),
      ),
  });
  const events = useQuery({
    queryKey: ['asset-resolution', id, eventOffset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/resolution-events', {
          params: { path: { id }, query: { limit: 50, offset: eventOffset } },
          signal,
        }),
      ),
  });
  const allowed =
    can(auth.session?.permissions, 'access.manage') && asset.data?.lifecycle_status === 'observed';
  const complete =
    asset.data?.source_count !== undefined &&
    bindings.data?.items?.length === asset.data.source_count;
  return (
    <>
      <Panel
        title="Проверка сопоставления"
        actions={
          <>
            <Button
              variant="secondary"
              disabled={asset.isFetching || bindings.isFetching}
              onClick={() => {
                void asset.refetch();
                void bindings.refetch();
                void candidates.refetch();
                void decisions.refetch();
                void events.refetch();
              }}
            >
              Перечитать сведения
            </Button>
            {allowed && (
              <>
                <Button
                  variant="secondary"
                  disabled={!complete || !bindings.data?.items?.length || bindings.isFetching}
                  onClick={() => setEditing({ operation: 'merge' })}
                >
                  Объединить Assets
                </Button>
                <Button
                  variant="secondary"
                  disabled={
                    !complete || (bindings.data?.items?.length || 0) < 2 || bindings.isFetching
                  }
                  onClick={() => setEditing({ operation: 'split' })}
                >
                  Отделить источники
                </Button>
              </>
            )}
          </>
        }
      >
        <Notice>
          Кандидаты вычислены backend и служат подсказкой для проверки. Совпадение идентификатора и
          confidence не доказывают уникальность физического устройства. Ручные решения доступны
          администратору.
        </Notice>
        {allowed && !complete && (
          <Notice>
            Для изменения нужен полный список привязок. Здесь загружено не более 200; если список
            неполный или source_count неизвестен, отправка решения заблокирована.
          </Notice>
        )}
        <QueryState query={bindings}>
          <small>
            Загружено привязок: {bindings.data?.items?.length ?? '—'} /{' '}
            {asset.data?.source_count ?? 'неизвестно'}
          </small>
        </QueryState>
        <QueryState query={candidates}>
          <DataTable
            data={candidates.data?.items || []}
            columns={[
              {
                header: 'Кандидат',
                cell: ({ row }) =>
                  row.original.asset?.id ? (
                    <Link
                      className="entity-link"
                      to={`/assets/${encodeURIComponent(row.original.asset?.id || '')}`}
                    >
                      {row.original.asset?.canonical_name || row.original.asset?.id}
                    </Link>
                  ) : (
                    'Asset ID не предоставлен'
                  ),
              },
              {
                header: 'Совпадения',
                cell: ({ row }) => row.original.comparison?.matches?.join(', ') || 'Не сообщены',
              },
              {
                header: 'Конфликты',
                cell: ({ row }) => row.original.comparison?.conflicts?.join(', ') || 'Не сообщены',
              },
              {
                header: 'Сильное совпадение',
                cell: ({ row }) =>
                  row.original.comparison?.strong_match === undefined
                    ? 'Неизвестно'
                    : row.original.comparison.strong_match
                      ? 'Да'
                      : 'Нет',
              },
              {
                header: 'Ранее разделены',
                cell: ({ row }) =>
                  row.original.blocked_by_decision === undefined
                    ? 'Неизвестно'
                    : row.original.blocked_by_decision
                      ? 'Да'
                      : 'Нет',
              },
              ...(allowed
                ? [
                    {
                      header: 'Проверить',
                      cell: ({ row }: { row: { original: Model<'AssetCandidate'> } }) => (
                        <Button
                          variant="secondary"
                          disabled={!complete || !row.original.asset?.id}
                          onClick={() =>
                            setEditing({ operation: 'merge', other: row.original.asset?.id })
                          }
                        >
                          Сравнить для объединения
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </QueryState>
        {candidates.data?.items?.length === 50 && (
          <Notice>Показаны первые 50 кандидатов backend.</Notice>
        )}
      </Panel>
      <Panel title="Решения о сопоставлении">
        <QueryState query={decisions}>
          <DataTable
            data={decisions.data?.items || []}
            columns={[
              { header: 'Решение', accessorKey: 'id' },
              {
                header: 'Операция',
                cell: ({ row }) =>
                  row.original.operation === 'merge'
                    ? 'Объединение'
                    : row.original.operation === 'split'
                      ? 'Разделение'
                      : 'Неизвестно',
              },
              { header: 'Источник', accessorKey: 'source_id' },
              {
                header: 'Результирующий Asset',
                cell: ({ row }) =>
                  row.original.target_id ? (
                    <Link
                      className="entity-link"
                      to={`/assets/${encodeURIComponent(row.original.target_id)}`}
                    >
                      {row.original.target_id}
                    </Link>
                  ) : (
                    'Не указан'
                  ),
              },
              { header: 'Причина', accessorKey: 'reason' },
              { header: 'Автор', accessorKey: 'actor_id' },
              { header: 'Время', cell: ({ row }) => <Time value={row.original.created_at} /> },
            ]}
          />
        </QueryState>
        <Pagination
          offset={offset}
          count={decisions.data?.items?.length || 0}
          onChange={setOffset}
        />
      </Panel>
      <Panel title="События разрешения идентичности">
        <QueryState query={events}>
          <DataTable
            data={events.data?.items || []}
            columns={[
              { header: 'Статус', cell: ({ row }) => <Badge value={row.original.code} /> },
              { header: 'Binding', accessorKey: 'binding_id' },
              { header: 'Source Asset', accessorKey: 'source_asset_id' },
              { header: 'Target Asset', accessorKey: 'target_asset_id' },
              { header: 'Fact ID', accessorKey: 'fact_id' },
              {
                header: 'Наблюдалось',
                cell: ({ row }) => <Time value={row.original.source_observed_at} />,
              },
              { header: 'Сохранено', cell: ({ row }) => <Time value={row.original.created_at} /> },
            ]}
          />
        </QueryState>
        <Pagination
          offset={eventOffset}
          count={events.data?.items?.length || 0}
          onChange={setEventOffset}
        />
      </Panel>
      <Drawer
        title={
          editing?.operation === 'split' ? 'Разделение источников Asset' : 'Объединение Assets'
        }
        open={!!editing}
        onClose={() => setEditing(null)}
      >
        {editing && asset.data && (
          <DecisionForm
            key={`${id}:${editing.operation}`}
            operation={editing.operation}
            other={editing.other}
            current={asset.data}
            bindings={bindings.data?.items || []}
          />
        )}
      </Drawer>
    </>
  );
}

type Review =
  | { operation: 'merge'; body: Model<'AssetMergeInput'> }
  | { operation: 'split'; body: Model<'AssetSplitInput'> };
function DecisionForm({
  operation,
  other,
  current,
  bindings,
}: {
  operation: 'merge' | 'split';
  other?: string;
  current: Model<'Asset'>;
  bindings: Model<'AssetSourceBinding'>[];
}) {
  const client = useQueryClient();
  const [base] = useState(() => ({
    asset: structuredClone(current),
    bindings: structuredClone(bindings),
  }));
  const [draft, setDraft] = useState(other || '');
  const [loaded, setLoaded] = useState(other || '');
  const [selected, setSelected] = useState<string[]>([]);
  const [canonical, setCanonical] = useState('');
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Review | null>(null);
  const [key] = useState(idempotencySlot);
  const remote = useQuery({
    queryKey: ['identity-compare', loaded],
    enabled: operation === 'merge' && !!loaded && loaded !== base.asset.id,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const asset = unwrap(
        await api.GET('/api/assets/{id}', { params: { path: { id: loaded } }, signal }),
      );
      const sources = unwrap(
        await api.GET('/api/assets/{id}/sources', {
          params: { path: { id: loaded }, query: { limit: 200, offset: 0 } },
          signal,
        }),
      );
      const placement = unwrap(
        await api.GET('/api/assets/{id}/placement', { params: { path: { id: loaded } }, signal }),
      );
      return { asset, sources, placement };
    },
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала просмотрите решение');
      return review.operation === 'merge'
        ? unwrap(
            await api.POST('/api/assets/merge', {
              params: { header: { 'Idempotency-Key': key(review) } },
              body: review.body,
            }),
          )
        : unwrap(
            await api.POST('/api/assets/split', {
              params: { header: { 'Idempotency-Key': key(review) } },
              body: review.body,
            }),
          );
    },
    onSuccess: () => {
      setReview(null);
      for (const q of [
        'assets',
        'asset',
        'asset-sources',
        'identity-bindings',
        'asset-identities',
        'asset-candidates',
        'asset-decisions',
        'asset-resolution',
        'inventory',
        'topology',
        'placement',
        'hardware',
      ])
        void client.invalidateQueries({ queryKey: [q] });
    },
  });
  const choices =
    operation === 'merge'
      ? [...base.bindings, ...(remote.data?.sources.items || [])]
      : base.bindings.filter((b) => selected.includes(b.id || ''));
  const remoteComplete =
    remote.data?.asset.source_count !== undefined &&
    remote.data.sources.items?.length === remote.data.asset.source_count;
  const remoteAllowed =
    remote.data?.asset.lifecycle_status === 'observed' &&
    remote.data.asset.kind === base.asset.kind &&
    base.asset.kind !== 'unknown' &&
    base.bindings.length + (remote.data.sources.items?.length || 0) <= 128 &&
    typeof base.asset.scope === 'string' &&
    remote.data.asset.scope === base.asset.scope &&
    remote.data.placement.mode === 'unplaced';
  const valid =
    !!base.asset.id &&
    Number.isSafeInteger(base.asset.revision) &&
    (base.asset.revision || 0) > 0 &&
    base.bindings.length > 0 &&
    !!canonical &&
    choices.some((b) => b.id === canonical) &&
    reason.trim().length > 0 &&
    new TextEncoder().encode(reason).length <= 512 &&
    ![...reason].some(
      (c) => c.charCodeAt(0) < 32 || (c.charCodeAt(0) >= 127 && c.charCodeAt(0) <= 159),
    ) &&
    (operation === 'merge'
      ? remoteComplete &&
        remoteAllowed &&
        !remote.isFetching &&
        draft.trim() === loaded &&
        Number.isSafeInteger(remote.data?.asset.revision) &&
        (remote.data?.asset.revision || 0) > 0
      : selected.length > 0 && selected.length < base.bindings.length && selected.length <= 64);
  if (mutation.data)
    return (
      <div className="stack-form">
        <Notice>Backend сохранил решение. Отправка из этой формы завершена.</Notice>
        <Facts
          values={{
            'Decision ID': mutation.data.id,
            Операция: mutation.data.operation,
            'Source Asset': mutation.data.source_id,
            'Target Asset': mutation.data.target_id,
            'Canonical binding': mutation.data.canonical_binding_id,
            Причина: mutation.data.reason,
          }}
        />
        {mutation.data.target_id && (
          <Link
            className="entity-link"
            to={`/assets/${encodeURIComponent(mutation.data.target_id)}?tab=sources`}
          >
            Открыть результирующий Asset →
          </Link>
        )}
      </div>
    );
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || !base.asset.id || !base.asset.revision) return;
        if (operation === 'merge' && remote.data?.asset.id && remote.data.asset.revision)
          setReview({
            operation,
            body: {
              target_id: base.asset.id,
              target_revision: base.asset.revision,
              source_id: remote.data.asset.id,
              source_revision: remote.data.asset.revision,
              canonical_binding_id: canonical,
              reason: reason.trim(),
              confirmed: true,
            },
          });
        if (operation === 'split')
          setReview({
            operation,
            body: {
              asset_id: base.asset.id,
              revision: base.asset.revision,
              binding_ids: [...selected],
              canonical_binding_id: canonical,
              reason: reason.trim(),
              confirmed: true,
            },
          });
      }}
    >
      <Facts
        values={{
          'Текущий Asset': base.asset.id,
          Имя: base.asset.canonical_name,
          Тип: base.asset.kind,
          'Серийный номер': base.asset.serial,
          Ревизия: base.asset.revision,
        }}
      />
      <Notice>
        {operation === 'merge'
          ? 'Текущий Asset сохранится. Привязки второго Asset перейдут в него, второй станет историческим alias. Backend проверит конфликты идентичности. Размещённый source сначала нужно отдельно снять с размещения.'
          : 'Выбранные привязки перейдут в новый Asset. Хотя бы одна привязка должна остаться в текущем. Физическое оборудование это действие не перемещает.'}
      </Notice>
      {operation === 'merge' ? (
        <>
          <label>
            ID второго Asset
            <input value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <Button
            type="button"
            variant="secondary"
            disabled={!draft.trim() || draft.trim() === base.asset.id || remote.isFetching}
            onClick={() => {
              setCanonical('');
              if (loaded === draft.trim()) void remote.refetch();
              else setLoaded(draft.trim());
            }}
          >
            Загрузить для сравнения
          </Button>
          {!!loaded && (
            <QueryState query={remote}>
              <Facts
                values={{
                  'Второй Asset': remote.data?.asset.id,
                  'Имя второго': remote.data?.asset.canonical_name,
                  'Тип второго': remote.data?.asset.kind,
                  'Серийный номер второго': remote.data?.asset.serial,
                  'Ревизия второго': remote.data?.asset.revision,
                  'Пространство второго': remote.data?.asset.scope || 'real',
                  'Размещение второго': remote.data?.placement.mode,
                }}
              />
              {remote.data && (!remoteComplete || !remoteAllowed) && (
                <Notice>
                  Объединение заблокировано: нужен активный Asset в том же пространстве данных,
                  полная загрузка его привязок и состояние unplaced. Backend остаётся окончательной
                  проверкой.
                </Notice>
              )}
              <BindingTable items={remote.data?.sources.items || []} />
            </QueryState>
          )}
        </>
      ) : (
        <fieldset>
          <legend>Какие источники отделить</legend>
          {base.bindings.map((b) => (
            <label className="checkbox-label" key={b.id}>
              <input
                type="checkbox"
                disabled={!b.id}
                checked={selected.includes(b.id || '')}
                onChange={(e) => {
                  setSelected((v) =>
                    e.target.checked ? [...v, b.id!] : v.filter((id) => id !== b.id),
                  );
                  setCanonical('');
                }}
              />
              {b.source_name || b.source_instance_id} · {b.external_id} · {b.id}
            </label>
          ))}
          <small>Выбрано: {selected.length}. Не более 64, не все привязки.</small>
        </fieldset>
      )}
      <label>
        Основной binding результирующего Asset
        <select required value={canonical} onChange={(e) => setCanonical(e.target.value)}>
          <option value="">Выберите проверенный источник…</option>
          {choices.map((b) => (
            <option key={b.id} value={b.id}>
              {b.source_name} · {b.external_id} · {b.id}
            </option>
          ))}
        </select>
      </label>
      <label>
        Причина решения
        <input
          required
          maxLength={512}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Button type="submit" disabled={!valid}>
        Проверить решение
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title={
          operation === 'merge'
            ? 'Подтвердить объединение Assets?'
            : 'Подтвердить разделение Asset?'
        }
        description="Решение изменит каноническую идентичность и связи источников. Проверьте направление операции, конкретные привязки и ревизии. Автоматического повтора при конфликте не будет."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.error instanceof ApiError && mutation.error.status === 409}
        onConfirm={() => mutation.mutate()}
      >
        {review && (
          <Facts
            values={
              review.operation === 'merge'
                ? {
                    'Сохранится Asset': review.body.target_id,
                    'Его ревизия': review.body.target_revision,
                    'Станет alias': review.body.source_id,
                    'Ревизия источника': review.body.source_revision,
                    'Основной binding': review.body.canonical_binding_id,
                    Причина: review.body.reason,
                  }
                : {
                    'Исходный Asset': review.body.asset_id,
                    Ревизия: review.body.revision,
                    'Переносимые привязки': review.body.binding_ids.join(', '),
                    'Основной binding нового Asset': review.body.canonical_binding_id,
                    Причина: review.body.reason,
                  }
            }
          />
        )}
      </ConfirmDialog>
    </form>
  );
}
export function BindingTable({ items }: { items: Model<'AssetSourceBinding'>[] }) {
  return (
    <DataTable
      data={items}
      columns={[
        { header: 'Binding', accessorKey: 'id' },
        { header: 'Источник', accessorKey: 'source_name' },
        { header: 'Внешний объект', accessorKey: 'external_id' },
        { header: 'Уверенность', accessorKey: 'confidence' },
        { header: 'Происхождение', cell: ({ row }) => <Badge value={row.original.provenance} /> },
        { header: 'Наблюдалось', cell: ({ row }) => <Time value={row.original.last_seen} /> },
      ]}
    />
  );
}
