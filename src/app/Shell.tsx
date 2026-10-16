import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Database,
  Server,
  Network,
  AlertTriangle,
  ScrollText,
  Phone,
  GitCompareArrows,
  Workflow,
  FileChartColumn,
  MapPin,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, setCSRF } from '../api/client';
import { useAuth } from '../features/auth/auth';
import { Button } from '../components/ui/button';
import { can } from '../lib/status';
import { clearPrivateCache } from '../api/session-cache';
import { breadcrumbs } from './breadcrumbs';
const navigation = [
  { label: 'Обзор', path: '/overview', icon: LayoutDashboard, group: 'Мониторинг' },
  { label: 'Источники данных', path: '/sources', icon: Database },
  { label: 'Коллекторы', path: '/collectors', icon: Activity },
  { label: 'Оборудование', path: '/assets', icon: Server },
  { label: 'Топология сети', path: '/topology', icon: Network },
  { label: 'Размещение', path: '/locations', icon: MapPin },
  { label: 'Инциденты', path: '/incidents', icon: AlertTriangle, group: 'Эксплуатация' },
  { label: 'Логи и аудит', path: '/logs', icon: ScrollText },
  { label: 'Телефония', path: '/telephony', icon: Phone },
  { label: 'Конфигурации', path: '/configuration/drift', icon: GitCompareArrows },
  { label: 'Автоматизация', path: '/automation/jobs', icon: Workflow },
  { label: 'Команды и откат', path: '/automation/commands', icon: RotateCcw },
  { label: 'Отчёты', path: '/reports', icon: FileChartColumn },
  { label: 'Моя учётная запись', path: '/account', icon: KeyRound, group: 'Личный доступ' },
  {
    label: 'Администрирование',
    path: '/admin/users',
    icon: Users,
    group: 'Управление',
    permission: 'access.manage',
  },
  {
    label: 'Сертификаты коллекторов',
    path: '/security/pki',
    icon: ShieldCheck,
    permission: 'access.manage',
  },
];
export default function Shell() {
  const auth = useAuth();
  const client = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [light, setLight] = useState(() => localStorage.getItem('infrapulse-theme') === 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    localStorage.setItem('infrapulse-theme', light ? 'light' : 'dark');
  }, [light]);
  const logout = useMutation({
    mutationFn: async () => {
      unwrap(await api.POST('/api/auth/logout'));
    },
    onSuccess: () => {
      clearPrivateCache(client);
      client.setQueryData(['session'], null);
      setCSRF('');
      navigate('/login');
    },
  });
  const crumbs = breadcrumbs(location.pathname);
  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <a href="#main" className="skip-link">
        К содержимому
      </a>
      <aside className="sidebar">
        <Link to="/overview" className="brand">
          <span className="brand-icon">
            <Activity size={23} />
          </span>
          <span className="brand-name">
            InfraPulse<small>NETOPS PLATFORM</small>
          </span>
        </Link>
        <div className="workspace-label">
          <span className="workspace-avatar">IP</span>
          <span>
            Рабочее пространство<small>Инфраструктура</small>
          </span>
          <ChevronRight size={14} />
        </div>
        <nav aria-label="Основная навигация">
          {navigation
            .filter((n) => !n.permission || can(auth.session?.permissions, n.permission))
            .map((n) => (
              <div key={n.path}>
                {n.group && <div className="nav-group">{n.group}</div>}
                <NavLink
                  to={n.path}
                  title={collapsed ? n.label : undefined}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <n.icon size={18} />
                  <span>{n.label}</span>
                </NavLink>
              </div>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-info">
            <ShieldIcon />
            <span>
              Контроль на основе фактов<small>Backend API · 0.44.0</small>
            </span>
          </div>
          <Button
            variant="ghost"
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>Свернуть меню</span>
          </Button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <nav className="breadcrumbs" aria-label="Путь страницы">
            {crumbs.map((crumb, i) => (
              <span className="breadcrumb-part" key={`${i}:${crumb.label}`}>
                {i > 0 && <ChevronRight size={13} aria-hidden />}
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <strong
                    aria-current={i === crumbs.length - 1 ? 'page' : undefined}
                    title={crumb.full}
                  >
                    {crumb.label}
                  </strong>
                )}
              </span>
            ))}
          </nav>
          <form
            className="global-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/assets?q=${encodeURIComponent(search)}`);
            }}
          >
            <Search size={16} />
            <input
              aria-label="Поиск оборудования"
              placeholder="Поиск оборудования…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd>↵</kbd>
          </form>
          <div className="topbar-actions">
            <button
              className="icon-button"
              title="Обновить данные"
              aria-label="Обновить данные"
              onClick={() => void client.invalidateQueries()}
            >
              <RefreshCw size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Переключить тему"
              onClick={() => setLight(!light)}
            >
              {light ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="user-chip">
              <span className="user-avatar">
                {auth.session?.user.username.slice(0, 2).toUpperCase()}
              </span>
              <div>
                {auth.session?.user.username}
                <small>{auth.session?.user.role}</small>
              </div>
            </div>
            <button
              className="icon-button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Выйти"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        {import.meta.env.VITE_DEMO_MODE === 'true' && (
          <div className="demo-banner">
            ДЕМОНСТРАЦИЯ · Все данные тестовые. Реальное оборудование не подключено.
          </div>
        )}
        {logout.error && (
          <div className="notice" role="alert">
            Не удалось завершить сессию: {logout.error.message}
          </div>
        )}
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            <span className="tiny-dot" />
            InfraPulse Control Plane
          </span>
          <span>Статусы и результаты подтверждает backend</span>
        </footer>
      </div>
    </div>
  );
}
function ShieldIcon() {
  return (
    <span className="security-mark">
      <Activity size={16} />
    </span>
  );
}
