import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, unwrap } from '../../api/client';
import { useAuth } from './auth';
import { Button } from '../../components/ui/button';
import { ConfirmDialog, Facts, Notice, PageHeader, Panel } from '../../components/shared';

export default function Account() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [review, setReview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const valid =
    !!current &&
    [...password].length >= 12 &&
    new TextEncoder().encode(password).length <= 256 &&
    password === repeat;
  const clear = () => {
    setCurrent('');
    setPassword('');
    setRepeat('');
  };
  const submit = async () => {
    if (!valid || pending) return;
    setPending(true);
    setError(null);
    try {
      // Passwords stay out of query/mutation caches, URLs and browser storage.
      unwrap(
        await api.POST('/api/auth/password', { body: { current_password: current, password } }),
      );
      clear();
      window.dispatchEvent(new Event('session-expired'));
      navigate('/login?password_changed=1', { replace: true });
    } catch (e) {
      setError(e as Error);
    } finally {
      clear();
      setPending(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Моя учётная запись"
        title="Смена пароля"
        description="Доступна каждому вошедшему пользователю. Требуется текущий пароль."
      />
      <Panel title="Личная безопасность">
        <Facts
          values={{ Пользователь: auth.session?.user.username, Роль: auth.session?.user.role }}
        />
        <Notice>
          После успешной смены backend завершит все ваши сессии, включая эту. Потребуется войти
          заново. Пароли не сохраняются в localStorage и не включаются в подтверждение.
        </Notice>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) {
              setError(null);
              setReview(true);
            }
          }}
        >
          <input
            autoComplete="username"
            value={auth.session?.user.username || ''}
            readOnly
            hidden
          />
          <label>
            Текущий пароль
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              disabled={review}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </label>
          <label>
            Новый пароль
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={review}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Повторите новый пароль
            <input
              type="password"
              autoComplete="new-password"
              value={repeat}
              disabled={review}
              onChange={(e) => setRepeat(e.target.value)}
            />
          </label>
          <small>Минимум 12 символов, максимум 256 байт UTF-8. Повтор должен совпадать.</small>
          {repeat && password !== repeat && <p className="field-error">Пароли не совпадают</p>}
          <Button type="submit" disabled={!valid}>
            Проверить смену пароля
          </Button>
        </form>
      </Panel>
      <ConfirmDialog
        open={review}
        onClose={() => {
          setReview(false);
          setError(null);
          clear();
        }}
        title="Изменить свой пароль?"
        description="Все ваши сессии будут отозваны. Следующий вход — с новым паролем."
        pending={pending}
        error={error}
        confirmDisabled={!valid || !!error}
        onConfirm={() => void submit()}
      >
        <Facts values={{ Пользователь: auth.session?.user.username, Пароли: 'Скрыты' }} />
        {error && (
          <Notice>
            Поля паролей очищены. Автоматического повтора нет: закройте подтверждение и введите
            данные заново.
          </Notice>
        )}
      </ConfirmDialog>
    </>
  );
}
