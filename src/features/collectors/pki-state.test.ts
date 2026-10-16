import { describe, expect, it } from 'vitest';
import { credentialState, validAgentUUID } from './pki-state';
const now = Date.parse('2026-10-15T00:00:00Z');
const valid = {
  revoked_at: null,
  not_before: '2026-01-01T00:00:00Z',
  not_after: '2027-01-01T00:00:00Z',
};
describe('PKI display does not equate validity with live connection', () => {
  it('requires a canonical non-nil UUID', () => {
    expect(validAgentUUID('bf6e7560-9b04-4d28-ae98-5dfe7d4f2001')).toBe(true);
    for (const v of [
      '',
      'agent_demo',
      '00000000-0000-0000-0000-000000000000',
      'BF6E7560-9B04-4D28-AE98-5DFE7D4F2001',
    ])
      expect(validAgentUUID(v)).toBe(false);
  });
  it('prioritizes server revocation and token consumption over expiry', () => {
    expect(credentialState({ ...valid, revoked_at: '2026-09-01T00:00:00Z' }, now)).toBe('Отозван');
    expect(
      credentialState(
        { revoked_at: null, used_at: '2026-09-01T00:00:00Z', expires_at: '2026-09-02T00:00:00Z' },
        now,
      ),
    ).toBe('Использован');
  });
  it('handles boundary expiry, future activation and absent/invalid dates honestly', () => {
    expect(credentialState(valid, now)).toBe('Действует по сроку');
    expect(credentialState({ ...valid, not_after: '2026-10-15T00:00:00Z' }, now)).toBe('Истёк');
    expect(credentialState({ ...valid, not_before: '2026-11-01T00:00:00Z' }, now)).toBe(
      'Ещё не действует',
    );
    expect(credentialState({ revoked_at: null }, now)).toBe('Срок неизвестен');
    expect(credentialState({ ...valid, not_before: 'broken' }, now)).toBe('Срок неизвестен');
  });
});
