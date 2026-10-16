// @vitest-environment node
import { beforeAll, afterAll, afterEach, describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { api, setCSRF, unwrap, retryRead, ApiError } from './client';
vi.hoisted(() => {
  vi.stubGlobal(
    'window',
    Object.assign(new EventTarget(), { location: { origin: 'http://localhost:3000' } }),
  );
});
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  setCSRF('');
});
afterAll(() => server.close());
describe('same-origin API contract', () => {
  it('sends cookies and CSRF on mutation, with no bearer header', async () => {
    let token: string | null = null;
    let auth: string | null = null;
    let credentials: string | undefined;
    server.use(
      http.post('*/api/auth/logout', ({ request }) => {
        token = request.headers.get('X-CSRF-Token');
        auth = request.headers.get('Authorization');
        credentials = request.credentials;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    setCSRF('test-csrf');
    unwrap(await api.POST('/api/auth/logout'));
    expect(token).toBe('test-csrf');
    expect(auth).toBeNull();
    expect(credentials).toBe('include');
  });
  it('preserves conflict code without automatically resubmitting', async () => {
    let count = 0;
    server.use(
      http.post('*/api/auth/logout', () => {
        count++;
        return HttpResponse.json(
          { error: { code: 'revision_conflict', message: 'Read latest state' } },
          { status: 409 },
        );
      }),
    );
    expect(() =>
      unwrap({
        data: undefined,
        error: { error: { code: 'revision_conflict', message: 'Read latest state' } },
        response: new Response(null, { status: 409 }),
      }),
    ).toThrow(ApiError);
    await expect(api.POST('/api/auth/logout').then(unwrap)).rejects.toMatchObject({
      status: 409,
      code: 'revision_conflict',
    });
    expect(count).toBe(1);
    expect(retryRead(0, new ApiError(409, '', ''))).toBe(false);
  });
  it('emits session expiration so sensitive cache can be cleared', async () => {
    let count = 0;
    const expired = () => count++;
    window.addEventListener('session-expired', expired);
    server.use(
      http.get('*/api/auth/me', () =>
        HttpResponse.json({ error: { code: 'unauthorized', message: 'Expired' } }, { status: 401 }),
      ),
    );
    await api.GET('/api/auth/me');
    expect(count).toBe(1);
    window.removeEventListener('session-expired', expired);
  });
});
