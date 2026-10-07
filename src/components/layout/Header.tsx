import { ExternalLink } from 'lucide-react'
import { useSystemHealth } from '../../hooks/useSystemHealth'
import { StatusBadge, type TriState } from '../common/StatusBadge'

function tri(isSuccess: boolean, isError: boolean): TriState {
  if (isSuccess) return 'ok'
  if (isError) return 'down'
  return 'loading'
}

export function Header() {
  const { health, ready } = useSystemHealth()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 bg-netops-bg/80 px-8 py-4 backdrop-blur">
      <div className="font-mono text-xs text-slate-500">
        localhost:3000 → vite proxy → 127.0.0.1:8080
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge
          title="Backend"
          state={tri(health.isSuccess, health.isError)}
          detail={health.isSuccess ? 'OK' : health.isError ? 'DOWN' : 'CHECK…'}
        />
        <StatusBadge
          title="PostgreSQL"
          state={tri(ready.isSuccess, ready.isError)}
          detail={ready.isSuccess ? 'READY' : ready.isError ? 'DOWN' : 'CHECK…'}
        />
        <a
          href="/openapi.json"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-netops-panel px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-netops-accent hover:text-netops-accent"
        >
          <ExternalLink size={14} /> OpenAPI
        </a>
      </div>
    </header>
  )
}