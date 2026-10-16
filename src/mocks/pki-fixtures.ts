import type { Model } from '../api/client';
// Explicitly simulated metadata. No real bootstrap token or private key is present.
export const pkiAgent = 'bf6e7560-9b04-4d28-ae98-5dfe7d4f2001';
export const pkiCertificates: Model<'PKICertificate'>[] = [
  {
    fingerprint: 'a'.repeat(64),
    agent_id: pkiAgent,
    serial: 'simulated-01',
    not_before: '2026-01-01T00:00:00Z',
    not_after: '2099-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    renewed_from: null,
    revoked_at: null,
  },
];
export const pkiTokens: Model<'PKIBootstrapToken'>[] = [
  {
    id: 'pkit_demo_metadata_only',
    agent_id: pkiAgent,
    created_at: '2026-01-01T00:00:00Z',
    expires_at: '2099-01-01T00:00:00Z',
    used_at: null,
    revoked_at: null,
  },
];
export const pkiAudit: Model<'PKIAudit'>[] = [
  {
    id: 1,
    agent_id: pkiAgent,
    actor_id: null,
    action: 'certificate_issued_simulated',
    resource: 'a'.repeat(64),
    at: '2026-01-01T00:00:00Z',
  },
];
