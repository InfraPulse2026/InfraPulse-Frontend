import { Link } from 'react-router-dom';
import type { Model } from '../../api/client';
import { Badge, DataTable, Facts, Notice, Time, JsonView } from '../../components/shared';
import { measurement } from '../../lib/format';

const kinds: Record<string, string> = {
  same_asset: 'То же оборудование',
  same_asset_and_time: 'То же оборудование и близкое время',
  same_service: 'Общий сервис',
  topology_neighbor: 'Соседство в топологии',
  same_site: 'Общая площадка',
  temporal_proximity: 'Близость по времени',
};
export function CorrelationFacts({ items }: { items: Model<'CorrelationEvidence'>[] }) {
  if (!items.length) return <Notice>Backend не предоставил основания сопоставления.</Notice>;
  return (
    <div className="stack-form">
      {items.map((item, i) => {
        const d = item.details || {};
        const ids = Array.isArray(d.asset_ids)
          ? d.asset_ids
          : typeof d.asset_id === 'string'
            ? [d.asset_id]
            : [];
        return (
          <div key={i}>
            <strong>{kinds[item.kind || ''] || item.kind || 'Основание backend'}</strong>
            <Facts
              values={Object.fromEntries(
                Object.entries({
                  'Вес основания': item.score,
                  'Расстояние по времени, сек.':
                    typeof d.distance_seconds === 'number' ? d.distance_seconds : undefined,
                  'Качество времени':
                    typeof d.time_confidence === 'string' ? d.time_confidence : undefined,
                  'Свежая топология': typeof d.fresh === 'boolean' ? d.fresh : undefined,
                  'Разрешение идентичности':
                    typeof d.resolution === 'string' ? d.resolution : undefined,
                  'Причинная связь доказана':
                    typeof d.causal_claim === 'boolean' ? d.causal_claim : undefined,
                  Сервисы: Array.isArray(d.service_ids)
                    ? d.service_ids.filter((v) => typeof v === 'string').join(', ')
                    : undefined,
                  Площадки: Array.isArray(d.site_ids)
                    ? d.site_ids.filter((v) => typeof v === 'string').join(', ')
                    : undefined,
                }).filter(([, value]) => value !== undefined),
              )}
            />
            {ids
              .filter((id): id is string => typeof id === 'string')
              .map((id) => (
                <Link
                  className="asset-inline-link"
                  key={id}
                  to={`/assets/${encodeURIComponent(id)}`}
                >
                  {id}
                </Link>
              ))}
            <JsonView value={d} title="Дополнительные поля основания" />
          </div>
        );
      })}
    </div>
  );
}
export function Assessment({ value }: { value: Model<'HealthAssessment'> }) {
  const h = value.hardware,
    log = value.log,
    config = value.configuration,
    topology = value.topology,
    external = value.external;
  const metricValue =
    value.value !== undefined
      ? value.value
      : !value.unit || value.unit === 'percent'
        ? value.value_percent
        : undefined;
  return (
    <div className="stack-form">
      <div className="inline-actions">
        <Badge value={value.status} />
        <strong>{value.metric || value.rule_id}</strong>
      </div>
      <Facts
        values={{
          'Основание оценки': value.reason,
          Значение: metricValue,
          Единица: value.unit || (value.value_percent !== undefined ? 'percent' : undefined),
          Наблюдение: value.observed_at,
          'Окно оценки, сек.': value.window_seconds,
          'Версия правила': value.rule_version,
          'Условия восстановления выполнены': value.recovery_eligible,
        }}
      />
      {(value.seconds_to_critical !== undefined || value.r_squared !== undefined) && (
        <>
          <h3>Тенденция</h3>
          <Facts
            values={{
              'До критического уровня, сек.': value.seconds_to_critical,
              'Наклон, %/сек.': value.slope_percent_per_second,
              'Качество регрессии R²': value.r_squared,
            }}
          />
          <Notice>
            Прогноз условен: он действует при сохранении тенденции. R² характеризует соответствие
            линии данным и не является вероятностью сбоя.
          </Notice>
        </>
      )}
      {h && (
        <>
          <h3>Доказательства аппаратного состояния</h3>
          <Facts
            values={{
              Ресурс: h.resource_id,
              Субъект: h.subject_id,
              Health: h.health,
              'Health rollup': h.health_rollup,
              Свежесть: h.freshness,
              'Качество часов': h.clock_quality,
              'Sample ID': h.sample_id,
              'Наблюдения восстановления': h.recovery_count,
              Binding: h.binding_id,
            }}
          />
        </>
      )}
      {log && (
        <>
          <h3>Доказательства события журнала</h3>
          <Facts
            values={{
              Событие: log.pattern_id,
              Записей: log.event_count,
              Процесс: log.process,
              'Syslog severity': log.severity,
              'Audit success': log.audit_success,
              'Качество времени': log.time_quality,
              Lifecycle: log.lifecycle,
              'Событие произошло': log.event_at,
              Получено: log.received_at,
              Проверил: log.reviewed_by,
              'Причина проверки': log.review_reason,
            }}
          />
          <Notice>
            Неуспешная операция не доказывает атаку. Отметка оператора о проверке не означает
            техническое восстановление.
          </Notice>
        </>
      )}
      {config && (
        <>
          <h3>Доказательства изменения конфигурации</h3>
          <Facts
            values={{
              Asset: config.asset_id,
              'Эталонная ревизия': config.baseline_revision,
              'Target revision': config.target_revision,
              Снимок: config.snapshot_id,
              'Результат сравнения': config.result_id,
              Изменений: config.total_changes,
              'Список ограничен': config.truncated,
              Нормализатор: config.normalizer,
            }}
          />
          {config.asset_id && (
            <Link
              className="entity-link"
              to={`/configuration/${encodeURIComponent(config.asset_id)}`}
            >
              Открыть сравнение конфигурации →
            </Link>
          )}
        </>
      )}
      {topology && (
        <>
          <h3>Доказательства изменения соседства</h3>
          <Facts
            values={{
              Протокол: topology.protocol,
              'Снимок до': topology.before_snapshot_id,
              'Снимок после': topology.after_snapshot_id,
              Событий: topology.event_count,
              Lifecycle: topology.lifecycle,
              Истекает: topology.expires_at,
              Проверил: topology.reviewed_by,
              'Причина проверки': topology.review_reason,
            }}
          />
          <Notice>
            Изменение peer endpoint само по себе не доказывает обрыв физического кабеля.
          </Notice>
          <Link className="entity-link" to="/topology">
            Открыть карту сети →
          </Link>
        </>
      )}
      {external && (
        <>
          <h3>Внешнее событие Zabbix</h3>
          <Facts
            values={{
              Имя: external.name || external.trigger_name,
              'Event ID': external.event_id,
              'Trigger ID': external.trigger_id,
              'Host IDs': external.host_ids?.join(', '),
              'Оригинальная severity Zabbix': external.severity,
              'Принят в Zabbix': external.acknowledged,
              Подавлен: external.suppressed,
              'Состояние Zabbix': external.state,
              Восстановлен: external.recovered_at,
              'Статус привязки': external.mapping_status,
            }}
          />
          <Notice>
            Подтверждение в Zabbix и принятие симптома в InfraPulse — отдельные состояния.
          </Notice>
        </>
      )}
      {value.collector && (
        <>
          <h3>Связь с Collector</h3>
          <Facts
            values={{
              'Соединение активно': value.collector.connected,
              'Последняя активность': value.collector.last_seen_at,
              'Потеря связи с': value.collector.loss_since,
              Проверено: value.collector.checked_at,
              'Timeout, сек.': value.collector.agent_timeout_seconds,
            }}
          />
          <Notice>
            Состояние соединения Collector не определяет доступность всех его targets.
          </Notice>
        </>
      )}
      {!!value.resource_evidence?.length && (
        <DataTable
          data={value.resource_evidence}
          columns={[
            { header: 'Наблюдение', cell: ({ row }) => <Time value={row.original.observed_at} /> },
            { header: 'Источник записи', accessorKey: 'record_kind' },
            { header: 'Record ID', accessorKey: 'record_id' },
            { header: 'Измерение', cell: ({ row }) => measurement(row.original.value) },
            { header: 'Состояние', accessorKey: 'state' },
          ]}
        />
      )}
      {!!value.evidence?.length && (
        <DataTable
          data={value.evidence}
          columns={[
            { header: 'Наблюдение', cell: ({ row }) => <Time value={row.original.observed_at} /> },
            { header: 'Telemetry ID', accessorKey: 'telemetry_id' },
            { header: 'Значение, %', cell: ({ row }) => measurement(row.original.value_percent) },
          ]}
        />
      )}
    </div>
  );
}
