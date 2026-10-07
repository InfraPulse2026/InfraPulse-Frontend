import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="font-mono text-6xl font-bold text-netops-accent">404</div>
      <p className="text-slate-400">Страница не найдена</p>
      <Link to="/" className="text-sm text-netops-accent underline underline-offset-4">
        Вернуться на дашборд
      </Link>
    </div>
  )
}