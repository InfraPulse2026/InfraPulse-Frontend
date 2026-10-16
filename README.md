# InfraPulse Frontend

Самостоятельный frontend на **React 19.3 + TypeScript strict + Vite 8** для InfraPulse Backend v2. Русский интерфейс NetOps, тёмная и светлая темы. Frontend не содержит код backend или Collector и не подключается к оборудованию напрямую.

## 1. Быстро посмотреть интерфейс

Нужны Node.js 24 LTS и pnpm 11.25.0. Распакуйте архив целиком, сохранив папки. Откройте терминал в папке `InfraPulse-Frontend`:

```powershell
pnpm install --frozen-lockfile
pnpm dev:demo
```

Откройте **http://127.0.0.1:5173**. Тестовые аккаунты: `demo / demo` (admin), `operator / demo`, `viewer / demo`.

Это отдельный **демонстрационный режим MSW**, доступный только в development. В нём видна постоянная пометка симуляции. Он не вызывает реальный LLM, не опрашивает Zabbix и не меняет сетевое оборудование. Короткий пароль относится только к фиктивным аккаунтам, backend его не принимает.

Если pnpm ещё не установлен, установите его штатным способом для вашей Node.js среды. На обычной установке Node можно выполнить `npm install --global pnpm@11.25.0`. Один менеджер пакетов: не создавайте параллельные npm/yarn lockfiles.

## 2. Подключить настоящий backend

Backend запускается отдельно по своей инструкции. Его исходники менять не нужно. Создайте frontend `.env`:

```powershell
Copy-Item .env.example .env
```

Содержимое:

```dotenv
BACKEND_URL=http://127.0.0.1:8080
VITE_DEMO_MODE=false
```

В **окружении запуска backend**, а не в frontend, настройте:

```dotenv
AUTH_MODE=required
AUTH_PUBLIC_ORIGIN=http://127.0.0.1:5173
AUTH_COOKIE_SECURE=false
```

Эти значения предназначены только для локального HTTP-стенда. Backend проверяет точный Origin, включая порт. Его прежнее значение `http://127.0.0.1:8080` приведёт к отказу входа из интерфейса на 5173. При смене окружения перезапустите backend; для Compose обычно требуется пересоздание контейнера с новым environment. Не отключайте CSRF/CORS/RBAC ради обхода ошибки.

```powershell
pnpm dev
```

Теперь интерфейс работает с настоящими REST API и HttpOnly session cookie. Используйте настоящего пользователя backend, созданного через его `/app/access init-admin`. Весь browser трафик идёт через same-origin Vite proxy, включая `/api`, `/openapi.json`, `/healthz`, `/readyz`.

**Не путайте `localhost` и `127.0.0.1`: используйте один согласованный origin.** Адрес backend задаётся server-side через `BACKEND_URL`; пароли и ключи нельзя помещать в `VITE_*`.

## 3. Как устроено взаимодействие

```text
Collector / Agent ──gRPC──► Backend ──► PostgreSQL
Zabbix / Prometheus ◄─HTTPS─ Backend
                              ▲
                              │ REST + HttpOnly cookie + CSRF
                              │
Browser ◄── static SPA ── Vite proxy / Nginx
```

Frontend генерирует TypeScript-типы из копии OpenAPI backend, использует openapi-fetch и TanStack Query. Браузер не обращается к PostgreSQL, gRPC, Zabbix, Redfish, IPMI, SSH или LLM самостоятельно. Поведение Collector не изменено. Управляемая конфигурация передаётся через существующий B9 API; местные allowlists и opt-in остаются обязательными.

## 4. Что есть в этой версии

- Вход, восстановление сессии, выход, обработка истечения, cookie/CSRF, фактические permissions от backend.
- Обзор: агрегаты корреляции, загруженная страница Assets, подключения, сессии Collectors; без выдуманного health score.
- Источники: список, детали, очередь test/sync, создание/редактирование основных параметров и безопасная передача credential только backend.
- Collectors: сессия и health, desired/applied, разрешённые Targets, редактор полного snapshot с подтверждением и expected revision.
- Assets: pagination, kind/scope, поиск в загруженной странице, Sources/Identity, resolved inventory, hardware, CPU/RAM, внешние показатели, hardware history, bounded Prometheus range при наличии mappings.
- L2 топология Cytoscape: граф, выбор узлов/связей, evidence, таблица как клавиатурная альтернатива, scope/expired/Asset filter.
- Размещение: локации, родители/дети, read-only rack units.
- Логи: server text/severity search, просмотр sanitized message, source/observed/received time и Audit metadata; группированные Linux Audit events.
- SIP: список, health/freshness, latency history, null gaps, обязательный agent_id в detail links.
- Инциденты: correlated cases отдельно от исходных symptoms, timeline, members, evidence; подтверждённый acknowledge для разрешённой роли.
- Drift: expected/actual VLAN, freshness, revision, предложение, запрос исправления, отдельное одобрение, backend verification status.
- Automation: задания по Asset, worker diagnostics, job events, закрытые snapshots для администратора.
- AI: точный preview перед отправкой, consent/hash/idempotency, polling результата, refs и limitations; AI не получает кнопку исполнения.
- Reports v2: период/scope, distinct episodes, категории, chronic problems, сохранённые snapshots; просмотр schedules.
- Базовое администрирование: список/создание пользователей, роли и просмотр access audit.
- Адаптивная сетка, темы, клавиатурный фокус, пропуски и unknown/stale вместо фиктивных нулей.

Некоторые подробные provenance/debug-объекты отображаются в раскрывающихся структурированных блоках, а не в специальных редакторах. Границы первой версии и оставшаяся работа — в `docs/implementation-status.md`.

## 5. API и совместимость

- Backend: commit `58d1e088f0fa0f744209b909e473a269779c1ea6`.
- OpenAPI: `0.44.0`. Точный SHA-256 — `api/contract.json`.
- Контракт скопирован из `internal/api/openapi.json` без изменений.
- `src/api/generated/schema.d.ts` редактировать нельзя.

```powershell
pnpm api:generate
pnpm api:check
```

При согласованном изменении backend замените `api/openapi.json`, обновите backend commit в генераторе, пересоздайте типы и проверьте diff. Новый будущий Agent main автоматически не объявляется совместимым: владельцы сверяют его protobuf с backend. Из браузера protobuf не вызывается.

Известные несовпадения описаний и runtime, ограничения фильтров, permissions и B9 описаны в `docs/frontend-api-contract.md`. Исходный большой план сохранён в `docs/frontend-plan.md`; это план, а не список закрытой приёмки.

## 6. Проверки

```powershell
pnpm install --frozen-lockfile
pnpm api:check
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Если Chrome уже установлен, можно не скачивать Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
pnpm test:e2e
```

MSW fixtures проверяются AJV по actual OpenAPI schemas. Проверки не подтверждают наличие настоящих Zabbix/Prometheus/LLM/Ansible устройств. Сквозная локальная проверка с реальными backend, PostgreSQL и native Simulator описана отдельно в `docs/verification.md`.

Для повторения real smoke на **своём разрешённом disposable стенде** есть `scripts/live-smoke.mjs`. Он создаёт тестового Viewer, поэтому не запускайте его на рабочей базе. Требуются `FRONTEND_TEST_URL`, `FRONTEND_TEST_USER`, `FRONTEND_TEST_PASSWORD`; передавайте их через временное окружение, не коммитьте. Нужны Native Simulator Assets и административная учётная запись. Пример привязан к тестовому origin/данным, не является автоматической настройкой production.

## 7. Production build и Nginx

```powershell
pnpm build
pnpm preview
```

`dist/` — статические файлы. Node.js не нужен для их обслуживания. `preview` нужен для просмотра сборки; для полного API нужен reverse proxy. Production build не содержит demo dataset/MSW и запрещает `VITE_DEMO_MODE=true`.

```powershell
docker compose up --build -d
```

Локальный контейнер доступен на **http://127.0.0.1:8081**. `BACKEND_ORIGIN` — адрес, доступный из контейнера, по умолчанию `http://host.docker.internal:8080`. Если backend находится в другой Docker-сети/на другой машине, настройте достижимый адрес или общую сеть. Нельзя гарантировать достижимость host loopback из любого Docker runtime.

Для такого стенда backend `AUTH_PUBLIC_ORIGIN` должен быть **http://127.0.0.1:8081**, а не 5173. В production нужен согласованный HTTPS reverse proxy, точный `AUTH_PUBLIC_ORIGIN=https://ваш-домен`, `AUTH_COOKIE_SECURE=true`, сертификаты и HSTS на TLS-границе. Они не выдаются автоматически этим репозиторием.

Nginx: SPA fallback для client routes; `/api` не перенаправляется в index.html; hashed assets cached immutable, HTML no-cache; CSP и security headers включены. Не размещайте пароли в frontend images или JavaScript. Локальная Docker/Nginx-сборка требует отдельной проверки на вашем Docker-стенде.

## 8. Структура и командная работа

`src/app` — shell/providers/router/styles; `src/api` — контракт и HTTP; `src/features` — предметные экраны; `src/components` — общие UI; `src/lib` — точные форматы и permissions; `src/mocks` — development/test only; `e2e` — browser scenarios; `deploy` — Nginx; `docs` — handoff.

ZIP содержит одну папку frontend. В нём нет `node_modules`, local store, `.env`, private keys, state Agent, .git или исходников backend. Готовый `dist` приложен как результат проверенной сборки, но для доработки используйте исходники.

На GitHub frontend нужно публиковать в **отдельный репозиторий**, целыми папками, без потери структуры. Этот архив сам по себе ничего не публикует. Не накладывайте его на репозитории Agent или Backend.

## Что добавлено в v0.2.0

- Источники: явная замена/удаление credential, Zabbix item mappings и параметры событий; Prometheus profile, target filters, identity/inventory labels, auth mode и mappings.
- Пользователи: смена роли, отключение и сброс пароля с отдельным подтверждением и отзывом сессий. Последнего администратора защищает backend.
- Расписания: создание, редактирование и приостановка daily/weekly с текущей revision и UTC-периодами.
- Конфигурации: назначение эталона из существующих снимков, редактор remediation policy и SSH target с локальной ссылкой на credentials worker.
- Отмена задания/исправления: отдельное подтверждение; отмена не означает rollback уже выполненных изменений.
- Размещение: создание/редактирование Site/Building/Room/Rack, размещение/снятие Asset, обработка конфликта занятых юнитов.

Во всех новых редакторах ревизия фиксируется при открытии формы. Фоновое обновление не подставляет новую revision в старые поля. Конфликт требует перечитать запись и проверить изменения заново.

Это промежуточная поставка по исходному плану. Полный список оставшейся работы: `docs/implementation-status.md`. Исходники Agent и Backend в эту поставку не включены и не изменялись.

## Что добавлено в v0.3.0

Карточки симптомов показывают понятные доказательства hardware/log/configuration/topology/Zabbix и измерения SIP, историю состояний, а также сохранённые оценки в раскрываемой истории. Основания корреляции переведены в факты и ссылки на Assets. Технические JSON поля доступны дополнительно.

Нулевые измерения и false сохраняют смысл; явный null не заменяется старым percent-полем. Оценка времени до критического уровня условна; R² не показывается как вероятность сбоя. Ссылки из доказательств ведут только на локальные маршруты, а содержимое экранируется.

## Что добавлено в v0.4.0

В карточке Asset → «Источники и идентичность» появились таблица идентификаторов, кандидаты backend, события разрешения и история ручных решений. Администратор может явно отделить выбранные привязки либо объединить два Assets, указав основной binding и причину. Автоматического сопоставления на стороне браузера нет.

Перед отправкой показываются точные IDs, направление операции и ревизии. Snapshot формы не меняется при фоновом обновлении. После 409 нужно закрыть форму, нажать «Перечитать сведения» и заново проверить решение. Source с размещением, разные scopes/типы, неполный список привязок и неизвестные/небезопасные ревизии блокируются. При split должна остаться хотя бы одна привязка; переносится не более 64. Backend остаётся окончательной проверкой конфликтов.

Merge создаёт исторический alias; split возвращает ID нового Asset из ответа backend. Успех отображается по сохранённому Decision ID. Чтение canonical metadata и аппаратного состояния не выдаётся за физическое объединение или перемещение оборудования.

В назначении baseline добавлен обязательный просмотр выбранного снимка через административный API с аудитом. Запрос выполняется только после клика; закрытые данные не сохраняются в localStorage, а query cache удаляется после закрытия просмотра.

## Что добавлено в v0.5.0

Административный раздел «Сертификаты коллекторов»: сертификаты, одноразовые токены, аудит, фильтр Agent UUID, явные выдача/отзыв с подтверждением. Отзыв сертификата предупреждает о закрытии потока агента. Секрет токена показывается только в форме успешной выдачи; в список и кэш запросов не попадает. При отключённом PKI отображается состояние backend.

«Моя учётная запись» доступна всем ролям: смена своего пароля с проверкой текущего, повтором нового, очисткой полей и завершением сессий. Реальный backend/PostgreSQL подтвердили отзыв двух сессий и повторный вход с новым паролем. Настоящий CA/Collector revoke пока не заявляется проверенным.

Подробная инструкция и границы проверки: [docs/pki-and-account.md](docs/pki-and-account.md). Следующий незавершённый этап — typed rollback UX.

## Что добавлено в v0.6.0

Журнал типизированных команд и метаданные снимков Agent, фильтры Agent/Device/state, карточка result/verification/events и контролируемый rollback с commands.write. Подтверждение фиксирует ресурс и условие; перед POST контекст перечитывается. Неизвестный исход не повторяется, неизвестный срок снимка не считается бессрочным хранением. Это существующий Agent rollback API; откат конфигурационных снимков Ansible не придуман.

Подробно: [docs/rollback.md](docs/rollback.md). По решению команды живой стенд и финальное развёртывание переданы другим разработчикам: [docs/team-handoff.md](docs/team-handoff.md). Локальные тесты и сборка frontend продолжаются в рамках разработки.

## Что добавлено в v0.7.0

Сетевые интерфейсы и Agent-provided rates с точными uint64, доступностью счётчиков, деталями и графиками. External metrics получили страницы, Prometheus — явное обновление временного окна. Аппаратная история показывает контекст источника/health/power/freshness и использует backend cursor.

Поиск логов и Linux Audit расширен до параметров текущего API; есть предметные audit-группы и страницы их записей. UID/PID=0 и success=false сохраняются. Неизвестные значения, неполная история и полнота Audit не превращаются в выдуманные факты.

Подробно: [docs/monitoring.md](docs/monitoring.md). Следующий блок — топология и массовое размещение.

## Что добавлено в v0.8.0

Сохранение layout топологии в памяти сессии, обновления без полной перераскладки, ограниченный canvas и отдельные BMC management relations. Массовое размещение до 50 Assets: JSON, проверка текущих ревизий/стоек, отдельный review и атомарный POST с защитой от повторов. Подробно docs/topology-placement.md. Backend и Agent не изменены.

## Что добавлено в v0.9.0

Расширенные настройки SNMP/SIP/Redfish/IPMI и интервалы до 24 часов, корректный medium polling hardware, очистка несовместимых полей, вложенные breadcrumbs, светлые графики/подписи карты, доступный focus узла/соседей и локальные AI evidence links. Все четыре согласованных блока frontend завершены локально. Начните передачу команде с docs/final-handoff.md. Live acceptance и финальный deployment выполняет другая команда.
