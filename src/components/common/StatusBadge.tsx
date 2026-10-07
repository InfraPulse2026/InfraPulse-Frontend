export type TriState = 'loading' | 'ok' | 'down'

const DOT: Record<TriState, string> = {
  loading: 'bg-slate-500 animate-pulse',
  ok: 'bg-netops-success',
  down: 'bg-netops-danger',
}

const TEXT: Record<TriState, string> = {
  loading: 'text-slate-400',
  ok: 'text-netops-success',
  down: 'text-netops-danger',
}

interface Props {
  title: string
  state: TriState
  detail: string
}

export function StatusBadge({ title, state, detail }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-netops-panel px-3 py-1.5 text-xs">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${DOT[state]}`} />
      <span className="text-slate-300">{title}:</span>
      <span className={`font-mono font-semibold ${TEXT[state]}`}>{detail}</span>
    </div>
  )
}