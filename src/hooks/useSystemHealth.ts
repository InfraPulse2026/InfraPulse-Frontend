import { useQuery } from '@tanstack/react-query'
import { getHealth, getReadiness } from '../api/health'

const POLL_MS = 5000

/**
 * Здоровье платформы. retry: 0 — чтобы при остановленном backend
 * индикатор краснел сразу, а не после трёх попыток.
 * refetchInterval держит статус актуальным без WebSocket (его в MVP нет).
 */
export function useSystemHealth() {
    const health = useQuery({
        queryKey: ['healthz'],
        queryFn: getHealth,
        refetchInterval: POLL_MS,
        retry: 0,
    })
    const ready = useQuery({
        queryKey: ['readyz'],
        queryFn: getReadiness,
        refetchInterval: POLL_MS,
        retry: 0,
    })
    return { health, ready }
}