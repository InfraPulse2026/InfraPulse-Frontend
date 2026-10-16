import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { api, unwrap, type Model } from '../../api/client';
import { useAuth } from '../auth/auth';
import { can } from '../../lib/status';
import { useFilters } from '../../hooks/useFilters';
import {
  PageHeader,
  Panel,
  QueryState,
  DataTable,
  Badge,
  Time,
  Pagination,
  Drawer,
  ErrorState,
  Tabs,
  JsonView,
  Notice,
} from '../../components/shared';
import { Button } from '../../components/ui/button';
import UserEditor from './UserEditor';
export default function Admin() {
  const { params, update, offset } = useFilters();
  const auth = useAuth();
  const allowed = can(auth.session?.permissions, 'access.manage');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Model<'AccessUser'> | null>(null);
  const audit = params.get('tab') === 'audit';
  const client = useQueryClient();
  const users = useQuery({
    queryKey: ['users', offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/access/users', { params: { query: { limit: 50, offset } }, signal }),
      ),
    enabled: allowed && !audit,
  });
  const events = useQuery({
    queryKey: ['access-audit', offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/access/audit', { params: { query: { limit: 50, offset } }, signal }),
      ),
    enabled: allowed && audit,
  });
  if (!allowed)
    return (
      <Notice>Администрирование доступно только с access.manage. Права проверяет backend.</Notice>
    );
  return (
    <>
      <PageHeader
        eyebrow="Управление / Доступ"
        title="Администрирование"
        description="Учётные записи, роли и история действий."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} />
            Создать пользователя
          </Button>
        }
      />
      <Tabs
        active={audit ? 'audit' : 'users'}
        onChange={(v) => update('tab', v)}
        items={[
          { value: 'users', label: 'Пользователи' },
          { value: 'audit', label: 'Аудит доступа' },
        ]}
      />
      <Panel title={audit ? 'Журнал действий' : 'Пользователи'} actions={<ShieldCheck size={17} />}>
        {audit ? (
          <QueryState query={events}>
            <DataTable
              data={events.data?.items || []}
              columns={[
                {
                  header: 'Событие',
                  cell: ({ row }) => <JsonView value={row.original} title="Событие аудита" />,
                },
              ]}
            />
          </QueryState>
        ) : (
          <QueryState query={users}>
            <DataTable
              data={users.data?.items || []}
              columns={[
                { header: 'Пользователь', accessorKey: 'username' },
                { header: 'Роль', accessorKey: 'role' },
                {
                  header: 'Доступ',
                  cell: ({ row }) => (
                    <Badge
                      value={row.original.disabled ? 'disabled' : 'connected'}
                      label={row.original.disabled ? 'Отключён' : 'Разрешён'}
                    />
                  ),
                },
                {
                  header: 'Последний вход',
                  cell: ({ row }) => <Time value={row.original.last_login_at} />,
                },
                {
                  header: 'Действия',
                  cell: ({ row }) => (
                    <Button variant="secondary" onClick={() => setEditing(row.original)}>
                      Управлять {row.original.username}
                    </Button>
                  ),
                },
              ]}
            />
          </QueryState>
        )}
        <Pagination
          offset={offset}
          count={(audit ? events.data?.items?.length : users.data?.items?.length) || 0}
          onChange={(n) => update('offset', n)}
        />
      </Panel>
      <Drawer title="Новый пользователь" open={adding} onClose={() => setAdding(false)}>
        {adding && (
          <UserForm
            onDone={() => {
              setAdding(false);
              void client.invalidateQueries({ queryKey: ['users'] });
            }}
          />
        )}
      </Drawer>
      <Drawer title="Управление пользователем" open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <UserEditor
            key={editing.id}
            user={editing}
            onDone={() => {
              setEditing(null);
              void client.invalidateQueries({ queryKey: ['users'] });
              void client.invalidateQueries({ queryKey: ['access-audit'] });
            }}
          />
        )}
      </Drawer>
    </>
  );
}
function UserForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Model<'AccessCreateUser'>['role']>('viewer');
  const mutation = useMutation({
    mutationFn: async () =>
      unwrap(await api.POST('/api/access/users', { body: { username, password, role } })),
    onSuccess: () => {
      setPassword('');
      onDone();
    },
  });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <label>
        Имя пользователя
        <input
          required
          minLength={3}
          maxLength={64}
          pattern="[a-z0-9][a-z0-9._-]{2,63}"
          value={username}
          autoComplete="off"
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label>
        Пароль (минимум 12 символов)
        <input
          required
          type="password"
          minLength={12}
          maxLength={256}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label>
        Роль
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="viewer">Viewer — просмотр</option>
          <option value="operator">Operator — разрешённые операции</option>
          <option value="admin">Admin — управление доступом</option>
        </select>
      </label>
      {mutation.error && <ErrorState error={mutation.error} />}
      <Button type="submit" disabled={mutation.isPending}>
        Создать пользователя
      </Button>
    </form>
  );
}
