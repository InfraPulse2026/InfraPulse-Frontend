import { describe, expect, it } from 'vitest';
import Ajv from 'ajv';
import formats from 'ajv-formats';
import spec from '../../api/openapi.json';
import { pkiCertificates, pkiTokens, pkiAudit } from './pki-fixtures';
import { commandFixtures, commandSnapshotFixtures, commandPolicy } from './command-fixtures';
import {
  networkHistory,
  auditRecords,
  auditGroup,
  externalMetrics,
  prometheusRange,
} from './monitoring-fixtures';
import {
  assets,
  agents,
  sources,
  cases,
  caseFixture,
  signals,
  topology,
  logs,
  sip,
  locations,
  drift,
  report,
  bindings,
  snapshotContent,
} from './fixtures';
// OpenAPI 3.0 nullable is converted without modifying the pinned artifact.
function convert(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(convert);
  if (!value || typeof value !== 'object') return value;
  const original = value as Record<string, unknown>;
  const object = Object.fromEntries(
    Object.entries(original)
      .filter(([key]) => key !== 'nullable')
      .map(([key, v]) => [key, convert(v)]),
  );
  return original.nullable === true ? { anyOf: [object, { type: 'null' }] } : object;
}
const ajv = new Ajv({ strict: false, allErrors: true });
formats(ajv);
function validate(name: string, value: unknown) {
  const schema = {
    $ref: `#/components/schemas/${name}`,
    components: { schemas: convert(spec.components.schemas) },
  };
  const check = ajv.compile(schema);
  const valid = check(value);
  expect(valid, `${name}: ${ajv.errorsText(check.errors)}`).toBe(true);
}
describe('fixtures conform to actual OpenAPI schemas', () => {
  it('source_count and binding ownership match, external identities are unique per source', () => {
    const external = new Set<string>();
    for (const asset of assets) {
      const items = bindings(asset.id);
      expect(items).toHaveLength(asset.source_count);
      for (const binding of items) {
        validate('AssetSourceBinding', binding);
        expect(binding.asset_id).toBe(asset.id);
        const key = `${binding.source_instance_id}:${binding.external_id}`;
        expect(external.has(key)).toBe(false);
        external.add(key);
      }
    }
  });
  it('case counts and affected assets match member fixtures', () => {
    for (const item of cases) {
      const value = caseFixture(item.id!);
      validate('CorrelationCase', value);
      expect(value.signals?.length).toBe(item.signal_count);
      expect(new Set(value.signals?.map((m) => m.signal?.source_kind)).size).toBe(
        item.source_count,
      );
      expect(
        value.signals?.every((m) => m.signal?.asset_ids?.includes(item.primary_asset_id!)),
      ).toBe(true);
    }
  });
  it.each([
    ['Asset', assets],
    ['Agent', agents],
    ['DataSource', sources],
    ['CorrelatedIncident', cases],
    ['Incident', signals],
    ['LogRecord', logs],
    ['PhysicalLocation', locations],
    ['PKICertificate', pkiCertificates],
    ['PKIBootstrapToken', pkiTokens],
    ['PKIAudit', pkiAudit],
    ['CommandRecord', commandFixtures],
    ['CommandSnapshot', commandSnapshotFixtures],
    ['Telemetry', networkHistory],
    ['LogRecord', auditRecords],
    ['ExternalMetric', externalMetrics],
  ] as const)('%s', (name, items) => items.forEach((v) => validate(name, v)));
  it.each([
    ['GlobalTopologyGraph', topology],
    ['SIPTarget', sip],
    ['ConfigurationDriftState', drift],
    ['ReportV2Summary', report],
    ['AutomationSnapshotContent', snapshotContent],
    ['CommandPolicy', commandPolicy],
    ['AuditEvent', auditGroup],
    ['PrometheusQueryResult', prometheusRange],
  ] as const)('%s', (name, value) => validate(name, value));
});
