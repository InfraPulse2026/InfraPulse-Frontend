import { test, expect, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Имя пользователя', { exact: true }).fill('viewer');
  await page.getByLabel('Пароль', { exact: true }).fill('demo');
  await page.getByRole('button', { name: 'Войти в систему', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Обзор инфраструктуры', exact: true }),
  ).toBeVisible();
}
test('monitoring: qualified network zeros, uint64 precision and external metric pages', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto('/assets/asset_core?tab=metrics');
  const network = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Сетевые интерфейсы Collector', exact: true }),
  });
  await expect(
    network.getByRole('cell', { name: '18446744073709551615', exact: true }),
  ).toBeVisible();
  const row = network
    .getByRole('row')
    .filter({ has: page.getByRole('button', { name: 'Gi1/0/5', exact: true }) });
  await expect(row).toContainText('Выключен');
  await expect(
    network
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: 'Gi1/0/6', exact: true }) }),
  ).toContainText('Неизвестно');
  await network.getByRole('button', { name: 'Gi1/0/5', exact: true }).click();
  const detail = page.getByRole('dialog', { name: 'Показатели интерфейса', exact: true });
  await expect(
    detail.getByRole('cell', { name: '18446744073709551615', exact: true }),
  ).toBeVisible();
  await expect(detail.getByRole('cell', { name: 'Неизвестно', exact: true }).first()).toBeVisible();
  await detail.screenshot({ path: testInfo.outputPath('network-details.png') });
  await detail.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(
    network.getByRole('img', { name: 'Скорость сетевого интерфейса', exact: true }),
  ).toBeVisible();
  const external = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Внешние метрики', exact: true }) });
  const next = page.waitForRequest(
    (r) =>
      r.url().includes('/external-metrics?') &&
      new URL(r.url()).searchParams.get('offset') === '50',
  );
  await external.getByRole('button', { name: 'Следующая страница', exact: true }).click();
  await next;
  await expect(
    external.getByRole('cell', { name: 'SIMULATED external metric 54', exact: true }),
  ).toBeVisible();
  await expect(external.getByRole('cell', { name: '0 %', exact: true })).toBeVisible();
  await expect(
    external.getByRole('button', { name: 'Следующая страница', exact: true }),
  ).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('monitoring: hardware context and backend history cursor remain separate', async ({
  page,
}) => {
  await login(page);
  await page.goto('/assets/asset_server?tab=hardware');
  await page.getByRole('button', { name: 'Открыть →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'История · CPU Temperature', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Health rollup', { exact: true })).toBeVisible();
  const next = page.waitForRequest(
    (r) =>
      r.url().includes('/hardware/history?') &&
      new URL(r.url()).searchParams.get('after_id') === '10',
  );
  await page.getByRole('button', { name: 'Следующие наблюдения', exact: true }).click();
  expect(new URL((await next).url()).searchParams.get('observation_key')).toBe('demo-temp');
  await expect(page.getByText('Страница 2 · 4 наблюдений', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Следующие наблюдения', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Предыдущие наблюдения', exact: true }),
  ).toBeEnabled();
});
test('monitoring: audit filters keep UID/PID zero and open paged group records', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto('/logs?tab=audit');
  await page.getByText('Дополнительные фильтры логов и Audit', { exact: true }).click();
  await page.getByLabel('UID', { exact: true }).fill('0');
  await page.getByLabel('AUID', { exact: true }).fill('0');
  await page.getByLabel('PID', { exact: true }).fill('0');
  await page.getByRole('combobox', { name: 'Результат Audit', exact: true }).selectOption('false');
  await page.getByLabel('Начало периода', { exact: true }).fill('2026-10-15T00:00');
  await page.getByLabel('Конец периода', { exact: true }).fill('2026-10-16T00:00');
  const filtered = page.waitForRequest(
    (r) =>
      new URL(r.url()).pathname === '/api/audit/events' &&
      new URL(r.url()).searchParams.get('uid') === '0',
  );
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  const params = new URL((await filtered).url()).searchParams;
  expect(params.get('success')).toBe('false');
  expect(params.get('pid')).toBe('0');
  expect(params.get('from')).toMatch(/Z$/);
  await page.getByRole('button', { name: '1718451712.123:42', exact: true }).click();
  const detail = page.getByRole('dialog', { name: 'Событие Linux Audit', exact: true });
  await expect(detail.getByRole('cell', { name: '0 / 0 / 0', exact: true }).first()).toBeVisible();
  await expect(detail.getByText('Полнота', { exact: true })).toBeVisible();
  const next = page.waitForRequest(
    (r) =>
      r.url().includes('/api/audit/events/') &&
      new URL(r.url()).searchParams.get('before_id') === '251',
  );
  await detail.getByRole('button', { name: 'Более ранние записи группы →', exact: true }).click();
  await next;
  await expect(
    detail.getByText('SIMULATED audit record 50: permission denied', { exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByRole('button', { name: 'Более ранние записи группы →', exact: true }),
  ).toBeDisabled();
  await detail.screenshot({ path: testInfo.outputPath('audit-group.png') });
});
test('monitoring: invalid substring window is rejected before sending a new query', async ({
  page,
}) => {
  await login(page);
  await page.goto('/logs');
  await expect(
    page.getByRole('button', { name: 'SIMULATED audit record 0: permission denied', exact: true }),
  ).toBeVisible();
  await page.getByText('Дополнительные фильтры логов и Audit', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Режим поиска', exact: true }).selectOption('contains');
  await page.getByLabel('Поиск по логам', { exact: true }).fill('permission');
  let reads = 0;
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/api/logs') reads++;
  });
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('не длиннее 7 дней');
  expect(reads).toBe(0);
  await page.getByLabel('Начало периода', { exact: true }).fill('2026-10-01T00:00');
  await page.getByLabel('Конец периода', { exact: true }).fill('2026-10-15T00:00');
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('не длиннее 7 дней');
  expect(reads).toBe(0);
  await page.getByRole('button', { name: 'Сбросить фильтры', exact: true }).click();
  await expect(page.getByLabel('Поиск по логам', { exact: true })).toHaveValue('');
});
test('monitoring: Prometheus stays bound to stored mapping and refreshes the time window', async ({
  page,
}) => {
  await login(page);
  await page.goto('/assets/asset_server?tab=metrics');
  const history = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'История Prometheus', exact: true }) });
  await expect(
    history.getByRole('img', { name: 'Исторические метрики Prometheus', exact: true }),
  ).toBeVisible();
  const next = page.waitForRequest((r) => r.url().includes('/prometheus/range?'));
  await history.getByRole('combobox', { name: 'Период Prometheus', exact: true }).selectOption('6');
  const params = new URL((await next).url()).searchParams;
  expect(params.get('source_instance_id')).toBe('source_1');
  expect(params.get('target_id')).toBe('target_asset_server');
  expect(params.get('mapping_id')).toBe('simulated-cpu-mapping');
  expect(params.has('query')).toBe(false);
  expect(params.get('step_seconds')).toBe('44');
  await expect(
    history.getByRole('button', { name: 'Обновить временное окно', exact: true }),
  ).toBeEnabled();
  const refresh = page.waitForRequest(
    (r) =>
      r.url().includes('/prometheus/range?') &&
      new URL(r.url()).searchParams.get('to') !== params.get('to'),
  );
  await history.getByRole('button', { name: 'Обновить временное окно', exact: true }).click();
  await refresh;
});
