import type { Model } from '../../api/client';
type Target = Model<'ManagedTarget'>;
export function durationSeconds(value?: string): number | '' {
  if (!value || !/^\d+(\.\d{1,9})?s$/.test(value)) return '';
  const n = Number(value.slice(0, -1));
  return Number.isFinite(n) ? n : '';
}
export function switchProtocol(previous: Target, protocol: Target['protocol']): Target {
  const { snmp, sip, redfish, ipmi, polling, ...base } = previous;
  void snmp;
  void sip;
  void redfish;
  void ipmi;
  void polling;
  const value: Target = {
    ...base,
    protocol,
    polling:
      protocol === 'redfish' || protocol === 'ipmi'
        ? { medium_interval: '30s', inventory_interval: '300s' }
        : { fast_interval: protocol === 'sip' ? '30s' : '3s' },
  };
  if (protocol === 'sip') {
    delete value.credential_ref;
    value.sip = { transport: 'udp', port: 5060, failure_threshold: 3 };
  }
  if (protocol === 'snmp' || protocol === 'ipmi' || protocol === 'sip') delete value.ca_ref;
  if (protocol === 'snmp') value.snmp = { version: 'v2c', port: 161, retries: 1 };
  if (protocol === 'redfish') value.redfish = { auth: 'session' };
  if (protocol === 'ipmi')
    value.ipmi = { port: 623, cipher_suite: 17, privilege: 'user', retries: 1 };
  return value;
}
export function snmpVersion(
  options: Target['snmp'],
  version: 'v2c' | 'v3',
): NonNullable<Target['snmp']> {
  return version === 'v2c'
    ? { version, port: options?.port, retries: options?.retries }
    : {
        ...options,
        version,
        security_level: 'authPriv',
        auth_protocol: 'SHA256',
        privacy_protocol: 'AES',
      };
}
const identifier = (v?: string) => !!v && /^[A-Za-z0-9_.-]{1,128}$/.test(v);
function host(v: string) {
  if (!v || /[\s/\\?#@%]/.test(v)) return false;
  if (v.includes(':')) {
    try {
      return new URL(`https://[${v}]`).hostname.includes(':');
    } catch {
      return false;
    }
  }
  const value = v.endsWith('.') ? v.slice(0, -1) : v;
  return (
    value.length <= 253 &&
    value.split('.').every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))
  );
}
export function validateManagedTargets(targets: Target[]) {
  if (targets.length > 1024) throw new Error('Допускается до 1024 Targets.');
  const seen = new Set<string>();
  for (const t of targets) {
    const fail = (message: string): never => {
      throw new Error(`${t.target_id || 'Новый Target'}: ${message}`);
    };
    if (!identifier(t.target_id) || seen.has(t.target_id)) fail('нужен уникальный Target ID.');
    seen.add(t.target_id);
    if (t.protocol === 'sip' ? !!t.credential_ref : !identifier(t.credential_ref))
      fail('credential_ref обязателен для non-SIP и запрещён для SIP.');
    if (
      t.ca_ref &&
      (!identifier(t.ca_ref) ||
        !(
          ['routeros', 'redfish'].includes(t.protocol) ||
          (t.protocol === 'sip' && t.sip?.transport === 'tls')
        ))
    )
      fail('CA reference допустим только для TLS-протокола.');
    if (t.protocol === 'routeros' || t.protocol === 'redfish') {
      try {
        const u = new URL(t.endpoint);
        if (
          u.protocol !== 'https:' ||
          !host(u.hostname.startsWith('[') ? u.hostname.slice(1, -1) : u.hostname) ||
          u.username ||
          u.password ||
          (u.port && Number(u.port) < 1) ||
          (u.pathname !== '' && u.pathname !== '/') ||
          u.search ||
          u.hash ||
          /[\\\s?#]/.test(t.endpoint)
        )
          fail('нужен HTTPS origin без пути, credentials, query и fragment.');
      } catch {
        fail('нужен корректный HTTPS origin.');
      }
    } else if (!host(t.endpoint)) fail('нужен host/IP без порта, пути и credentials.');
    const hardware = t.protocol === 'redfish' || t.protocol === 'ipmi';
    const p = t.polling || {};
    for (const field of [
      'fast_interval',
      'medium_interval',
      'inventory_interval',
      'topology_interval',
      'timeout',
    ] as const) {
      const raw = p[field];
      if (raw === undefined) continue;
      const n = durationSeconds(raw);
      if (n === '') fail(`${field}: нужен protobuf duration в секундах.`);
      const unused =
        (hardware && (field === 'fast_interval' || field === 'topology_interval')) ||
        (t.protocol === 'sip' && !['fast_interval', 'timeout'].includes(field));
      if (unused && n !== 0) fail(`${field} не используется этим протоколом.`);
      const min = field === 'timeout' ? 0.01 : hardware ? 10 : 3;
      const max = field === 'timeout' ? (t.protocol === 'sip' ? 60 : 300) : 86400;
      if (n !== 0 && (Number(n) < min || Number(n) > max))
        fail(`${field}: диапазон ${min}–${max} секунд, 0 — default.`);
    }
    const blocks = ['snmp', 'sip', 'redfish', 'ipmi'] as const;
    if (blocks.some((b) => t[b] && b !== t.protocol))
      fail('несовместимый блок параметров протокола.');
    if (
      t.snmp?.version === 'v2c' &&
      (t.snmp.security_level ||
        t.snmp.auth_protocol ||
        t.snmp.privacy_protocol ||
        t.snmp.context_name)
    )
      fail('SNMP v2c не принимает настройки v3.');
    if (t.snmp?.security_level === 'authNoPriv' && t.snmp.privacy_protocol)
      fail('authNoPriv не принимает privacy protocol.');
    if (t.snmp?.context_name && new TextEncoder().encode(t.snmp.context_name).length > 32)
      fail('SNMP context ограничен 32 байтами UTF-8.');
    if (
      t.ipmi &&
      t.ipmi.max_poll_bytes &&
      ((t.ipmi.max_fru_bytes || 65536) > t.ipmi.max_poll_bytes ||
        (t.ipmi.max_sdr_bytes || 131072) > t.ipmi.max_poll_bytes)
    )
      fail('max_poll_bytes должен вмещать FRU и SDR.');
  }
}
