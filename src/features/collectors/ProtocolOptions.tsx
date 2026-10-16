import type { Model } from '../../api/client';
import { durationSeconds, snmpVersion } from './target-options';
type Target = Model<'ManagedTarget'>;
type Field = {
  name: string;
  label: string;
  min?: number;
  max?: number;
  choices?: readonly string[];
  duration?: boolean;
  text?: boolean;
  maxLength?: number;
  hint?: string;
};
const snmp: Field[] = [
  { name: 'port', label: 'SNMP port', min: 1, max: 65535 },
  { name: 'retries', label: 'SNMP retries', min: 0, max: 10 },
  { name: 'security_level', label: 'SNMP security level', choices: ['authPriv', 'authNoPriv'] },
  {
    name: 'auth_protocol',
    label: 'SNMP auth protocol',
    choices: ['MD5', 'SHA', 'SHA224', 'SHA256', 'SHA384', 'SHA512'],
  },
  {
    name: 'privacy_protocol',
    label: 'SNMP privacy protocol',
    choices: ['DES', 'AES', 'AES192', 'AES256', 'AES192C', 'AES256C'],
  },
  { name: 'context_name', label: 'SNMP context, до 32 байт', text: true, maxLength: 32 },
];
const sip: Field[] = [
  { name: 'port', label: 'SIP port', min: 1, max: 65535 },
  { name: 'from_user', label: 'SIP from user', text: true, maxLength: 128 },
  { name: 'to_user', label: 'SIP to user', text: true, maxLength: 128 },
  { name: 'domain', label: 'SIP domain', text: true, maxLength: 253 },
  { name: 'server_name', label: 'SIP TLS server name', text: true, maxLength: 253 },
  { name: 'failure_threshold', label: 'SIP failure threshold', min: 1, max: 100 },
  {
    name: 'latency_threshold',
    label: 'SIP latency threshold, сек.',
    min: 0.001,
    max: 60,
    duration: true,
  },
];
const redfish: Field[] = [
  { name: 'auth', label: 'Redfish authentication', choices: ['session', 'basic'] },
  {
    name: 'request_timeout',
    label: 'Redfish request timeout, сек.',
    min: 0.01,
    max: 30,
    duration: true,
  },
  { name: 'max_resources', label: 'Redfish max resources', min: 1, max: 1024 },
  { name: 'max_pages', label: 'Redfish max pages', min: 1, max: 64 },
  { name: 'max_requests', label: 'Redfish max requests', min: 1, max: 4096 },
];
const ipmi: Field[] = [
  { name: 'port', label: 'IPMI port', min: 1, max: 65535 },
  { name: 'cipher_suite', label: 'IPMI cipher suite', choices: ['17', '3'] },
  { name: 'privilege', label: 'IPMI privilege', choices: ['user', 'operator'] },
  { name: 'retries', label: 'IPMI retries', min: 0, max: 3 },
  {
    name: 'request_timeout',
    label: 'IPMI request timeout, сек.',
    min: 0.01,
    max: 30,
    duration: true,
  },
  {
    name: 'max_session_duration',
    label: 'IPMI session duration, сек.',
    min: 0.01,
    max: 300,
    duration: true,
  },
  { name: 'sdr_cache_ttl', label: 'IPMI SDR cache TTL, сек.', min: 1, max: 3600, duration: true },
  { name: 'max_operations', label: 'IPMI max operations', min: 1, max: 8192 },
  { name: 'max_sdr_records', label: 'IPMI max SDR records', min: 1, max: 1024 },
  { name: 'max_sdr_bytes', label: 'IPMI max SDR bytes', min: 260, max: 1048576 },
  { name: 'max_fru_records', label: 'IPMI max FRU records', min: 1, max: 128 },
  { name: 'max_fru_bytes', label: 'IPMI max FRU bytes', min: 8, max: 65536 },
  { name: 'max_poll_bytes', label: 'IPMI max poll bytes', min: 260, max: 8388608 },
];
function Fields({
  fields,
  values,
  change,
}: {
  fields: Field[];
  values: Record<string, unknown>;
  change: (name: string, value: string | number | undefined) => void;
}) {
  return (
    <div className="form-grid">
      {fields.map((f) => {
        const raw = values[f.name];
        const value = f.duration
          ? durationSeconds(typeof raw === 'string' ? raw : undefined)
          : raw === undefined
            ? ''
            : String(raw);
        return (
          <label key={f.name}>
            {f.label}
            {f.choices ? (
              <select
                value={String(value)}
                onChange={(e) =>
                  change(
                    f.name,
                    e.target.value === ''
                      ? undefined
                      : f.name === 'cipher_suite'
                        ? Number(e.target.value)
                        : e.target.value,
                  )
                }
              >
                <option value="">По умолчанию</option>
                {f.choices.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.text ? 'text' : 'number'}
                min={f.min}
                max={f.max}
                step={f.duration ? 'any' : 1}
                maxLength={f.maxLength}
                value={value}
                placeholder="По умолчанию"
                onChange={(e) =>
                  change(
                    f.name,
                    e.target.value === ''
                      ? undefined
                      : f.text
                        ? e.target.value
                        : f.duration
                          ? `${Number(e.target.value)}s`
                          : Number(e.target.value),
                  )
                }
              />
            )}
            {f.hint && <small>{f.hint}</small>}
          </label>
        );
      })}
    </div>
  );
}
export default function ProtocolOptions({
  target: t,
  update,
}: {
  target: Target;
  update: (patch: Partial<Target>) => void;
}) {
  const hardware = t.protocol === 'redfish' || t.protocol === 'ipmi';
  const polling: Field[] = [
    ...(t.protocol !== 'sip'
      ? [
          {
            name: 'medium_interval',
            label: 'Medium interval, сек.',
            min: 0,
            max: 86400,
            duration: true,
          },
          {
            name: 'inventory_interval',
            label: 'Inventory interval, сек.',
            min: 0,
            max: 86400,
            duration: true,
          },
        ]
      : []),
    ...(!hardware && t.protocol !== 'sip'
      ? [
          {
            name: 'topology_interval',
            label: 'Topology interval, сек.',
            min: 0,
            max: 86400,
            duration: true,
          },
        ]
      : []),
    {
      name: 'timeout',
      label: 'Polling timeout, сек.',
      min: 0,
      max: t.protocol === 'sip' ? 60 : 300,
      duration: true,
    },
  ];
  return (
    <details className="protocol-options">
      <summary>Интервалы и параметры {t.protocol.toUpperCase()}</summary>
      <p className="muted">
        Пустой период или 0 — фиксированный default backend. Интервалы {hardware ? '10' : '3'}–86400
        секунд; timeout от 0,01 секунды. Для аппаратного мониторинга используется medium, для SIP —
        fast. Остальные периоды не отправляются.
      </p>
      <Fields
        fields={polling}
        values={t.polling || {}}
        change={(k, v) => update({ polling: { ...t.polling, [k]: v } })}
      />
      {t.protocol === 'snmp' && (
        <>
          <label>
            SNMP version
            <select
              value={t.snmp?.version || 'v2c'}
              onChange={(e) =>
                update({ snmp: snmpVersion(t.snmp, e.target.value as 'v2c' | 'v3') })
              }
            >
              <option value="v2c">v2c</option>
              <option value="v3">v3</option>
            </select>
          </label>
          <Fields
            fields={snmp.filter(
              (f) =>
                ['port', 'retries'].includes(f.name) ||
                (t.snmp?.version === 'v3' &&
                  (f.name !== 'privacy_protocol' || t.snmp.security_level !== 'authNoPriv')),
            )}
            values={t.snmp || {}}
            change={(k, v) =>
              update({
                snmp: {
                  ...t.snmp,
                  [k]: v,
                  ...(k === 'security_level' && v === 'authNoPriv'
                    ? { privacy_protocol: undefined }
                    : {}),
                },
              })
            }
          />
        </>
      )}
      {t.protocol === 'sip' && (
        <>
          <label>
            Транспорт SIP
            <select
              value={t.sip?.transport || 'udp'}
              onChange={(e) => {
                const transport = e.target.value as 'udp' | 'tcp' | 'tls';
                update({
                  ca_ref: transport === 'tls' ? t.ca_ref : undefined,
                  sip: {
                    ...t.sip,
                    transport,
                    server_name: transport === 'tls' ? t.sip?.server_name : undefined,
                    port:
                      !t.sip?.port || [5060, 5061].includes(t.sip.port)
                        ? transport === 'tls'
                          ? 5061
                          : 5060
                        : t.sip.port,
                  },
                });
              }}
            >
              <option>udp</option>
              <option>tcp</option>
              <option>tls</option>
            </select>
          </label>
          <Fields
            fields={sip.filter((f) => f.name !== 'server_name' || t.sip?.transport === 'tls')}
            values={t.sip || {}}
            change={(k, v) => update({ sip: { ...t.sip, [k]: v } })}
          />
        </>
      )}
      {t.protocol === 'redfish' && (
        <Fields
          fields={redfish}
          values={t.redfish || {}}
          change={(k, v) => update({ redfish: { ...t.redfish, [k]: v } })}
        />
      )}
      {t.protocol === 'ipmi' && (
        <Fields
          fields={ipmi}
          values={t.ipmi || {}}
          change={(k, v) => update({ ipmi: { ...t.ipmi, [k]: v } })}
        />
      )}
      {t.protocol === 'routeros' && (
        <p className="muted">
          RouterOS использует HTTPS endpoint и локальные credential/CA references; отдельного блока
          options в API нет.
        </p>
      )}
    </details>
  );
}
