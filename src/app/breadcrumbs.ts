export type Crumb = { label: string; to?: string; full?: string };
export function breadcrumbs(path: string): Crumb[] {
  const parts = path.split('/').filter(Boolean);
  const routes: Record<string, string> = {
    overview: 'Обзор',
    sources: 'Источники данных',
    collectors: 'Коллекторы',
    assets: 'Оборудование',
    topology: 'Топология сети',
    locations: 'Размещение',
    incidents: 'Инциденты',
    logs: 'Логи и аудит',
    telephony: 'Телефония',
    reports: 'Отчёты',
    account: 'Моя учётная запись',
    configuration: 'Конфигурации',
    security: 'Безопасность',
    admin: 'Администрирование',
    automation: 'Автоматизация',
  };
  const out: Crumb[] = [{ label: 'Рабочая среда', to: '/overview' }];
  const first = parts[0] || 'overview';
  const label = routes[first] || 'Страница';
  const nested = parts.length > 1;
  const roots: Record<string, string> = {
    configuration: '/configuration/drift',
    security: '/security/pki',
    admin: '/admin/users',
    automation: '/automation/jobs',
  };
  out.push({ label, to: nested ? roots[first] || `/${first}` : undefined });
  let at = 1;
  const sub: Record<string, string> = {
    jobs: 'Задания',
    commands: 'Команды и откат',
    remediations: 'Исправления',
    signals: 'Симптом',
    pki: 'Сертификаты',
    users: 'Пользователи',
    drift: 'Отклонения',
  };
  if (
    parts[1] &&
    sub[parts[1]] &&
    ['automation', 'incidents', 'security', 'admin', 'configuration'].includes(first)
  ) {
    out.push({
      label: sub[parts[1]]!,
      to:
        parts.length > 2 && parts[1] !== 'remediations'
          ? `/${first}/${parts[1] === 'signals' ? '' : parts[1]}`.replace(/\/$/, '')
          : undefined,
    });
    at = 2;
  }
  const id = parts[at];
  if (id) {
    let decoded = id;
    try {
      decoded = decodeURIComponent(id);
    } catch {
      /* Keep literal route segment. */
    }
    out.push({
      label: decoded.length > 30 ? `${decoded.slice(0, 16)}…${decoded.slice(-8)}` : decoded,
      full: decoded,
    });
  }
  return out;
}
