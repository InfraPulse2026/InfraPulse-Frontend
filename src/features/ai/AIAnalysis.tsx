import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Eye, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, unwrap, type Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { useNow } from '../../hooks/useNow';
import {
  Panel,
  Badge,
  Notice,
  Facts,
  JsonView,
  ErrorState,
  ConfirmDialog,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import { evidenceLinks, type EvidenceContext } from './references';
export default function AIAnalysis({
  id,
  correlated = false,
  evidenceIDs = [],
}: {
  id: string;
  correlated?: boolean;
  evidenceIDs?: readonly number[];
}) {
  const auth = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [jobId, setJob] = useState('');
  const [key, setKey] = useState(crypto.randomUUID());
  const preview = useMutation({
    mutationFn: async () =>
      unwrap(
        await api.POST(
          correlated
            ? '/api/correlation/incidents/{id}/analysis/preview'
            : '/api/incidents/{id}/analysis/preview',
          { params: { path: { id } }, body: {} },
        ),
      ),
    onSuccess: () => {
      setKey(crypto.randomUUID());
      setJob('');
      create.reset();
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      if (!preview.data?.id || !preview.data.request_hash)
        throw new Error('Нет действующего preview');
      if (
        !preview.data.enabled ||
        !preview.data.expires_at ||
        !Number.isFinite(Date.parse(preview.data.expires_at)) ||
        Date.parse(preview.data.expires_at) <= Date.now()
      )
        throw new Error('Preview истёк или AI выключен. Подготовьте и просмотрите новый контекст.');
      return unwrap(
        await api.POST(
          correlated ? '/api/correlation/incidents/{id}/analysis' : '/api/incidents/{id}/analysis',
          {
            params: { path: { id }, header: { 'Idempotency-Key': key } },
            body: {
              preview_id: preview.data.id,
              request_hash: preview.data.request_hash,
              confirmed: true,
            },
          },
        ),
      );
    },
    onSuccess: (result) => {
      setJob(result.id || '');
      setConfirm(false);
    },
  });
  const job = useQuery({
    queryKey: ['analysis-job', jobId],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/analyses/{analysis_id}', {
          params: { path: { analysis_id: jobId } },
          signal,
        }),
      ),
    enabled: !!jobId,
    refetchInterval: (q) =>
      ['queued', 'running'].includes(q.state.data?.state || '') ? 3_000 : false,
  });
  const now = useNow();
  const expiresAt = Date.parse(preview.data?.expires_at || '');
  const expired = !Number.isFinite(expiresAt) || expiresAt <= now;
  return (
    <Panel
      title="AI · Анализ по доказательствам"
      subtitle="Гипотезы и рекомендации без права исполнения"
      actions={<Sparkles size={18} />}
    >
      <Notice>
        Сначала просмотрите точный экспорт. Отправка модели — отдельное подтверждённое действие; AI
        не меняет оборудование.
      </Notice>
      <div className="inline-actions">
        <Button
          variant="secondary"
          disabled={preview.isPending || create.isPending}
          onClick={() => preview.mutate()}
        >
          <Eye size={16} />
          {preview.isPending ? 'Подготовка…' : 'Просмотреть контекст'}
        </Button>
        {preview.data && can(auth.session?.permissions, 'analysis.write') && (
          <Button
            disabled={!preview.data.enabled || expired || create.isPending || !!jobId}
            onClick={() => setConfirm(true)}
          >
            <Send size={15} />
            Отправить на анализ
          </Button>
        )}
      </div>
      {preview.error && <ErrorState error={preview.error} />}{' '}
      {preview.data && (
        <>
          <Facts
            values={{
              Назначение: preview.data.destination,
              'Разрешён AI': preview.data.enabled,
              'Срок preview': preview.data.expires_at,
              'Версия prompt': preview.data.prompt_version,
              'Request hash': preview.data.request_hash,
            }}
          />
          <JsonView value={preview.data.request} title="Точный запрос к провайдеру (до отправки)" />
          <JsonView value={preview.data.excluded_fields} title="Исключённые данные" />
          {!preview.data.enabled && (
            <Notice>AI выключен в backend. Preview доступен, вызов модели не выполняется.</Notice>
          )}
        </>
      )}
      {job.error && <ErrorState error={job.error} />}{' '}
      {job.data && (
        <>
          <div className="inline-actions">
            <Badge value={job.data.state} />
            <small>
              {job.data.id} · {job.data.model}
            </small>
          </div>
          {job.data.failure && <Notice>{job.data.failure}</Notice>}
          {job.data.result && (
            <AnalysisResult
              result={job.data.result}
              references={preview.data?.references || []}
              context={{ correlatedID: correlated ? id : undefined, evidenceIDs }}
            />
          )}
        </>
      )}
      <ConfirmDialog
        title="Отправить этот контекст модели?"
        description="Во внешний сервис уйдёт показанный preview. Это может быть платный запрос. Рекомендация не разрешает никаких действий."
        open={confirm}
        onClose={() => setConfirm(false)}
        pending={create.isPending}
        error={create.error}
        confirmDisabled={expired || create.isError}
        onConfirm={() => create.mutate()}
        confirmLabel="Подтверждаю отправку"
      >
        <Facts values={{ Получатель: preview.data?.destination, Preview: preview.data?.id }} />
      </ConfirmDialog>
    </Panel>
  );
}
function AnalysisResult({
  result,
  references,
  context,
}: {
  result: Model<'AIResult'>;
  references: Model<'AIEvidenceReference'>[];
  context: EvidenceContext;
}) {
  return (
    <div className="analysis-result">
      <h3>{result.summary}</h3>
      {(['observations', 'hypotheses', 'recommendations'] as const).map((section) => (
        <div key={section}>
          <h4>
            {
              {
                observations: 'Наблюдения',
                hypotheses: 'Гипотезы',
                recommendations: 'Рекомендации',
              }[section]
            }
          </h4>
          {result[section]?.map((item, i) => (
            <div className="analysis-item" key={i}>
              <p>{item.text}</p>
              {'confidence' in item && (
                <p className="muted">
                  Уверенность:{' '}
                  {item.confidence === 'low'
                    ? 'низкая'
                    : item.confidence === 'medium'
                      ? 'средняя'
                      : 'не указана'}
                </p>
              )}
              {'safety' in item && (
                <p className="muted">
                  {item.safety === 'read_only'
                    ? 'Только чтение'
                    : 'Требует отдельного решения оператора'}
                </p>
              )}
              <div className="reference-list">
                {[...new Set(item.refs || [])].map((ref) => {
                  const links = evidenceLinks(ref, references, context);
                  return (
                    <span key={ref} className="evidence-reference">
                      <strong>{ref}</strong>
                      {links.length ? (
                        links.map((link) => (
                          <Link key={link.to} to={link.to}>
                            {link.label} ↗
                          </Link>
                        ))
                      ) : (
                        <span title="Нет однозначного локального сопоставления backend">
                          Ссылка не сопоставлена
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
      {result.limitations?.map((l, i) => (
        <Notice key={i}>{l}</Notice>
      ))}
    </div>
  );
}
