import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, ApiError, type Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import { idempotencySlot } from '../../lib/idempotency';
import { ConfirmDialog, Drawer, Facts, Notice, QueryState } from '../../components/shared';

export default function LocationEditor({ initial }: { initial?: Model<'PhysicalLocation'> }) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {initial ? 'Изменить локацию' : 'Добавить локацию'}
      </Button>
      <Drawer
        title={initial ? 'Изменение локации' : 'Новая локация'}
        open={open}
        onClose={() => setOpen(false)}
      >
        {open && (
          <LocationForm
            initial={initial}
            done={() => {
              setOpen(false);
              for (const key of ['locations', 'location', 'rack', 'placement'])
                void client.invalidateQueries({ queryKey: [key] });
            }}
          />
        )}
      </Drawer>
    </>
  );
}
function LocationForm({
  initial,
  done,
}: {
  initial?: Model<'PhysicalLocation'>;
  done: () => void;
}) {
  const [kind, setKind] = useState<Model<'PhysicalLocationInput'>['kind']>(initial?.kind || 'site');
  const [name, setName] = useState(initial?.name || '');
  const [parent, setParent] = useState(initial?.parent_id || '');
  const [units, setUnits] = useState(initial?.rack_units || 42);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState<Model<'PhysicalLocationInput'> | null>(null);
  const [baseRevision] = useState(initial?.revision ?? 0);
  const [key] = useState(idempotencySlot);
  const parentKind = kind === 'rack' ? 'room' : kind === 'room' ? 'building' : 'site';
  const parents = useQuery({
    queryKey: ['location-parents', parentKind],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/locations', {
          params: { query: { kind: parentKind, limit: 200, offset: 0 } },
          signal,
        }),
      ),
    enabled: !initial && kind !== 'site',
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('Сначала проверьте локацию');
      return initial
        ? unwrap(
            await api.PUT('/api/locations/{id}', {
              params: { path: { id: initial.id }, header: { 'Idempotency-Key': key(review) } },
              body: review,
            }),
          )
        : unwrap(
            await api.POST('/api/locations', {
              params: { header: { 'Idempotency-Key': key(review) } },
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
          kind,
          name: name.trim(),
          parent_id: kind === 'site' ? null : parent,
          rack_units: kind === 'rack' ? units : 0,
          expected_revision: baseRevision,
          reason: reason.trim(),
        });
      }}
    >
      <Notice>
        Иерархия: площадка → здание → помещение → стойка. Тип и родитель существующей локации
        неизменяемы. Уменьшение стойки с занятыми юнитами проверяет backend.
      </Notice>
      <label>
        Тип локации
        <select
          value={kind}
          disabled={!!initial}
          onChange={(e) => {
            setKind(e.target.value as typeof kind);
            setParent('');
          }}
        >
          <option value="site">Площадка</option>
          <option value="building">Здание</option>
          <option value="room">Помещение</option>
          <option value="rack">Стойка</option>
        </select>
      </label>
      <label>
        Название локации
        <input required maxLength={128} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      {kind !== 'site' && (
        <>
          {!initial && (
            <QueryState query={parents}>
              <label>
                Выбрать родителя
                <select value={parent} onChange={(e) => setParent(e.target.value)}>
                  <option value="">Выберите {parentKind}…</option>
                  {parents.data?.items?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.id}
                    </option>
                  ))}
                </select>
              </label>
              <small>Список ограничен 200 записями. Можно указать точный ID ниже.</small>
            </QueryState>
          )}
          <label>
            ID родительской локации
            <input
              required
              value={parent}
              disabled={!!initial}
              onChange={(e) => setParent(e.target.value)}
            />
          </label>
        </>
      )}
      {kind === 'rack' && (
        <label>
          Ёмкость стойки, U
          <input
            required
            type="number"
            min={1}
            max={100}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
          />
        </label>
      )}
      <label>
        Причина изменения локации
        <input
          required
          minLength={3}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Button type="submit" disabled={!name.trim() || reason.trim().length < 3}>
        Проверить локацию
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
        }}
        title="Сохранить локацию?"
        description="Создать или обновить физическую локацию с показанными параметрами."
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={
          mutation.error instanceof ApiError && [0, 409].includes(mutation.error.status)
        }
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            Название: review?.name,
            Тип: review?.kind,
            Родитель: review?.parent_id,
            Ёмкость: review?.rack_units,
            Ревизия: review?.expected_revision,
            Причина: review?.reason,
          }}
        />
      </ConfirmDialog>
    </form>
  );
}
