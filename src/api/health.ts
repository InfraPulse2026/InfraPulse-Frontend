import { apiGet } from './client'

export interface StatusResponse {
    status: string
}

/** Процесс backend жив. */
export const getHealth = () => apiGet<StatusResponse>('/healthz')

/** PostgreSQL доступен. */
export const getReadiness = () => apiGet<StatusResponse>('/readyz')