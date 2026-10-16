import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, user = 'demo') {
  await page.goto('/login');
  await page.getByLabel('Имя пользователя', { exact: true }).fill(user);
  await page.getByLabel('Пароль', { exact: true }).fill('demo');
  await page.getByRole('button', { name: 'Войти в систему', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Обзор инфраструктуры', exact: true }),
  ).toBeVisible();
}
const batch = {
  placements: [
    {
      asset_id: 'asset_server',
      mode: 'rack',
      location_id: 'rack_a01',
      start_unit: 1,
      height_units: 2,
      expected_revision: 0,
    },
    {
      asset_id: 'asset_access',
      mode: 'outside_rack',
      location_id: 'room_01',
      position: 'Полка 2',
      expected_revision: 0,
    },
  ],
};
async function openImport(page: Page, scenario = '') {
  await page.goto(`/locations${scenario}`);
  await page.getByRole('button', { name: 'Импорт размещений', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Партия размещений', exact: true });
  await form.getByLabel('JSON партии', { exact: true }).fill(JSON.stringify(batch));
  await form.getByLabel('Обоснование партии', { exact: true }).fill('SIMULATED team placement');
  return form;
}
test('topology: saved layout survives SPA navigation and table toggle, clears on logout', async ({
  page,
}) => {
  await login(page, 'viewer');
  await page.getByRole('link', { name: 'Топология сети', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Сохранить раскладку', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('combobox', { name: 'Алгоритм раскладки', exact: true })
    .selectOption('grid');
  await page.getByRole('button', { name: 'Применить раскладку', exact: true }).click();
  await page.getByRole('button', { name: 'Сохранить раскладку', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Восстановить раскладку', exact: true }),
  ).toBeEnabled();
  await page.getByRole('tab', { name: 'Таблица связей', exact: true }).click();
  await page.getByRole('tab', { name: 'Граф', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Алгоритм раскладки', exact: true })).toHaveValue(
    'grid',
  );
  await page.getByRole('link', { name: 'Оборудование', exact: true }).click();
  await page.getByRole('link', { name: 'Топология сети', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Восстановить раскладку', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Восстановить раскладку', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'позиции восстановлены' })).toBeVisible();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await login(page);
  await page.getByRole('link', { name: 'Топология сети', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Восстановить раскладку', exact: true }),
  ).toBeDisabled();
});
test('placements: preview reads only, confirmed atomic batch sends explicit revisions and CSRF', async ({
  page,
}, info) => {
  await login(page);
  let writes = 0;
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/api/placements/import' && r.method() === 'POST') writes++;
  });
  const form = await openImport(page);
  await form.getByRole('button', { name: 'Проверить партию размещений', exact: true }).click();
  const review = page.getByRole('dialog', {
    name: 'Сохранить всю партию размещений?',
    exact: true,
  });
  await expect(review.getByRole('cell', { name: 'asset_server', exact: true })).toBeVisible();
  expect(writes).toBe(0);
  await review.screenshot({ path: info.outputPath('placement-batch-review.png') });
  const request = page.waitForRequest(
    (r) => new URL(r.url()).pathname === '/api/placements/import' && r.method() === 'POST',
  );
  await review.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  const sent = await request;
  expect(sent.postDataJSON()).toEqual({ ...batch, reason: 'SIMULATED team placement' });
  expect(sent.headers()['x-csrf-token']).toBe('demo-csrf');
  expect(sent.headers()['idempotency-key']).toBeTruthy();
  await expect(
    form.getByText('Backend сохранил партию. Ниже — фактические размещения из ответа.', {
      exact: true,
    }),
  ).toBeVisible();
  expect(writes).toBe(1);
  await expect(form.getByRole('cell', { name: '1', exact: true })).toHaveCount(2);
});
test('placements: invalid batch sends no writes and server conflict blocks repeat without partial save', async ({
  page,
}) => {
  await login(page);
  let writes = 0;
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/api/placements/import' && r.method() === 'POST') writes++;
  });
  const form = await openImport(page, '?test_scenario=conflict');
  await form
    .getByLabel('JSON партии', { exact: true })
    .fill(JSON.stringify({ placements: [batch.placements[0], batch.placements[0]] }));
  await form.getByRole('button', { name: 'Проверить партию размещений', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('один раз');
  expect(writes).toBe(0);
  await form.getByLabel('JSON партии', { exact: true }).fill(JSON.stringify(batch));
  await form.getByRole('button', { name: 'Проверить партию размещений', exact: true }).click();
  const review = page.getByRole('dialog', {
    name: 'Сохранить всю партию размещений?',
    exact: true,
  });
  await review.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(review.getByRole('alert')).toContainText('Ревизия устарела');
  await expect(review.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  expect(writes).toBe(1);
  const values = await page.evaluate(async () =>
    Promise.all(
      ['asset_server', 'asset_access'].map(async (id) =>
        (await fetch(`/api/assets/${id}/placement`)).json(),
      ),
    ),
  );
  expect(values.map((p) => [p.mode, p.revision])).toEqual([
    ['unplaced', 0],
    ['unplaced', 0],
  ]);
});
test('placements: viewer has no import action and direct request is forbidden', async ({
  page,
}) => {
  await login(page, 'viewer');
  await page.goto('/locations');
  await expect(page.getByRole('heading', { name: 'Размещение', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Импорт размещений', exact: true })).toHaveCount(0);
  const status = await page.evaluate(
    async (body) =>
      (
        await fetch('/api/placements/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'demo-csrf',
            'Idempotency-Key': 'simulated-viewer-import',
          },
          body: JSON.stringify(body),
        })
      ).status,
    { ...batch, reason: 'SIMULATED forbidden' },
  );
  expect(status).toBe(403);
});
