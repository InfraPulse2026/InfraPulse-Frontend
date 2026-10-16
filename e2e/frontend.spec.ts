import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, username = 'demo') {
  await page.goto('/login');
  await page.getByLabel('Имя пользователя', { exact: true }).fill(username);
  await page.getByLabel('Пароль', { exact: true }).fill('demo');
  await page.getByRole('button', { name: 'Войти в систему' }).click();
  await expect(page.getByRole('heading', { name: 'Обзор инфраструктуры' })).toBeVisible();
}

test('PKI: one-time token, explicit revocation and server audit', async ({ page }, testInfo) => {
  await login(page);
  await page.goto('/security/pki');
  await expect(page.getByRole('cell', { name: 'simulated-01', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Выдать токен подключения', exact: true }).click();
  await page.getByLabel('UUID для регистрации').fill('not-an-uuid');
  await expect(page.getByRole('button', { name: 'Проверить выпуск токена' })).toBeDisabled();
  const agent = 'bf6e7560-9b04-4d28-ae98-5dfe7d4f2001';
  await page.getByLabel('UUID для регистрации').fill(agent);
  await page.getByLabel('Срок токена, секунд').fill('86401');
  await expect(page.getByRole('button', { name: 'Проверить выпуск токена' })).toBeDisabled();
  await page.getByLabel('Срок токена, секунд').fill('900');
  await page.getByRole('button', { name: 'Проверить выпуск токена' }).click();
  const confirm = page.getByRole('dialog', { name: 'Выдать токен этому агенту?', exact: true });
  await expect(confirm).toContainText(agent);
  const issued = page.waitForRequest(
    (r) => r.url().endsWith('/api/pki/bootstrap-tokens') && r.method() === 'POST',
  );
  await confirm.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  expect((await issued).postDataJSON()).toEqual({ agent_id: agent, ttl_seconds: 900 });
  const secret = page.getByLabel('Одноразовый секрет');
  await expect(secret).toHaveAttribute('type', 'password');
  await expect(secret).toHaveValue('SIMULATED-ONE-TIME-SECRET-NOT-FOR-REAL-ENROLLMENT');
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })),
  ).not.toContain('SIMULATED-ONE-TIME');
  await page.getByRole('button', { name: 'Удалить секрет из формы', exact: true }).click();
  await expect(secret).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Проверить выпуск токена' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await page.getByRole('tab', { name: 'Токены подключения', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'pkit_demo_1', exact: true })).toBeVisible();
  const listed = await page.evaluate(async () => (await fetch('/api/pki/bootstrap-tokens')).json());
  expect(JSON.stringify(listed)).not.toContain('SIMULATED-ONE-TIME');
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: 'pkit_demo_1', exact: true }) });
  await row.getByRole('button', { name: 'Отозвать токен', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Отозвать токен подключения?', exact: true })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await expect(row).toContainText('Отозван');
  await page.getByRole('tab', { name: 'Сертификаты', exact: true }).click();
  await page.getByRole('button', { name: 'Отозвать сертификат', exact: true }).click();
  const revoke = page.getByRole('dialog', { name: 'Отозвать сертификат коллектора?', exact: true });
  await expect(revoke).toContainText('закроет поток агента');
  await expect(revoke).toContainText('a'.repeat(64));
  await revoke.screenshot({ path: testInfo.outputPath('pki-revoke-review.png') });
  const request = page.waitForRequest((r) => r.url().endsWith('/revoke') && r.method() === 'POST');
  await revoke.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  expect((await request).postDataJSON()).toEqual({ confirmed: true });
  await expect(
    page.getByRole('button', { name: 'Отозвать сертификат', exact: true }),
  ).toBeDisabled();
  await page.getByRole('tab', { name: 'Аудит PKI', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'certificate_revoked_simulated', exact: true }),
  ).toBeVisible();
});

test('PKI: viewer is denied without requesting management metadata', async ({ page }) => {
  await login(page, 'viewer');
  let reads = 0;
  page.on('request', (r) => {
    if (r.url().includes('/api/pki/')) reads++;
  });
  await expect(
    page.getByRole('link', { name: 'Сертификаты коллекторов', exact: true }),
  ).toHaveCount(0);
  await page.goto('/security/pki');
  await expect(
    page.getByText(
      'Управление PKI доступно только администратору с access.manage. Права проверяет backend.',
      { exact: true },
    ),
  ).toBeVisible();
  expect(reads).toBe(0);
  expect(await page.evaluate(async () => (await fetch('/api/pki/certificates')).status)).toBe(403);
});

test('PKI: disabled service and conflict do not trigger automatic writes', async ({ page }) => {
  await login(page);
  await page.goto('/security/pki?test_scenario=pki-disabled');
  await expect(page.getByText(/PKI отключён на backend/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Выдать токен подключения', exact: true }),
  ).toBeDisabled();
  await page.goto('/security/pki?test_scenario=conflict');
  await page.getByRole('button', { name: 'Отозвать сертификат', exact: true }).click();
  let posts = 0;
  page.on('request', (r) => {
    if (r.url().includes('/api/pki/') && r.method() === 'POST') posts++;
  });
  const dialog = page.getByRole('dialog', { name: 'Отозвать сертификат коллектора?', exact: true });
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(dialog).toContainText('Ревизия устарела');
  await expect(dialog.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  expect(posts).toBe(1);
});

test('account: viewer changes own password and session ends without exposing secrets', async ({
  page,
}, testInfo) => {
  await login(page, 'viewer');
  await page.getByRole('link', { name: 'Моя учётная запись', exact: true }).click();
  await page.getByLabel('Текущий пароль', { exact: true }).fill('demo');
  await page.getByLabel('Новый пароль', { exact: true }).fill('new-private-password-456');
  await page.getByLabel('Повторите новый пароль', { exact: true }).fill('different');
  await expect(
    page.getByRole('button', { name: 'Проверить смену пароля', exact: true }),
  ).toBeDisabled();
  await page.getByLabel('Повторите новый пароль', { exact: true }).fill('new-private-password-456');
  await page.getByRole('button', { name: 'Проверить смену пароля', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Изменить свой пароль?', exact: true });
  await expect(dialog).not.toContainText('new-private-password-456');
  await dialog.screenshot({ path: testInfo.outputPath('account-password-review.png') });
  const request = page.waitForRequest(
    (r) => r.url().endsWith('/api/auth/password') && r.method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  expect((await request).postDataJSON()).toEqual({
    current_password: 'demo',
    password: 'new-private-password-456',
  });
  await expect(page.getByRole('heading', { name: 'Добро пожаловать', exact: true })).toBeVisible();
  expect(page.url()).not.toContain('new-private-password');
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })),
  ).not.toContain('new-private-password');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Добро пожаловать', exact: true })).toBeVisible();
});

test('account: failed password change clears fields and cannot resubmit old confirmation', async ({
  page,
}) => {
  await login(page, 'viewer');
  await page.goto('/account?test_scenario=outage');
  await page.getByLabel('Текущий пароль', { exact: true }).fill('demo');
  await page.getByLabel('Новый пароль', { exact: true }).fill('private-rejected-password-123');
  await page
    .getByLabel('Повторите новый пароль', { exact: true })
    .fill('private-rejected-password-123');
  await page.getByRole('button', { name: 'Проверить смену пароля', exact: true }).click();
  let writes = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/api/auth/password') && r.method() === 'POST') writes++;
  });
  const dialog = page.getByRole('dialog', { name: 'Изменить свой пароль?', exact: true });
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(dialog).toContainText('Тестовая недоступность backend');
  await expect(dialog.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  expect(writes).toBe(1);
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click();
  for (const label of ['Текущий пароль', 'Новый пароль', 'Повторите новый пароль'])
    await expect(page.getByLabel(label, { exact: true })).toHaveValue('');
});

test('report schedule: reviewed create, revision-preserving edit and pause', async ({ page }) => {
  await login(page);
  await page.goto('/reports');
  await page.getByRole('button', { name: 'Добавить расписание' }).click();
  await page.getByLabel('Название расписания').fill('Еженедельная проверка');
  await page.getByLabel('Период расписания').selectOption('weekly');
  await page.getByLabel('Пространство данных').selectOption('simulated');
  await page.getByLabel('Причина изменения').fill('Проверка демонстрационного контура');
  await page.getByRole('button', { name: 'Проверить расписание' }).click();
  const dialog = page.getByRole('dialog', { name: 'Сохранить расписание?' });
  await expect(dialog.getByText('weekly', { exact: true })).toBeVisible();
  const created = page.waitForRequest(
    (r) => r.url().endsWith('/api/reports/schedules') && r.method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  const body = (await created).postDataJSON();
  expect(body).toMatchObject({
    name: 'Еженедельная проверка',
    cadence: 'weekly',
    scope: 'simulated',
    enabled: true,
    confirmed: true,
  });
  expect(body).not.toHaveProperty('expected_revision');
  await expect(
    page.getByRole('cell', { name: 'Еженедельная проверка', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Изменить расписание', exact: true }).click();
  await page.getByLabel('Включить расписание').uncheck();
  await page.getByLabel('Причина изменения').fill('Приостановка тестового расписания');
  await page.getByRole('button', { name: 'Проверить расписание' }).click();
  const edited = page.waitForRequest(
    (r) => r.url().includes('/api/reports/schedules/') && r.method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить расписание?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await edited).postDataJSON()).toMatchObject({
    expected_revision: 1,
    enabled: false,
    confirmed: true,
  });
  await expect(page.getByRole('cell', { name: 'Приостановлено', exact: true })).toBeVisible();
});

test('admin access editor: last-admin protection, role change and secret reset', async ({
  page,
}) => {
  await login(page);
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Управлять demo', exact: true }).click();
  await page.getByLabel('Отключить пользователя').check();
  await page.getByRole('button', { name: 'Проверить изменение доступа' }).click();
  await page
    .getByRole('dialog', { name: 'Изменить доступ?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await expect(
    page.getByText('Нельзя отключить последнего активного администратора', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('dialog', { name: 'Изменить доступ?' })
    .getByRole('button', { name: 'Отмена', exact: true })
    .click();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await page.getByRole('button', { name: 'Управлять viewer', exact: true }).click();
  await page.getByLabel('Новая роль').selectOption('operator');
  await page.getByRole('button', { name: 'Проверить изменение доступа' }).click();
  await page
    .getByRole('dialog', { name: 'Изменить доступ?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await expect(page.getByRole('dialog', { name: 'Управление пользователем' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Управлять viewer', exact: true }).click();
  await page.getByLabel('Новый пароль пользователя').fill('temporary-test-password-123');
  await page.getByRole('button', { name: 'Проверить сброс пароля' }).click();
  const dialog = page.getByRole('dialog', { name: 'Сбросить пароль?' });
  await expect(dialog).not.toContainText('temporary-test-password-123');
  const request = page.waitForRequest(
    (r) => r.url().endsWith('/password') && r.method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  expect((await request).postDataJSON()).toEqual({ password: 'temporary-test-password-123' });
  await expect(page.getByRole('dialog', { name: 'Управление пользователем' })).toHaveCount(0);
});

test('baseline and policy editors preserve reviewed revisions', async ({ page }, testInfo) => {
  await login(page);
  let privateReads = 0;
  page.on('request', (r) => {
    if (r.url().includes('/api/automation/snapshots/') && r.url().endsWith('/content'))
      privateReads++;
  });
  await page.goto('/configuration/asset_core');
  await page.getByRole('button', { name: 'Назначить эталон', exact: true }).click();
  await page.getByLabel('Эталонный снимок').selectOption('snapshot_demo');
  await page.getByLabel('Причина назначения').fill('Проверенный эталон лаборатории');
  expect(privateReads).toBe(0);
  await expect(
    page.getByRole('button', { name: 'Проверить назначение', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Просмотреть снимок с аудитом', exact: true }).click();
  await expect(page.getByLabel('Содержимое выбранного снимка')).toContainText(
    'switchport access vlan 20',
  );
  expect(privateReads).toBe(1);
  await page
    .getByRole('dialog', { name: 'Назначить эталон конфигурации', exact: true })
    .screenshot({ path: testInfo.outputPath('baseline-preview.png') });
  await page.getByRole('button', { name: 'Проверить назначение' }).click();
  const baseline = page.waitForRequest(
    (r) => r.url().endsWith('/configuration/baseline') && r.method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Назначить этот эталон?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  const request = await baseline;
  expect(request.postDataJSON()).toMatchObject({
    expected_revision: 2,
    asset_revision: 3,
    snapshot_id: 'snapshot_demo',
    confirmed: true,
  });
  expect(request.headers()['idempotency-key']).toBeTruthy();
  await expect(page.getByRole('dialog', { name: 'Назначить эталон конфигурации' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Изменить policy' }).click();
  await page.getByLabel('Разрешённые VLAN').fill('20, 30');
  await page.getByLabel('Защищённые интерфейсы').fill('GigabitEthernet1/0/1');
  await page.getByLabel('Причина изменения').fill('Согласованные ограничения стенда');
  await page.getByRole('button', { name: 'Проверить policy', exact: true }).click();
  const policy = page.waitForRequest(
    (r) => r.url().endsWith('/remediation-policy') && r.method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Изменить ограничения исправления?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await policy).postDataJSON()).toMatchObject({
    expected_revision: 1,
    allowed_vlans: [20, 30],
    protected_interfaces: ['GigabitEthernet1/0/1'],
  });
  await expect(page.getByRole('dialog', { name: 'Ограничения автоматизации' })).toHaveCount(0);
});
test('SSH target setup and pending-remediation cancellation', async ({ page }) => {
  await login(page);
  await page.goto('/automation/jobs?asset_id=asset_core');
  await page.getByRole('button', { name: 'Настроить SSH target', exact: true }).click();
  await page.getByLabel('SSH порт', { exact: true }).fill('2222');
  await page.getByLabel('Причина изменения').fill('Проверка SSH target без запуска задания');
  await page.getByRole('button', { name: 'Проверить SSH target', exact: true }).click();
  const saved = page.waitForRequest(
    (r) => r.url().endsWith('/automation-target') && r.method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить SSH target?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await saved).postDataJSON()).toMatchObject({
    expected_revision: 1,
    asset_revision: 3,
    port: 2222,
    enabled: false,
    credential_ref: 'lab_ssh',
  });
  await expect(page.getByRole('dialog', { name: 'SSH target', exact: true })).toHaveCount(0);
  await page.goto('/configuration/asset_core');
  await page.getByLabel('Причина запроса').fill('Проверка отмены до одобрения');
  await page.getByRole('button', { name: 'Создать запрос на одобрение' }).click();
  await page
    .getByRole('dialog', { name: 'Создать запрос исправления?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await page.getByRole('link', { name: 'rem_demo', exact: true }).click();
  await page.getByLabel('Причина отмены').fill('Отмена тестового запроса оператором');
  await page.getByRole('button', { name: 'Проверить отмену', exact: true }).click();
  const cancelled = page.waitForRequest(
    (r) => r.url().endsWith('/rem_demo/cancel') && r.method() === 'POST',
  );
  await page
    .getByRole('dialog', { name: 'Запросить отмену?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await cancelled).postDataJSON()).toMatchObject({
    expected_revision: 1,
    reason: 'Отмена тестового запроса оператором',
  });
  await expect(page.getByRole('button', { name: 'Проверить отмену', exact: true })).toHaveCount(0);
});

test('source forms: Prometheus mapping and Zabbix item with credential removal', async ({
  page,
}) => {
  await login(page);
  await page.goto('/sources');
  await page.getByRole('button', { name: 'Добавить источник', exact: true }).click();
  const form = page.getByRole('dialog');
  await form.getByRole('combobox', { name: 'Тип', exact: true }).selectOption('PROMETHEUS');
  await form.getByLabel('Название', { exact: true }).fill('Prometheus form acceptance');
  await form.getByLabel('HTTPS endpoint', { exact: true }).fill('https://prometheus.example.test');
  await form.getByLabel('Scrape pools').fill('linux');
  await form.getByRole('button', { name: 'Добавить Prometheus mapping' }).click();
  await form.getByLabel('Выражение PromQL').fill('node_memory_MemAvailable_bytes');
  await form.getByLabel('Нормализованная метрика Prometheus').fill('memory.available');
  await form.getByLabel('Единица Prometheus', { exact: true }).fill('bytes');
  await form.getByRole('button', { name: 'Проверить настройки источника' }).click();
  const created = page.waitForRequest(
    (r) => r.url().endsWith('/api/data-sources') && r.method() === 'POST',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить настройки источника?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await created).postDataJSON()).toMatchObject({
    type: 'PROMETHEUS',
    configuration: {
      prometheus: {
        identity_labels: ['job', 'instance'],
        scrape_pools: ['linux'],
        mappings: [
          {
            id: 'mapping_1',
            metric: 'memory.available',
            unit: 'bytes',
            expression: 'node_memory_MemAvailable_bytes',
          },
        ],
      },
    },
  });
  await expect(
    page.getByRole('link', { name: 'Prometheus form acceptance', exact: false }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Zabbix · Основной контур', exact: false }).click();
  await page.getByRole('button', { name: 'Настроить', exact: true }).click();
  await page.getByLabel('Действие с credential').selectOption('clear');
  await expect(page.getByLabel('HTTPS endpoint', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Добавить Zabbix item' }).click();
  const item = page.getByRole('group').last();
  await item.getByLabel('Host ID', { exact: true }).fill('10101');
  await item.getByLabel('Item ID', { exact: true }).fill('20202');
  await page.getByRole('button', { name: 'Проверить настройки источника' }).click();
  const updated = page.waitForRequest(
    (r) => r.url().includes('/api/data-sources/') && r.method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить настройки источника?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  const body = (await updated).postDataJSON();
  expect(body.credential).toBe('');
  expect(body.configuration.zabbix.monitoring.item_mappings).toContainEqual(
    expect.objectContaining({ host_id: '10101', item_id: '20202', metric: 'cpu.utilization' }),
  );
});

test('locations and placement: revisions, idempotency and occupied-unit conflict', async ({
  page,
}) => {
  await login(page);
  await page.goto('/locations');
  await page.getByRole('button', { name: 'Добавить локацию' }).click();
  await page.getByLabel('Название локации').fill('Тестовая площадка');
  await page.getByLabel('Причина изменения локации').fill('Создание тестовой площадки');
  await page.getByRole('button', { name: 'Проверить локацию' }).click();
  const created = page.waitForRequest(
    (r) => r.url().endsWith('/api/locations') && r.method() === 'POST',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить локацию?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  const request = await created;
  expect(request.headers()['idempotency-key']).toBeTruthy();
  expect(request.postDataJSON()).toMatchObject({
    kind: 'site',
    expected_revision: 0,
    parent_id: null,
  });
  await page.getByRole('link', { name: 'Тестовая площадка', exact: true }).click();
  await page.getByRole('button', { name: 'Изменить локацию', exact: true }).click();
  await page.getByLabel('Название локации').fill('Площадка после проверки');
  await page.getByLabel('Причина изменения локации').fill('Согласованное переименование');
  await page.getByRole('button', { name: 'Проверить локацию' }).click();
  const updated = page.waitForRequest(
    (r) => r.url().includes('/api/locations/') && r.method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить локацию?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await updated).postDataJSON()).toMatchObject({
    expected_revision: 1,
    name: 'Площадка после проверки',
  });
  await expect(
    page.getByRole('heading', { name: 'Площадка после проверки', exact: true }),
  ).toBeVisible();
  await page.goto('/assets/asset_core?tab=location');
  await page.getByRole('button', { name: 'Изменить размещение' }).click();
  await page.getByLabel('Начальный юнит', { exact: true }).fill('5');
  await page.getByLabel('Причина изменения размещения').fill('Проверенное размещение оборудования');
  await page.getByRole('button', { name: 'Проверить размещение' }).click();
  const moved = page.waitForRequest((r) => r.url().endsWith('/placement') && r.method() === 'PUT');
  await page
    .getByRole('dialog', { name: 'Сохранить размещение?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  expect((await moved).postDataJSON()).toMatchObject({
    expected_revision: 1,
    mode: 'rack',
    start_unit: 5,
    height_units: 2,
  });
  await expect(page.getByRole('button', { name: 'Изменить размещение' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Основная навигация', exact: true })
    .getByRole('link', { name: 'Оборудование', exact: true })
    .click();
  await page.getByRole('link', { name: 'office-access-02', exact: false }).first().click();
  await page.getByRole('tab', { name: 'Размещение', exact: true }).click();
  await page.getByRole('button', { name: 'Изменить размещение' }).click();
  await page
    .getByRole('combobox', { name: 'Вариант размещения', exact: true })
    .selectOption('rack');
  await page.getByLabel('ID локации', { exact: true }).fill('rack_a01');
  await page.getByLabel('Начальный юнит', { exact: true }).fill('5');
  await page.getByLabel('Причина изменения размещения').fill('Проверка конфликта занятых юнитов');
  await page.getByRole('button', { name: 'Проверить размещение' }).click();
  const conflict = page.getByRole('dialog', { name: 'Сохранить размещение?' });
  await conflict.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(conflict.getByText('Юниты стойки уже заняты', { exact: true })).toBeVisible();
  await expect(conflict.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
});

test('incident evidence is readable across configuration, hardware, logs, SIP and topology', async ({
  page,
}) => {
  await login(page);
  for (const [id, title] of [
    ['inc_vlan', 'Доказательства изменения конфигурации'],
    ['inc_psu', 'Доказательства аппаратного состояния'],
    ['inc_log', 'Доказательства события журнала'],
    ['inc_topology', 'Доказательства изменения соседства'],
    ['inc_zabbix', 'Внешнее событие Zabbix'],
  ] as const) {
    await page.goto(`/incidents/signals/${id}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'История состояний симптома', exact: true }),
    ).toBeVisible();
  }
  await page.goto('/incidents/signals/inc_sip');
  await expect(page.getByRole('cell', { name: 'down', exact: true })).toHaveCount(1);
  await page.goto('/incidents/case_voice');
  await expect(page.getByText('То же оборудование и близкое время', { exact: true })).toBeVisible();
  await expect(page.getByText('Причинная связь доказана', { exact: true })).toHaveCount(4);
});

test('identity: split selected binding then explicitly merge it back with frozen revisions', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto('/assets/asset_core?tab=sources');
  await page.getByRole('button', { name: 'Отделить источники', exact: true }).click();
  await page.getByRole('checkbox', { name: /binding_asset_core_zabbix/ }).check();
  await page
    .getByRole('combobox', { name: 'Основной binding результирующего Asset', exact: true })
    .selectOption('binding_asset_core_zabbix');
  await page
    .getByLabel('Причина решения', { exact: true })
    .fill('Проверено отдельное происхождение источника');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Подтвердить разделение Asset?' })
    .screenshot({ path: testInfo.outputPath('identity-split-review.png') });
  const splitRequest = page.waitForRequest(
    (r) => r.url().endsWith('/api/assets/split') && r.method() === 'POST',
  );
  await page
    .getByRole('dialog', { name: 'Подтвердить разделение Asset?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  const split = await splitRequest;
  expect(split.headers()['idempotency-key']).toBeTruthy();
  expect(split.postDataJSON()).toMatchObject({
    asset_id: 'asset_core',
    revision: 3,
    binding_ids: ['binding_asset_core_zabbix'],
    canonical_binding_id: 'binding_asset_core_zabbix',
    confirmed: true,
  });
  await expect(page.getByText('Backend сохранил решение.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Отделить источники', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Объединить Assets', exact: true }).click();
  await page.getByLabel('ID второго Asset', { exact: true }).fill('asset_split_0');
  await page.getByRole('button', { name: 'Загрузить для сравнения' }).click();
  await page
    .getByRole('combobox', { name: 'Основной binding результирующего Asset', exact: true })
    .selectOption('binding_asset_core_collector');
  await page
    .getByLabel('Причина решения', { exact: true })
    .fill('Проверено одно физическое устройство');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  const mergeRequest = page.waitForRequest(
    (r) => r.url().endsWith('/api/assets/merge') && r.method() === 'POST',
  );
  await page
    .getByRole('dialog', { name: 'Подтвердить объединение Assets?' })
    .screenshot({ path: testInfo.outputPath('identity-merge-review.png') });
  await page
    .getByRole('dialog', { name: 'Подтвердить объединение Assets?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  const merge = await mergeRequest;
  expect(merge.postDataJSON()).toMatchObject({
    target_id: 'asset_core',
    target_revision: 4,
    source_id: 'asset_split_0',
    source_revision: 1,
    canonical_binding_id: 'binding_asset_core_collector',
    confirmed: true,
  });
  expect(merge.headers()['idempotency-key']).not.toBe(split.headers()['idempotency-key']);
  await expect(page.getByText('Backend сохранил решение.', { exact: false })).toBeVisible();
  const alias = await page.evaluate(
    async () => await (await fetch('/api/assets/asset_split_0')).json(),
  );
  expect(alias).toMatchObject({
    lifecycle_status: 'merged',
    merged_into_id: 'asset_core',
    source_count: 0,
  });
});

test('identity: stale revision is not resubmitted and placed source is blocked', async ({
  page,
}) => {
  await login(page);
  await page.goto('/assets/asset_core?tab=sources&test_scenario=conflict');
  let writes = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/api/assets/split') && r.method() === 'POST') writes++;
  });
  await page.getByRole('button', { name: 'Отделить источники', exact: true }).click();
  await page.getByRole('checkbox', { name: /binding_asset_core_zabbix/ }).check();
  await page
    .getByRole('combobox', { name: 'Основной binding результирующего Asset', exact: true })
    .selectOption('binding_asset_core_zabbix');
  await page.getByLabel('Причина решения', { exact: true }).fill('Проверка конфликтующей ревизии');
  await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Подтвердить разделение Asset?' });
  await confirm.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(confirm.getByText('Ревизия устарела.', { exact: false })).toBeVisible();
  await expect(confirm.getByRole('button', { name: 'Подтвердить', exact: true })).toBeDisabled();
  expect(writes).toBe(1);
  await page.goto('/assets/asset_access?tab=sources');
  await page.getByRole('button', { name: 'Объединить Assets', exact: true }).click();
  await page.getByLabel('ID второго Asset', { exact: true }).fill('asset_core');
  await page.getByRole('button', { name: 'Загрузить для сравнения' }).click();
  await expect(page.getByText('Объединение заблокировано:', { exact: false })).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Основной binding результирующего Asset', exact: true })
    .selectOption('binding_asset_access_collector');
  await page
    .getByLabel('Причина решения', { exact: true })
    .fill('Проверка источника с размещением');
  await expect(page.getByRole('button', { name: 'Проверить решение', exact: true })).toBeDisabled();
});

test('identity decisions are unavailable to viewer', async ({ page }) => {
  await login(page, 'viewer');
  await page.goto('/assets/asset_core?tab=sources');
  await expect(
    page.getByRole('heading', { name: 'Проверка сопоставления', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Объединить Assets', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Отделить источники', exact: true })).toHaveCount(
    0,
  );
});

test('sources → asset → topology → incident; reload and logout', async ({ page }) => {
  const crashes: string[] = [];
  page.on('pageerror', (error) => crashes.push(error.message));
  await login(page);
  await page
    .getByRole('navigation', { name: 'Основная навигация', exact: true })
    .getByRole('link', { name: 'Источники данных' })
    .click();
  await page.getByRole('link', { name: 'Zabbix · Основной контур', exact: false }).click();
  await expect(
    page.getByRole('heading', { name: 'Zabbix · Основной контур', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Основная навигация', exact: true })
    .getByRole('link', { name: 'Оборудование' })
    .click();
  await page.getByRole('link', { name: 'dc-core-01', exact: false }).first().click();
  await page.getByRole('tab', { name: 'Источники и идентичность' }).click();
  await expect(
    page.getByRole('cell', { name: 'Zabbix · Основной контур', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'dc-core-01', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'На карте' }).click();
  await expect(page.getByRole('heading', { name: 'Топология сети', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Таблица связей' }).click();
  await expect(page.getByRole('cell', { name: 'LLDP', exact: true })).toHaveCount(6);
  await page
    .getByRole('navigation', { name: 'Основная навигация', exact: true })
    .getByRole('link', { name: 'Инциденты', exact: true })
    .click();
  await page.getByRole('link', { name: 'Деградация голосового сервиса', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Состав инцидента' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Доказательства корреляции' })).toBeVisible();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Добро пожаловать' })).toBeVisible();
  expect(crashes).toEqual([]);
});
test('viewer cannot manage access, sources, or execute mutations', async ({ page }) => {
  await login(page, 'viewer');
  await expect(
    page
      .getByRole('navigation', { name: 'Основная навигация', exact: true })
      .getByRole('link', { name: 'Администрирование' }),
  ).toHaveCount(0);
  await page.goto('/sources');
  await expect(page.getByRole('heading', { name: 'Источники данных', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Добавить источник' })).toHaveCount(0);
  await page.goto('/collectors/demo-edge-01');
  await expect(
    page.getByText('Просмотр backend-managed конфигурации требует', { exact: false }),
  ).toBeVisible();
  await page.goto('/incidents/case_voice');
  await page.getByRole('button', { name: 'Просмотреть контекст' }).click();
  await expect(page.getByText('Точный запрос к провайдеру (до отправки)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Отправить на анализ' })).toHaveCount(0);
});
test('null SIP data, log search and text escaping', async ({ page }) => {
  await login(page);
  await page.goto('/telephony');
  await expect(page.getByRole('cell', { name: 'Недоступен', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Нет данных', exact: true })).toHaveCount(2);
  await page.getByRole('link', { name: '192.0.2.50' }).click();
  await expect(page.getByRole('heading', { name: 'История задержки' })).toBeVisible();
  await page.goto('/logs');
  await page.getByLabel('Поиск по логам').fill('VLAN');
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page.getByRole('button', { name: /Interface GigabitEthernet/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /SIP OPTIONS timeout/ })).toHaveCount(0);
  await page.getByRole('button', { name: /Interface GigabitEthernet/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Host (claim)')).toBeVisible();
});
test('explicit proposal → approval → backend verified; AI remains separate', async ({ page }) => {
  await login(page);
  await page.goto('/configuration/asset_core');
  await expect(page.getByRole('heading', { name: 'Разрешённое предложение' })).toBeVisible();
  await page.getByLabel('Причина запроса').fill('Восстановить тестовый голосовой VLAN');
  await page.getByRole('button', { name: 'Создать запрос на одобрение' }).click();
  await expect(page.getByRole('dialog')).toContainText('Policy revision');
  await page.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await page.getByRole('link', { name: 'rem_demo' }).click();
  await expect(page.getByText('Ждёт одобрения', { exact: true })).toBeVisible();
  await page.getByLabel('Обоснование одобрения').fill('Проверен порт и разрешённый VLAN');
  await page.getByRole('button', { name: 'Проверить и одобрить действие' }).click();
  await expect(page.getByRole('dialog')).toContainText('GigabitEthernet1/0/24');
  await page.getByRole('button', { name: 'Одобряю это изменение' }).click();
  await expect(page.getByText('Подтверждено', { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.goto('/incidents/case_voice');
  await page.getByRole('button', { name: 'Просмотреть контекст' }).click();
  await page.getByRole('button', { name: 'Отправить на анализ' }).click();
  await expect(page.getByRole('dialog')).toContainText('платный запрос');
  await page.getByRole('button', { name: 'Подтверждаю отправку' }).click();
  await expect(page.getByText('Симулированный ответ. Реальный LLM не вызывался.')).toBeVisible({
    timeout: 15_000,
  });
});
test('key pages render without crashes and fit desktop', async ({ page }) => {
  const crashes: string[] = [];
  page.on('pageerror', (error) => crashes.push(error.message));
  await login(page);
  for (const [path, heading] of [
    ['/overview', 'Обзор инфраструктуры'],
    ['/assets/asset_server?tab=hardware', 'srv-voice-01'],
    ['/assets/asset_core?tab=metrics', 'dc-core-01'],
    ['/locations/rack_a01', 'Стойка A-01'],
    ['/reports', 'Отчёты и повторные проблемы'],
    ['/automation/jobs', 'Автоматизация'],
    ['/admin/users', 'Администрирование'],
  ]) {
    await page.goto(path!);
    await expect(page.getByRole('heading', { name: heading!, exact: true })).toBeVisible();
    await expect(page.getByText('Не удалось отобразить страницу')).toHaveCount(0);
    await page.waitForTimeout(150);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  expect(crashes).toEqual([]);
});
test('expired cookie returns to login and clears protected data', async ({ page, context }) => {
  await login(page);
  await context.clearCookies();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Добро пожаловать' })).toBeVisible();
  await expect(
    page.getByText('Деградация голосового сервиса · ЦОД Москва', { exact: false }),
  ).toHaveCount(0);
});
test('503 differs from empty data; stale revision is not resubmitted', async ({ page }) => {
  await login(page);
  await page.goto('/sources?test_scenario=outage');
  await expect(page.getByRole('alert')).toContainText('Тестовая недоступность backend');
  await expect(page.getByRole('heading', { name: 'Добро пожаловать' })).toHaveCount(0);
  await page.goto('/assets?test_scenario=empty');
  await expect(page.getByText('Здесь пока нет данных')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.goto('/configuration/asset_core?test_scenario=conflict');
  let creates = 0;
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().includes('/configuration/remediations')) creates++;
  });
  await page.getByLabel('Причина запроса').fill('Проверка устаревшей ревизии');
  await page.getByRole('button', { name: 'Создать запрос на одобрение' }).click();
  await page.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('revision_conflict');
  await page.waitForTimeout(500);
  expect(creates).toBe(1);
  await expect(page.getByRole('link', { name: 'rem_demo' })).toHaveCount(0);
});
test('visual QA desktop, light theme, topology and mobile', async ({ page }, testInfo) => {
  await login(page);
  for (const [path, name] of [
    ['/overview', 'overview'],
    ['/assets', 'assets'],
    ['/topology', 'topology'],
    ['/incidents/case_voice', 'incident'],
  ]) {
    await page.goto(path!);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.skeleton')).toHaveCount(0);
    if (name === 'topology')
      await expect(page.locator('.topology-canvas canvas').first()).toBeAttached();
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Переключить тему' }).click();
  await page.goto('/overview');
  await expect(page.locator('.skeleton')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('light.png'), fullPage: true });
  await page.getByRole('button', { name: 'Переключить тему' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('managed targets submit full typed snapshot and wait for applied', async ({ page }) => {
  await login(page);
  await page.goto('/collectors/demo-edge-01');
  await page.getByRole('button', { name: 'Редактировать Targets' }).click();
  await page.getByLabel('Fast interval, сек.', { exact: true }).fill('60');
  await page.getByLabel('Причина изменения', { exact: true }).fill('Тест согласованного интервала');
  await page.getByRole('button', { name: 'Просмотреть и отправить' }).click();
  await expect(page.getByRole('dialog')).toContainText('60s');
  const sent = page.waitForRequest(
    (req) => req.method() === 'PUT' && req.url().includes('/api/collectors/demo-edge-01/config'),
  );
  await page.getByRole('button', { name: 'Подтвердить', exact: true }).click();
  const request = await sent;
  const body = request.postDataJSON();
  expect(body.expected_revision).toBe(2);
  expect(body.targets).toHaveLength(1);
  expect(body.targets[0].polling.fast_interval).toBe('60s');
  expect(body.targets[0].credential_ref).toBe('lab_snmp');
  expect(body.targets[0].password).toBeUndefined();
  await expect(page.getByText('Ожидает применения', { exact: true })).toBeVisible();
  await expect(page.getByText('Применено', { exact: true })).toBeVisible({ timeout: 15_000 });
});
