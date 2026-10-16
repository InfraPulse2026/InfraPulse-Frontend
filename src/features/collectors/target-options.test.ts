import { it, expect, describe } from 'vitest';
import type { Model } from '../../api/client';
import {
  durationSeconds,
  snmpVersion,
  switchProtocol,
  validateManagedTargets,
} from './target-options';
const target: Model<'ManagedTarget'> = {
  target_id: 'core',
  protocol: 'snmp',
  endpoint: '192.0.2.10',
  enabled: true,
  credential_ref: 'local_snmp',
  polling: { fast_interval: '3s', topology_interval: '300s' },
  snmp: {
    version: 'v3',
    auth_protocol: 'SHA256',
    security_level: 'authPriv',
    privacy_protocol: 'AES',
  },
};
describe('managed target compatibility', () => {
  it('reads protobuf durations without treating units as seconds', () => {
    expect(durationSeconds('86400s')).toBe(86400);
    expect(durationSeconds('0.010s')).toBe(0.01);
    expect(durationSeconds('24h')).toBe('');
    expect(durationSeconds('5m')).toBe('');
    expect(durationSeconds('1.1234567890s')).toBe('');
  });
  it('uses medium for hardware, removes unused protocol blocks and preserves identity', () => {
    const v = switchProtocol(target, 'ipmi');
    expect(v.target_id).toBe('core');
    expect(v.polling).toEqual({ medium_interval: '30s', inventory_interval: '300s' });
    expect(v.snmp).toBeUndefined();
    expect(() => validateManagedTargets([v])).not.toThrow();
    expect(target.snmp?.version).toBe('v3');
  });
  it('clears SIP credentials/CA and unused periods and SNMP v3-only settings', () => {
    const v = switchProtocol({ ...target, ca_ref: 'local_ca' }, 'sip');
    expect(v.credential_ref).toBeUndefined();
    expect(v.ca_ref).toBeUndefined();
    expect(v.polling).toEqual({ fast_interval: '30s' });
    expect(snmpVersion(target.snmp, 'v2c')).not.toHaveProperty('auth_protocol');
  });
  it('rejects duplicate IDs and credential/CA misuse', () => {
    expect(() => validateManagedTargets([target, target])).toThrow('уникальный');
    expect(() =>
      validateManagedTargets([{ ...switchProtocol(target, 'sip'), credential_ref: 'illegal' }]),
    ).toThrow('SIP');
    expect(() => validateManagedTargets([{ ...target, ca_ref: 'ca' }])).toThrow('CA');
  });
  it('respects 24h and protocol-specific lower bounds and unused periods', () => {
    expect(() =>
      validateManagedTargets([{ ...target, polling: { fast_interval: '86400s' } }]),
    ).not.toThrow();
    expect(() =>
      validateManagedTargets([{ ...target, polling: { fast_interval: '86401s' } }]),
    ).toThrow('диапазон');
    const hardware = switchProtocol(target, 'redfish');
    hardware.endpoint = 'https://bmc.example.org';
    expect(() =>
      validateManagedTargets([{ ...hardware, polling: { medium_interval: '9s' } }]),
    ).toThrow('диапазон');
    expect(() =>
      validateManagedTargets([{ ...hardware, polling: { fast_interval: '30s' } }]),
    ).toThrow('не используется');
  });
  it('rejects endpoint credentials/paths, incompatible options and undersized IPMI budget', () => {
    const https = switchProtocol(target, 'routeros');
    for (const endpoint of [
      'http://a.example',
      'https://u:p@a.example',
      'https://a.example/api',
      'https://a.example?',
    ])
      expect(() => validateManagedTargets([{ ...https, endpoint }])).toThrow('HTTPS');
    expect(() => validateManagedTargets([{ ...target, ipmi: { port: 623 } }])).toThrow('блок');
    expect(() =>
      validateManagedTargets([
        { ...switchProtocol(target, 'ipmi'), ipmi: { max_poll_bytes: 1000 } },
      ]),
    ).toThrow('вмещать');
  });
});
