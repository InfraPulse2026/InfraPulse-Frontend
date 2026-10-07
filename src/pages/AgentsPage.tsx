export function AgentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Агенты (Collectors)</h1>
        <p className="mt-1 text-sm text-slate-400">
          Раздел реализуется на Этапе 2: таблица подключённых агентов, сессии, heartbeat.
        </p>
      </div>
      <div className="card border-dashed">
        <code className="font-mono text-sm text-slate-500">
          {'GET /api/agents → { "items": [ ... ] }  // максимум 1000 записей'}
        </code>
      </div>
    </div>
  )
}