import { it, expect } from 'vitest';
import { chartTheme } from './chart-theme';
it('changes contrast while preserving gaps, units, axis bounds and original data', () => {
  const option = {
    xAxis: { type: 'time' },
    yAxis: [{ min: 0, max: 100, name: '%' }],
    series: [
      {
        type: 'line',
        connectNulls: false,
        data: [
          [1, null],
          [2, 0],
        ],
      },
    ],
    tooltip: { trigger: 'axis' },
    legend: { show: true },
  };
  const original = structuredClone(option),
    light = chartTheme(option, true),
    dark = chartTheme(option, false);
  expect(option).toEqual(original);
  expect(light.series).toEqual(option.series);
  expect(light.yAxis).toMatchObject([{ min: 0, max: 100, name: '%' }]);
  expect(light.textStyle).not.toEqual(dark.textStyle);
  expect(light.tooltip).toMatchObject({ renderMode: 'richText' });
});
