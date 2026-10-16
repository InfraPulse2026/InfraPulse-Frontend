import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { idempotencySlot } from '../../lib/idempotency';
import { Button } from '../../components/ui/button';
import { Panel, QueryState, Facts, Drawer, ConfirmDialog, Notice } from '../../components/shared';

export default function ConfigurationSetup({ id }: { id: string }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState<'baseline' | 'policy' | null>(null);
  const baseline = useQuery({
    queryKey: ['baseline', id],
    queryFn: async ({ signal }) => {
      const response = await api.GET('/api/assets/{id}/configuration/baseline', {
        params: { path: { id } },
        signal,
      });
      if (response.response.status === 404) return null;
      return unwrap(response);
    },
  });
  const policy = useQuery({
    queryKey: ['remediation-policy', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/configuration/remediation-policy', {
          params: { path: { id } },
          signal,
        }),
      ),
  });
  const asset = useQuery({
    queryKey: ['setup-asset', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/assets/{id}', { params: { path: { id } }, signal })),
  });
  const done = () => {
    setEditing(null);
    for (const key of ['baseline', 'remediation-policy', 'drift'])
      void client.invalidateQueries({ queryKey: [key, id] });
  };
  return (
    <>
      <Panel
        title="Эталон и ограничения исправления"
        actions={
          <>
            <Button
              variant="secondary"
              disabled={!baseline.isSuccess || !asset.data?.revision}
              onClick={() => setEditing('baseline')}
            >
              Назначить эталон
            </Button>
            <Button
              variant="secondary"
              disabled={!policy.data}
              onClick={() => setEditing('policy')}
            >
              Изменить policy
            </Button>
          </>
        }
      >
        <QueryState query={baseline}>
          <Facts
            values={{
              'Эталонная ревизия': baseline.data?.revision ?? 'Не назначен',
              Снимок: baseline.data?.snapshot_id,
              Причина: baseline.data?.reason,
            }}
          />
        </QueryState>
        <QueryState query={policy}>
          <Facts
            values={{
              'Policy revision': policy.data?.revision,
              'Исправления включены': policy.data?.enabled,
              'Разрешённые VLAN': policy.data?.allowed_vlans.join(', '),
              'Защищённые интерфейсы': policy.data?.protected_interfaces.join(', '),
              'Максимальный возраст evidence (сек.)': policy.data?.max_evidence_age_seconds,
            }}
          />
        </QueryState>
      </Panel>
      <Drawer
        title={
          editing === 'baseline' ? 'Назначить эталон конфигурации' : 'Ограничения автоматизации'
        }
        open={!!editing}
        onClose={() => setEditing(null)}
      >
        {editing === 'baseline' && asset.data?.revision && (
          <BaselineForm
            id={id}
            assetRevision={asset.data.revision}
            revision={baseline.data?.revision ?? 0}
            onDone={done}
          />
        )}
        {editing === 'policy' && policy.data && (
          <PolicyForm id={id} initial={policy.data} onDone={done} />
        )}
      </Drawer>
    </>
  );
}
function BaselineForm({
  id,
  assetRevision,
  revision,
  onDone,
}: {
  id: string;
  assetRevision: number;
  revision: number;
  onDone: () => void;
}) {
  const [snapshot, setSnapshot] = useState('');
  const [preview, setPreview] = useState('');
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Model<'ConfigurationBaselineInput'> | null>(null);
  const [base] = useState({ revision, assetRevision });
  const [key] = useState(idempotencySlot);
  const content = useQuery({
    queryKey: ['baseline-private-preview', id, preview],
    enabled: !!preview,
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/automation/snapshots/{snapshot_id}/content', {
          params: { path: { snapshot_id: preview } },
          signal,
        }),
      ),
  });
  const previewReady =
    preview === snapshot &&
    content.isSuccess &&
    typeof content.data?.configuration === 'string' &&
    content.data.configuration.length > 0;
  const snapshots = useQuery({
    queryKey: ['setup-snapshots', id],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/assets/{id}/automation/snapshots', {
          params: { path: { id }, query: { limit: 200, offset: 0 } },
          signal,
        }),
      ),
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте параметры');
      return unwrap(
        await api.PUT('/api/assets/{id}/configuration/baseline', {
          params: { path: { id }, header: { 'Idempotency-Key': key(review) } },
          body: review,
        }),
      );
    },
    onSuccess: onDone,
  });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!previewReady) return;
        setReview({
          expected_revision: base.revision,
          asset_revision: base.assetRevision,
          snapshot_id: snapshot,
          confirmed: true,
          reason: reason.trim(),
        });
      }}
    >
      <Notice>
        Эталон выбирается из существующих снимков этого Asset. Назначение меняет основу сравнения и
        требует проверки конфигурации оператором.
      </Notice>
      <QueryState query={snapshots}>
        <label>
          Эталонный снимок
          <select
            required
            value={snapshot}
            onChange={(e) => {
              setSnapshot(e.target.value);
              setPreview('');
            }}
          >
            <option value="">Выберите проверенный снимок…</option>
            {snapshots.data?.items?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} · {s.observed_at}
              </option>
            ))}
          </select>
        </label>
      </QueryState>
      {snapshots.data?.items?.length === 200 && <Notice>Показаны первые 200 снимков.</Notice>}
      <Notice>
        Содержимое снимка может быть чувствительным. Просмотр — отдельный административный запрос с
        аудитом. Оно не включается в AI-контекст и не сохраняется в localStorage.
      </Notice>
      <Button
        type="button"
        variant="secondary"
        disabled={!snapshot}
        onClick={() => setPreview(preview ? '' : snapshot)}
      >
        {preview ? 'Скрыть содержимое снимка' : 'Просмотреть снимок с аудитом'}
      </Button>
      {!!preview && (
        <QueryState query={content}>
          <div className="json-view">
            <pre aria-label="Содержимое выбранного снимка">{content.data?.configuration}</pre>
          </div>
        </QueryState>
      )}
      <label>
        Причина назначения
        <input
          required
          minLength={3}
          maxLength={512}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Button type="submit" disabled={!snapshot || !previewReady || reason.trim().length < 3}>
        Проверить назначение
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Назначить этот эталон?"
        description="Дальнейшие сравнения будут использовать выбранный снимок. Оборудование это действие не изменяет."
        error={mutation.error}
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        confirmDisabled={mutation.error instanceof ApiError && mutation.error.status === 409}
      >
        <Facts
          values={{
            Asset: id,
            'Asset revision': review?.asset_revision,
            'Baseline revision': review?.expected_revision,
            Снимок: review?.snapshot_id,
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </form>
  );
}
function PolicyForm({
  id,
  initial,
  onDone,
}: {
  id: string;
  initial: Model<'ConfigurationRemediationPolicy'>;
  onDone: () => void;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [vlans, setVlans] = useState(initial.allowed_vlans.join(', '));
  const [interfaces, setInterfaces] = useState(initial.protected_interfaces.join(', '));
  const [age, setAge] = useState(initial.max_evidence_age_seconds);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Model<'ConfigurationRemediationPolicyInput'> | null>(null);
  const [baseRevision] = useState(initial.revision);
  const vlanList = vlans.trim() ? vlans.split(',').map((s) => Number(s.trim())) : [];
  const protectedInterfaces = interfaces.trim() ? interfaces.split(',').map((s) => s.trim()) : [];
  const valid =
    vlanList.length <= 256 &&
    new Set(vlanList).size === vlanList.length &&
    vlanList.every((v) => Number.isInteger(v) && v >= 1 && v <= 4094) &&
    protectedInterfaces.length <= 256 &&
    new Set(protectedInterfaces).size === protectedInterfaces.length &&
    protectedInterfaces.every((s) => s.length > 0 && s.length <= 64);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте параметры');
      return unwrap(
        await api.PUT('/api/assets/{id}/configuration/remediation-policy', {
          params: { path: { id } },
          body: review,
        }),
      );
    },
    onSuccess: onDone,
  });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid)
          setReview({
            expected_revision: baseRevision,
            enabled,
            allowed_vlans: vlanList,
            protected_interfaces: protectedInterfaces,
            max_evidence_age_seconds: age,
            reason: reason.trim(),
          });
      }}
    >
      <label>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />{' '}
        Разрешить исправления по policy
      </label>
      <label>
        Разрешённые VLAN (через запятую)
        <input value={vlans} onChange={(e) => setVlans(e.target.value)} />
      </label>
      <label>
        Защищённые интерфейсы (через запятую)
        <input value={interfaces} onChange={(e) => setInterfaces(e.target.value)} />
      </label>
      {!valid && (
        <Notice>
          VLAN: уникальные целые числа от 1 до 4094. Интерфейсы: уникальные имена до 64 символов. Не
          более 256 элементов каждого вида.
        </Notice>
      )}
      <label>
        Максимальный возраст evidence, секунды
        <input
          type="number"
          required
          min={60}
          max={86400}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </label>
      <label>
        Причина изменения
        <input
          required
          minLength={3}
          maxLength={512}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Button type="submit" disabled={!valid || reason.trim().length < 3}>
        Проверить policy
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Изменить ограничения исправления?"
        description="Policy определяет допустимые действия. Выполнение каждого предложения всё равно требует отдельного одобрения."
        pending={mutation.isPending}
        error={mutation.error}
        onConfirm={() => mutation.mutate()}
        confirmDisabled={mutation.error instanceof ApiError && mutation.error.status === 409}
      >
        <Facts
          values={{
            Asset: id,
            Ревизия: review?.expected_revision,
            Включена: review?.enabled,
            VLAN: review?.allowed_vlans.join(', '),
            'Защищённые интерфейсы': review?.protected_interfaces.join(', '),
            'Evidence (сек.)': review?.max_evidence_age_seconds,
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </form>
  );
}
