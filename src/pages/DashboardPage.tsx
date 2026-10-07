import { Database, Server } from 'lucide-react'
import { StatusBadge, type TriState } from '../components/common/StatusBadge'
import { useSystemHealth } from '../hooks/useSystemHealth'

function tri(isSuccess: boolean, isError: boolean): TriState {
  if (isSuccess) return 'ok'
  if (isError) return 'down'
  return 'loading'
}

export function DashboardPage() {
  const { health, ready } = useSystemHealth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="mt-1 text-sm text-slate-400">
          Обзор состояния платформы. Данные агентов и устройств появятся на следующих этапах.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="card">
          <div className="card-title">
            <Server size={16} /> Backend process
          </div>
          <StatusBadge
            title="GET /healthz"
            state={tri(health.isSuccess, health.isError)}
            detail={health.isSuccess ? 'OK' : health.isError ? 'DOWN' : 'CHECK…'}
          />
          <div className="mt-3 font-mono text-xs text-slate-500">опрос каждые 5 c</div>
        </div>

        <div className="card">
          <div className="card-title">
            <Database size={16} /> PostgreSQL
          </div>
          <StatusBadge
            title="GET /readyz"
            state={tri(ready.isSuccess, ready.isError)}
            detail={ready.isSuccess ? 'READY' : ready.isError ? 'DOWN' : 'CHECK…'}
          />
          <div className="mt-3 font-mono text-xs text-slate-500">опрос каждые 5 c</div>
        </div>

        <div className="card">
          <div className="card-title">Источники данных</div>
          <p className="text-sm text-slate-400">
            Агенты и устройства будут загружаться из{' '}
            <code className="font-mono text-netops-accent">/api/agents</code> и{' '}
            <code className="font-mono text-netops-accent">/api/devices</code>{' '}
            начиная с Этапа 2.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Дорожная карта фронтенда</div>
        <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
          <li>
            <span className="font-semibold text-netops-success">Этап 1 (этот):</span> каркас,
            роутинг, proxy, индикаторы здоровья
          </li>
          <li>Этап 2: списки агентов и устройств</li>
          <li>Этап 3: карточка устройства и inventory</li>
          <li>Этап 4: телеметрия и история метрик</li>
          <li>Этап 5: политики мониторинга (GET/PUT)</li>
        </ol>
      </div>
    </div>
  )
}