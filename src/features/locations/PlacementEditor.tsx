import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import { idempotencySlot } from '../../lib/idempotency';
import { Drawer, ConfirmDialog, Facts, Notice, QueryState } from '../../components/shared';

export default function PlacementEditor({ initial }: { initial: Model<'AssetPlacement'> }) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Изменить размещение
      </Button>
      <Drawer title="Размещение оборудования" open={open} onClose={() => setOpen(false)}>
        {open && (
          <PlacementForm
            initial={initial}
            done={() => {
              setOpen(false);
              for (const key of ['placement', 'rack', 'inventory'])
                void client.invalidateQueries({ queryKey: [key] });
            }}
          />
        )}
      </Drawer>
    </>
  );
}
function PlacementForm({ initial, done }: { initial: Model<'AssetPlacement'>; done: () => void }) {
  const [mode, setMode] = useState(initial.mode);
  const [location, setLocation] = useState(initial.location_id || '');
  const [start, setStart] = useState(initial.start_unit || 1);
  const [height, setHeight] = useState(initial.height_units || 1);
  const [position, setPosition] = useState(initial.position);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Model<'PlacementRequest'> | null>(null);
  const [baseRevision] = useState(initial.revision);
  const [key] = useState(idempotencySlot);
  const locations = useQuery({
    queryKey: ['placement-options', mode],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/locations', {
          params: { query: { kind: mode === 'rack' ? 'rack' : 'room', limit: 200, offset: 0 } },
          signal,
        }),
      ),
    enabled: mode !== 'unplaced',
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте размещение');
      return unwrap(
        await api.PUT('/api/assets/{id}/placement', {
          params: { path: { id: initial.asset_id }, header: { 'Idempotency-Key': key(review) } },
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
          asset_id: initial.asset_id,
          expected_revision: baseRevision,
          mode,
          location_id: mode === 'unplaced' ? null : location,
          start_unit: mode === 'rack' ? start : 0,
          height_units: mode === 'rack' ? height : 0,
          position: mode === 'unplaced' ? '' : position,
          reason: reason.trim(),
        });
      }}
    >
      <label>
        Вариант размещения
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as typeof mode);
            setLocation('');
          }}
        >
          <option value="rack">В стойке</option>
          <option value="outside_rack">В помещении, вне стойки</option>
          <option value="unplaced">Снять с размещения</option>
        </select>
      </label>
      {mode !== 'unplaced' && (
        <>
          <QueryState query={locations}>
            <label>
              Выбрать локацию
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Выберите локацию…</option>
                {locations.data?.items?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.id}
                  </option>
                ))}
              </select>
            </label>
          </QueryState>
          <label>
            ID локации
            <input required value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <small>Список ограничен 200 записями; точный ID можно ввести вручную.</small>
          <label>
            Описание позиции
            <input maxLength={256} value={position} onChange={(e) => setPosition(e.target.value)} />
          </label>
        </>
      )}
      {mode === 'rack' && (
        <>
          <label>
            Начальный юнит
            <input
              required
              type="number"
              min={1}
              max={100}
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
            />
          </label>
          <label>
            Высота оборудования, U
            <input
              required
              type="number"
              min={1}
              max={100}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </label>
        </>
      )}
      <label>
        Причина изменения размещения
        <input
          required
          minLength={3}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Notice>
        {mode === 'unplaced'
          ? 'Снятие с размещения освободит все занятые юниты этого Asset.'
          : 'Backend проверяет тип локации, ёмкость стойки и пересечение занятых юнитов. Пересечение не будет автоматически исправлено перемещением других Assets.'}
      </Notice>
      <Button
        type="submit"
        disabled={reason.trim().length < 3 || (mode === 'rack' && start + height - 1 > 100)}
      >
        Проверить размещение
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Сохранить размещение?"
        description="Изменится запись физического размещения. Сетевое оборудование не перенастраивается."
        error={mutation.error}
        pending={mutation.isPending}
        confirmDisabled={
          mutation.error instanceof ApiError && [0, 409].includes(mutation.error.status)
        }
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            Asset: review?.asset_id,
            'Ревизия размещения': review?.expected_revision,
            Режим: review?.mode,
            Локация: review?.location_id,
            'Начальный юнит': review?.start_unit,
            Высота: review?.height_units,
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </form>
  );
}
