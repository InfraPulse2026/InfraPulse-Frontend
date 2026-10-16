import { test, expect, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Имя пользователя', { exact: true }).fill('demo');
  await page.getByLabel('Пароль', { exact: true }).fill('demo');
  await page.getByRole('button', { name: 'Войти в систему', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Обзор инфраструктуры', exact: true }),
  ).toBeVisible();
}
test('protocols: hardware uses medium interval and reviewed IPMI options without fast polling', async ({
  page,
}, info) => {
  await login(page);
  await page.goto('/collectors/demo-edge-01');
  await page.getByRole('button', { name: 'Редактировать Targets', exact: true }).click();
  await page.getByRole('combobox', { name: 'Протокол', exact: true }).selectOption('ipmi');
  await page.getByLabel('Credential reference', { exact: true }).fill('lab_ipmi');
  await expect(page.getByLabel('Fast interval, сек.', { exact: true })).toHaveCount(0);
  await page.getByText('Интервалы и параметры IPMI', { exact: true }).click();
  await page.getByLabel('Medium interval, сек.', { exact: true }).fill('86400');
  await page.getByLabel('IPMI request timeout, сек.', { exact: true }).fill('1.5');
  await page
    .getByRole('combobox', { name: 'IPMI privilege', exact: true })
    .selectOption('operator');
  await page.getByLabel('IPMI max operations', { exact: true }).fill('2048');
  await page.getByLabel('Причина изменения', { exact: true }).fill('SIMULATED managed hardware');
  await page.getByRole('button', { name: 'Просмотреть и отправить', exact: true }).click();
  const review = page.getByRole('dialog', {
    name: 'Обновить весь управляемый набор?',
    exact: true,
  });
  await review
    .getByText('Полный snapshot: интервалы, параметры и references', { exact: true })
    .click();
  await expect(review).toContainText('1.5s');
  await review.screenshot({ path: info.outputPath('managed-protocol-review.png') });
  const sent = page.waitForRequest(
    (r) => r.method() === 'PUT' && r.url().includes('/api/collectors/demo-edge-01/config'),
  );
  await review.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  const body = (await sent).postDataJSON();
  expect(body.expected_revision).toBe(2);
  expect(body.targets[0]).toMatchObject({
    protocol: 'ipmi',
    credential_ref: 'lab_ipmi',
    polling: { medium_interval: '86400s', inventory_interval: '300s' },
    ipmi: { request_timeout: '1.5s', privilege: 'operator', max_operations: 2048 },
  });
  expect(body.targets[0].polling).not.toHaveProperty('fast_interval');
  expect(body.targets[0]).not.toHaveProperty('snmp');
});
test('protocols: SNMP v3 to v2 cleanup, invalid interval rejection and SIP TLS references', async ({
  page,
}) => {
  await login(page);
  await page.goto('/collectors/demo-edge-01');
  await page.getByRole('button', { name: 'Редактировать Targets', exact: true }).click();
  await page.getByText('Интервалы и параметры SNMP', { exact: true }).click();
  await page.getByRole('combobox', { name: 'SNMP version', exact: true }).selectOption('v3');
  await page
    .getByRole('combobox', { name: 'SNMP auth protocol', exact: true })
    .selectOption('SHA512');
  await page.getByRole('combobox', { name: 'SNMP version', exact: true }).selectOption('v2c');
  await expect(page.getByRole('combobox', { name: 'SNMP auth protocol', exact: true })).toHaveCount(
    0,
  );
  await page.getByLabel('Fast interval, сек.', { exact: true }).fill('2');
  await page.getByLabel('Причина изменения', { exact: true }).fill('SIMULATED protocol change');
  let writes = 0;
  page.on('request', (r) => {
    if (r.method() === 'PUT' && r.url().includes('/api/collectors/')) writes++;
  });
  await page.getByRole('button', { name: 'Просмотреть и отправить', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('диапазон 3–86400');
  expect(writes).toBe(0);
  await page.getByRole('combobox', { name: 'Протокол', exact: true }).selectOption('sip');
  await expect(page.getByLabel('Credential reference', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Credential reference', { exact: true })).toHaveValue('');
  await page.getByRole('combobox', { name: 'Транспорт SIP', exact: true }).selectOption('tls');
  await page.getByLabel('CA reference', { exact: true }).fill('lab_sip_ca');
  await page.getByLabel('SIP TLS server name', { exact: true }).fill('sip.example.org');
  await page.getByLabel('SIP latency threshold, сек.', { exact: true }).fill('0.25');
  await page.getByRole('button', { name: 'Просмотреть и отправить', exact: true }).click();
  const sent = page.waitForRequest(
    (r) => r.method() === 'PUT' && r.url().includes('/api/collectors/demo-edge-01/config'),
  );
  await page
    .getByRole('dialog', { name: 'Обновить весь управляемый набор?', exact: true })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  const t = (await sent).postDataJSON().targets[0];
  expect(t).toMatchObject({
    protocol: 'sip',
    ca_ref: 'lab_sip_ca',
    sip: {
      transport: 'tls',
      port: 5061,
      server_name: 'sip.example.org',
      latency_threshold: '0.25s',
    },
  });
  expect(t).not.toHaveProperty('credential_ref');
  expect(t).not.toHaveProperty('snmp');
});
test('UX: hierarchical breadcrumbs, light chart/topology and local AI evidence links', async ({
  page,
}, info) => {
  await login(page);
  await page.goto('/assets/asset_core?tab=metrics');
  const crumbs = page.getByRole('navigation', { name: 'Путь страницы', exact: true });
  await expect(crumbs.getByRole('link', { name: 'Оборудование', exact: true })).toHaveAttribute(
    'href',
    '/assets',
  );
  await expect(crumbs.getByText('asset_core', { exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.getByRole('button', { name: 'Переключить тему', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('img', { name: 'История загрузки CPU', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('light-metrics.png'), fullPage: true });
  await page.getByRole('link', { name: 'Топология сети', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Сохранить раскладку', exact: true }),
  ).toBeEnabled();
  await page.getByRole('combobox', { name: 'Фокус узла', exact: true }).selectOption({ index: 1 });
  await expect(page.getByRole('heading', { name: 'Узел сети', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Показать соседей', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'координаты не изменены' }),
  ).toBeVisible();
  await page.screenshot({ path: info.outputPath('light-topology.png'), fullPage: true });
  await page.goto('/incidents/case_voice');
  await page.getByRole('button', { name: 'Просмотреть контекст', exact: true }).click();
  await page.getByRole('button', { name: 'Отправить на анализ', exact: true }).click();
  await page.getByRole('button', { name: 'Подтверждаю отправку', exact: true }).click();
  const result = page.locator('.analysis-result');
  const relation = result.getByRole('link', { name: 'Основание связи 1 ↗', exact: true });
  await expect(relation).toHaveAttribute('href', '/incidents/case_voice#correlation-evidence-1', {
    timeout: 15000,
  });
  await expect(
    result.getByRole('link', { name: 'Asset asset_core ↗', exact: true }).first(),
  ).toHaveAttribute('href', '/assets/asset_core');
  await expect(result.getByText('Ссылка не сопоставлена', { exact: true })).toBeVisible();
  await relation.click();
  await expect(page.locator('#correlation-evidence-1')).toBeInViewport();
});
