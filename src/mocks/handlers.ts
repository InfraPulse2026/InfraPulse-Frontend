import { caseFixture } from './fixtures';
import { pkiCertificates, pkiTokens, pkiAudit } from './pki-fixtures';
import { commandFixtures, commandSnapshotFixtures, commandPolicy } from './command-fixtures';
import {
  networkHistory,
  auditRecords,
  auditGroup,
  externalMetrics,
  prometheusRange,
} from './monitoring-fixtures';
// Development/test only. These fixtures never represent live equipment.
import { http, HttpResponse, delay, type HttpHandler } from 'msw';
import type { Model } from '../api/client';
import {
  assets,
  agents,
  sources,
  cases,
  signals,
  topology,
  logs,
  sip,
  locations,
  drift,
  report,
  bindings,
  now,
  snapshotContent,
} from './fixtures';
const mutableAssets: Model<'Asset'>[] = assets;
const identityBindings = new Map<string, Model<'AssetSourceBinding'>[]>();
const assetDecisions: Model<'AssetDecision'>[] = [];
const currentBindings = (id: string) => identityBindings.get(id) ?? bindings(id);
const permissions = {
  viewer: ['data.read'],
  operator: [
    'data.read',
    'monitoring.write',
    'commands.write',
    'incidents.write',
    'analysis.write',
    'reports.write',
  ],
  admin: [
    'data.read',
    'monitoring.write',
    'commands.write',
    'incidents.write',
    'analysis.write',
    'reports.write',
    'access.manage',
  ],
};
type Role = keyof typeof permissions;
const users: Model<'AccessUser'>[] = ['admin', 'operator', 'viewer'].map((role, i) => ({
  id: `usr_${String(i).padStart(32, '0')}`,
  username: role === 'admin' ? 'demo' : role,
  role: role as Role,
  disabled: false,
  created_at: now,
  updated_at: now,
  last_login_at: now,
}));
function role(request: Request): Role | undefined {
  const value = /infrapulse_demo_role=(admin|operator|viewer)/.exec(
    request.headers.get('cookie') || (typeof document !== 'undefined' ? document.cookie : ''),
  )?.[1];
  return value as Role | undefined;
}
const problem = (status: number, code: string, message: string) =>
  HttpResponse.json({ error: { code, message } }, { status });
function page<T>(items: T[], request: Request) {
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get('offset')) || 0;
  const limit = Number(url.searchParams.get('limit')) || 50;
  return { items: items.slice(offset, offset + limit), offset, limit };
}
function selectedLogs(request: Request, ignoreCursor = false) {
  const p = new URL(request.url).searchParams;
  return [...logs, ...auditRecords]
    .filter((item) => {
      for (const key of [
        'agent_id',
        'device_id',
        'source',
        'source_id',
        'host',
        'process',
      ] as const)
        if (p.has(key) && item[key] !== p.get(key)) return false;
      for (const key of ['record_type', 'event_id', 'executable'] as const)
        if (p.has(key) && item.audit?.[key] !== p.get(key)) return false;
      for (const key of ['uid', 'auid', 'pid'] as const)
        if (p.has(key) && item.audit?.[key] !== Number(p.get(key))) return false;
      if (p.has('facility') && item.facility !== Number(p.get('facility'))) return false;
      if (
        p.has('severity') &&
        (p.get('severity') === 'unknown'
          ? item.severity !== null
          : String(item.severity) !== p.get('severity'))
      )
        return false;
      if (
        p.has('success') &&
        (!item.audit ||
          (p.get('success') === 'unknown'
            ? item.audit.success !== null
            : item.audit.success !== (p.get('success') === 'true')))
      )
        return false;
      const term = p.get('q') || p.get('contains');
      if (
        term &&
        !`${item.message} ${item.audit?.executable || ''}`
          .toLowerCase()
          .includes(term.toLowerCase())
      )
        return false;
      if (p.get('from') && Date.parse(item.event_at) < Date.parse(p.get('from')!)) return false;
      if (p.get('to') && Date.parse(item.event_at) >= Date.parse(p.get('to')!)) return false;
      if (!ignoreCursor && p.get('before_id') && item.id >= Number(p.get('before_id')))
        return false;
      return true;
    })
    .sort((a, b) => b.id - a.id);
}
function logPage(items: Model<'LogRecord'>[], request: Request) {
  const limit = Number(new URL(request.url).searchParams.get('limit')) || 50;
  const selected = items.slice(0, limit);
  return {
    items: selected,
    limit,
    next_before_id: items.length > limit ? selected.at(-1)!.id : null,
  };
}
const respond = (value: unknown, status = 200) =>
  new HttpResponse(JSON.stringify(value ?? null), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
function read(
  path: string,
  fn: (request: Request, params: Record<string, string | readonly string[] | undefined>) => unknown,
): HttpHandler {
  return http.get(`*${path}`, async ({ request, params }) => {
    await delay(70);
    if (!role(request)) return problem(401, 'unauthorized', 'Сессия отсутствует');
    const scenario = request.headers.get('X-InfraPulse-Demo-Scenario');
    if (scenario === 'pki-disabled' && path.startsWith('/api/pki/'))
      return problem(503, 'pki_disabled', 'PKI is not enabled');
    if (scenario === 'outage' && !path.startsWith('/api/auth'))
      return problem(503, 'storage_unavailable', 'Тестовая недоступность backend');
    const result = fn(request, params);
    if (result instanceof HttpResponse) return result;
    if (scenario === 'empty' && result && typeof result === 'object' && 'items' in result)
      return respond({ ...result, items: [] });
    return respond(result);
  });
}
const json = async (r: Request) => (await r.json()) as Record<string, unknown>;
let jobs: Model<'DataSourceJob'>[] = [];
let remediation: Model<'ConfigurationRemediation'> | null = null;
let approvedAt = 0;
let jobCancelled = false;
let preview: Model<'AIPreview'> | null = null;
let analysisCreated = 0;
const snapshots: Model<'ReportV2Snapshot'>[] = [];
const schedules: Model<'ReportSchedule'>[] = [];
const baselines = new Map<string, Model<'ConfigurationBaseline'>>();
const policies = new Map<string, Model<'ConfigurationRemediationPolicy'>>();
const automationTargets = new Map<string, Model<'AutomationTarget'>>();
const placements = new Map<string, Model<'AssetPlacement'>>();
const configs = new Map<string, { state: Model<'CollectorConfigState'>; submitted: number }>();
const replay = new Map<string, { body: string; value: unknown }>();
const typedCommands = structuredClone(commandFixtures);
const typedSnapshots = structuredClone(commandSnapshotFixtures);
const rollbackRuns = new Map<string, { started: number; uncertain: boolean }>();
const snapshotReads = new Map<string, number>();
const typedEvents = new Map<string, Model<'CommandEvent'>[]>();
function projectCommand(id: string) {
  const command = typedCommands.find((c) => c.id === id);
  const run = rollbackRuns.get(id);
  if (command && run) {
    const age = Date.now() - run.started;
    const next =
      age > 3500 ? (run.uncertain ? 'uncertain' : 'success') : age > 1200 ? 'running' : 'queued';
    if (command.state !== next) {
      command.state = next;
      command.updated_at = new Date().toISOString();
      const events = typedEvents.get(id) || [];
      events.push({
        id: events.length + 1,
        command_id: id,
        state: next,
        reason: 'SIMULATED fake Agent progression',
        at: command.updated_at,
      });
      typedEvents.set(id, events);
      if (next === 'success' || next === 'uncertain') {
        const ref = typedSnapshots.find((s) => s.rollback_command_id === id);
        if (ref) {
          ref.status = next === 'success' ? 'consumed' : 'uncertain';
          ref.reason = 'SIMULATED rollback result';
        }
        command.result = {
          message_id: 'simulated-rollback-result',
          status: next === 'success' ? 'COMMAND_STATUS_SUCCESS' : 'COMMAND_STATUS_FAILED',
          started_at: new Date(run.started).toISOString(),
          finished_at: command.updated_at,
          changed: true,
          uncertain: next === 'uncertain',
          error_code: next === 'uncertain' ? 'verification_unknown' : '',
          error_message: 'SIMULATED fake Agent result',
          snapshot_id: '',
          verification:
            next === 'success'
              ? {
                  interface_id: command.interface_id,
                  name: command.interface_id,
                  expected_admin_up: true,
                  observed_admin_up: true,
                  observed_at: command.updated_at,
                  verified: true,
                  changed: true,
                  uncertain: false,
                  evidence: 'SIMULATED fake read-back',
                }
              : null,
        };
      }
    }
  }
  return command;
}
function mutate(
  path: string,
  permission: string,
  fn: (
    request: Request,
    params: Record<string, string | readonly string[] | undefined>,
    body: Record<string, unknown>,
  ) => unknown,
  status = 202,
  method: 'post' | 'put' | 'patch' = 'post',
): HttpHandler {
  return http[method](`*${path}`, async ({ request, params }) => {
    await delay(100);
    const r = role(request);
    if (!r) return problem(401, 'unauthorized', 'Сессия отсутствует');
    if (!permissions[r].includes(permission)) return problem(403, 'forbidden', 'Недостаточно прав');
    if (request.headers.get('X-CSRF-Token') !== 'demo-csrf')
      return problem(403, 'csrf_failed', 'Требуется CSRF');
    if (request.headers.get('X-InfraPulse-Demo-Scenario') === 'conflict')
      return problem(
        409,
        'revision_conflict',
        'Ревизия устарела. Перечитайте состояние; действие не выполнено.',
      );
    const body = request.headers.get('content-type')?.includes('application/json')
      ? await json(request)
      : {};
    const key = request.headers.get('Idempotency-Key');
    const slot = `${request.url}:${key}`;
    const old = key ? replay.get(slot) : undefined;
    if (old)
      return JSON.stringify(body) === old.body
        ? respond(old.value, status)
        : problem(409, 'idempotency_conflict', 'Ключ уже использован с другим содержимым');
    const value = fn(request, params, body);
    if (value instanceof HttpResponse) return value;
    if (key) replay.set(slot, { body: JSON.stringify(body), value });
    return respond(value, status);
  });
}
export const handlers: HttpHandler[] = [
  read('/api/commands/policy', (r) =>
    r.headers.get('X-InfraPulse-Demo-Scenario') === 'commands-disabled'
      ? { ...commandPolicy, enabled: false }
      : commandPolicy,
  ),
  read('/api/commands', (r) => {
    const p = new URL(r.url).searchParams;
    const all = typedCommands
      .map((c) => projectCommand(c.id)!)
      .filter(
        (c) =>
          (!p.get('agent_id') || c.agent_id === p.get('agent_id')) &&
          (!p.get('device_id') || c.device_id === p.get('device_id')) &&
          (!p.get('state') || c.state === p.get('state')),
      );
    return page(all, r);
  }),
  read('/api/snapshots', (r) => {
    const p = new URL(r.url).searchParams;
    return page(
      typedSnapshots.filter(
        (s) =>
          (!p.get('agent_id') || s.agent_id === p.get('agent_id')) &&
          (!p.get('device_id') || s.device_id === p.get('device_id')),
      ),
      r,
    );
  }),
  read('/api/commands/:id/events', (_, p) => ({
    items: typedEvents.get(String(p.id)) || [
      {
        id: 1,
        command_id: String(p.id),
        state: projectCommand(String(p.id))?.state || 'unknown',
        reason: 'SIMULATED fixture',
        at: now,
      },
    ],
  })),
  read('/api/commands/:id/snapshot', (r, p) => {
    const item = typedSnapshots.find((s) => s.origin_command_id === p.id);
    if (!item) return problem(409, 'snapshot_unavailable', 'Ссылка на снимок недоступна');
    if (r.headers.get('X-InfraPulse-Demo-Scenario') === 'rollback-stale') {
      const n = snapshotReads.get(String(p.id)) || 0;
      snapshotReads.set(String(p.id), n + 1);
      if (n > 0) return { ...item, status: 'superseded', reason: 'SIMULATED concurrent update' };
    }
    return item;
  }),
  read(
    '/api/commands/:id',
    (_, p) => projectCommand(String(p.id)) || problem(404, 'not_found', 'Команда не найдена'),
  ),
  mutate('/api/commands/:id/rollback', 'commands.write', (r, p, body) => {
    const parent = typedCommands.find((c) => c.id === p.id),
      ref = typedSnapshots.find((s) => s.origin_command_id === p.id);
    if (!parent || !ref) return problem(404, 'not_found', 'Исходная команда не найдена');
    if (r.headers.get('X-InfraPulse-Demo-Scenario') === 'commands-disabled')
      return problem(403, 'commands_disabled', 'Команды отключены политикой');
    if (
      body.confirmed !== true ||
      typeof body.expected_admin_up !== 'boolean' ||
      !Number.isInteger(body.timeout_seconds) ||
      Number(body.timeout_seconds) < 1 ||
      Number(body.timeout_seconds) > 60
    )
      return problem(
        400,
        'invalid_request',
        'Нужны confirmed, boolean expected_admin_up и timeout 1..60',
      );
    if (!r.headers.get('Idempotency-Key'))
      return problem(400, 'invalid_request', 'Нужен Idempotency-Key');
    if (
      parent.state !== 'success' ||
      parent.result?.uncertain ||
      ref.status !== 'candidate' ||
      ref.after_admin_up !== body.expected_admin_up
    )
      return problem(409, 'snapshot_unavailable', 'Снимок недоступен или условие изменилось');
    const id = 'cmd_' + (typedCommands.length + 10).toString(16).padStart(32, '0');
    const at = new Date().toISOString();
    const created: Model<'CommandRecord'> = {
      ...structuredClone(parent),
      id,
      operation: 'rollback',
      expected_admin_up: body.expected_admin_up,
      timeout_seconds: Number(body.timeout_seconds),
      idempotency_key: r.headers.get('Idempotency-Key')!,
      state: 'queued',
      reason: 'SIMULATED rollback queued',
      created_at: at,
      updated_at: at,
      deadline_at: new Date(Date.now() + Number(body.timeout_seconds) * 1000).toISOString(),
      dispatched_at: null,
      result: null,
      rollback_of_command_id: parent.id,
      rollback_snapshot_id: ref.snapshot_id,
    };
    ref.status = 'reserved';
    ref.rollback_command_id = id;
    typedCommands.unshift(created);
    typedEvents.set(id, [
      {
        id: 1,
        command_id: id,
        state: 'queued',
        reason: 'SIMULATED operator_requested_rollback',
        at,
      },
    ]);
    rollbackRuns.set(id, {
      started: Date.now(),
      uncertain: r.headers.get('X-InfraPulse-Demo-Scenario') === 'rollback-uncertain',
    });
    return created;
  }),
  ...(['certificates', 'bootstrap-tokens', 'audit'] as const).map((resource) =>
    read(`/api/pki/${resource}`, (request) => {
      if (role(request) !== 'admin') return problem(403, 'forbidden', 'Требуется администратор');
      const id = new URL(request.url).searchParams.get('agent_id');
      const items =
        resource === 'certificates'
          ? pkiCertificates
          : resource === 'bootstrap-tokens'
            ? pkiTokens
            : pkiAudit;
      return { items: items.filter((v) => !id || v.agent_id === id).slice(0, 200) };
    }),
  ),
  mutate(
    '/api/pki/bootstrap-tokens',
    'access.manage',
    (_, __, body) => {
      const created = new Date().toISOString();
      const item: Model<'PKIBootstrapToken'> = {
        id: `pkit_demo_${pkiTokens.length}`,
        agent_id: String(body.agent_id),
        created_at: created,
        expires_at: new Date(Date.now() + Number(body.ttl_seconds) * 1000).toISOString(),
        used_at: null,
        revoked_at: null,
      };
      pkiTokens.unshift(item);
      pkiAudit.unshift({
        id: pkiAudit.length + 1,
        agent_id: item.agent_id,
        actor_id: users[0]?.id ?? null,
        action: 'token_created_simulated',
        resource: item.id,
        at: created,
      });
      return { ...item, token: 'SIMULATED-ONE-TIME-SECRET-NOT-FOR-REAL-ENROLLMENT' };
    },
    201,
  ),
  mutate(
    '/api/pki/bootstrap-tokens/:id/revoke',
    'access.manage',
    (_, params, body) => {
      if (body.confirmed !== true)
        return problem(400, 'confirmation_required', 'Нужно подтверждение');
      const item = pkiTokens.find((v) => v.id === params.id);
      if (!item) return problem(404, 'not_found', 'Токен не найден');
      if (item.revoked_at || item.used_at)
        return problem(409, 'pki_conflict', 'Токен уже использован или отозван');
      item.revoked_at = new Date().toISOString();
      pkiAudit.unshift({
        id: pkiAudit.length + 1,
        agent_id: item.agent_id,
        actor_id: users[0]?.id ?? null,
        action: 'token_revoked_simulated',
        resource: item.id,
        at: item.revoked_at,
      });
      return { status: 'revoked' };
    },
    200,
  ),
  mutate(
    '/api/pki/certificates/:id/revoke',
    'access.manage',
    (_, params, body) => {
      if (body.confirmed !== true)
        return problem(400, 'confirmation_required', 'Нужно подтверждение');
      const item = pkiCertificates.find((v) => v.fingerprint === params.id);
      if (!item) return problem(404, 'not_found', 'Сертификат не найден');
      if (item.revoked_at) return problem(409, 'pki_conflict', 'Сертификат уже отозван');
      item.revoked_at = new Date().toISOString();
      pkiAudit.unshift({
        id: pkiAudit.length + 1,
        agent_id: item.agent_id,
        actor_id: users[0]?.id ?? null,
        action: 'certificate_revoked_simulated',
        resource: item.fingerprint,
        at: item.revoked_at,
      });
      return { status: 'revoked' };
    },
    200,
  ),
  http.post('*/api/auth/password', async ({ request }) => {
    if (!role(request)) return problem(401, 'unauthorized', 'Сессия отсутствует');
    if (request.headers.get('X-CSRF-Token') !== 'demo-csrf')
      return problem(403, 'csrf_failed', 'Требуется CSRF');
    if (request.headers.get('X-InfraPulse-Demo-Scenario') === 'outage')
      return problem(503, 'storage_unavailable', 'Тестовая недоступность backend');
    const body = await json(request);
    if (body.current_password !== 'demo')
      return problem(401, 'unauthorized', 'Неверный текущий пароль');
    if (
      [...String(body.password)].length < 12 ||
      new TextEncoder().encode(String(body.password)).length > 256
    )
      return problem(400, 'invalid_request', 'Недопустимый пароль');
    if (typeof document !== 'undefined')
      document.cookie = 'infrapulse_demo_role=; Path=/; Max-Age=0';
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/healthz', () => HttpResponse.json({ status: 'ok' })),
  http.post('*/api/auth/login', async ({ request }) => {
    const b = await json(request);
    if (!['demo', 'operator', 'viewer'].includes(String(b.username)) || b.password !== 'demo')
      return problem(401, 'unauthorized', 'Неверные учётные данные');
    const r: Role = b.username === 'demo' ? 'admin' : (b.username as Role);
    if (typeof document !== 'undefined')
      document.cookie = `infrapulse_demo_role=${r}; Path=/; SameSite=Strict`;
    return HttpResponse.json({
      user: users.find((u) => u.role === r),
      csrf_token: 'demo-csrf',
      expires_at: '2099-01-01T00:00:00Z',
    });
  }),
  read('/api/auth/me', (request) => {
    const r = role(request)!;
    return {
      user: users.find((u) => u.role === r),
      permissions: permissions[r],
      csrf_token: 'demo-csrf',
      expires_at: '2099-01-01T00:00:00Z',
    };
  }),
  http.post('*/api/auth/logout', ({ request }) => {
    if (request.headers.get('X-CSRF-Token') !== 'demo-csrf')
      return problem(403, 'csrf_failed', 'Требуется CSRF');
    if (typeof document !== 'undefined')
      document.cookie = 'infrapulse_demo_role=; Path=/; Max-Age=0';
    return new HttpResponse(null, { status: 204 });
  }),
  read('/api/assets', (request) => {
    const p = new URL(request.url).searchParams;
    return page(
      mutableAssets.filter(
        (a) =>
          a.lifecycle_status !== 'merged' &&
          (!p.get('kind') || a.kind === p.get('kind')) &&
          p.get('scope') !== 'real',
      ),
      request,
    );
  }),
  read('/api/assets/:id', (_, p) => mutableAssets.find((a) => a.id === p.id)),
  read('/api/assets/:id/sources', (r, p) => page(currentBindings(String(p.id)), r)),
  read('/api/assets/:id/candidates', (_, p) => ({
    items: mutableAssets
      .filter(
        (a) =>
          a.id !== p.id &&
          a.lifecycle_status === 'observed' &&
          a.kind === mutableAssets.find((v) => v.id === p.id)?.kind,
      )
      .slice(0, 50)
      .map((a) => ({
        asset: a,
        comparison: { strong_match: false, matches: [], conflicts: [] },
        blocked_by_decision: assetDecisions.some(
          (d) =>
            d.operation === 'split' &&
            [d.target_id, d.source_id].includes(String(p.id)) &&
            [d.target_id, d.source_id].includes(a.id),
        ),
      })),
  })),
  read('/api/assets/:id/decisions', (r, p) =>
    page(
      assetDecisions.filter((d) => d.target_id === p.id || d.source_id === p.id),
      r,
    ),
  ),
  read('/api/assets/:id/resolution-events', (r, p) =>
    page(
      [
        {
          id: 1,
          source_asset_id: String(p.id),
          binding_id: currentBindings(String(p.id))[0]?.id,
          code: 'insufficient_evidence',
          source_observed_at: now,
          created_at: now,
        },
      ],
      r,
    ),
  ),
  mutate(
    '/api/assets/split',
    'access.manage',
    (_, __, body) => {
      const original = mutableAssets.find((a) => a.id === body.asset_id);
      const owned = currentBindings(String(body.asset_id));
      const selected = body.binding_ids as string[];
      if (
        !original ||
        original.revision !== body.revision ||
        original.lifecycle_status !== 'observed' ||
        !selected.length ||
        selected.length >= owned.length ||
        selected.some((id) => !owned.some((b) => b.id === id)) ||
        !selected.includes(String(body.canonical_binding_id))
      )
        return problem(409, 'asset_conflict', 'Ревизия или состав источников изменились');
      const id = `asset_split_${assetDecisions.length}`;
      const moving = owned
        .filter((b) => selected.includes(b.id!))
        .map((b) => ({ ...b, asset_id: id, confidence: 'manual' }));
      const remaining = owned.filter((b) => !selected.includes(b.id!));
      identityBindings.set(id, moving);
      identityBindings.set(original.id!, remaining);
      mutableAssets.push({
        ...original,
        id,
        revision: 1,
        canonical_name: `${original.canonical_name} · отделённый источник`,
        source_count: moving.length,
        canonical_binding_id: String(body.canonical_binding_id),
        resolution_status: 'unresolved',
      });
      original.revision!++;
      original.source_count = remaining.length;
      original.canonical_binding_id = remaining[0]?.id;
      const result: Model<'AssetDecision'> = {
        id: `decision_${assetDecisions.length}`,
        operation: 'split',
        source_id: original.id,
        target_id: id,
        binding_ids: selected,
        canonical_binding_id: String(body.canonical_binding_id),
        reason: String(body.reason),
        actor_id: users[0]!.id,
        created_at: now,
      };
      assetDecisions.unshift(result);
      return result;
    },
    200,
  ),
  mutate(
    '/api/assets/merge',
    'access.manage',
    (_, __, body) => {
      const target = mutableAssets.find((a) => a.id === body.target_id),
        source = mutableAssets.find((a) => a.id === body.source_id);
      if (
        !target ||
        !source ||
        target.id === source.id ||
        target.revision !== body.target_revision ||
        source.revision !== body.source_revision ||
        source.lifecycle_status !== 'observed' ||
        target.lifecycle_status !== 'observed' ||
        target.scope !== source.scope ||
        target.kind !== source.kind ||
        placement(source.id!).mode !== 'unplaced' ||
        (target.vendor && source.vendor && target.vendor !== source.vendor) ||
        (target.serial && source.serial && target.serial !== source.serial)
      )
        return problem(409, 'asset_conflict', 'Ревизия, идентичность или размещение конфликтуют');
      const all = [...currentBindings(target.id!), ...currentBindings(source.id!)];
      if (!all.some((b) => b.id === body.canonical_binding_id) || all.length > 128)
        return problem(409, 'asset_conflict', 'Недопустимый canonical binding');
      const moving = currentBindings(source.id!).map((b) => b.id!);
      identityBindings.set(
        target.id!,
        all.map((b) => ({ ...b, asset_id: target.id, confidence: 'manual' })),
      );
      identityBindings.set(source.id!, []);
      target.revision!++;
      target.source_count = all.length;
      target.canonical_binding_id = String(body.canonical_binding_id);
      target.resolution_status = 'resolved';
      source.revision!++;
      source.source_count = 0;
      source.lifecycle_status = 'merged';
      source.merged_into_id = target.id;
      const result: Model<'AssetDecision'> = {
        id: `decision_${assetDecisions.length}`,
        operation: 'merge',
        source_id: source.id,
        target_id: target.id,
        binding_ids: moving,
        canonical_binding_id: String(body.canonical_binding_id),
        reason: String(body.reason),
        actor_id: users[0]!.id,
        created_at: now,
      };
      assetDecisions.unshift(result);
      return result;
    },
    200,
  ),
  read('/api/assets/:id/identities', (r, p) => {
    const asset = mutableAssets.find((a) => a.id === p.id);
    return page(
      asset?.serial
        ? currentBindings(String(p.id)).map((binding, i) => ({
            id: i + 1,
            kind: 'serial',
            value: asset.serial,
            normalized_value: asset.serial,
            binding_id: binding.id,
            subject_id: '',
            current: true,
            usable: true,
            confidence: binding.confidence,
            observed_at: now,
          }))
        : [],
      r,
    );
  }),
  read('/api/assets/:id/resolved-inventory', (_, p) => ({
    asset_id: p.id,
    asset_revision: 3,
    status: 'partial',
    missing: ['hardware_revision'],
    source_count: 2,
    attributes: Object.fromEntries(
      Object.entries({
        vendor: 'Cisco',
        model: 'Catalyst 9300',
        serial: 'DEMO-FCX012345',
        software_version: 'IOS XE 17.x',
      }).map(([key, value]) => [
        key,
        { value, status: 'observed', selected: null, conflict: false, claims: [] },
      ]),
    ),
    placement: placement(String(p.id)),
  })),
  read('/api/assets/:id/placement', (_, p) => placement(String(p.id))),
  mutate(
    '/api/placements/import',
    'access.manage',
    (_, __, body) => {
      const rows = body.placements as Model<'PlacementInput'>[];
      if (
        !Array.isArray(rows) ||
        !rows.length ||
        rows.length > 50 ||
        typeof body.reason !== 'string' ||
        body.reason.trim().length < 3
      )
        return problem(400, 'invalid_import', 'Некорректная партия');
      const ids = new Set(rows.map((p) => p.asset_id));
      if (ids.size !== rows.length) return problem(400, 'duplicate_asset', 'Повтор Asset');
      const staged: Model<'AssetPlacement'>[] = [];
      for (const row of rows) {
        const old = placement(row.asset_id);
        if (!assets.some((a) => a.id === row.asset_id))
          return problem(404, 'not_found', 'Asset не найден');
        if (old.revision !== row.expected_revision)
          return problem(409, 'placement_conflict', 'Ревизия размещения изменилась');
        const location = locations.find((l) => l.id === row.location_id);
        const start = row.start_unit || 0,
          height = row.height_units || 0;
        if (
          row.mode === 'rack' &&
          (location?.kind !== 'rack' ||
            start < 1 ||
            height < 1 ||
            start + height - 1 > location.rack_units)
        )
          return problem(409, 'rack_capacity', 'Недопустимые юниты');
        if (row.mode === 'outside_rack' && (location?.kind !== 'room' || start || height))
          return problem(400, 'invalid_location', 'Нужно помещение без юнитов');
        if (row.mode === 'unplaced' && (row.location_id != null || start || height || row.position))
          return problem(400, 'invalid_unplaced', 'Освобождение должно быть явным');
        staged.push({
          asset_id: row.asset_id,
          mode: row.mode,
          location_id: row.mode === 'unplaced' ? null : row.location_id!,
          start_unit: row.mode === 'rack' ? start : 0,
          height_units: row.mode === 'rack' ? height : 0,
          position: row.position || '',
          revision: old.revision + 1,
          updated_at: now,
          path: location ? locationPath(location) : [],
        });
      }
      const final = [
        ...assets.filter((a) => !ids.has(a.id)).map((a) => placement(a.id)),
        ...staged,
      ].filter((p) => p.mode === 'rack');
      const slots = new Set<string>();
      for (const p of final)
        for (let u = p.start_unit; u < p.start_unit + p.height_units; u++) {
          const key = `${p.location_id}:${u}`;
          if (slots.has(key)) return problem(409, 'rack_occupied', 'Пересечение юнитов');
          slots.add(key);
        }
      for (const p of staged) placements.set(p.asset_id, p);
      return { items: staged };
    },
    200,
  ),
  mutate(
    '/api/assets/:id/placement',
    'access.manage',
    (_, p, body) => {
      const id = String(p.id),
        current = placement(id);
      if (body.expected_revision !== current.revision)
        return problem(409, 'placement_conflict', 'Ревизия размещения изменилась');
      const location = locations.find((l) => l.id === body.location_id);
      if (
        body.mode === 'rack' &&
        (!location ||
          location.kind !== 'rack' ||
          Number(body.start_unit) + Number(body.height_units) - 1 > location.rack_units)
      )
        return problem(409, 'rack_capacity', 'Размещение не помещается в стойку');
      const start = Number(body.start_unit),
        height = Number(body.height_units);
      if (
        body.mode === 'rack' &&
        assets.some(
          (a) =>
            a.id !== id &&
            placement(a.id).mode === 'rack' &&
            placement(a.id).location_id === body.location_id &&
            start < placement(a.id).start_unit + placement(a.id).height_units &&
            start + height > placement(a.id).start_unit,
        )
      )
        return problem(409, 'rack_occupied', 'Юниты стойки уже заняты');
      const value: Model<'AssetPlacement'> = {
        asset_id: id,
        mode: body.mode as Model<'AssetPlacement'>['mode'],
        location_id: body.mode === 'unplaced' ? null : String(body.location_id),
        start_unit: body.mode === 'rack' ? start : 0,
        height_units: body.mode === 'rack' ? height : 0,
        position: String(body.position || ''),
        revision: current.revision + 1,
        updated_at: now,
        path: location ? locationPath(location) : [],
      };
      placements.set(id, value);
      return value;
    },
    200,
    'put',
  ),
  read('/api/assets/:id/hardware', (_, p) => ({
    asset_id: p.id,
    generated_at: now,
    items: hardware(String(p.id)),
    limit: 50,
    offset: 0,
    has_more: false,
    relations_truncated: false,
    max_age_seconds: 300,
  })),
  read('/api/assets/:id/hardware/history', (r, p) => ({
    asset_id: p.id,
    generated_at: now,
    items: Array.from(
      { length: new URL(r.url).searchParams.has('after_id') ? 4 : 10 },
      (_, index) => {
        const i = index + (Number(new URL(r.url).searchParams.get('after_id')) || 0);
        return {
          ...hardware(String(p.id))[0],
          id: i + 1,
          value: 38 + (i % 4),
          observed_at: new Date(Date.parse(now) - (14 - i) * 30000).toISOString(),
        };
      },
    ),
    limit: 200,
    next_after_id: new URL(r.url).searchParams.has('after_id') ? 14 : 10,
    has_more: !new URL(r.url).searchParams.has('after_id'),
    relations_truncated: false,
    max_age_seconds: 300,
  })),
  read('/api/assets/:id/logs', () => ({ items: logs, limit: 50 })),
  read('/api/assets/:id/external-metrics', (r) => page(externalMetrics, r)),
  read('/api/assets/:id/prometheus/range', (r, p) => {
    const q = new URL(r.url).searchParams;
    return {
      ...prometheusRange,
      asset_id: p.id,
      target_id: q.get('target_id'),
      mapping_id: q.get('mapping_id'),
      points: Array.from({ length: 12 }, (_, i) => ({
        at: new Date(
          Date.parse(q.get('from')!) +
            (i * (Date.parse(q.get('to')!) - Date.parse(q.get('from')!))) / 11,
        ).toISOString(),
        value: i === 4 ? null : i === 5 ? '18446744073709551615' : String(10000 + i * 100),
      })),
    };
  }),
  read('/api/devices/:id/metrics/history', (r, p) => ({
    items: networkHistory.map((item) => ({
      ...item,
      agent_id: new URL(r.url).searchParams.get('agent_id') || item.agent_id,
      device_id: p.id,
    })),
    limit: 100,
  })),
  read('/api/data-sources', (r) => page(sources, r)),
  read('/api/data-sources/:id', (_, p) => sources.find((s) => s.id === p.id)),
  read('/api/data-sources/:id/jobs', (r, p) =>
    page(
      jobs.filter((j) => j.source_id === p.id),
      r,
    ),
  ),
  ...(['test', 'sync'] as const).map((op) =>
    mutate(`/api/data-sources/:id/${op}`, 'access.manage', (_, p) => {
      const job: Model<'DataSourceJob'> = {
        id: `job_source_${jobs.length}`,
        source_id: String(p.id),
        operation: op,
        trigger: 'manual',
        state: 'queued',
        source_revision: 1,
        attempts: 0,
        code: '',
        created_at: now,
        started_at: null,
        finished_at: null,
        next_attempt_at: now,
        actor_id: users[0]!.id,
      };
      jobs = [job, ...jobs];
      return job;
    }),
  ),
  mutate(
    '/api/data-sources',
    'access.manage',
    (_, __, body) => {
      const source = {
        ...sources[0]!,
        ...body,
        id: `source_${sources.length}`,
        has_credential: !!body.credential,
        connection_status: 'unverified',
        credential: undefined,
      } as Model<'DataSource'>;
      sources.push(source);
      return source;
    },
    201,
  ),
  read('/api/agents', () => ({ items: agents })),
  mutate(
    '/api/data-sources/:id',
    'access.manage',
    (_, p, body) => {
      const index = sources.findIndex((s) => s.id === p.id);
      const current = sources[index] || sources[0]!;
      if (body.revision !== current.revision)
        return problem(409, 'source_revision_conflict', 'Ревизия источника изменилась');
      const result = {
        ...current,
        ...body,
        credential: undefined,
        has_credential:
          body.credential === undefined || body.credential === null
            ? current.has_credential
            : !!body.credential,
        revision: current.revision + 1,
      } as Model<'DataSource'>;
      sources[index] = result;
      return result;
    },
    200,
    'put',
  ),
  mutate(
    '/api/collectors/:id/config',
    'access.manage',
    (_, p, body) => {
      const collector = String(p.id);
      const revision = Number(body.expected_revision) + 1;
      const state: Model<'CollectorConfigState'> = {
        collector_id: collector,
        backend_enabled: true,
        connected: true,
        managed_config_v1: true,
        remote_management_enabled: true,
        in_sync: false,
        desired: {
          collector_id: collector,
          revision,
          snapshot: { targets: body.targets as Model<'ManagedTarget'>[] },
        },
        applied_revision: revision - 1,
        status: 'pending',
      };
      configs.set(collector, { state, submitted: Date.now() });
      return state.desired;
    },
    202,
    'put',
  ),
  read('/api/agents/:id/health', () => ({
    status: 'healthy',
    reason: 'demo',
    fresh: true,
    queue_size: 0,
  })),
  read('/api/collectors/:id/config', (_, p) => {
    const stored = configs.get(String(p.id));
    if (stored) {
      if (Date.now() - stored.submitted > 1500) {
        stored.state.status = 'applied';
        stored.state.applied_revision = stored.state.desired?.revision;
        stored.state.in_sync = true;
      }
      return structuredClone(stored.state);
    }
    return {
      collector_id: p.id,
      backend_enabled: true,
      connected: true,
      managed_config_v1: true,
      remote_management_enabled: true,
      in_sync: true,
      desired: {
        collector_id: p.id,
        revision: 2,
        snapshot: {
          targets: [
            {
              target_id: 'core',
              protocol: 'snmp',
              endpoint: '192.0.2.10',
              enabled: true,
              credential_ref: 'lab_snmp',
              polling: { fast_interval: '3s' },
              snmp: { version: 'v2c' },
            },
          ],
        },
      },
      applied_revision: 2,
      status: 'applied',
    };
  }),
  read('/api/topology/global', () => topology),
  read('/api/correlation/summary', () => ({
    open: 3,
    resolved: 4,
    multi_source: 2,
    normalized_signals: 7,
    correlation_window_seconds: 300,
    minimum_score: 60,
  })),
  read('/api/correlation/incidents', (r) => {
    const p = new URL(r.url).searchParams;
    return page(
      cases.filter(
        (c) =>
          (!p.get('state') || c.state === p.get('state')) &&
          (!p.get('severity') || c.severity === p.get('severity')) &&
          (!p.get('asset_id') || c.primary_asset_id === p.get('asset_id')),
      ),
      r,
    );
  }),
  read('/api/correlation/incidents/:id', (_, p) => caseFixture(String(p.id))),
  read('/api/incidents', (r) => page(signals, r)),
  read('/api/incidents/:id', (_, p) => signals.find((s) => s.id === p.id) || signals[0]),
  read('/api/incidents/:id/evidence', (_, p) => ({
    items: [
      {
        id: 1,
        kind: 'assessment',
        observed_at: now,
        assessment: signals.find((s) => s.id === p.id)?.signal,
      },
    ],
  })),
  read('/api/incidents/:id/transitions', (_, p) => ({
    items: [
      {
        id: 1,
        state: signals.find((s) => s.id === p.id)?.state,
        at: now,
        reason: 'simulated fixture transition',
        actor_id: null,
      },
    ],
  })),
  mutate(
    '/api/incidents/:id/acknowledge',
    'incidents.write',
    (_, p) => {
      const signal = signals.find((s) => s.id === p.id);
      if (signal) signal.state = 'acknowledged';
      return signal;
    },
    200,
  ),
  read('/api/logs', (r) => logPage(selectedLogs(r), r)),
  read('/api/audit/events', (r) => {
    const rows = selectedLogs(r, true).filter((row) => row.audit?.event_key === auditGroup.key);
    const cursor = Number(new URL(r.url).searchParams.get('before_id'));
    return {
      items:
        rows.length && (!cursor || auditGroup.cursor_id < cursor)
          ? [
              {
                ...auditGroup,
                record_count: rows.length,
                record_types: [...new Set(rows.map((row) => row.audit!.record_type))],
              },
            ]
          : [],
      limit: 50,
      next_before_id: null,
    };
  }),
  read('/api/audit/events/:key', (r, p) =>
    p.key === auditGroup.key
      ? logPage(
          selectedLogs(r).filter((row) => row.audit?.event_key === p.key),
          r,
        )
      : problem(404, 'not_found', 'Audit-группа не найдена'),
  ),
  read('/api/telephony/targets', (r) => page([sip], r)),
  read('/api/telephony/targets/:id', () => sip),
  read('/api/telephony/targets/:id/history', () => ({
    items: Array.from({ length: 12 }, (_, i) => ({
      ...sip.latest!,
      id: 20 - i,
      observed_at: new Date(Date.parse(now) - i * 3000).toISOString(),
      latency_ms: i < 3 ? null : 18 + i * 2,
      state: i < 3 ? 'down' : 'up',
    })),
    limit: 50,
    next_before_id: null,
  })),
  read('/api/locations', (r) => {
    const parent = new URL(r.url).searchParams.get('parent_id');
    return page(
      locations.filter(
        (l) =>
          (!parent || l.parent_id === parent) &&
          (!new URL(r.url).searchParams.get('kind') ||
            l.kind === new URL(r.url).searchParams.get('kind')),
      ),
      r,
    );
  }),
  read('/api/locations/:id', (_, p) => locations.find((l) => l.id === p.id)),
  mutate(
    '/api/locations',
    'access.manage',
    (_, __, body) => {
      const value: Model<'PhysicalLocation'> = {
        id: `location_${locations.length}`,
        kind: body.kind as Model<'PhysicalLocation'>['kind'],
        name: String(body.name),
        parent_id: body.parent_id ? String(body.parent_id) : null,
        rack_units: Number(body.rack_units) || 0,
        revision: 1,
        created_at: now,
        updated_at: now,
      };
      locations.push(value);
      return value;
    },
    201,
  ),
  mutate(
    '/api/locations/:id',
    'access.manage',
    (_, p, body) => {
      const value = locations.find((l) => l.id === p.id);
      if (!value) return problem(404, 'not_found', 'Локация не найдена');
      if (
        body.expected_revision !== value.revision ||
        body.kind !== value.kind ||
        body.parent_id !== value.parent_id
      )
        return problem(409, 'location_conflict', 'Ревизия, тип или родитель локации изменились');
      Object.assign(value, {
        name: body.name,
        rack_units: Number(body.rack_units) || 0,
        revision: value.revision + 1,
        updated_at: now,
      });
      return value;
    },
    200,
    'put',
  ),
  read('/api/locations/:id/rack-layout', (_, p) => {
    const rows = assets
      .map((a) => placement(a.id))
      .filter((v) => v.mode === 'rack' && v.location_id === p.id);
    const occupied = rows.reduce((n, v) => n + v.height_units, 0);
    const location = locations.find((l) => l.id === p.id);
    return {
      location,
      placements: rows,
      occupied_units: occupied,
      free_units: (location?.rack_units || 0) - occupied,
    };
  }),
  read('/api/assets/:id/configuration/drift', (_, p) => ({
    ...drift,
    asset_id: p.id,
    ...(remediation?.state === 'verified' ? { status: 'compliant' } : {}),
  })),
  read(
    '/api/assets/:id/configuration/baseline',
    (_, p) =>
      baselines.get(String(p.id)) || {
        asset_id: p.id,
        revision: 2,
        asset_revision: 3,
        snapshot_id: 'snapshot_demo',
        reason: 'Simulated reviewed baseline',
      },
  ),
  read('/api/assets/:id/automation/snapshots', (_, p) => ({
    items: [
      {
        id: 'snapshot_demo',
        asset_id: p.id,
        job_id: 'automation_demo',
        template_id: 'cisco_ios_read_config_v1',
        observed_at: now,
      },
    ],
    limit: 200,
    offset: 0,
  })),
  mutate(
    '/api/assets/:id/configuration/baseline',
    'access.manage',
    (_, p, body) => {
      const id = String(p.id);
      const current = baselines.get(id)?.revision ?? 2;
      if (
        body.expected_revision !== current ||
        body.asset_revision !== assets.find((a) => a.id === id)?.revision
      )
        return problem(409, 'configuration_state_conflict', 'Ревизия Asset или эталона изменилась');
      const baseline: Model<'ConfigurationBaseline'> = {
        asset_id: id,
        revision: current + 1,
        asset_revision: Number(body.asset_revision),
        snapshot_id: String(body.snapshot_id),
        reason: String(body.reason),
        created_at: now,
      };
      baselines.set(id, baseline);
      return baseline;
    },
    200,
    'put',
  ),
  read(
    '/api/assets/:id/configuration/remediation-policy',
    (_, p) =>
      policies.get(String(p.id)) || {
        asset_id: p.id,
        revision: 1,
        expected_revision: 1,
        enabled: true,
        allowed_vlans: [20],
        protected_interfaces: [],
        max_evidence_age_seconds: 300,
        reason: 'simulated',
        actor_id: users[0]!.id,
        updated_at: now,
      },
  ),
  mutate(
    '/api/assets/:id/configuration/remediation-policy',
    'access.manage',
    (_, p, body) => {
      const id = String(p.id);
      const current = policies.get(id)?.revision ?? 1;
      if (body.expected_revision !== current)
        return problem(409, 'configuration_state_conflict', 'Ревизия policy изменилась');
      const policy: Model<'ConfigurationRemediationPolicy'> = {
        ...(body as Model<'ConfigurationRemediationPolicyInput'>),
        asset_id: id,
        revision: current + 1,
        actor_id: users[0]!.id,
        updated_at: now,
      };
      policies.set(id, policy);
      return policy;
    },
    200,
    'put',
  ),
  read('/api/assets/:id/configuration/remediations', (r) =>
    page(remediation ? [currentRemediation()] : [], r),
  ),
  read('/api/configuration/remediations/:id', () => currentRemediation()),
  mutate('/api/configuration/remediations/:id/cancel', 'commands.write', (_, p, body) => {
    if (!remediation || remediation.id !== p.id)
      return problem(404, 'not_found', 'Запрос не найден');
    if (
      body.expected_revision !== remediation.revision ||
      !['pending_approval', 'queued', 'running'].includes(remediation.state || '')
    )
      return problem(
        409,
        'configuration_state_conflict',
        'Ревизия или состояние запроса изменилось',
      );
    remediation.state = 'cancelled';
    remediation.revision = (remediation.revision || 0) + 1;
    approvedAt = 0;
    return remediation;
  }),
  mutate(
    '/api/assets/:id/configuration/remediations',
    'commands.write',
    (_, p, body) => {
      remediation = {
        id: 'rem_demo',
        asset_id: String(p.id),
        revision: 1,
        drift_result_id: 1,
        baseline_revision: 2,
        actual_snapshot_id: 'snapshot_demo',
        policy_revision: 1,
        action: 'restore_access_vlan',
        interface: 'GigabitEthernet1/0/24',
        expected_vlan: 20,
        actual_vlan: 30,
        state: 'pending_approval',
        error_code: '',
        requester_id: users[0]!.id,
        reason: String(body.reason),
        created_at: now,
      };
      return remediation;
    },
    201,
  ),
  mutate('/api/configuration/remediations/:id/approve', 'access.manage', () => {
    jobCancelled = false;
    approvedAt = Date.now();
    if (remediation) {
      remediation.state = 'queued';
      remediation.revision = 2;
      remediation.automation_job_id = 'automation_demo';
    }
    return remediation;
  }),
  read('/api/automation/workers', () => ({
    items: [
      {
        worker_id: 'demo-linux-worker',
        state: 'simulated',
        last_seen: now,
        templates: ['cisco_ios_read', 'restore_access_vlan'],
      },
    ],
  })),
  read(
    '/api/assets/:id/automation-target',
    (_, p) =>
      automationTargets.get(String(p.id)) || {
        asset_id: p.id,
        revision: 1,
        asset_revision: 3,
        host: '192.0.2.10',
        port: 22,
        template_id: 'cisco_ios_read_config_v1',
        credential_ref: 'lab_ssh',
        ssh_host_key:
          'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG9yTgrkqsRfG4admgQOzGOjKcWCSHNXxJ8ggcC18Mjy',
        enabled: false,
        reason: 'simulated target',
      },
  ),
  mutate(
    '/api/assets/:id/automation-target',
    'access.manage',
    (_, p, body) => {
      const id = String(p.id);
      const revision = automationTargets.get(id)?.revision ?? 1;
      if (
        body.expected_revision !== revision ||
        body.asset_revision !== assets.find((a) => a.id === id)?.revision
      )
        return problem(409, 'automation_state_conflict', 'Ревизия target или Asset изменилась');
      const result: Model<'AutomationTarget'> = {
        ...(body as Model<'AutomationTargetInput'>),
        asset_id: id,
        revision: revision + 1,
        updated_at: now,
      };
      automationTargets.set(id, result);
      return result;
    },
    200,
    'put',
  ),
  read('/api/assets/:id/automation/jobs', (r) => page(approvedAt ? [automationJob()] : [], r)),
  read('/api/automation/jobs/:id', () => automationJob()),
  mutate('/api/automation/jobs/:id/cancel', 'commands.write', () => {
    jobCancelled = true;
    return automationJob();
  }),
  read('/api/automation/jobs/:id/events', () => ({
    items: [{ event: 'fake_runner', code: 'simulated', observed_at: now }],
  })),
  read('/api/automation/snapshots/:id/content', () => snapshotContent),
  ...['/api/correlation/incidents/:id/analysis/preview', '/api/incidents/:id/analysis/preview'].map(
    (path) =>
      mutate(
        path,
        'data.read',
        (_, p) => {
          preview = {
            id: 'preview_demo',
            incident_id: String(p.id),
            created_by: users[0]!.id,
            created_at: now,
            expires_at: '2099-01-01T00:00:00Z',
            enabled: true,
            destination: 'Тестовый provider · сеть не используется',
            request_hash: 'a'.repeat(64),
            prompt_version: 'demo',
            request: {},
            excluded_fields: ['credentials', 'raw_logs', 'device_addresses'],
            references: [
              { ref: 'F1', incident_id: 'inc_vlan', asset_ids: ['asset_core'] },
              ...(path.includes('/correlation/')
                ? [{ ref: 'R1', correlation_evidence_id: 1 }]
                : []),
            ],
          };
          return preview;
        },
        201,
      ),
  ),
  ...['/api/correlation/incidents/:id/analysis', '/api/incidents/:id/analysis'].map((path) =>
    mutate(path, 'analysis.write', () => {
      analysisCreated = Date.now();
      return { id: 'analysis_demo', state: 'queued' };
    }),
  ),
  read('/api/analyses/:id', () => ({
    id: 'analysis_demo',
    incident_id: 'inc_vlan',
    state: Date.now() - analysisCreated < 1200 ? 'running' : 'succeeded',
    model: 'simulated-provider',
    result:
      Date.now() - analysisCreated < 1200
        ? null
        : {
            summary: 'Тестовый результат: изменения VLAN совпали по времени с деградацией SIP.',
            observations: [
              {
                text: 'Зафиксировано отклонение access VLAN 20 → 30.',
                refs: ['F1', 'R1', 'UNMAPPED'],
              },
            ],
            hypotheses: [
              {
                text: 'Изменение сегмента может влиять на доступность сервиса.',
                refs: ['F1'],
                confidence: 'low',
              },
            ],
            recommendations: [
              {
                text: 'Проверить эталон и согласовать разрешённое восстановление.',
                refs: ['F1'],
                safety: 'requires_operator_review',
              },
            ],
            limitations: ['Симулированный ответ. Реальный LLM не вызывался.'],
          },
  })),
  read('/api/reports/v2/summary', () => report),
  read('/api/reports/v2/snapshots', () => ({ items: snapshots })),
  mutate(
    '/api/reports/v2/snapshots',
    'reports.write',
    () => {
      const result = {
        id: `report_${snapshots.length}`,
        created_at: now,
        created_by: users[0]!.id,
        report,
      };
      snapshots.push(result);
      return result;
    },
    201,
  ),
  read('/api/reports/schedules', (r) => page(schedules, r)),
  mutate(
    '/api/reports/schedules',
    'access.manage',
    (_, __, body) => {
      const schedule: Model<'ReportSchedule'> = {
        id: `schedule_${schedules.length}`,
        revision: 1,
        owner_id: users[0]!.id,
        definition: body as Model<'ReportScheduleInput'>,
        next_run_at: now,
        updated_at: now,
        failure: '',
        last_snapshot_id: null,
      };
      schedules.push(schedule);
      return schedule;
    },
    201,
  ),
  mutate(
    '/api/reports/schedules/:id',
    'access.manage',
    (_, p, body) => {
      const schedule = schedules.find((s) => s.id === p.id);
      if (!schedule) return problem(404, 'not_found', 'Расписание не найдено');
      if (body.expected_revision !== schedule.revision)
        return problem(409, 'revision_conflict', 'Ревизия расписания устарела');
      Object.assign(schedule, {
        definition: body,
        revision: schedule.revision! + 1,
        updated_at: now,
      });
      return schedule;
    },
    200,
    'put',
  ),
  read('/api/access/users', (r) => page(users, r)),
  mutate(
    '/api/access/users/:id',
    'access.manage',
    (_, p, body) => {
      const user = users.find((u) => u.id === p.id);
      if (!user) return problem(404, 'not_found', 'Пользователь не найден');
      if (
        user.role === 'admin' &&
        !user.disabled &&
        (body.disabled === true || (body.role && body.role !== 'admin')) &&
        users.filter((u) => u.role === 'admin' && !u.disabled).length === 1
      )
        return problem(409, 'last_admin', 'Нельзя отключить последнего активного администратора');
      Object.assign(user, body, { updated_at: now });
      return user;
    },
    200,
    'patch',
  ),
  mutate(
    '/api/access/users/:id/password',
    'access.manage',
    (_, p, body) => {
      if (!users.some((u) => u.id === p.id))
        return problem(404, 'not_found', 'Пользователь не найден');
      if (
        typeof body.password !== 'string' ||
        [...body.password].length < 12 ||
        new TextEncoder().encode(body.password).length > 256
      )
        return problem(400, 'invalid_password', 'Пароль не соответствует требованиям');
      return new HttpResponse(null, { status: 204 });
    },
    204,
  ),
  read('/api/access/audit', (r) =>
    page([{ id: 1, action: 'demo_login', created_at: now, actor_id: users[0]!.id }], r),
  ),
  mutate(
    '/api/access/users',
    'access.manage',
    (_, __, body) => {
      const user: Model<'AccessUser'> = {
        id: `usr_${String(users.length).padStart(32, '0')}`,
        username: String(body.username),
        role: body.role as Role,
        disabled: false,
        created_at: now,
        updated_at: now,
        last_login_at: null,
      };
      users.push(user);
      return user;
    },
    201,
  ),
];
function placement(asset: string): Model<'AssetPlacement'> {
  const stored = placements.get(asset);
  if (stored) return stored;
  if (asset !== 'asset_core')
    return {
      asset_id: asset,
      mode: 'unplaced',
      location_id: null,
      start_unit: 0,
      height_units: 0,
      position: '',
      revision: 0,
      updated_at: null,
      path: [],
    };
  return {
    asset_id: asset,
    mode: 'rack',
    location_id: 'rack_a01',
    start_unit: 9,
    height_units: 2,
    position: '',
    revision: 1,
    updated_at: now,
    path: [locations[0]!, locations[3]!, locations[2]!, locations[1]!],
  };
}
function locationPath(location: Model<'PhysicalLocation'>): Model<'PhysicalLocation'>[] {
  const parent = locations.find((l) => l.id === location.parent_id);
  return [...(parent ? locationPath(parent) : []), location];
}
function hardware(asset: string): Model<'AssetHardwareItem'>[] {
  return [
    {
      device_id: 'remote:server',
      kind: 'sensor',
      resource_id: 'temperature.cpu',
      subject_id: 'system0',
      name: 'CPU Temperature',
      unit: '°C',
      value: 42,
      source_type: 'redfish',
      provenance: 'simulated',
      source_ref: null,
      observation_time: null,
      observed_at: now,
      collected_at: now,
      source_timestamp: null,
      clock_quality: 'synced',
      data_quality: 'partial',
      payload: null,
      resource_type: 'sensor',
      power_state: 'On',
      health: 'OK',
      health_rollup: 'Warning',
      operational_state: 'Enabled',
      id: 1,
      observation_key: 'demo-temp',
      message_id: 'demo-hardware',
      asset_id: asset,
      binding_id: 'binding-demo',
      source_instance_id: 'source_2',
      source_name: 'Collector (simulated Redfish)',
      scope: 'demo-lab',
      received_at: now,
      freshness: 'fresh',
      source_enabled: true,
      agent_connected: true,
      related: false,
      relation_ids: [],
    },
  ];
}
function currentRemediation() {
  if (remediation && approvedAt) {
    const elapsed = Date.now() - approvedAt;
    remediation.state = elapsed < 1500 ? 'queued' : elapsed < 4500 ? 'running' : 'verified';
    remediation.verification_drift_result_id = elapsed >= 4500 ? 2 : 0;
  }
  return remediation;
}
function automationJob(): Model<'AutomationJob'> {
  return {
    id: 'automation_demo',
    asset_id: 'asset_core',
    target_revision: 1,
    template_id: 'restore_access_vlan',
    state: jobCancelled ? 'cancelled' : Date.now() - approvedAt < 4500 ? 'running' : 'succeeded',
    snapshot_id: 'snapshot_demo',
    reason: 'SIMULATED fake Runner',
    created_at: now,
  };
}
