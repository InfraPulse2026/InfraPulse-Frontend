import type { EChartsCoreOption } from 'echarts/core';
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
function mapConfig(
  v: unknown,
  update: (entry: Record<string, unknown>) => Record<string, unknown>,
) {
  return Array.isArray(v) ? v.map((entry) => update(record(entry))) : update(record(v));
}
export function chartTheme(option: EChartsCoreOption, light: boolean): EChartsCoreOption {
  const text = light ? '#475569' : '#a8b6c8',
    line = light ? '#d7e0e8' : '#26313e';
  const axis = (entry: Record<string, unknown>) => ({
    ...entry,
    axisLabel: { ...record(entry.axisLabel), color: text },
    nameTextStyle: { ...record(entry.nameTextStyle), color: text },
    axisLine: {
      ...record(entry.axisLine),
      lineStyle: { ...record(record(entry.axisLine).lineStyle), color: line },
    },
    splitLine: {
      ...record(entry.splitLine),
      lineStyle: { ...record(record(entry.splitLine).lineStyle), color: line },
    },
  });
  const result: EChartsCoreOption = {
    ...option,
    color: light
      ? ['#087f6c', '#315dcc', '#9b640b', '#c13955']
      : ['#49d8b6', '#7c9fff', '#f4bb65', '#f0788c'],
    textStyle: { ...record(option.textStyle), color: text, fontFamily: 'system-ui' },
    tooltip: {
      trigger: 'axis',
      ...record(option.tooltip),
      backgroundColor: light ? '#fff' : '#192330',
      borderColor: line,
      textStyle: {
        ...record(record(option.tooltip).textStyle),
        color: light ? '#172334' : '#e2e8f0',
      },
      renderMode: 'richText',
    },
    grid: option.grid || { left: 48, right: 22, top: 28, bottom: 40 },
  };
  if (option.legend)
    result.legend = mapConfig(option.legend, (entry) => ({
      ...entry,
      textStyle: { ...record(entry.textStyle), color: text },
    }));
  if (option.xAxis) result.xAxis = mapConfig(option.xAxis, axis);
  if (option.yAxis) result.yAxis = mapConfig(option.yAxis, axis);
  return result;
}
