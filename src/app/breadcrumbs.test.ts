import { it, expect } from 'vitest';
import { breadcrumbs } from './breadcrumbs';
it('keeps commands, jobs, signals and remediation route ancestry distinct', () => {
  expect(breadcrumbs('/automation/commands/cmd_1').map((c) => c.label)).toEqual([
    'Рабочая среда',
    'Автоматизация',
    'Команды и откат',
    'cmd_1',
  ]);
  expect(breadcrumbs('/automation/jobs/job_1')[2]?.to).toBe('/automation/jobs');
  expect(breadcrumbs('/incidents/signals/inc_1')[2]?.to).toBe('/incidents');
  expect(breadcrumbs('/automation/remediations/rem_1')[2]?.to).toBeUndefined();
  expect(breadcrumbs('/configuration/drift').at(-1)?.label).toBe('Отклонения');
});
