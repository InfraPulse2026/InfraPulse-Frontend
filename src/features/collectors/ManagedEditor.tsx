import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api, unwrap, type Model } from '../../api/client';
import { idempotencySlot } from '../../lib/idempotency';
import { Button } from '../../components/ui/button';
import { ConfirmDialog, Facts, Notice, Panel, ErrorState, JsonView } from '../../components/shared';
import ProtocolOptions from './ProtocolOptions';
import { durationSeconds, switchProtocol, validateManagedTargets } from './target-options';
export default function ManagedEditor({
  id,
  state,
  close,
}: {
  id: string;
  state: Model<'CollectorConfigState'>;
  close: () => void;
}) {
  const client = useQueryClient();
  const [targets, setTargets] = useState<Model<'ManagedTarget'>[]>(() =>
    structuredClone(state.desired?.snapshot?.targets || []),
  );
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<Error | null>(null);
  const [allowEmpty, setAllowEmpty] = useState(false);
  const [review, setReview] = useState<Model<'CollectorConfigInput'> | null>(null);
  const [key] = useState(idempotencySlot);
  const [baseRevision] = useState(state.desired?.revision || 0);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала просмотрите изменение');
      return unwrap(
        await api.PUT('/api/collectors/{id}/config', {
          params: { path: { id }, header: { 'Idempotency-Key': key(review) } },
          body: review,
        }),
      );
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['collector-config', id] });
      close();
    },
  });
  const update = (i: number, patch: Partial<Model<'ManagedTarget'>>) =>
    setTargets((values) => values.map((t, at) => (at === i ? { ...t, ...patch } : t)));
  const setProtocol = (i: number, protocol: Model<'ManagedTarget'>['protocol']) => {
    setTargets((values) => values.map((t, at) => (at === i ? switchProtocol(t, protocol) : t)));
  };
  return (
    <Panel
      title="Редактор управляемых Targets"
      subtitle={`Полный snapshot · исходная ревизия ${baseRevision}`}
    >
      <form
        className="managed-form"
        onSubmit={(e) => {
          e.preventDefault();
          setValidationError(null);
          mutation.reset();
          try {
            validateManagedTargets(targets);
            const n = new TextEncoder().encode(reason.trim()).length;
            if (n < 3 || n > 512) throw new Error('Обоснование: 3–512 байт UTF-8.');
          } catch (error) {
            setValidationError(error as Error);
            return;
          }
          setReview({
            expected_revision: baseRevision,
            confirmed: true,
            reason: reason.trim(),
            allow_empty_snapshot: allowEmpty,
            site: state.desired?.site,
            targets: structuredClone(targets),
          });
        }}
      >
        <Notice>
          Отправляется весь набор Targets. Локальные targets и секреты Collector остаются под его
          политикой. Используйте только локальные credential_ref / ca_ref, а не пароли.
        </Notice>
        {targets.map((target, i) => (
          <fieldset key={i} className="target-fieldset">
            <legend>Target {i + 1}</legend>
            <div className="form-grid">
              <label>
                Target ID
                <input
                  required
                  pattern="[A-Za-z0-9_.-]{1,128}"
                  value={target.target_id}
                  onChange={(e) => update(i, { target_id: e.target.value })}
                />
              </label>
              <label>
                Протокол
                <select
                  value={target.protocol}
                  onChange={(e) => setProtocol(i, e.target.value as typeof target.protocol)}
                >
                  {['snmp', 'routeros', 'sip', 'redfish', 'ipmi'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Endpoint
                <input
                  required
                  value={target.endpoint}
                  onChange={(e) => update(i, { endpoint: e.target.value })}
                  placeholder={
                    ['routeros', 'redfish'].includes(target.protocol)
                      ? 'https://device.example.org'
                      : '192.0.2.10'
                  }
                />
              </label>
              <label>
                Credential reference
                <input
                  required={target.protocol !== 'sip'}
                  disabled={target.protocol === 'sip'}
                  pattern="[A-Za-z0-9_.-]{1,128}"
                  value={target.credential_ref || ''}
                  onChange={(e) => update(i, { credential_ref: e.target.value })}
                />
              </label>
              <label>
                CA reference
                <input
                  disabled={
                    !(
                      ['routeros', 'redfish'].includes(target.protocol) ||
                      (target.protocol === 'sip' && target.sip?.transport === 'tls')
                    )
                  }
                  pattern="[A-Za-z0-9_.-]{1,128}"
                  value={target.ca_ref || ''}
                  onChange={(e) => update(i, { ca_ref: e.target.value })}
                />
              </label>
              {!['redfish', 'ipmi'].includes(target.protocol) && (
                <label>
                  Fast interval, сек.
                  <input
                    type="number"
                    min={0}
                    step="any"
                    max={86400}
                    placeholder="По умолчанию"
                    value={durationSeconds(target.polling?.fast_interval)}
                    onChange={(e) =>
                      update(i, {
                        polling: {
                          ...target.polling,
                          fast_interval:
                            e.target.value === '' ? undefined : `${Number(e.target.value)}s`,
                        },
                      })
                    }
                  />
                </label>
              )}
            </div>
            <ProtocolOptions target={target} update={(patch) => update(i, patch)} />
            <div className="target-actions">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={target.enabled}
                  onChange={(e) => update(i, { enabled: e.target.checked })}
                />
                Разрешён
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTargets((t) => t.filter((_, at) => at !== i))}
              >
                <Trash2 size={14} />
                Убрать из snapshot
              </Button>
            </div>
          </fieldset>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setTargets((t) => [
              ...t,
              {
                target_id: '',
                protocol: 'snmp',
                endpoint: '',
                enabled: false,
                snmp: { version: 'v2c' },
                polling: { fast_interval: '3s' },
              },
            ])
          }
        >
          <Plus size={15} />
          Добавить Target
        </Button>
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
        {!targets.length && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={allowEmpty}
              onChange={(e) => setAllowEmpty(e.target.checked)}
            />
            Подтверждаю удаление всего управляемого набора
          </label>
        )}
        <div className="inline-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Отменить
          </Button>
          <Button disabled={mutation.isPending || (!targets.length && !allowEmpty)}>
            Просмотреть и отправить
          </Button>
        </div>
      </form>
      {validationError && <ErrorState error={validationError} />}
      {mutation.error && <ErrorState error={mutation.error} />}
      <ConfirmDialog
        title="Обновить весь управляемый набор?"
        description="Backend сохранит desired snapshot; APPLIED нужно дождаться отдельно. При конфликте ревизии перечитайте состояние и начните новое изменение."
        open={!!review}
        onClose={() => setReview(null)}
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.isError}
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            Collector: id,
            'Expected revision': review?.expected_revision,
            'Число Targets': review?.targets.length,
            Причина: review?.reason,
          }}
        />
        <div className="review-targets">
          {review?.targets.map((t) => (
            <p key={t.target_id}>
              {t.target_id} · {t.protocol} · {t.endpoint} · {t.enabled ? 'enabled' : 'disabled'} ·{' '}
              {t.polling?.fast_interval || t.polling?.medium_interval || 'default'}
            </p>
          ))}
        </div>
        <JsonView
          value={review?.targets}
          title="Полный snapshot: интервалы, параметры и references"
        />
      </ConfirmDialog>
    </Panel>
  );
}
