import createClient from 'openapi-fetch';
import type { paths, components } from './generated/schema';

export type Model<N extends keyof components['schemas']> = components['schemas'][N];
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
let csrf = '';
export const setCSRF = (token: string) => {
  csrf = token;
};
export const api = createClient<paths>({
  baseUrl: window.location.origin,
  credentials: 'include',
  fetch: async (request: Request) => {
    let response: Response;
    try {
      // Use the request's realm (native Request + JSDOM have different signal classes).
      const Signal = request.signal.constructor as typeof AbortSignal;
      const signal =
        typeof Signal.any === 'function' && typeof Signal.timeout === 'function'
          ? Signal.any([request.signal, Signal.timeout(30_000)])
          : request.signal;
      response = await fetch(new Request(request, { signal }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new ApiError(
        0,
        'network_error',
        'Не удалось связаться с backend. Проверьте подключение.',
      );
    }
    if (response.status === 401 && !request.url.endsWith('/api/auth/login')) {
      setCSRF('');
      window.dispatchEvent(new Event('session-expired'));
    }
    return response;
  },
});
api.use({
  onRequest({ request }) {
    if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
      const scenario = new URLSearchParams(window.location.search).get('test_scenario');
      if (
        scenario &&
        [
          'outage',
          'empty',
          'conflict',
          'pki-disabled',
          'commands-disabled',
          'rollback-stale',
          'rollback-uncertain',
        ].includes(scenario)
      )
        request.headers.set('X-InfraPulse-Demo-Scenario', scenario);
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && csrf)
      request.headers.set('X-CSRF-Token', csrf);
    request.headers.set('Accept', 'application/json');
    return request;
  },
});
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (!result.response.ok) {
    const error = result.error as { error?: { code?: string; message?: string } } | undefined;
    throw new ApiError(
      result.response.status,
      error?.error?.code || 'request_failed',
      error?.error?.message || 'Запрос не выполнен',
      result.response.headers.get('X-Request-ID') || undefined,
    );
  }
  return result.data as T;
}
export const retryRead = (attempt: number, error: Error) =>
  attempt < 1 && (!(error instanceof ApiError) || error.status >= 500 || error.status === 0);
export const emptyQuery = <T extends Record<string, unknown>>(query: T): T =>
  Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v !== undefined)) as T;
