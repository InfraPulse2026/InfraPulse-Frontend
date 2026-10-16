import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api, unwrap, type Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import {
  ConfirmDialog,
  DataTable,
  Drawer,
  ErrorState,
  Facts,
  Notice,
} from '../../components/shared';
import { idempotencySlot } from '../../lib/idempotency';
import { parsePlacementFile, validateImportRows, type ImportReview } from './placement-import';

async function boundedRead<T, R>(items: T[], load: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += 4)
    results.push(...(await Promise.all(items.slice(i, i + 4).map(load))));
  return results;
}
const description = (p: Model<'PlacementInput'>) =>
  p.mode === 'unplaced'
    ? 'Не размещён'
    : p.mode === 'outside_rack'
      ? `${p.location_id} · вне стойки`
      : `${p.location_id} · U${p.start_unit}–U${(p.start_unit || 0) + (p.height_units || 0) - 1}`;
export default function PlacementImport() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Импорт размещений
      </Button>
      <Drawer open={open} title="Партия размещений" onClose={() => setOpen(false)}>
        {open && <ImportForm />}
      </Drawer>
    </>
  );
}
function ImportForm() {
  const jsonID = useId();
  const client = useQueryClient();
  const [raw, setRaw] = useState(''),
    [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false),
    [error, setError] = useState<Error | null>(null);
  const [review, setReview] = useState<ImportReview | null>(null),
    [key] = useState(idempotencySlot);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Нет просмотренной партии');
      return unwrap(
        await api.POST('/api/placements/import', {
          params: { header: { 'Idempotency-Key': key(review.body) } },
          body: review.body,
        }),
      );
    },
    onSuccess: () => {
      setReview(null);
      for (const name of ['placement', 'rack', 'inventory', 'locations'])
        void client.invalidateQueries({ queryKey: [name] });
    },
  });
  const preview = async () => {
    setError(null);
    setLoading(true);
    mutation.reset();
    try {
      const body = parsePlacementFile(raw, reason);
      const previous = await boundedRead(
        body.placements,
        async (row) =>
          [
            row.asset_id,
            unwrap(
              await api.GET('/api/assets/{id}/placement', {
                params: { path: { id: row.asset_id } },
              }),
            ),
          ] as const,
      );
      const locationIDs = [
        ...new Set(body.placements.flatMap((row) => (row.location_id ? [row.location_id] : []))),
      ];
      const locations = await boundedRead(
        locationIDs,
        async (id) =>
          [id, unwrap(await api.GET('/api/locations/{id}', { params: { path: { id } } }))] as const,
      );
      const rackIDs = locations.filter(([, value]) => value.kind === 'rack').map(([id]) => id);
      const racks = await boundedRead(
        rackIDs,
        async (id) =>
          [
            id,
            unwrap(await api.GET('/api/locations/{id}/rack-layout', { params: { path: { id } } })),
          ] as const,
      );
      setReview(
        structuredClone(
          validateImportRows(body, new Map(previous), new Map(locations), new Map(racks)),
        ),
      );
    } catch (e) {
      setError(
        new Error(
          e instanceof z.ZodError
            ? e.issues
                .slice(0, 3)
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('; ')
            : (e as Error).message,
        ),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="stack-form">
      <Notice>
        Одна атомарная партия до 50 Assets: backend сохранит всю партию либо отклонит её целиком.
        Это изменение учётного размещения, а не физическое перемещение оборудования. Preview только
        читает данные; запись — после отдельного подтверждения.
      </Notice>
      <label>
        JSON-файл размещений
        <input
          type="file"
          accept=".json,application/json"
          disabled={loading || !!review || mutation.isSuccess}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 65536) {
              setRaw('');
              setError(new Error('Файл ограничен 64 КиБ.'));
              return;
            }
            setLoading(true);
            try {
              setRaw(await file.text());
              setError(null);
            } catch {
              setRaw('');
              setError(new Error('Не удалось прочитать выбранный файл.'));
            } finally {
              setLoading(false);
            }
          }}
        />
      </label>
      <label htmlFor={jsonID}>JSON партии</label>
      <textarea
        id={jsonID}
        rows={10}
        value={raw}
        disabled={loading || !!review || mutation.isSuccess}
        onChange={(e) => setRaw(e.target.value)}
      />
      <details className="json-view">
        <summary>Формат файла</summary>
        <pre>
          {JSON.stringify(
            {
              placements: [
                {
                  asset_id: 'asset_ID_из_карточки',
                  mode: 'rack',
                  location_id: 'loc_ID_стойки',
                  start_unit: 1,
                  height_units: 1,
                  expected_revision: 0,
                },
              ],
            },
            null,
            2,
          )}
        </pre>
        <p>
          expected_revision — текущая ревизия размещения, не inventory. Для нового размещения 0. ID
          берутся из существующих карточек. Для unplaced: location_id=null, юниты 0, пустая
          position.
        </p>
      </details>
      <label>
        Обоснование партии
        <input
          value={reason}
          maxLength={1000}
          disabled={loading || !!review || mutation.isSuccess}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Button
        disabled={
          !raw.trim() || reason.trim().length < 3 || loading || !!review || mutation.isSuccess
        }
        onClick={() => void preview()}
      >
        {loading ? 'Проверяем ревизии и стойки…' : 'Проверить партию размещений'}
      </Button>
      {error && <ErrorState error={error} />}
      {mutation.data && (
        <>
          <Notice>Backend сохранил партию. Ниже — фактические размещения из ответа.</Notice>
          <DataTable
            data={mutation.data.items}
            columns={[
              { header: 'Asset ID', accessorKey: 'asset_id' },
              { header: 'Размещение', cell: ({ row }) => description(row.original) },
              { header: 'Ревизия', accessorKey: 'revision' },
            ]}
          />
        </>
      )}
      <ConfirmDialog
        open={!!review}
        onClose={() => setReview(null)}
        title="Сохранить всю партию размещений?"
        description="Ревизии и назначения зафиксированы. Backend проверит их повторно в одной транзакции. При конфликте вся партия отклоняется; автоматического повтора нет."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={mutation.isError}
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{ 'Assets в партии': review?.rows.length, Обоснование: review?.body.reason }}
        />
        <div className="placement-review-table">
          <DataTable
            data={review?.rows || []}
            columns={[
              { header: 'Asset', cell: ({ row }) => row.original.desired.asset_id },
              { header: 'Сейчас', cell: ({ row }) => description(row.original.current) },
              { header: 'Будет', cell: ({ row }) => description(row.original.desired) },
              {
                header: 'Локация',
                cell: ({ row }) => row.original.location?.name || 'Не размещён',
              },
              { header: 'Ревизия', cell: ({ row }) => row.original.desired.expected_revision },
            ]}
          />
        </div>
        {mutation.isError && (
          <Notice>
            Старое подтверждение заблокировано. Перечитайте размещения; при потере ответа партия
            могла сохраниться. Ревизии в файле не заменяются автоматически.
          </Notice>
        )}
      </ConfirmDialog>
    </div>
  );
}
