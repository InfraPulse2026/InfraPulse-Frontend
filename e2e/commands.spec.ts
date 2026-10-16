import { expect, test, type Page } from '@playwright/test';
import {
  originCommandID,
  uncertainCommandID,
  consumedCommandID,
} from '../src/mocks/command-fixtures';
async function login(page: Page, username = 'operator') {
  await page.goto('/login');
  await page.getByLabel('Имя пользователя', { exact: true }).fill(username);
  await page.getByLabel('Пароль', { exact: true }).fill('demo');
  await page.getByRole('button', { name: 'Войти в систему', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Обзор инфраструктуры', exact: true }),
  ).toBeVisible();
}
async function review(page: Page) {
  await page
    .getByRole('combobox', { name: 'Ожидаемое состояние перед откатом', exact: true })
    .selectOption('false');
  await page.getByRole('button', { name: 'Проверить откат', exact: true }).click();
  return page.getByRole('dialog', { name: 'Отправить откат агенту?', exact: true });
}
test('commands: filtered journal, unknown snapshot expiry and typed rollback read-back', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto('/automation/commands');
  await page.getByLabel('Agent ID', { exact: true }).fill('demo-edge-01');
  await page.getByLabel('Device ID', { exact: true }).fill('simulated:mikrotik-01');
  const filtered = page.waitForRequest((r) => {
    const u = new URL(r.url());
    return (
      u.pathname === '/api/commands' &&
      u.searchParams.get('agent_id') === 'demo-edge-01' &&
      u.searchParams.get('device_id') === 'simulated:mikrotik-01'
    );
  });
  await page.getByRole('button', { name: 'Применить отбор команд', exact: true }).click();
  await filtered;
  await page.getByRole('tab', { name: 'Ссылки на снимки Agent', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'simulated-agent-snapshot-1', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: originCommandID, exact: true }).click();
  await expect(page.getByText('Срок не передан агентом', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toBeDisabled();
  await page
    .getByRole('combobox', { name: 'Ожидаемое состояние перед откатом', exact: true })
    .selectOption('true');
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toBeDisabled();
  await page
    .getByRole('combobox', { name: 'Ожидаемое состояние перед откатом', exact: true })
    .selectOption('false');
  await page.getByLabel('Таймаут отката, секунд', { exact: true }).fill('61');
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toBeDisabled();
  await page.getByLabel('Таймаут отката, секунд', { exact: true }).fill('30');
  const dialog = await review(page);
  await expect(dialog).toContainText('simulated-agent-snapshot-1');
  await expect(dialog).toContainText('Административно выключен');
  await dialog.screenshot({ path: testInfo.outputPath('rollback-review.png') });
  let rereads = 0;
  page.on('request', (r) => {
    if (r.url().endsWith(`/api/commands/${originCommandID}/snapshot`) && r.method() === 'GET')
      rereads++;
  });
  const created = page.waitForResponse(
    (r) =>
      r.url().endsWith(`/api/commands/${originCommandID}/rollback`) &&
      r.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  const response = await created;
  expect(response.status()).toBe(202);
  expect(response.request().postDataJSON()).toEqual({
    expected_admin_up: false,
    timeout_seconds: 30,
    confirmed: true,
  });
  expect(response.request().headers()['idempotency-key']).toMatch(/^[a-f0-9-]{36}$/);
  expect(response.request().headers()['x-csrf-token']).toBe('demo-csrf');
  expect(rereads).toBeGreaterThan(0);
  const command = (await response.json()) as {
    id: string;
    rollback_of_command_id: string;
    rollback_snapshot_id: string;
  };
  expect(command.rollback_of_command_id).toBe(originCommandID);
  expect(command.rollback_snapshot_id).toBe('simulated-agent-snapshot-1');
  await expect(page.getByText(/Backend принял запрос/)).toBeVisible();
  await page.getByRole('link', { name: command.id, exact: true }).first().click();
  await expect(page.getByText('SIMULATED fake read-back', { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('Команда выполнена', { exact: true }).first()).toBeVisible();
  const reference = await page.evaluate(
    async (id) => (await fetch(`/api/commands/${id}/snapshot`)).json(),
    originCommandID,
  );
  expect(reference.status).toBe('consumed');
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toHaveCount(0);
});

test('commands: uncertain, consumed snapshots and disabled policy block execution', async ({
  page,
}) => {
  await login(page);
  await page.goto(`/automation/commands/${uncertainCommandID}`);
  await expect(page.getByText(/Исход неизвестен\. Не повторяйте действие/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toBeDisabled();
  await page.goto(`/automation/commands/${consumedCommandID}`);
  await expect(
    page.getByText('Ссылка на снимок уже занята, использована или недоступна.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toBeDisabled();
  await page.goto(`/automation/commands/${originCommandID}?test_scenario=commands-disabled`);
  await expect(page.getByText(/Политика backend не разрешает откат/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toBeDisabled();
  await page.goto('/automation/commands/not-a-command');
  await expect(page.getByText(/Неверный ID команды/)).toBeVisible();
});

test('commands: viewer reads results but cannot request rollback', async ({ page }) => {
  await login(page, 'viewer');
  await page.goto(`/automation/commands/${originCommandID}`);
  await expect(page.getByRole('heading', { name: 'Карточка команды', exact: true })).toBeVisible();
  await expect(page.getByText('Срок не передан агентом', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toHaveCount(0);
  const status = await page.evaluate(
    async (id) =>
      (
        await fetch(`/api/commands/${id}/rollback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'demo-csrf',
            'Idempotency-Key': crypto.randomUUID(),
          },
          body: JSON.stringify({ confirmed: true, expected_admin_up: false, timeout_seconds: 30 }),
        })
      ).status,
    originCommandID,
  );
  expect(status).toBe(403);
});

test('commands: changed review prevents POST; server 409 disables old confirmation', async ({
  page,
}) => {
  await login(page);
  await page.goto(`/automation/commands/${originCommandID}?test_scenario=rollback-stale`);
  let posts = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/rollback') && r.method() === 'POST') posts++;
  });
  const changed = await review(page);
  await changed.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(changed).toContainText('Контекст отката изменился');
  await expect(changed.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  expect(posts).toBe(0);
  await page.goto(`/automation/commands/${originCommandID}?test_scenario=conflict`);
  const conflict = await review(page);
  await conflict.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(conflict).toContainText('Ревизия устарела');
  await expect(conflict.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  expect(posts).toBe(1);
});

test('commands: unknown rollback outcome stays uncertain and is never repeated', async ({
  page,
}) => {
  await login(page);
  await page.goto(`/automation/commands/${originCommandID}?test_scenario=rollback-uncertain`);
  let posts = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/rollback') && r.method() === 'POST') posts++;
  });
  const dialog = await review(page);
  const created = page.waitForResponse(
    (r) => r.url().endsWith('/rollback') && r.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  const id = (await (await created).json()).id as string;
  await page.getByRole('link', { name: id, exact: true }).first().click();
  await expect(page.getByText(/Исход неизвестен\. Не повторяйте действие/)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('verification_unknown', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Проверить откат', exact: true })).toHaveCount(0);
  expect(posts).toBe(1);
});

test('automation: private snapshot is explicit and is not reread after hiding or focus', async ({
  page,
}) => {
  await login(page, 'demo');
  let reads = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/api/automation/snapshots/snapshot_demo/content')) reads++;
  });
  await page.goto('/automation/jobs/automation_demo');
  await expect(
    page.getByRole('heading', { name: 'Исполнение Ansible', exact: true }),
  ).toBeVisible();
  expect(reads).toBe(0);
  await page.getByLabel('Открыть конфигурацию с административным аудитом', { exact: true }).check();
  await expect(page.getByText('Содержимое снимка', { exact: true })).toBeVisible();
  expect(reads).toBe(1);
  await page
    .getByLabel('Открыть конфигурацию с административным аудитом', { exact: true })
    .uncheck();
  await page.getByRole('button', { name: 'Обновить данные', exact: true }).click();
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
  });
  await expect(page.getByText('Содержимое снимка', { exact: true })).toHaveCount(0);
  expect(reads).toBe(1);
});
