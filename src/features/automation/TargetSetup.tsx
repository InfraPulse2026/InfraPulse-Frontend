import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import { ConfirmDialog, Drawer, Facts, Notice, Panel, QueryState } from '../../components/shared';

export default function TargetSetup({ id }: { id: string }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const target = useQuery({
    queryKey: ['automation-target', id],
    queryFn: async ({ signal }) => {
      const result = await api.GET('/api/assets/{id}/automation-target', {
        params: { path: { id } },
        signal,
      });
      if (result.response.status === 404) return null;
      return unwrap(result);
    },
  });
  const asset = useQuery({
    queryKey: ['setup-asset', id],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/assets/{id}', { params: { path: { id } }, signal })),
  });
  return (
    <Panel
      title="SSH target для Linux worker"
      actions={
        <Button
          variant="secondary"
          disabled={!target.isSuccess || !asset.data?.revision}
          onClick={() => setEditing(true)}
        >
          Настроить SSH target
        </Button>
      }
    >
      <QueryState query={target}>
        <Facts
          values={{
            Адрес: target.data?.host,
            Порт: target.data?.port,
            Шаблон: target.data?.template_id,
            'Credential ref': target.data?.credential_ref,
            Ревизия: target.data?.revision,
            Включён: target.data?.enabled,
          }}
        />
      </QueryState>
      <Notice>
        Пароли и приватные ключи хранятся на worker. Здесь задаются ссылка на credentials и
        проверенный публичный SSH host key. Сохранение target не запускает задание.
      </Notice>
      <Drawer title="SSH target" open={editing} onClose={() => setEditing(false)}>
        {editing && asset.data?.revision && (
          <TargetForm
            id={id}
            assetRevision={asset.data.revision}
            initial={target.data || null}
            done={() => {
              setEditing(false);
              void client.invalidateQueries({ queryKey: ['automation-target', id] });
            }}
          />
        )}
      </Drawer>
    </Panel>
  );
}
function TargetForm({
  id,
  assetRevision,
  initial,
  done,
}: {
  id: string;
  assetRevision: number;
  initial: Model<'AutomationTarget'> | null;
  done: () => void;
}) {
  const [host, setHost] = useState(initial?.host || '');
  const [port, setPort] = useState(initial?.port ?? 22);
  const [template, setTemplate] = useState<Model<'AutomationTargetInput'>['template_id']>(
    initial?.template_id || 'cisco_ios_read_config_v1',
  );
  const [credential, setCredential] = useState(initial?.credential_ref || '');
  const [hostKey, setHostKey] = useState(initial?.ssh_host_key || '');
  const [enabled, setEnabled] = useState(initial?.enabled ?? false);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Model<'AutomationTargetInput'> | null>(null);
  const [base] = useState({ revision: initial?.revision ?? 0, assetRevision });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте target');
      return unwrap(
        await api.PUT('/api/assets/{id}/automation-target', {
          params: { path: { id } },
          body: review,
        }),
      );
    },
    onSuccess: done,
  });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        setReview({
          expected_revision: base.revision,
          asset_revision: base.assetRevision,
          host: host.trim(),
          port,
          template_id: template,
          credential_ref: credential.trim(),
          ssh_host_key: hostKey.trim(),
          enabled,
          reason: reason.trim(),
        });
      }}
    >
      <label>
        IP-адрес оборудования
        <input
          required
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="192.0.2.10"
        />
      </label>
      <label>
        SSH порт
        <input
          required
          type="number"
          min={1}
          max={65535}
          value={port}
          onChange={(e) => setPort(Number(e.target.value))}
        />
      </label>
      <label>
        Разрешённый шаблон
        <select value={template} onChange={(e) => setTemplate(e.target.value as typeof template)}>
          <option value="cisco_ios_read_config_v1">Cisco IOS: чтение конфигурации</option>
          <option value="arista_eos_read_config_v1">Arista EOS: чтение конфигурации</option>
          <option value="vyos_read_config_v1">VyOS: чтение конфигурации</option>
        </select>
      </label>
      <label>
        Ссылка на credentials worker
        <input
          required
          pattern="[A-Za-z0-9][A-Za-z0-9_-]{0,63}"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
        />
      </label>
      <label>
        Проверенный публичный SSH host key
        <textarea
          required
          maxLength={4096}
          value={hostKey}
          onChange={(e) => setHostKey(e.target.value)}
          placeholder="ssh-ed25519 AAAA…"
        />
      </label>
      <small>Только тип и Base64 ключа. Без имени хоста, комментариев и приватного ключа.</small>
      <label>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />{' '}
        Включить SSH target
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
      <Button type="submit" disabled={reason.trim().length < 3 || hostKey.includes('PRIVATE KEY')}>
        Проверить SSH target
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Сохранить SSH target?"
        description="Проверьте адрес, публичный host key и ссылку на локальные credentials. Backend и worker дополнительно проверят разрешённую сеть и шаблон."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.error instanceof ApiError && mutation.error.status === 409}
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            Asset: id,
            'Asset revision': review?.asset_revision,
            'Target revision': review?.expected_revision,
            Адрес: review?.host,
            Порт: review?.port,
            Шаблон: review?.template_id,
            'Credential ref': review?.credential_ref,
            'Публичный host key': review?.ssh_host_key,
            Включён: review?.enabled,
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </form>
  );
}
