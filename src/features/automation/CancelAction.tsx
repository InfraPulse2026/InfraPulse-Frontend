import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, ApiError } from '../../api/client';
import { Button } from '../../components/ui/button';
import { ConfirmDialog, Facts, Notice, Panel } from '../../components/shared';

export default function CancelAction({
  id,
  revision,
  kind,
}: {
  id: string;
  revision?: number;
  kind: 'job' | 'remediation';
}) {
  const client = useQueryClient();
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<{ reason: string; revision?: number } | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте отмену');
      if (kind === 'job')
        return unwrap(
          await api.POST('/api/automation/jobs/{job_id}/cancel', {
            params: { path: { job_id: id } },
          }),
        );
      if (!review.revision) throw new Error('Отсутствует ревизия запроса');
      return unwrap(
        await api.POST('/api/configuration/remediations/{remediation_id}/cancel', {
          params: { path: { remediation_id: id } },
          body: { expected_revision: review.revision, reason: review.reason },
        }),
      );
    },
    onSuccess: () => {
      setReview(null);
      void client.invalidateQueries({
        queryKey: [kind === 'job' ? 'automation-job' : 'remediation', id],
      });
    },
  });
  return (
    <Panel title="Отмена исполнения">
      <Notice>
        Отмена — запрос на остановку. Уже выполненные изменения остаются; отмена не выполняет
        rollback. Итоговое состояние нужно проверить у backend.
      </Notice>
      {kind === 'remediation' && (
        <label className="reason-field">
          Причина отмены
          <input
            minLength={3}
            maxLength={512}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      )}
      <Button
        variant="secondary"
        disabled={
          mutation.isSuccess || (kind === 'remediation' && (!revision || reason.trim().length < 3))
        }
        onClick={() => {
          mutation.reset();
          setReview({ reason: reason.trim(), revision });
        }}
      >
        Проверить отмену
      </Button>
      {mutation.isSuccess && <Notice>Backend принял запрос. Ожидайте итогового состояния.</Notice>}
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Запросить отмену?"
        description="Остановить ожидающее или выполняемое действие, если это ещё возможно."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.error instanceof ApiError && mutation.error.status === 409}
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            ID: id,
            Ревизия: review?.revision,
            Причина:
              kind === 'remediation' ? review?.reason : 'API задания не принимает обоснование',
          }}
        />
      </ConfirmDialog>
    </Panel>
  );
}
