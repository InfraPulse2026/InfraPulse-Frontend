/**
 * Тонкий клиент REST API InfraPulse Backend.
 * Все пути относительные: запросы идут на origin dev-сервера Vite,
 * а vite.config.ts проксирует их на http://127.0.0.1:8080 (backend без CORS).
 */

export class ApiError extends Error {
    readonly status: number
    readonly code: string

    constructor(status: number, code: string, message: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
    }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
    let response: Response
    try {
        response = await fetch(path, {
            signal,
            headers: { Accept: 'application/json' },
        })
    } catch {
        // Сеть недоступна / proxy не смог достучаться до backend
        throw new ApiError(0, 'network_error', 'Backend is not reachable')
    }

    if (!response.ok) {
        let code = 'unknown'
        let message = `HTTP ${response.status}`
        try {
            const body = (await response.json()) as {
                error?: { code?: string; message?: string }
            }
            code = body.error?.code ?? code
            message = body.error?.message ?? message
        } catch {
            // тело не JSON — оставляем статус как сообщение
        }
        throw new ApiError(response.status, code, message)
    }

    return (await response.json()) as T
}