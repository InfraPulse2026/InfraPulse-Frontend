import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, unwrap, type Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import { ConfirmDialog, Facts, Notice } from '../../components/shared';
import { useAuth } from '../auth/auth';

export default function UserEditor({
  user,
  onDone,
}: {
  user: Model<'AccessUser'>;
  onDone: () => void;
}) {
  const auth = useAuth();
  const [role, setRole] = useState(user.role);
  const [disabled, setDisabled] = useState(user.disabled);
  const [password, setPassword] = useState('');
  const [review, setReview] = useState<'access' | 'password' | null>(null);
  const self = user.id === auth.session?.user.id;
  const mutation = useMutation({
    mutationFn: async () => {
      if (review === 'password')
        return unwrap(
          await api.POST('/api/access/users/{id}/password', {
            params: { path: { id: user.id } },
            body: { password },
          }),
        );
      return unwrap(
        await api.PATCH('/api/access/users/{id}', {
          params: { path: { id: user.id } },
          body: { role, disabled },
        }),
      );
    },
    onSuccess: () => {
      onDone();
      if (self) window.dispatchEvent(new Event('session-expired'));
    },
    onSettled: () => {
      setPassword('');
    },
  });
  const validPassword =
    [...password].length >= 12 && new TextEncoder().encode(password).length <= 256;
  return (
    <div className="stack-form">
      <Facts values={{ Пользователь: user.username, ID: user.id, 'Текущая роль': user.role }} />
      <Notice>
        Изменение роли, доступа или пароля завершит все сессии пользователя. Последнего активного
        администратора защищает backend.
        {self ? ' Вы редактируете свою учётную запись: потребуется повторный вход.' : ''}
      </Notice>
      <label>
        Новая роль
        <select
          value={role}
          disabled={!!review}
          onChange={(e) => setRole(e.target.value as typeof role)}
        >
          <option value="viewer">Viewer</option>
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={disabled}
          disabled={!!review}
          onChange={(e) => setDisabled(e.target.checked)}
        />{' '}
        Отключить пользователя
      </label>
      <Button
        disabled={role === user.role && disabled === user.disabled}
        onClick={() => {
          mutation.reset();
          setReview('access');
        }}
      >
        Проверить изменение доступа
      </Button>
      <hr />
      <label>
        Новый пароль пользователя
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          disabled={!!review}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <small>
        Минимум 12 символов, максимум 256 байт UTF-8. Пароль не отображается в подтверждении и не
        сохраняется в браузере.
      </small>
      <Button
        disabled={!validPassword}
        onClick={() => {
          mutation.reset();
          setReview('password');
        }}
      >
        Проверить сброс пароля
      </Button>
      <ConfirmDialog
        open={!!review}
        onClose={() => {
          setReview(null);
          mutation.reset();
          setPassword('');
        }}
        title={review === 'password' ? 'Сбросить пароль?' : 'Изменить доступ?'}
        description={`Все сессии ${user.username} будут отозваны после успешного изменения.`}
        pending={mutation.isPending}
        confirmDisabled={review === 'password' && !validPassword}
        error={mutation.error}
        onConfirm={() => mutation.mutate()}
      >
        <Facts
          values={{
            Пользователь: user.username,
            ...(review === 'access'
              ? { Роль: role, Доступ: disabled ? 'Отключить' : 'Разрешить' }
              : { Пароль: 'Скрыт' }),
          }}
        />
        {mutation.isError && review === 'password' && !password && (
          <Notice>Пароль очищен после попытки. Закройте подтверждение и введите его заново.</Notice>
        )}
      </ConfirmDialog>
    </div>
  );
}
