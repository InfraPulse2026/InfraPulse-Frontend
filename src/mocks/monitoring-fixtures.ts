import type { Model } from '../api/client';
import { now, logs } from './fixtures';
export const networkHistory: Model<'Telemetry'>[] = Array.from({ length: 24 }, (_, i) => ({
  id: 100 - i,
  agent_id: 'demo-edge-01',
  device_id: 'remote:core',
  observed_at: new Date(Date.parse(now) - i * 3000).toISOString(),
  collected_at: now,
  received_at: now,
  source: 'simulated',
  cpu_usage_percent: i === 5 ? null : 28 + (i % 7) * 4,
  memory_total_bytes: '17179869184',
  memory_used_bytes: '6000000000',
  sample: {
    interfaces: [
      {
        id: 'ifindex:5',
        name: 'Gi1/0/5',
        oper_state: 'up',
        metadata: { admin_status: true, mtu: true },
        mtu: 1500,
        counter_metadata: {
          available: { rx_bytes: true, tx_bytes: true, rx_errors: true, tx_dropped: true },
          widths: { rx_bytes: 64, tx_bytes: 64, rx_errors: 32, tx_dropped: 32 },
        },
        counters: { rx_bytes: '18446744073709551615', tx_bytes: '2048' },
        rates:
          i === 23
            ? undefined
            : {
                available: { rx_bytes: i !== 5, tx_bytes: true },
                rx_bytes_per_second: 125000 + i * 100,
              },
        speed_bits_per_second: '1000000000',
        addresses: ['192.0.2.15/24'],
      },
      {
        id: 'ifindex:6',
        name: 'Gi1/0/6',
        counter_metadata: { available: {}, widths: {} },
        counters: {},
        metadata: {},
        oper_state: 'unknown',
      },
    ],
  },
}));
export const auditKey = 'audit:' + 'a'.repeat(64);
export const auditRecords: Model<'LogRecord'>[] = Array.from({ length: 53 }, (_, i) => ({
  ...structuredClone(logs[0]!),
  id: 300 - i,
  record_id: `simulated-audit-${i}`,
  message_id: `simulated-audit-message-${i}`,
  source: 'simulated',
  source_id: 'demo-audit',
  process: 'auditd',
  host: 'audit-host.demo',
  file_identity: 'simulated-file-1',
  message: `SIMULATED audit record ${i}: permission denied`,
  event_at: now,
  observed_at: now,
  audit: {
    event_key: auditKey,
    event_id: '1718451712.123:42',
    record_type: i === 0 ? 'SYSCALL' : i === 1 ? 'EXECVE' : 'PATH',
    uid: 0,
    auid: 0,
    pid: 0,
    executable: '/usr/bin/id',
    syscall: '59',
    success: false,
    result: 'exit=-13',
    host: 'audit-host.demo',
  },
}));
export const auditGroup: Model<'AuditEvent'> = {
  cursor_id: 300,
  key: auditKey,
  agent_id: 'demo-edge-01',
  device_id: 'remote:core',
  source: 'simulated',
  source_id: 'demo-audit',
  file_identity: 'simulated-file-1',
  host: 'audit-host.demo',
  event_id: '1718451712.123:42',
  first_event_at: now,
  last_event_at: now,
  first_received_at: now,
  last_received_at: now,
  record_count: 53,
  record_types: ['SYSCALL', 'EXECVE', 'PATH'],
  outcome: 'failure',
  completeness: 'unknown',
};
export const externalMetrics: Model<'ExternalMetric'>[] = Array.from({ length: 55 }, (_, i) => ({
  source_instance_id: i === 1 ? 'source_1' : 'source_0',
  source_type: i === 1 ? 'PROMETHEUS' : 'ZABBIX',
  item_id: i === 1 ? 'prom_metric_simulated' : String(1000 + i),
  mapping_id: i === 1 ? 'simulated-cpu-mapping' : undefined,
  name:
    i === 0
      ? 'Memory used'
      : i === 1
        ? 'Counter example (uint64)'
        : `SIMULATED external metric ${i}`,
  metric: i === 1 ? 'network_rx_bytes' : 'memory_used_percent',
  value: i === 1 ? '18446744073709551615' : i === 54 ? '0' : '62.4',
  unit: i === 1 ? 'bytes' : '%',
  quality: 'fresh',
  observed_at: now,
  received_at: now,
}));
export const prometheusRange: Model<'PrometheusQueryResult'> = {
  source_instance_id: 'source_1',
  source_revision: 1,
  target_id: 'target_asset_server',
  mapping_id: 'simulated-cpu-mapping',
  metric: 'network_rx_bytes',
  unit: 'bytes',
  kind: 'range',
  time_semantics: 'promql_evaluation',
  quality: 'partial',
  points: [{ at: now, value: '18446744073709551615' }],
};
