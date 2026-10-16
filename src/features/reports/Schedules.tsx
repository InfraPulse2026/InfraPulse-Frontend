import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import {
  ConfirmDialog,
  DataTable,
  Drawer,
  Facts,
  Notice,
  Panel,
  QueryState,
  Time,
} from '../../components/shared';

export default function Schedules() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<Model<'ReportSchedule'> | null>();
  const query = useQuery({
    queryKey: ['report-schedules'],
    queryFn: async ({ signal }) => unwrap(await api.GET('/api/reports/schedules', { signal })),
  });
  return (
    <Panel
      title="Расписания daily / weekly"
      actions={<Button onClick={() => setEditing(null)}>Добавить расписание</Button>}
    >
      <Facts
        values={{
          'Часовой пояс календарных периодов': 'UTC',
          Формирование: 'Завершённый день или неделя с понедельника',
        }}
      />
      <QueryState query={query}>
        <DataTable
          data={query.data?.items || []}
          columns={[
            { header: 'Название', cell: ({ row }) => row.original.definition?.name },
            {
              header: 'Период',
              cell: ({ row }) =>
                row.original.definition?.cadence === 'weekly' ? 'Неделя' : 'День',
            },
            { header: 'Данные', cell: ({ row }) => row.original.definition?.scope || 'real' },
            {
              header: 'Состояние',
              cell: ({ row }) => (row.original.definition?.enabled ? 'Включено' : 'Приостановлено'),
            },
            {
              header: 'Следующий запуск',
              cell: ({ row }) => <Time value={row.original.next_run_at} />,
            },
            { header: 'Ошибка', accessorKey: 'failure' },
            {
              header: 'Действия',
              cell: ({ row }) => (
                <Button variant="secondary" onClick={() => setEditing(row.original)}>
                  Изменить расписание
                </Button>
              ),
            },
          ]}
        />
      </QueryState>
      <Drawer
        title={editing ? 'Изменить расписание' : 'Новое расписание'}
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
      >
        {editing !== undefined && (
          <ScheduleForm
            initial={editing}
            onDone={() => {
              setEditing(undefined);
              void client.invalidateQueries({ queryKey: ['report-schedules'] });
            }}
          />
        )}
      </Drawer>
    </Panel>
  );
}

function ScheduleForm({
  initial,
  onDone,
}: {
  initial: Model<'ReportSchedule'> | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(initial?.definition?.name || '');
  const [cadence, setCadence] = useState<'daily' | 'weekly'>(
    initial?.definition?.cadence || 'daily',
  );
  const [scope, setScope] = useState<'real' | 'simulated' | 'all'>(
    initial?.definition?.scope || 'real',
  );
  const [enabled, setEnabled] = useState(initial?.definition?.enabled ?? true);
  const [asset, setAsset] = useState(initial?.definition?.asset_id || '');
  const [site, setSite] = useState(initial?.definition?.site_id || '');
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Model<'ReportScheduleInput'> | null>(null);
  const [baseRevision] = useState(initial?.revision);
  const mutation = useMutation({
    mutationFn: async (body: Model<'ReportScheduleInput'>) =>
      initial?.id
        ? unwrap(
            await api.PUT('/api/reports/schedules/{id}', {
              params: { path: { id: initial.id } },
              body,
            }),
          )
        : unwrap(await api.POST('/api/reports/schedules', { body })),
    onSuccess: onDone,
  });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        setReview({
          name: name.trim(),
          cadence,
          scope,
          enabled,
          asset_id: asset.trim(),
          site_id: site.trim(),
          reason: reason.trim(),
          confirmed: true,
          ...(initial ? { expected_revision: baseRevision } : {}),
        });
      }}
    >
      <label>
        Название расписания
        <input required maxLength={128} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Период расписания
        <select value={cadence} onChange={(e) => setCadence(e.target.value as typeof cadence)}>
          <option value="daily">Каждый день</option>
          <option value="weekly">Каждую неделю</option>
        </select>
      </label>
      <label>
        Пространство данных
        <select value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
          <option value="real">Реальные данные</option>
          <option value="simulated">Симуляция</option>
          <option value="all">Все данные</option>
        </select>
      </label>
      <label>
        Asset ID (пусто — все)
        <input value={asset} onChange={(e) => setAsset(e.target.value)} />
      </label>
      <label>
        Site ID (пусто — все)
        <input value={site} onChange={(e) => setSite(e.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />{' '}
        Включить расписание
      </label>
      <label>
        Причина изменения
        <textarea
          required
          minLength={5}
          maxLength={512}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Notice>
        Снимки формирует backend. Периоды считаются по UTC. Изменение сохраняется только после
        подтверждения.
      </Notice>
      <Button
        type="submit"
        disabled={
          !name.trim() ||
          reason.trim().length < 5 ||
          (initial !== null && initial.revision === undefined)
        }
      >
        Проверить расписание
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Сохранить расписание?"
        description="Проверьте параметры автоматического формирования отчётов."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={
          mutation.error instanceof ApiError &&
          (mutation.error.status === 409 || mutation.error.status === 0)
        }
        onConfirm={() => review && mutation.mutate(review)}
      >
        {mutation.error instanceof ApiError && mutation.error.status === 0 && (
          <Notice>
            Ответ не получен. Закройте форму и перечитайте список расписаний перед новой попыткой:
            API создания не предоставляет ключ идемпотентности.
          </Notice>
        )}
        <Facts
          values={{
            Название: review?.name,
            Период: review?.cadence,
            Данные: review?.scope,
            Включено: review?.enabled ? 'Да' : 'Нет',
            Asset: review?.asset_id || 'Все',
            Site: review?.site_id || 'Все',
            Ревизия: review?.expected_revision ?? 'Создание',
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </form>
  );
}
