export function DevicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Устройства</h1>
        <p className="mt-1 text-sm text-slate-400">
          Этап 2 — список устройств с фильтрацией по агенту и пагинацией. Этапы 3–4 — карточка
          устройства, inventory, телеметрия и история метрик.
        </p>
      </div>
      <div className="card border-dashed">
        <code className="font-mono text-sm text-slate-500">
          {'GET /api/devices?limit=100&offset=0&agent_id=...'}
        </code>
      </div>
    </div>
  )
}