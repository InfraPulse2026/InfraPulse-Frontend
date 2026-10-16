import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, setCSRF, unwrap, type Model, ApiError } from '../../api/client';
import { sessionQuery, useSession } from '../../api/queries';
import { Button } from '../../components/ui/button';
import { ErrorState, Loading } from '../../components/shared';
import { safeInternalPath } from '../../lib/format';
import { clearPrivateCache } from '../../api/session-cache';

type Auth = {
  session?: Model<'AccessMe'>;
  pending: boolean;
  error: Error | null;
  refresh: () => void;
};
const Context = createContext<Auth>({ pending: true, error: null, refresh() {} });
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useSession();
  const client = useQueryClient();
  useEffect(() => {
    setCSRF(query.data?.csrf_token || '');
  }, [query.data]);
  useEffect(() => {
    const expire = () => {
      setCSRF('');
      clearPrivateCache(client);
      client.setQueryData(['session'], null);
    };
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, [client]);
  return (
    <Context.Provider
      value={{
        session: query.data || undefined,
        pending: query.isPending,
        error: query.error,
        refresh: () => void query.refetch(),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function Protected({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.pending)
    return (
      <div className="boot">
        <Activity />
        <Loading />
      </div>
    );
  if (auth.error && !(auth.error instanceof ApiError && auth.error.status === 401))
    return (
      <div className="boot">
        <ErrorState error={auth.error} retry={auth.refresh} />
      </div>
    );
  if (!auth.session)
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  return <>{children}</>;
}
const schema = z.object({
  username: z.string().min(1, 'Укажите имя пользователя'),
  password: z.string().min(1, 'Введите пароль'),
});
export default function Login() {
  const auth = useAuth();
  const client = useQueryClient();
  const location = useLocation();
  const [error, setError] = useState<Error | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const next = safeInternalPath(new URLSearchParams(location.search).get('next') || '/overview');
  if (auth.session) return <Navigate to={next && next !== '/login' ? next : '/overview'} replace />;
  return (
    <div className="login-page">
      <div className="login-story">
        <div className="brand">
          <span className="brand-icon">
            <Activity />
          </span>
          InfraPulse
        </div>
        <div>
          <div className="eyebrow">NETOPS CONTROL PLANE</div>
          <h1>
            Вся инфраструктура.
            <br />
            <span>Одна картина.</span>
          </h1>
          <p>
            От первого сигнала до подтверждённого восстановления — с фактами, источниками и
            контролем каждого действия.
          </p>
          <div className="login-diagram">
            <span>Zabbix</span>
            <span>Collector</span>
            <span>Prometheus</span>
            <div className="diagram-core">
              <Activity />
              InfraPulse
            </div>
            <span className="diagram-caption">Наблюдать → объяснять → действовать</span>
          </div>
        </div>
        <small>
          <ShieldCheck size={15} /> Безопасные действия · Проверяемые результаты
        </small>
      </div>
      <div className="login-form-area">
        <form
          className="login-form"
          onSubmit={form.handleSubmit(async (values) => {
            setError(null);
            try {
              const result = unwrap(await api.POST('/api/auth/login', { body: values }));
              form.resetField('password');
              clearPrivateCache(client);
              setCSRF(result.csrf_token);
              await client.fetchQuery({ ...sessionQuery, staleTime: 0 });
            } catch (e) {
              setError(e as Error);
              form.resetField('password');
            }
          })}
        >
          <span className="login-lock">
            <LockKeyhole size={24} />
          </span>
          <h2>Добро пожаловать</h2>
          <p>Войдите в рабочую среду InfraPulse</p>
          {new URLSearchParams(location.search).get('password_changed') === '1' && (
            <div className="notice">
              Пароль изменён. Все прежние сессии завершены. Войдите с новым паролем.
            </div>
          )}
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <div className="notice">Демонстрационный режим · demo / demo</div>
          )}
          <label>
            Имя пользователя
            <input
              autoComplete="username"
              autoFocus
              placeholder="oleg"
              {...form.register('username')}
            />
            <small className="field-error">{form.formState.errors.username?.message}</small>
          </label>
          <label>
            Пароль
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Введите пароль"
              {...form.register('password')}
            />
            <small className="field-error">{form.formState.errors.password?.message}</small>
          </label>
          {error && <ErrorState error={error} />}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Проверяем…' : 'Войти в систему'}
            <ArrowRight size={17} />
          </Button>
          <p className="login-note">
            Доступ выдаёт администратор вашей команды.
            <br />
            Пароль хранится только на стороне backend.
          </p>
        </form>
        <small className="login-footer">InfraPulse · Единая среда управления инфраструктурой</small>
      </div>
    </div>
  );
}
