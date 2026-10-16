import { useState } from 'react';
import type { Model } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Notice } from '../../components/shared';
type Config = NonNullable<Model<'DataSourceInput'>['configuration']>;
const metrics: Model<'ExternalItemMapping'>['metric'][] = [
  'cpu.utilization',
  'memory.utilization',
  'disk.utilization',
  'memory.used',
  'memory.total',
  'disk.free',
  'network.rx',
  'network.tx',
  'network.errors',
  'latency',
  'availability',
];
const units: Model<'ExternalItemMapping'>['unit'][] = [
  'percent',
  'bytes',
  'bytes_per_second',
  'per_second',
  'seconds',
  'boolean',
];

export default function SourceSettings({
  type,
  value,
  onChange,
}: {
  type: Model<'DataSourceInput'>['type'];
  value: Config;
  onChange: (value: Config) => void;
}) {
  if (type === 'COLLECTOR') return null;
  return (
    <>
      <label>
        Timeout подключения, секунды
        <input
          type="number"
          required
          min={1}
          max={120}
          value={value.timeout_seconds ?? 15}
          onChange={(e) => onChange({ ...value, timeout_seconds: Number(e.target.value) })}
        />
      </label>
      <label>
        Ссылка на доверенный CA backend
        <input
          maxLength={64}
          pattern="[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}|"
          value={value.tls_ca_ref || ''}
          onChange={(e) => onChange({ ...value, tls_ca_ref: e.target.value })}
        />
      </label>
      {type === 'ZABBIX' && (
        <Zabbix
          value={
            value.zabbix || { page_size: 20, device_type: 'unknown', verified_inventory: false }
          }
          onChange={(zabbix) => onChange({ ...value, zabbix })}
        />
      )}
      {type === 'PROMETHEUS' && (
        <Prometheus
          value={
            value.prometheus || {
              identity_labels: ['job', 'instance'],
              page_size: 5,
              max_targets: 200,
              auth_mode: 'none',
              device_type: 'unknown',
              profile: 'custom',
              verified_identity_labels: false,
              alerts_enabled: false,
            }
          }
          onChange={(prometheus) => onChange({ ...value, prometheus })}
        />
      )}
    </>
  );
}
function NumberField({
  label,
  value,
  min,
  max,
  change,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  change: (v: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        required
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => change(Number(e.target.value))}
      />
    </label>
  );
}
function CommaList({
  label,
  values,
  change,
  required = false,
}: {
  label: string;
  values: string[];
  change: (v: string[]) => void;
  required?: boolean;
}) {
  const [raw, setRaw] = useState(values.join(', '));
  return (
    <label>
      {label}
      <input
        required={required}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          change(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }}
      />
    </label>
  );
}
function Zabbix({
  value,
  onChange,
}: {
  value: Model<'ZabbixSettings'>;
  onChange: (v: Model<'ZabbixSettings'>) => void;
}) {
  const monitoring = value.monitoring || {
    enabled: false,
    event_page_size: 20,
    event_lookback_seconds: 86400,
  };
  const mappings = monitoring.item_mappings || [];
  const updateMonitoring = (patch: Partial<Model<'ZabbixMonitoring'>>) =>
    onChange({ ...value, monitoring: { ...monitoring, ...patch } });
  const update = (index: number, patch: Partial<Model<'ExternalItemMapping'>>) =>
    updateMonitoring({
      item_mappings: mappings.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    });
  return (
    <>
      <NumberField
        label="Host на страницу Zabbix"
        min={1}
        max={50}
        value={value.page_size ?? 20}
        change={(page_size) => onChange({ ...value, page_size })}
      />
      <label>
        Тип оборудования Zabbix
        <select
          value={value.device_type || 'unknown'}
          onChange={(e) =>
            onChange({
              ...value,
              device_type: e.target.value as Model<'ZabbixSettings'>['device_type'],
            })
          }
        >
          {[
            'unknown',
            'server',
            'workstation',
            'router',
            'switch',
            'firewall',
            'gateway',
            'access_point',
            'voice_gateway',
            'pbx',
            'hypervisor',
            'system',
            'bmc',
            'chassis',
            'component',
          ].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.verified_inventory ?? false}
          onChange={(e) => onChange({ ...value, verified_inventory: e.target.checked })}
        />{' '}
        Серийные номера инвентаризации проверены администратором
      </label>
      <label>
        <input
          type="checkbox"
          checked={monitoring.enabled ?? false}
          onChange={(e) => updateMonitoring({ enabled: e.target.checked })}
        />{' '}
        Получать мониторинг и события Zabbix
      </label>
      <NumberField
        label="Событий на страницу"
        min={1}
        max={100}
        value={monitoring.event_page_size ?? 20}
        change={(event_page_size) => updateMonitoring({ event_page_size })}
      />
      <NumberField
        label="Глубина событий, секунды"
        min={300}
        max={2592000}
        value={monitoring.event_lookback_seconds ?? 86400}
        change={(event_lookback_seconds) => updateMonitoring({ event_lookback_seconds })}
      />
      <h3>Соответствия Zabbix items</h3>
      {mappings.map((mapping, i) => (
        <fieldset className="stack-form" key={i}>
          <legend>Item {i + 1}</legend>
          <label>
            Host ID
            <input
              required
              pattern="[1-9][0-9]{0,19}"
              value={mapping.host_id}
              onChange={(e) => update(i, { host_id: e.target.value })}
            />
          </label>
          <label>
            Item ID
            <input
              required
              pattern="[1-9][0-9]{0,19}"
              value={mapping.item_id}
              onChange={(e) => update(i, { item_id: e.target.value })}
            />
          </label>
          <label>
            Нормализованная метрика
            <select
              value={mapping.metric}
              onChange={(e) => update(i, { metric: e.target.value as typeof mapping.metric })}
            >
              {metrics.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Единица результата
            <select
              value={mapping.unit}
              onChange={(e) => update(i, { unit: e.target.value as typeof mapping.unit })}
            >
              {units.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Единица источника
            <input
              maxLength={32}
              value={mapping.source_unit}
              onChange={(e) => update(i, { source_unit: e.target.value })}
            />
          </label>
          <label>
            Множитель преобразования
            <input
              required
              value={mapping.multiplier || '1'}
              onChange={(e) => update(i, { multiplier: e.target.value })}
            />
          </label>
          <NumberField
            label="Актуальность item, секунды"
            min={3}
            max={86400}
            value={mapping.max_age_seconds ?? 300}
            change={(max_age_seconds) => update(i, { max_age_seconds })}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              updateMonitoring({ item_mappings: mappings.filter((_, at) => at !== i) })
            }
          >
            Удалить item {i + 1}
          </Button>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={mappings.length >= 100}
        onClick={() =>
          updateMonitoring({
            item_mappings: [
              ...mappings,
              {
                host_id: '',
                item_id: '',
                metric: 'cpu.utilization',
                unit: 'percent',
                source_unit: '%',
                multiplier: '1',
                max_age_seconds: 300,
              },
            ],
          })
        }
      >
        Добавить Zabbix item
      </Button>
    </>
  );
}
function Prometheus({
  value,
  onChange,
}: {
  value: Model<'PrometheusSettings'>;
  onChange: (v: Model<'PrometheusSettings'>) => void;
}) {
  const mappings = value.mappings || [];
  const update = (index: number, patch: Partial<Model<'PrometheusMapping'>>) =>
    onChange({
      ...value,
      mappings: mappings.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    });
  return (
    <>
      <Notice>
        PromQL настраивает только администратор. Выражения исполняет backend с ограничением по
        identity labels выбранного target. Браузер не обращается к Prometheus напрямую.
      </Notice>
      <label>
        Профиль Prometheus
        <select
          value={value.profile || 'custom'}
          onChange={(e) =>
            onChange({ ...value, profile: e.target.value as 'custom' | 'node_exporter' })
          }
        >
          <option value="custom">Custom mappings</option>
          <option value="node_exporter">Node exporter</option>
        </select>
      </label>
      <label>
        Тип оборудования Prometheus
        <select
          value={value.device_type || 'unknown'}
          onChange={(e) =>
            onChange({
              ...value,
              device_type: e.target.value as Model<'PrometheusSettings'>['device_type'],
            })
          }
        >
          {['unknown', 'server', 'router', 'switch', 'firewall', 'hypervisor'].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <CommaList
        label="Scrape pools (через запятую)"
        values={value.scrape_pools || []}
        change={(scrape_pools) => onChange({ ...value, scrape_pools })}
      />
      <CommaList
        label="Identity labels (обязательны job и instance)"
        required
        values={value.identity_labels || ['job', 'instance']}
        change={(identity_labels) => onChange({ ...value, identity_labels })}
      />
      <label>
        Label filters: по одному key=value в строке
        <textarea
          defaultValue={Object.entries(value.label_match || {})
            .map(([k, v]) => `${k}=${v}`)
            .join('\n')}
          onChange={(e) => {
            const entries = e.target.value
              .split('\n')
              .filter((s) => s.trim())
              .map((s) => {
                const at = s.indexOf('=');
                return [s.slice(0, at).trim(), s.slice(at + 1)];
              });
            const valid =
              entries.every(([k]) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k!)) &&
              new Set(entries.map(([k]) => k)).size === entries.length &&
              e.target.value
                .split('\n')
                .filter((s) => s.trim())
                .every((s) => s.includes('='));
            e.target.setCustomValidity(
              valid ? '' : 'Укажите уникальные label=value, по одному в строке',
            );
            if (valid) onChange({ ...value, label_match: Object.fromEntries(entries) });
          }}
        />
      </label>
      <label>
        Режим авторизации Prometheus
        <select
          value={value.auth_mode || 'none'}
          onChange={(e) =>
            onChange({ ...value, auth_mode: e.target.value as 'none' | 'bearer' | 'basic' })
          }
        >
          <option value="none">Без авторизации</option>
          <option value="bearer">Bearer</option>
          <option value="basic">Basic</option>
        </select>
      </label>
      {value.auth_mode === 'basic' && (
        <label>
          Имя пользователя Prometheus
          <input
            value={value.username || ''}
            onChange={(e) => onChange({ ...value, username: e.target.value })}
          />
        </label>
      )}
      <NumberField
        label="Targets на страницу"
        min={1}
        max={5}
        value={value.page_size ?? 5}
        change={(page_size) => onChange({ ...value, page_size })}
      />
      <NumberField
        label="Лимит выбранных targets"
        min={1}
        max={200}
        value={value.max_targets ?? 200}
        change={(max_targets) => onChange({ ...value, max_targets })}
      />
      <label>
        <input
          type="checkbox"
          checked={value.alerts_enabled ?? false}
          onChange={(e) => onChange({ ...value, alerts_enabled: e.target.checked })}
        />{' '}
        Получать firing alerts выбранных targets
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.verified_identity_labels ?? false}
          onChange={(e) => onChange({ ...value, verified_identity_labels: e.target.checked })}
        />{' '}
        Identity labels проверены администратором
      </label>
      {(
        [
          'hostname_label',
          'manufacturer_label',
          'model_label',
          'serial_label',
          'uuid_label',
        ] as const
      ).map((key) => (
        <label key={key}>
          Inventory label: {key}
          <input
            maxLength={64}
            value={value[key] || ''}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
        </label>
      ))}
      <h3>Соответствия Prometheus</h3>
      {mappings.map((mapping, i) => (
        <fieldset className="stack-form" key={i}>
          <legend>Mapping {i + 1}</legend>
          <label>
            ID mapping
            <input
              required
              pattern="[a-zA-Z0-9][a-zA-Z0-9_-]{0,31}"
              value={mapping.id}
              onChange={(e) => update(i, { id: e.target.value })}
            />
          </label>
          <label>
            Нормализованная метрика Prometheus
            <input
              required
              value={mapping.metric}
              onChange={(e) => update(i, { metric: e.target.value })}
            />
          </label>
          <label>
            Единица Prometheus
            <input
              required
              value={mapping.unit}
              onChange={(e) => update(i, { unit: e.target.value })}
            />
          </label>
          <label>
            Выражение PromQL
            <textarea
              required
              maxLength={4096}
              value={mapping.expression}
              onChange={(e) => update(i, { expression: e.target.value })}
            />
          </label>
          <label>
            Множитель Prometheus
            <input
              required
              value={mapping.multiplier || '1'}
              onChange={(e) => update(i, { multiplier: e.target.value })}
            />
          </label>
          <NumberField
            label="Актуальность mapping, секунды"
            min={3}
            max={86400}
            value={mapping.max_age_seconds ?? 300}
            change={(max_age_seconds) => update(i, { max_age_seconds })}
          />
          <label>
            Metadata metric
            <input
              value={mapping.metadata_metric || ''}
              onChange={(e) => update(i, { metadata_metric: e.target.value })}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange({ ...value, mappings: mappings.filter((_, at) => at !== i) })}
          >
            Удалить mapping {i + 1}
          </Button>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={mappings.length >= 16}
        onClick={() =>
          onChange({
            ...value,
            mappings: [
              ...mappings,
              {
                id: `mapping_${mappings.length + 1}`,
                metric: 'cpu.utilization',
                unit: 'percent',
                expression: '',
                multiplier: '1',
                max_age_seconds: 300,
              },
            ],
          })
        }
      >
        Добавить Prometheus mapping
      </Button>
    </>
  );
}
