// Run only against an explicitly authorized disposable backend.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const baseURL = process.env.FRONTEND_TEST_URL;
const username = process.env.FRONTEND_TEST_USER;
const password = process.env.FRONTEND_TEST_PASSWORD;
if (!baseURL || !username || !password)
  throw new Error('Provide FRONTEND_TEST_URL/USER/PASSWORD for an isolated test backend');
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const crashes = [];
  page.on('pageerror', (e) => crashes.push(e.message));
  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Имя пользователя', { exact: true }).fill(username);
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Войти в систему' }).click();
  await page.getByRole('heading', { name: 'Обзор инфраструктуры' }).waitFor();
  const me = await (await page.request.get(`${baseURL}/api/auth/me`)).json();
  if (me.user.username !== username || !me.permissions.includes('access.manage'))
    throw new Error('Real session/role not confirmed');
  const cookies = await context.cookies();
  if (!cookies.some((c) => c.name === 'infrapulse_session' && c.httpOnly))
    throw new Error('Backend did not issue HttpOnly cookie');
  const denied = await page.request.post(`${baseURL}/api/access/users`, {
    data: { username: 'must_not_exist', password: 'NotAnActualSecret-123', role: 'viewer' },
  });
  if (denied.status() !== 403) throw new Error('CSRF rejection missing');
  await page.goto(`${baseURL}/security/pki`);
  await page.getByText(/PKI отключён на backend/).waitFor();
  if (
    !(await page
      .getByRole('button', { name: 'Выдать токен подключения', exact: true })
      .isDisabled())
  )
    throw new Error('PKI-disabled boundary permits token creation');
  let assets = [];
  for (let i = 0; i < 40; i++) {
    assets = (await (await page.request.get(`${baseURL}/api/assets`)).json()).items || [];
    if (assets.length) break;
    await page.waitForTimeout(500);
  }
  if (!assets.length) throw new Error('No ingested simulator Assets');
  let identityDecisions = false;
  if (process.env.FRONTEND_TEST_IDENTITY_ASSETS) {
    const [targetID, sourceID] = JSON.parse(process.env.FRONTEND_TEST_IDENTITY_ASSETS);
    const targetSources = await (
      await page.request.get(`${baseURL}/api/assets/${targetID}/sources`)
    ).json();
    const sourceSources = await (
      await page.request.get(`${baseURL}/api/assets/${sourceID}/sources`)
    ).json();
    if (targetSources.items?.length !== 1 || sourceSources.items?.length !== 1)
      throw new Error('Identity fixture must start with one binding per Asset');
    const canonical = targetSources.items[0].id,
      moving = sourceSources.items[0].id;
    await page.goto(`${baseURL}/assets/${targetID}?tab=sources`);
    await page.getByRole('button', { name: 'Объединить Assets', exact: true }).click();
    await page.getByLabel('ID второго Asset', { exact: true }).fill(sourceID);
    await page.getByRole('button', { name: 'Загрузить для сравнения' }).click();
    await page
      .getByRole('combobox', { name: 'Основной binding результирующего Asset', exact: true })
      .selectOption(canonical);
    await page
      .getByLabel('Причина решения', { exact: true })
      .fill('Isolated simulated identity merge acceptance');
    try {
      await page
        .getByRole('button', { name: 'Проверить решение', exact: true })
        .click({ timeout: 10000 });
    } catch {
      const target = await (await page.request.get(`${baseURL}/api/assets/${targetID}`)).json();
      const source = await (await page.request.get(`${baseURL}/api/assets/${sourceID}`)).json();
      const placement = await (
        await page.request.get(`${baseURL}/api/assets/${sourceID}/placement`)
      ).json();
      throw new Error(
        `Identity review gated: ${JSON.stringify({ target, source, placement, form: await page.getByRole('dialog').innerText() })}`,
      );
    }
    const merged = page.waitForResponse(
      (r) => r.url().endsWith('/api/assets/merge') && r.request().method() === 'POST',
    );
    await page
      .getByRole('dialog', { name: 'Подтвердить объединение Assets?' })
      .getByRole('button', { name: 'Подтвердить', exact: true })
      .click();
    if (!(await merged).ok()) throw new Error('Real identity merge rejected');
    await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await page.getByRole('button', { name: 'Отделить источники', exact: true }).click();
    await page.getByRole('checkbox', { name: new RegExp(moving) }).check();
    await page
      .getByRole('combobox', { name: 'Основной binding результирующего Asset', exact: true })
      .selectOption(moving);
    await page
      .getByLabel('Причина решения', { exact: true })
      .fill('Isolated simulated identity split acceptance');
    await page.getByRole('button', { name: 'Проверить решение', exact: true }).click();
    const splitResponse = page.waitForResponse(
      (r) => r.url().endsWith('/api/assets/split') && r.request().method() === 'POST',
    );
    await page
      .getByRole('dialog', { name: 'Подтвердить разделение Asset?' })
      .getByRole('button', { name: 'Подтвердить', exact: true })
      .click();
    const split = await splitResponse;
    if (!split.ok()) throw new Error('Real identity split rejected');
    const decision = await split.json();
    const original = await (await page.request.get(`${baseURL}/api/assets/${targetID}`)).json();
    const separated = await (
      await page.request.get(`${baseURL}/api/assets/${decision.target_id}`)
    ).json();
    const alias = await (await page.request.get(`${baseURL}/api/assets/${sourceID}`)).json();
    const history = await (
      await page.request.get(`${baseURL}/api/assets/${targetID}/decisions`)
    ).json();
    if (
      original.source_count !== 1 ||
      separated.source_count !== 1 ||
      alias.lifecycle_status !== 'merged' ||
      history.items?.length !== 2
    )
      throw new Error('Identity ownership/history not persisted');
    identityDecisions = true;
    assets = (await (await page.request.get(`${baseURL}/api/assets`)).json()).items || [];
  }
  await page.goto(`${baseURL}/assets`);
  await page.getByRole('link', { name: assets[0].canonical_name, exact: false }).first().click();
  await page.getByRole('tab', { name: 'Инвентаризация', exact: true }).click();
  await page.getByRole('heading', { name: 'Сводная инвентаризация' }).waitFor();
  await page.goto(`${baseURL}/topology`);
  await page.getByRole('tab', { name: 'Таблица связей' }).click();
  await page.goto(`${baseURL}/admin/users`);
  await page.getByRole('button', { name: 'Создать пользователя' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Имя пользователя', { exact: true }).fill('frontend_viewer');
  await dialog.getByLabel('Пароль (минимум 12 символов)', { exact: true }).fill(password);
  await dialog.getByRole('button', { name: 'Создать пользователя' }).click();
  await page.getByRole('cell', { name: 'frontend_viewer', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Управлять frontend_viewer', exact: true }).click();
  await page.getByLabel('Новая роль').selectOption('operator');
  await page.getByRole('button', { name: 'Проверить изменение доступа' }).click();
  await page
    .getByRole('dialog', { name: 'Изменить доступ?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await page.getByRole('dialog', { name: 'Управление пользователем' }).waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Управлять frontend_viewer', exact: true }).click();
  await page.getByLabel('Новая роль').selectOption('viewer');
  await page.getByRole('button', { name: 'Проверить изменение доступа' }).click();
  await page
    .getByRole('dialog', { name: 'Изменить доступ?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await page.getByRole('dialog', { name: 'Управление пользователем' }).waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Управлять frontend_viewer', exact: true }).click();
  await page.getByLabel('Новый пароль пользователя').fill(password);
  await page.getByRole('button', { name: 'Проверить сброс пароля' }).click();
  await page
    .getByRole('dialog', { name: 'Сбросить пароль?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await page.getByRole('dialog', { name: 'Управление пользователем' }).waitFor({ state: 'hidden' });
  await page.goto(`${baseURL}/reports`);
  await page.getByRole('heading', { name: 'Отчёты и повторные проблемы' }).waitFor();
  const reportResponse = await page.request.get(`${baseURL}/api/reports/v2/summary`);
  if (reportResponse.status() !== 200) throw new Error('Report API incompatible');
  await page.getByRole('button', { name: 'Добавить расписание' }).click();
  await page.getByLabel('Название расписания').fill('Isolated frontend acceptance');
  await page.getByLabel('Пространство данных').selectOption('simulated');
  await page.getByLabel('Включить расписание').uncheck();
  await page.getByLabel('Причина изменения').fill('Disposable acceptance test only');
  await page.getByRole('button', { name: 'Проверить расписание' }).click();
  await page
    .getByRole('dialog', { name: 'Сохранить расписание?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  await page.getByRole('cell', { name: 'Isolated frontend acceptance', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Изменить расписание', exact: true }).click();
  await page.getByLabel('Период расписания').selectOption('weekly');
  await page.getByLabel('Причина изменения').fill('Review weekly period in isolated test');
  await page.getByRole('button', { name: 'Проверить расписание' }).click();
  const updateResponse = page.waitForResponse(
    (r) => r.url().includes('/api/reports/schedules/') && r.request().method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить расписание?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  if (!(await updateResponse).ok()) throw new Error('Schedule update request rejected');
  await page
    .getByRole('dialog', { name: 'Изменить расписание', exact: true })
    .waitFor({ state: 'hidden' });
  const scheduleData = await (await page.request.get(`${baseURL}/api/reports/schedules`)).json();
  if (
    !scheduleData.items?.some(
      (s) => s.revision === 2 && s.definition.cadence === 'weekly' && !s.definition.enabled,
    )
  )
    throw new Error(`Schedule update not persisted: ${JSON.stringify(scheduleData)}`);
  let parentID = null;
  for (const kind of ['site', 'building', 'room', 'rack']) {
    await page.goto(`${baseURL}/locations`);
    await page.getByRole('button', { name: 'Добавить локацию' }).click();
    await page.getByRole('combobox', { name: 'Тип локации', exact: true }).selectOption(kind);
    await page.getByLabel('Название локации').fill(`Frontend acceptance ${kind}`);
    if (parentID) await page.getByLabel('ID родительской локации', { exact: true }).fill(parentID);
    await page
      .getByLabel('Причина изменения локации')
      .fill('Isolated physical hierarchy acceptance');
    await page.getByRole('button', { name: 'Проверить локацию' }).click();
    const response = page.waitForResponse(
      (r) => r.url().endsWith('/api/locations') && r.request().method() === 'POST',
    );
    await page
      .getByRole('dialog', { name: 'Сохранить локацию?' })
      .getByRole('button', { name: 'Подтвердить', exact: true })
      .click();
    const result = await response;
    if (!result.ok()) throw new Error(`Location ${kind} rejected: ${result.status()}`);
    parentID = (await result.json()).id;
  }
  await page.goto(`${baseURL}/assets/${assets[0].id}?tab=location`);
  await page.getByRole('button', { name: 'Изменить размещение' }).click();
  await page
    .getByRole('combobox', { name: 'Вариант размещения', exact: true })
    .selectOption('rack');
  await page.getByLabel('ID локации', { exact: true }).fill(parentID);
  await page.getByLabel('Причина изменения размещения').fill('Isolated placement acceptance');
  await page.getByRole('button', { name: 'Проверить размещение' }).click();
  const placed = page.waitForResponse(
    (r) => r.url().endsWith('/placement') && r.request().method() === 'PUT',
  );
  await page
    .getByRole('dialog', { name: 'Сохранить размещение?' })
    .getByRole('button', { name: 'Подтвердить', exact: true })
    .click();
  if (!(await placed).ok()) throw new Error('Real placement update rejected');
  const placement = await (
    await page.request.get(`${baseURL}/api/assets/${assets[0].id}/placement`)
  ).json();
  if (
    placement.location_id !== parentID ||
    placement.path.length !== 4 ||
    placement.mode !== 'rack'
  )
    throw new Error('Physical hierarchy/placement not persisted');
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await page.getByRole('heading', { name: 'Добро пожаловать' }).waitFor();
  await page.getByLabel('Имя пользователя', { exact: true }).fill('frontend_viewer');
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Войти в систему' }).click();
  await page.getByRole('heading', { name: 'Обзор инфраструктуры' }).waitFor();
  if (await page.getByRole('navigation').getByRole('link', { name: 'Администрирование' }).count())
    throw new Error('Viewer admin navigation exposed');
  await page.goto(`${baseURL}/sources`);
  await page.getByRole('heading', { name: 'Источники данных', exact: true }).waitFor();
  if (await page.getByRole('button', { name: 'Добавить источник' }).count())
    throw new Error('Viewer mutation exposed');
  const forbidden = await page.request.get(`${baseURL}/api/access/users`);
  if (forbidden.status() !== 403) throw new Error('Backend role enforcement missing');
  const secondSession = await browser.newContext();
  try {
    const secondLogin = await secondSession.request.post(`${baseURL}/api/auth/login`, {
      headers: { Origin: new URL(baseURL).origin },
      data: { username: 'frontend_viewer', password },
    });
    if (!secondLogin.ok()) throw new Error('Cannot create second isolated viewer session');
    await page.goto(`${baseURL}/account`);
    await page.getByLabel('Текущий пароль', { exact: true }).fill(password);
    const newPassword = `${password}-changed`;
    await page.getByLabel('Новый пароль', { exact: true }).fill(newPassword);
    await page.getByLabel('Повторите новый пароль', { exact: true }).fill(newPassword);
    await page.getByRole('button', { name: 'Проверить смену пароля', exact: true }).click();
    const changed = page.waitForResponse(
      (r) => r.url().endsWith('/api/auth/password') && r.request().method() === 'POST',
    );
    await page
      .getByRole('dialog', { name: 'Изменить свой пароль?', exact: true })
      .getByRole('button', { name: 'Подтвердить', exact: true })
      .click();
    if ((await changed).status() !== 204) throw new Error('Own password change rejected');
    await page.getByRole('heading', { name: 'Добро пожаловать', exact: true }).waitFor();
    if ((await secondSession.request.get(`${baseURL}/api/auth/me`)).status() !== 401)
      throw new Error('Other viewer session was not revoked');
    if ((await page.request.get(`${baseURL}/api/auth/me`)).status() !== 401)
      throw new Error('Current viewer session was not revoked');
    await page.getByLabel('Имя пользователя', { exact: true }).fill('frontend_viewer');
    await page.getByLabel('Пароль', { exact: true }).fill(newPassword);
    const newLogin = page.waitForResponse(
      (r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Войти в систему' }).click();
    if (!(await newLogin).ok()) throw new Error('New password was not accepted');
    // An expiry redirect may preserve /account as the intended return route.
    await page.getByRole('heading', { name: /^(Обзор инфраструктуры|Смена пароля)$/ }).waitFor();
    const renewed = await (await page.request.get(`${baseURL}/api/auth/me`)).json();
    if (renewed.user?.username !== 'frontend_viewer')
      throw new Error('Renewed viewer session missing');
  } finally {
    await secondSession.close();
  }
  if (crashes.length) throw new Error(`Frontend crashed: ${crashes.join(';')}`);
  const result = {
    liveBackend: true,
    msw: false,
    httpOnlyCookie: true,
    csrfRejected: true,
    viewerRBAC: true,
    accessEditAndPasswordReset: true,
    scheduleCreateAndRevisionUpdate: true,
    physicalHierarchyAndPlacement: true,
    identityMergeSplitAndHistory: identityDecisions,
    ownPasswordSessionRevocation: true,
    pkiDisabledBoundary: true,
    ingestedAssets: assets.length,
    backendOpenAPI: '0.44.0',
    notes: ['Native simulator data explicitly simulated; no real hardware/LLM/Ansible writes'],
  };
  if (process.env.FRONTEND_TEST_OUTPUT)
    await fs.writeFile(process.env.FRONTEND_TEST_OUTPUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
