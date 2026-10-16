import { useMemo, useState } from 'react';
import type { Model } from '../../api/client';
import { Badge, DataTable, Drawer, Facts, Notice, Panel, Time } from '../../components/shared';
import { interfacesFromSample, counterFields, type NetworkInterface } from '../../lib/network';
import { measurement } from '../../lib/format';
import Chart from './Chart';

const labels = {
  rx_bytes: 'RX bytes',
  tx_bytes: 'TX bytes',
  rx_packets: 'RX packets',
  tx_packets: 'TX packets',
  rx_errors: 'RX errors',
  tx_errors: 'TX errors',
  rx_dropped: 'RX dropped',
  tx_dropped: 'TX dropped',
};
export default function NetworkMetrics({ items }: { items: Model<'Telemetry'>[] }) {
  const parsed = useMemo(() => interfacesFromSample(items[0]?.sample || {}), [items]);
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState<(NetworkInterface & { observedAt?: string }) | null>(null);
  const current = parsed.interfaces.find((v) => v.id === selected) || parsed.interfaces[0];
  const points = useMemo(
    () =>
      [...items]
        .sort((a, b) => Date.parse(a.observed_at) - Date.parse(b.observed_at))
        .map((sample) => {
          const iface = interfacesFromSample(sample.sample).interfaces.find(
            (i) => i.id === current?.id,
          );
          return {
            at: sample.observed_at,
            rx: iface?.rates.rx_bytes ?? null,
            tx: iface?.rates.tx_bytes ?? null,
          };
        }),
    [items, current?.id],
  );
  const option = useMemo(
    () => ({
      legend: { textStyle: { color: '#98a6b8' } },
      xAxis: { type: 'time' },
      yAxis: { type: 'value', name: 'B/s', min: 0, splitLine: { lineStyle: { color: '#26313e' } } },
      series: [
        {
          type: 'line',
          name: 'RX bytes/s',
          showSymbol: false,
          connectNulls: false,
          data: points.map((p) => [p.at, p.rx]),
        },
        {
          type: 'line',
          name: 'TX bytes/s',
          showSymbol: false,
          connectNulls: false,
          data: points.map((p) => [p.at, p.tx]),
        },
      ],
    }),
    [points],
  );
  return (
    <Panel
      title="Сетевые интерфейсы Collector"
      subtitle="Счётчики — точные значения; скорости вычислены агентом, не браузером"
    >
      <Facts
        values={{
          'Agent ID': items[0]?.agent_id,
          'Device ID': items[0]?.device_id,
          Источник: items[0]?.source,
        }}
      />
      {items[0] && (
        <p className="muted">
          Последнее наблюдение: <Time value={items[0].observed_at} /> · получено{' '}
          <Time value={items[0].received_at} />
        </p>
      )}
      {(parsed.omitted > 0 || parsed.truncated) && (
        <Notice>
          Неоднозначные/некорректные интерфейсы пропущены: {parsed.omitted}.{' '}
          {parsed.truncated ? 'Набор ограничен первыми 500 интерфейсами.' : ''}
        </Notice>
      )}
      <DataTable
        data={parsed.interfaces}
        emptyTitle="В этих samples нет интерфейсов"
        columns={[
          {
            header: 'Интерфейс',
            cell: ({ row }) => (
              <button
                className="text-link"
                onClick={() => setDetail({ ...row.original, observedAt: items[0]?.observed_at })}
              >
                {row.original.name || row.original.id}
              </button>
            ),
          },
          {
            header: 'Admin',
            cell: ({ row }) =>
              row.original.adminUp === null
                ? 'Неизвестно'
                : row.original.adminUp
                  ? 'Разрешён'
                  : 'Выключен',
          },
          {
            header: 'Oper',
            cell: ({ row }) => <Badge value={row.original.operState || 'unknown'} />,
          },
          {
            header: 'RX bytes/s',
            cell: ({ row }) => measurement(row.original.rates.rx_bytes, 'B/s'),
          },
          {
            header: 'TX bytes/s',
            cell: ({ row }) => measurement(row.original.rates.tx_bytes, 'B/s'),
          },
          {
            header: 'RX bytes counter',
            cell: ({ row }) => row.original.counters.rx_bytes ?? 'Неизвестно',
          },
          {
            header: 'TX bytes counter',
            cell: ({ row }) => row.original.counters.tx_bytes ?? 'Неизвестно',
          },
          {
            header: 'RX errors',
            cell: ({ row }) => row.original.counters.rx_errors ?? 'Неизвестно',
          },
          {
            header: 'TX dropped',
            cell: ({ row }) => row.original.counters.tx_dropped ?? 'Неизвестно',
          },
        ]}
      />
      {current && (
        <>
          <label>
            Интерфейс для графика
            <select value={current.id} onChange={(e) => setSelected(e.target.value)}>
              {parsed.interfaces.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name || i.id} · {i.id}
                </option>
              ))}
            </select>
          </label>
          <Chart option={option} label="Скорость сетевого интерфейса" />
        </>
      )}
      <Notice>
        История ограничена последними samples выбранного binding. Отсутствующие или недоступные
        скорости дают разрыв, а не ноль. Первый sample может не содержать рассчитанных rates.
        Счётчики не преобразуются в скорость; wrap/reset/discontinuity обрабатывает Agent.
        Наблюдение само по себе не доказывает текущее online-состояние.
      </Notice>
      <Drawer open={!!detail} title="Показатели интерфейса" onClose={() => setDetail(null)}>
        {detail && (
          <>
            <p className="muted">
              Значения выбранного наблюдения: <Time value={detail.observedAt} />. Для нового sample
              закройте и откройте строку заново.
            </p>
            <Facts
              values={{
                ID: detail.id,
                Имя: detail.name,
                Alias: detail.alias,
                MAC: detail.mac,
                Описание: detail.description,
                MTU: detail.mtu,
                Index: detail.index,
                Тип: detail.type,
                'Link speed, bit/s': detail.speed,
                Адреса: detail.addresses.join(', '),
                Admin:
                  detail.adminUp === null ? 'Неизвестно' : detail.adminUp ? 'Разрешён' : 'Выключен',
              }}
            />
            <DataTable
              data={counterFields.map((key) => ({
                key,
                counter: detail.counters[key],
                rate: detail.rates[key],
                width: detail.widths[key],
              }))}
              columns={[
                { header: 'Показатель', cell: ({ row }) => labels[row.original.key] },
                { header: 'Счётчик', cell: ({ row }) => row.original.counter ?? 'Неизвестно' },
                {
                  header: 'В секунду',
                  cell: ({ row }) =>
                    row.original.rate === null ? 'Неизвестно' : String(row.original.rate),
                },
                {
                  header: 'Разрядность',
                  cell: ({ row }) => row.original.width || 'Неизвестна / aggregate',
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </Panel>
  );
}
