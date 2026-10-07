import { NavLink } from 'react-router-dom'
import { Activity, LayoutDashboard, Network, Radio } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/agents', label: 'Агенты', icon: Radio, end: false },
  { to: '/devices', label: 'Устройства', icon: Network, end: false },
] as const

export function Sidebar() {
  return (
    <aside className="flex flex-col border-r border-slate-700 bg-netops-panel p-6">
      <div className="mb-10 flex items-center gap-3">
        <Activity size={28} strokeWidth={2.5} className="text-netops-accent" />
        <div>
          <div className="text-lg font-bold tracking-tight">InfraPulse</div>
          <div className="-mt-0.5 text-[11px] text-slate-400">NetOps Control Plane</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md border-l-2 px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                ? 'border-netops-accent bg-netops-accent/15 text-netops-accent'
                : 'border-transparent text-slate-400 hover:bg-slate-700/40 hover:text-slate-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 font-mono text-[11px] text-slate-500">
        frontend v0.1 · этап 1
      </div>
    </aside>
  )
}