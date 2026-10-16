import { it, expect } from 'vitest';
import { evidenceLinks } from './references';
it('maps only unique local references and encodes IDs rather than accepting model URLs', () => {
  const references = [{ ref: 'f1', incident_id: 'inc/one', asset_ids: ['a', 'a'] }];
  expect(evidenceLinks('f1', references).map((l) => l.to)).toEqual([
    '/incidents/signals/inc%2Fone',
    '/assets/a',
  ]);
  expect(evidenceLinks('https://external.example', references)).toEqual([]);
  expect(evidenceLinks('f1', [...references, ...references])).toEqual([]);
});
it('resolves correlation evidence only against the actual current case IDs', () => {
  const references = [{ ref: 'r1', correlation_evidence_id: 12 }];
  expect(evidenceLinks('r1', references)).toEqual([]);
  expect(evidenceLinks('r1', references, { correlatedID: 'case', evidenceIDs: [13] })).toEqual([]);
  expect(evidenceLinks('r1', references, { correlatedID: 'case', evidenceIDs: [12] })[0]?.to).toBe(
    '/incidents/case#correlation-evidence-12',
  );
  expect(evidenceLinks('f', [{ ref: 'f', signal_id: 'not-an-incident-ID' }])).toEqual([]);
});
