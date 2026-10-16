# InfraPulse Frontend — полный план разработки

> **Документ:** `docs/frontend-plan.md` (рекомендуемое расположение в репозитории Frontend)  
> **Проект:** InfraPulse — vendor-neutral NetOps Control Plane  
> **Версия плана:** 1.0  
> **Дата:** 15 октября 2026 г.  
> **Статус:** архитектурный и продуктовый план для реализации; **не** Codex-промт и **не** утверждение о готовности всех API  
> **Основной язык продукта:** русский; архитектурно предусмотреть английский  
> **Область:** только веб-интерфейс; Collector и Backend не переписываются

---

## 0. Краткое решение

**Реализуем InfraPulse Frontend как отдельное SPA-приложение на React + TypeScript + Vite, с профессиональным интерфейсом NetOps/NOC, развёртываемое статическими файлами через Nginx.** В production Node.js для обслуживания страниц не нужен. Frontend обращается к Backend через существующий REST API; непосредственно к Collector по gRPC браузер не подключается.

Основная ценность интерфейса — не «ещё одна Grafana», а единая рабочая среда, которая показывает источники данных, глобальные Assets, физическую топологию, здоровье инфраструктуры, инциденты и их доказательства, конфигурационные отклонения, AI-объяснения и безопасные действия по исправлению.

**Выбранный стек:** React 19.3.x, TypeScript, Vite 8.x, React Router, Tailwind CSS 4, shadcn/ui, TanStack Query, TanStack Table, OpenAPI-generated TypeScript types/client, Apache ECharts, Cytoscape.js, React Hook Form + Zod, Vitest, Testing Library, MSW, Playwright. Конкретные patch-версии фиксируются в lockfile после совместимого install/CI.

**Главный контракт:** OpenAPI Backend. На момент интеграционного аудита 15.10.2026 — OpenAPI 3.0.3, `info.version=0.44.0`, миграции Backend `001..045`. **Это проверенная историческая точка, а не гарантия, что API не изменится.** До начала реализации получить фактический актуальный файл OpenAPI из согласованного Backend checkout и сохранить его версию/хеш в документации Frontend.

**Основная продуктовая последовательность:**

`Data Sources → Unified Assets → Topology → Incident → Evidence / AI → Configuration Drift → Human Approval → Ansible Job → Verification → Report`.

Не ждать завершения всех live-испытаний оборудования, чтобы начать интерфейс. Строить экраны на реальном OpenAPI и контрактных fixtures, затем постепенно заменять fixtures реальными запросами.

---

## 1. Основания, ограничения и достоверность

### 1.1. Источники проекта

План составлен по следующим материалам:

1. **`кейс_телеком_будущего ... .docx`** — исходное задание: минимум шесть зарубежных/отечественных вендоров, мониторинг, хронические проблемы, отчёты, SIP, Linux rsyslog/auditd, AI-анализ, inventory, физическое размещение, автоматическая карта сети.
2. **`InfraPulse_Architecture_v2_after_curator_review.md`** — позиционирование InfraPulse как интеграционного NetOps Control Plane, разделение Collector/Backend, Unified Assets, Zabbix, Prometheus, Ansible, Grafana и demo flow.
3. **Backend Stage9F и roadmap B0–B16** — RBAC, инциденты, PKI, отчёты, AI workflow, команды; позднее этапы B11.2–B16 по отчётам команды.
4. **`Collector ↔ Backend: compatibility audit, 2026-10-15`** — проверенное текущее состояние и фактические границы интеграции.

### 1.2. Что подтверждено интеграционным аудитом

- Collector ↔ Backend используют совместимый текущий protobuf/gRPC contract.
- Существуют проверенные process-тесты с реальными Collector, Backend, PostgreSQL, mTLS, ACK/replay, REST и управляемой конфигурацией B9.
- Реальные REST-маршруты включали семейства `/api/agents`, `/api/devices/{id}/inventory`, `/api/devices/{id}/telemetry`, `/api/logs`, `/api/assets/{id}/resolved-inventory`, `/api/topology/global`, Asset hardware/history, SIP target/history, B9 desired/status. **Точное полное описание параметров, ответа и существования остальных маршрутов брать только из OpenAPI.**
- В Backend имеется реализация B0–B14, основа B15 и security/recovery B16; наличие реализации не означает реальную приёмку всех внешних продуктов, LLM и оборудования.
- Последний предоставленный Backend не имел `.git` metadata; существует snapshot и проверенный кандидат исправлений. Для Frontend нужен согласованный и сохранённый API artifact от команды.

### 1.3. Известные нерешённые интеграционные вопросы

| Код | Проблема | Последствие для UI | Как проектировать UI |
|---|---|---|---|
| DATA-01 | SIP latest/history/VoIP projection не показывала часть SourceRef/ObservationTime | Могут отсутствовать метаданные источника/времени | `observation` и производные поля считаются **optional**, UI показывает «не указано»; не подставлять выдуманные значения |
| DATA-02 | Возможна неправильная auto-resolution identity и ошибочное слияние Assets | Некорректное объединение физических устройств | Использовать `asset_id` только из Backend; не вычислять/сливать устройства в браузере; отображать SourceBindings и confidence |
| DATA-03 | Backend отклонял валидные большие группы hardware metrics из-за меньшего лимита | Некоторые большие аппаратные наборы не отображаются | Поддерживать partial/unknown/freshness и ошибки приёма, не генерировать нули |

Три исправления проверены в отдельной `integration-audit/backend-candidate`, но по предоставленному отчёту **ещё не внедрены в исходный Backend**. Владельцем исправлений остаётся Backend-команда. UI не должен жёстко зависеть от их наличия.

### 1.4. Что не считаем подтверждённым

- Реальный Zabbix, Prometheus, Ansible Runner на Linux, Grafana, LLM provider и оборудование на production-like стендах пока не имеют полной приёмки по интеграционному отчёту.
- Отдельные процессные проверки IPMI, Linux Audit и Redfish выполнялись/дополнялись в ходе аудита; итоговый полный список PASS нужно уточнить по последней версии отчёта.
- Возможность realtime push через SSE/WebSocket **не заявлена**: пока используем HTTP polling, если соответствующих endpoints нет.
- Конкретные новые REST routes и поля **не придумывать**. В этом плане URL страниц приложения — проектируемые клиентские маршруты, **не** утверждения о существующих API Backend.

---

## 2. Где писать Frontend и как устроить репозитории

### 2.1. Рекомендуемая организация

```text
InfraPulse/
├── InfraPulseAgent/          # Go Collector; отдельный Git
├── InfraPulse-Backend/       # Go Backend; отдельный Git
├── InfraPulse-Frontend/      # React + Vite; отдельный Git
└── integration-audit/        # временные отчёты/fixtures; не часть UI
```

Frontend разрабатывается **в собственной папке и собственном репозитории**. Не размещать React-приложение внутри `internal/` Backend или Collector. Никаких прямых правок чужих исходников ради UI.

IDE: **WebStorm** или VS Code. GitHub — отдельный репозиторий или согласованный организацией проект. Использовать feature branches и Pull Requests. Для интеграционных API-изменений необходим синхронизированный OpenAPI snapshot.

### 2.2. Рабочая среда

- Node.js **24.x LTS** на момент составления плана (26.x ещё Current до перехода в LTS); зафиксировать версию через `.nvmrc`/`.node-version`.
- **pnpm** как единый менеджер пакетов; один `pnpm-lock.yaml` в Git и `packageManager` в `package.json`.
- TypeScript strict, ESLint, Prettier; одинаковые настройки в команде.
- Vite — dev server/HMR и production build в `/dist`.
- Разработка с HTTPS при необходимости cookie/SameSite; предпочтительно использовать Vite dev proxy `/api` → тестовый Backend, чтобы сохранить same-origin для браузера.
- Тестовая среда Backend/PostgreSQL должна быть отдельной от production.

### 2.3. Runtime и deployment

```text
Браузер
   |
   v
Nginx: InfraPulse Frontend SPA (static dist)
   | /api/*
   v
InfraPulse Backend REST API
   |
   +--> PostgreSQL / Connector services / Collector sessions
```

В production предпочтителен **один origin**: Nginx отдаёт HTML/CSS/JS, проксирует `/api/` к Backend. Не добавлять BFF/Node server без подтверждённой потребности. Браузер не должен соединяться напрямую с PostgreSQL, Collector gRPC, IPMI, Redfish, Zabbix API или Ansible Runner.

Nginx должен поддерживать SPA fallback на `index.html`, HTTPS, cache-control для hashed assets и no-cache для HTML; backend `/api` проксируется без SPA fallback. Конкретную конфигурацию согласовать с Backend deployment и session/CSRF.

---

## 3. Технологический стек — окончательный выбор

| Слой | Рекомендация | Причина / границы |
|---|---|---|
| UI runtime | **React 19.3.x** | Компонентная архитектура SPA; зафиксировать установленный патч |
| Язык | **TypeScript (strict)** | Проверка контракта, безопасные рефакторинги |
| Сборка | **Vite 8.x** | Быстрая разработка и статическая сборка |
| Маршруты | **React Router, SPA/Data Mode** | Nested layouts, защита routes, URL-параметры; без обязательного SSR |
| UI styling | **Tailwind CSS 4** | Токены, темизация, адаптивная сетка |
| UI primitives | **shadcn/ui + Radix** | Доступные контролы; исходники UI-компонентов принадлежат проекту |
| Иконки | **lucide-react** | Единый визуальный язык |
| Серверное состояние | **TanStack Query 5** | Кэш, revalidation, polling, invalidation, async states |
| Таблицы | **TanStack Table** | Сортировка, фильтры, server pagination, виртуализация при необходимости |
| Контракт/API | **openapi-typescript + openapi-fetch** | Типы и typed REST client из фактического OpenAPI; небольшой abstraction layer |
| Формы | **React Hook Form + Zod** | Валидация UI перед запросом; Backend всё равно проверяет сам |
| Диаграммы | **Apache ECharts** | Таймсерии, threshold, heatmap, timeline, легенды и большие наборы |
| Топология | **Cytoscape.js** | Граф сети, directed edges, zoom/pan, layouts, highlight paths |
| Локальное UI state | React state/context; при росте — Zustand | Не дублировать TanStack Query и серверную БД в клиенте |
| Даты | date-fns либо dayjs, **одна** библиотека | Время событий/получения, интервалы, часовые пояса |
| Тесты | **Vitest + React Testing Library** | Unit/component tests |
| Mock API | **MSW** | Те же типизированные сценарии для dev/tests |
| E2E браузера | **Playwright** | Реальный пользовательский сценарий, в т. ч. auth и approval |
| Код/стиль | ESLint, Prettier, TypeScript strict | Консистентность и CI |

Не добавлять в первый релиз Next.js, Redux Toolkit, GraphQL, собственный UI framework, второй chart library, второй topology renderer или новый Backend-for-Frontend. Допускается пересмотр после фактических требований/нагрузки.

### 3.1. Стратегия зависимостей

Использовать последние **совместимые стабильные патчи внутри выбранных major/minor-линий**, закрепить версии lockfile, протестировать `pnpm install --frozen-lockfile`. Не применять автоматическое массовое обновление всех пакетов перед защитой. Указываемые здесь React 19.3.x, Vite 8.x, Tailwind 4, TanStack Query 5 — **целевые линии**, не требование к конкретному патчу через годы.

### 3.2. Схема интеграции данных

```text
OpenAPI Backend
     |
     v
Generated TypeScript types
     |
     v
Typed API client (openapi-fetch)
     |
     v
Feature service/query functions
     |
     v
TanStack Query cache
     |
     v
React view models/components
```

Generated код нельзя редактировать вручную. Все адаптации (fallback legacy data, presentation mapping, units, derived labels) располагаются **вне generated**.

---

## 4. Продуктовое позиционирование и UX-принципы

**Аудитория:** NOC-инженеры, сетевые инженеры, системные администраторы, руководители эксплуатации, аудиторы/наблюдатели.

**Ключевые пользовательские задачи:** понять, что происходит; на каком Asset; какие сервисы затронуты; откуда факт; почему сигналы коррелированы; что менялось; что можно безопасно сделать; подтвердилось ли восстановление.

Принципы:

1. **Asset-first:** устройство — единая глобальная сущность, его состояние складывается из нескольких источников.
2. **Evidence-first:** у каждого статуса, предупреждения, корреляции и AI-вывода есть доступное объяснение/источник.
3. **Сначала проблема, потом глубина:** быстрый overview с переходом к карточке, графику, логу, topology, diff.
4. **Без ложных состояний:** `unknown`, `stale`, `partial`, `simulated`, `unverified` не превращаются в «OK» или «DOWN».
5. **Безопасность действий:** чтение и изменение чётко разделены; destructive remediation нельзя выполнить случайным нажатием.
6. **Отдельные статусы доставки и результата:** job submitted ≠ executed ≠ verified; config status ≠ telemetry ACK.
7. **Не требовать собственный Collector на каждом сервере:** Zabbix/Prometheus/Ansible — полноправные источники.
8. **Слабые сети/большие объёмы:** пагинация, кэш, графики по диапазонам, ограниченное polling, удобные ошибки.
9. **Русский UI, понятные эксплуатационные термины;** английский translation infrastructure без полного перевода на первом этапе.
10. **Демонстрация не должна скрывать симуляцию:** любые fixtures/demo events обозначаются явно.

---

## 5. Дизайн-система и визуальный стиль

### 5.1. Общий образ

Стиль: **современная B2B-инженерная консоль/NOC**, строгий и технический, без перегруженных neon-анимаций. Дизайн должен выглядеть как полноценный инфраструктурный продукт, а не шаблонный landing page.

- Основная **тёмная тема** для NOC и длительной работы; полноценная светлая тема — после P0 либо параллельно, если компоненты используют токены.
- Нейтральная тёмная основа, аккуратные сине-циановые/бирюзовые акценты InfraPulse.
- Семантические цвета только для состояний (`healthy`, `warning`, `critical`, `stale`, `unknown`); цвет всегда дублируется иконкой/текстом.
- Стабильные отступы, иерархия типографики, единые таблицы и фильтры.
- Моноширинный шрифт для MAC/IP/UUID/серийников, JSON, logs, команды и diff; читаемый sans-serif для UI.
- Не придумывать global health score «97%» без формулы/данных Backend. Если score не существует, показывать доступные объективные показатели.

### 5.2. Каркас приложения

```text
┌──────────────────────────────────────────────────────────────────┐
│ InfraPulse    Search assets/incidents...     [Time] [Theme] [Me] │
├──────────────────┬───────────────────────────────────────────────┤
│ Обзор            │ Breadcrumbs / Page title / Actions            │
│ Источники        │                                               │
│ Collector'ы      │ Feature workspace                             │
│ Оборудование     │                                               │
│ Топология        │                                               │
│ Инциденты        │                                               │
│ Логи             │                                               │
│ Телефония        │                                               │
│ Конфигурации     │                                               │
│ Автоматизация    │                                               │
│ Отчёты           │                                               │
│ Администрирование│                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

Sidebar — сворачиваемый. Header — поиск, состояние Backend/API, выбранный период, уведомления (только если реальное API), профиль. Контекстные фильтры рядом с каждой страницей. Детали можно открывать в боковом drawer, но глубокая карточка имеет собственный URL.

### 5.3. UI-компоненты для разработки

`AppShell`, `Sidebar`, `Topbar`, `PageHeader`, `StatusBadge`, `SourceBadge`, `VendorBadge`, `DataFreshness`, `Timestamp`, `TimeRangePicker`, `AssetLink`, `EvidenceLink`, `MetricChart`, `MetricSparkline`, `DataTable`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ConfirmDialog`, `PermissionGuard`, `DiffViewer`, `EventTimeline`, `JSONViewer`, `TopologyCanvas`, `RackView`, `AuditTrail`, `AsyncJobStatus`, `CopyIdentifier`.

Каждый status component должен принимать не только green/red, но и `unknown`, `stale`, `partial`, `maintenance`, `simulated` там, где это поддерживает источник.

### 5.4. Экранные разрешения

- Основной desktop: 1440–1920 px.
- Рабочая поддержка: 1280 px и более.
- На планшетах: sidebar collapsible, таблицы scrollable/column picker.
- На смартфоне: основные статусы, поиск, просмотр карточки/инцидента, но не обещать удобное редактирование большого topology graph.
- Не использовать только hover для критичных действий; клавиатура, контраст и фокус обязательны.

---

## 6. Навигация и информационная архитектура

Ниже **предлагаемые маршруты Frontend**. Это *не* Backend endpoints.

| Страница | Пример client route | Приоритет |
|---|---|---|
| Login | `/login` | P0 |
| Overview / Dashboard | `/overview` | P0 |
| Data Sources | `/sources` | P0 |
| Source details | `/sources/:sourceId` | P1 |
| Collectors | `/collectors` | P0 |
| Collector details / managed targets | `/collectors/:collectorId` | P0/P1 |
| Assets | `/assets` | P0 |
| Asset details | `/assets/:assetId` | P0 |
| Network topology | `/topology` | P0 |
| Physical locations | `/locations` | P1 |
| Site/room/rack | `/locations/:locationId` | P1 |
| Incidents | `/incidents` | P0 |
| Incident details | `/incidents/:incidentId` | P0 |
| Logs / Audit | `/logs` | P0 |
| Telephony | `/telephony` | P0 |
| Configuration drift | `/configuration/drift` | P0/P1 |
| Configuration target/proposal | `/configuration/:assetId` | P1 |
| Automation jobs | `/automation/jobs` | P1 |
| AI analyses | `/analysis` | P1 |
| Reports / Chronic issues | `/reports` | P1 |
| Admin/users/audit | `/admin/...` | P1 |
| Not found / Forbidden / Service unavailable | `*`, `/403`, `/503` | P0 |

Nested routes и breadcrumbs; при смене detail tabs URL сохраняет активную вкладку, фильтры, период и выбранный объект — через search params. Не хранить все пользовательские фильтры только в памяти React.

---

## 7. Полный перечень экранов и требований

### 7.1. Авторизация, сессия, профиль, RBAC

**Назначение:** защищённый доступ к операционным данным и действиям.

Функции:

- Страница входа; корректные ошибки без раскрытия наличия пользователя.
- Восстановление действующей сессии после reload через предусмотренный Backend endpoint.
- Logout, завершение сессии, обработка 401/403, expiration и CSRF.
- Роли `viewer`, `operator`, `admin` и фактические permission/capability checks из Backend.
- Read-only действия для viewer; destructive buttons только при реальном permission; Backend повторно проверяет все права.
- Профиль: username/role, logout; смена пароля/другие параметры — **только если OpenAPI подтверждает**.
- Состояния: login pending, invalid credentials, session expired, forbidden, Backend unavailable.

Безопасность: по возможности использовать Backend HttpOnly cookie, `credentials: 'include'`, SameSite, CSRF header/token по документированному API. **Не сохранять Bearer-токены или пароли в localStorage.** Не переносить auth в клиентские mock roles.

**Acceptance:** viewer не видит активных управляющих кнопок; оператор с правами может пройти утверждённый approval flow; при 401 защищённые экраны недоступны.

### 7.2. Overview / NOC Dashboard (P0)

Композиция:

- Суммарное количество Assets и Collectors.
- Доступность источников: connected/degraded/unknown.
- Открытые инциденты по severity, acknowledged, resolved (за период).
- Hardware warnings, SIP degradation, drift и критичные изменения топологии, если есть соответствующие API.
- Хронические проблемы, наиболее затронутые площадки/Assets.
- Лента последних значимых событий; links в исходные записи.
- Графики изменения количества инцидентов и состояния инфраструктуры, только по реальным агрегатам.

Виджеты должны разделять **«сигнал», «инцидент», «событие», «недоступность источника»**. Не складывать всё в одну цифру ошибок.

Минимальный MVP: 4–6 реальных cards, топ-5 активных incidents, состояние sources и 1–2 графика. Не блокировать готовность красивого Dashboard отсутствующими сложными агрегатами.

### 7.3. Data Sources (P0)

Центральный экран концепции InfraPulse v2. Показывает, что продукт подключается к существующим системам предприятия.

Карточки/таблица:

- Zabbix connections (несколько инстансов);
- Prometheus connections;
- Collector instances;
- Ansible / Automation Worker;
- Grafana — если Backend предоставляет интеграционную ссылку/объект.

Поля: имя, тип, состояние, last successful sync, last error, target/host count (если API даёт), источник credentials (только безопасный reference), режим sync, location/description при наличии.

Действия — только если API подтверждает: test connection, manual sync, add/edit/disable/remove. Перед удалением — подтверждение и пояснение влияния, но не удаление исторических наблюдений произвольно.

Экран detail: connection information, последние sync jobs, ошибки, импортированные Assets, diagnostic status. Секреты не раскрывать.

MVP: список sources + статус + детали ошибок + запуск доступных read-only sync.

### 7.4. Collectors и Backend-managed Configuration (P0/P1)

Список Collector: online/offline/stale, identity, version, session, last heartbeat, target counts, queue/health (если доступно), latest config revision.

Карточка:

- Overview/health;
- список Targets;
- protocol и enabled;
- polling interval;
- desired revision и actual applied revision;
- statuses `RECEIVED`, `VALIDATING`, `APPLIED`, `REJECTED`, `FAILED` — по реальному контракту;
- ошибки policy/application;
- lost connection / offline LKG diagnostics;
- certificates/PKI status только при наличии соответствующих REST scopes и RBAC.

Управление Targets: формы SNMP, RouterOS, SIP, Redfish, IPMI и validation по доступному API. Frontend отправляет **только разрешённые typed options и credential_ref**, никогда plaintext secret. При submit не показывать «сохранено» как «применено»: отдельно показать `desired` и `applied` и реальное состояние.

**MVP:** просмотр Collector и применённых ревизий. **P1:** редактирование Targets и workflow подтверждённого применения.

### 7.5. Unified Assets — список (P0)

Таблица с server-side filtering, sorting, pagination и URL query state:

- canonical name, type, vendor, model;
- site/room (если привязаны);
- availability/health/freshness;
- source count и chips Zabbix/Collector/Prometheus/Ansible;
- active incidents;
- observed time;
- serial/firmware — при разрешении роли и наличии данных.

Фильтры: text, type, vendor, source, site, status, active incident. Для больших списков — серверная пагинация и virtualization при необходимости.

Не делать UI merge Assets автоматически по hostname/IP/MAC. Различать `Asset`, `device observation`, `source binding`, `BMC` и `hardware component`.

### 7.6. Unified Asset — полная карточка (P0)

Hero: canonical name, Asset ID, vendor/model, role/location, online/stale/unknown, число источников, incidents.

Вкладки:

1. **Overview:** основные факты, health и последние наблюдения.
2. **Sources & Identity:** SourceBindings, confidence/evidence, serials/UUID/MAC, конфликты, timestamp/provenance; merge/split только по существующим Backend permissions и API.
3. **Inventory:** hardware/software version, интерфейсы, CPU/RAM, модель/serial/hardware revision, facts и их источники.
4. **Metrics:** CPU/RAM/Network/time series и диапазоны.
5. **Hardware:** системы/шасси/BMC/sensors/fans/PSU/power/health.
6. **Topology:** прямые/неразрешённые соседи и переход к общей карте.
7. **Incidents/Logs:** связанные события и evidence.
8. **Configuration:** snapshots, expected/actual/diff/drift, remediation при разрешении.
9. **Location:** site/building/room/rack/unit.

Реализация progressive: вкладка рендерится даже при отсутствии данных, показывая честное empty/unsupported, а не падает и не выдумывает значения.

### 7.7. Network Topology (P0)

**Основной графический компонент проекта**, использовать Cytoscape.js + ограниченные layouts (например, concentric/grid/breadthfirst для малого графа, подключаемый layout при необходимости).

Требования:

- Глобальный graph узлов Backend Assets и unresolved neighbors.
- Directional LLDP/CDP/MNDP observations.
- Различать **наблюдаемое L2-соседство**, подтверждённое/неподтверждённое сопоставление и другие отношения (BMC manages System — не сетевой кабель).
- Показывать Asset/vendor/health badges и источник связи, local interface, remote port, subtype, first/last seen, TTL/freshness, confidence.
- Zoom, pan, fit, search, focus neighbor, click edge, filters by site/protocol/type/status.
- Возможность перейти в карточку Asset и детали конкретной связи.
- Легенда: active, stale, unresolved, simulated, one-sided/bidirectional (только если Backend действительно вычисляет такое состояние).
- Сохранение позиции узлов локально в UI при навигации допустимо; **глобальную физическую истину** из layout координат не выводить.
- На большой сети: фильтрация/ограничение числа узлов, поиск и подгрузка по области; не рендерить бесконечный полный graph.

**MVP:** стабильный graph на fixtures/реальном `/api/topology/global`, click node, details, filters, легенда.

### 7.8. Physical Location / DCIM (P1)

Иерархия:

`Site → Building → Room → Rack → Rack Units → Asset placement`.

Отдельные экраны: дерево локаций, список помещений, стойки, визуализация фронтального вида rack (CSS/SVG), объект и его высота/позиция. Не использовать карту Google/OSM, если в кейсе требуется именно rack/DCIM, а координаты не заданы.

При наличии CRUD API: добавить/edit/move placement с RBAC, валидацией юнитов и пересечений. Если Backend поддерживает только read-only — не рисовать работающий на вид edit button.

**MVP по кейсу:** хотя бы просмотр Site/Room/Rack/Unit и переход к Asset. Это обязательный бизнес-смысл, но подробный drag-and-drop rack editor — P2.

### 7.9. Metrics & Hardware Health (P0)

Сеть и серверные metrics:

- CPU, RAM, interfaces, throughput (в правильных бит/с или байт/с), packet errors/loss;
- температурные датчики, fan RPM, напряжение, мощность, PSU status;
- latency SIP и availability;
- source и временные metadata рядом с показанием.

ECharts: time range, legend, multiple lines, unit formatter, min/max, null gaps, zoom/brush (если экономно), hover с timestamp/source, auto refresh по условию. **Counter != rate**, правильная конверсия — строго по контракту Backend или явно протестированной единице.

Отдельно различать `Health`, `HealthRollup`, `State`, `PowerState`, `Availability`, `DataFreshness`; не переводить `PowerState=Off` автоматически в `Critical`. Нет датчика ≠ 0°C.

Метрики backend/Prometheus могут идти из разных storage backends. UI не должен зависеть от того, где физически лежит time-series.

### 7.10. Logs / Linux Audit (P0)

Полнотекстовый поиск, фильтры и paginated table.

Поля: severity, facility, time (source/observed/received при наличии), Asset/Source, process/program, hostname claim, authenticated peer metadata, message, correlation/incident link, audit group ID.

UX:

- временной диапазон;
- severity/facility/source/Asset filters;
- поиск по тексту;
- открытие log detail в drawer с raw/parsed раздельно и безопасным escaping;
- audit event grouping (несколько auditd records одного события);
- copy/export только если Backend API позволяет и роль имеет права;
- marked `simulated`/`claimed hostname` когда применимо.

Маскировать чувствительные данные согласно серверной политике; UI не должен раскрывать секреты из raw log только потому, что backend query их вернул.

### 7.11. Telephony / SIP (P0)

Список SIP endpoints: target, transport, status `up/degraded/down/stale/unknown`, response code, latency, last check, associated Asset/service.

Детальная страница: history chart, state transitions, source attribution, related incidents, лог изменения latency/response. Optional `observation` metadata после DATA-01 выводить только при наличии. Не смешивать server time и source time.

**MVP:** endpoints table + recent history + status/latency.

### 7.12. Incidents & Correlation (P0)

Список: incident ID, title, severity, status (`open`, `acknowledged`, `resolved` и реальные дополнительные statuses), first/last seen, affected Assets/site/services, source counts, assignee если API поддерживает.

Карточка:

- summary;
- все affected Assets;
- event/alert/incident timeline;
- evidence groups по Zabbix / Prometheus / Collector / Syslog / SIP / Redfish / IPMI / Drift;
- topology impact и связанный subgraph;
- correlation rationale/links/confidence;
- history/status transitions;
- AI analysis block;
- recommended actions/remediation link (если API поддерживает).

Акцент: **один Incident может содержать несколько источников**, а восстановление одного source не закрывает Incident автоматически. Не вычислять общий status в браузере по цветам сигналов.

Actions acknowledge/resolve только по существующему API, permission, подтверждению и optimistic updates без ложной окончательной фиксации.

### 7.13. Configuration / Drift / Diff (P0/P1)

Список drift: Asset, interface/config scope, expected reference, actual snapshot, изменившийся параметр, last detected, status, linked incident/service.

Карточка diff:

- expected vs actual — side-by-side и unified view;
- highlighted changed lines/typed field values;
- provenance и snapshot timestamps;
- previous drift history;
- source of truth expected config (Git/Ansible/другая поддерживаемая ссылка);
- различать технический текстовый diff и **подтверждённое семантическое изменение**.

Использовать безопасный diff viewer (текст, не исполняемый HTML). Не показывать чувствительные части конфигураций без прав.

**MVP:** read-only drift list/detail и визуальный diff. Исполнение в следующем модуле.

### 7.14. Controlled Remediation / Ansible (P1; критичный safe flow)

Фронтенд **не отправляет произвольные shell commands или playbooks**. Действует только по конкретному предложению Backend B11.2.

Workflow:

1. Открыть Drift/Incident и нажать «Посмотреть возможное действие».
2. Получить immutable remediation proposal из API.
3. Показать **Asset, port/interface, actual, expected, VLAN, template, policy/risk и источник эталона**, срок подтверждения.
4. Явно подтвердить конкретное действие через documented approval endpoint, включая CSRF/permissions.
5. Показать, что `APPROVED/QUEUED/RUNNING` **ещё не означают** успех.
6. Отображать исполнение, ссылки на Ansible job/evidence, preflight; использовать polling состояния задания.
7. После завершения показать `VERIFYING → SUCCEEDED` только когда Backend подтвердил повторное чтение actual config и сравнение.
8. `UNKNOWN`, `FAILED`, `VERIFICATION_FAILED`, `STALE`, `REJECTED`, `EXPIRED` показывать отдельно, с безопасными пояснениями.

Если drift изменился между preview и approval, UI должен отображать конфликт и требовать обновить предложение; **не** повторять выполнение молча. Не выдавать permission исходя только из наличия кнопки.

Backend may support RouterOS typed commands/rollback отдельно: для них нужны собственные разрешённые flow, не смешивать с Ansible drift remediation.

### 7.15. AI Incident Analysis (P1)

Основная карточка AI **внутри Incident**, отдельная история задач — факультативно.

UX:

- показать набор отправляемых фактов (`IncidentContext Preview`), очищенный/обезличенный Backend;
- явное подтверждение отправки, если workflow требует;
- pending/running/completed/failed состояния задачи;
- результат: summary, probable cause, confidence/uncertainty, evidence refs, recommendations, risks;
- каждый evidence ref ведёт на **реальный** лог/metric/snapshot/incident event или отображает unavailable;
- предупреждение: AI recommendation не является доказанным root cause и не разрешает выполнение.

Не вставлять LLM HTML в `dangerouslySetInnerHTML`; Markdown/structured text — с sanitization. Не отправлять пароли, raw конфигурации, sensitive logs напрямую из браузера к внешнему LLM API.

При mock/test provider указывать, что анализ simulated/test.

### 7.16. Chronic Problems & Reports (P1)

Chronic view: повторные flaps, растущие error rates, SIP failures, hardware warnings, recurring drift, частые инциденты; период и affected Assets/Sites.

Отчёты: daily/weekly, выбранный период/площадка, snapshot, состояние формирования, generated at, краткие показатели/таблицы, links на доказательства, скачивание только поддерживаемого формата.

Scheduled reports: создать/изменить расписание **только если OpenAPI предоставляет соответствующие операции**. Иначе read-only список и сохранённые отчёты.

Не вычислять MTTR/MTBF в браузере из случайных sample rows; это агрегаты Backend с определёнными знаменателями и временны́ми границами.

### 7.17. Users / Roles / Audit / Settings (P1)

Администрирование:

- users/roles/session management согласно OpenAPI;
- permission matrix на UI-уровне;
- audit trail для config, merge/split, remediation, account changes;
- data source settings, preferences;
- backend/system status и diagnostics при наличии API.

Viewer/Operator/Admin — интерфейс отражает реальные серверные права. UI guard — удобство, не средство безопасности. Запрет на Backend обязателен.

### 7.18. Grafana links / external dashboards (P2)

Если Backend содержит Grafana datasource/dashboard refs — открывать по явно выданной безопасной ссылке, желательно в отдельной вкладке. Inline iframe только при согласованной auth/CSP/frame policy. Не делать Grafana обязательной для основного dashboard.

---

## 8. Сквозные пользовательские сценарии

### S1. «Увидеть сбой и найти причину» — основной P0

`Overview → Active Incident → Affected Asset → Evidence → Topology → Historical metric / Log → Probable cause`.

**Успех:** оператор может объяснить минимум один реальный либо явно тестовый incident, не переключаясь между сырой БД и внешними системами.

### S2. «Компания уже использует Zabbix и Prometheus» — основной P0

`Sources → Zabbix/Prometheus → Imported Host/Target → Same Unified Asset → SourceBindings`.

**Успех:** UI демонстрирует несколько sources у одного Asset и не создаёт дубликаты сам.

### S3. «Физическая карта сети» — основной P0

`Topology → Switch Node → Interface/Edge → Neighbor / Unresolved → Asset Details`.

**Успех:** ясно, откуда взялось соседство, не утверждается физический кабель при недостатке evidence.

### S4. «Безопасное восстановление VLAN» — P1, главный demo wow-flow

`Drift → Expected/Actual Diff → Immutable Proposal → Approval → Ansible Job → Verification → Incident/Report`.

**Успех:** видно, что AI не исполняет действия; результат подтверждается reread и Backend status. Ошибка/stale proposal не приводит к скрытой повторной команде.

### S5. «Поиск в Linux logs/audit» — P0

`Logs → Asset/time filters → Syslog entry / Audit group → Related Incident`.

**Успех:** records searchable, source identity видна, нет выдуманной авторизации claimed HOSTNAME.

### S6. «Оператор отслеживает телефонный сервис» — P0

`Telephony → Degraded SIP Endpoint → Latency/response history → Associated Asset / Incident`.

**Успех:** можно подтвердить ухудшение по реальным samples; optional observation корректно отображается.

### S7. «Отчёт по хроническим проблемам» — P1

`Reports → Weekly → Site → Chronic Issues → Affected Asset → Evidence`.

**Успех:** числа объяснимы и соответствуют данным Backend.

---

## 9. Данные, API, статусы и договорённости с Backend

### 9.1. Источник истины

Единственный authoritative источник структуры API — **актуальный OpenAPI**. Сначала получить файл и сгенерировать TS types. Отчёт аудита показывает наличие семейств API, но не раскрывает полный JSON contract и операции.

Согласовать с Backend:

- путь к OpenAPI YAML/JSON;
- точный info.version и commit/snapshot hash;
- test Backend base URL;
- способ login/logout/session/CSRF;
- error response format;
- pagination/sorting/filtering conventions;
- временные форматы и units;
- RBAC/capabilities;
- управление identity merge/split;
- status enum sets;
- экспорт отчётов;
- long-running job statuses;
- актуальность fixes DATA-01–03.

Нельзя добавлять неподтверждённые Backend endpoints через вручную написанный mock client и затем считать UI интегрированным.

### 9.2. API client

- Один типизированный wrapper с `baseUrl` (same-origin `/api`), `credentials`, CSRF и обработкой ошибок.
- Query/mutation functions только по OpenAPI; единые query key conventions.
- HTTP errors: 400 validation, 401 session, 403 permission, 404 missing, 409 conflict/stale, 422 business rejection, 429 throttling, 5xx outage — **по фактическому контракту**.
- Запросы отменяются при смене route/filter/unmount через `AbortSignal`.
- Серверные списки используют pagination и filtering Backend; не скачивать весь inventory/logs локально для фильтрации.
- После mutation инвалидировать затронутые queries, не подменять irreversible outcomes optimistic UI.
- Не дублировать API responses в Zustand.

### 9.3. Polling / real-time

Пока нет подтверждённого browser SSE/WebSocket, **HTTP polling с TanStack Query**:

| Данные | Начальная UI-политика (не гарантия API) |
|---|---|
| Collector/session/source status | 10–15 с на видимой странице |
| Active incidents | 10–15 с |
| Topology overview | 30–60 с или manual refresh |
| Asset details/health | 15–30 с |
| Telemetry chart | 10–30 с для активного диапазона, без переполучения всей истории |
| Logs search | ручной refresh/опционально 10–15 с в live mode |
| Job/remediation/config status | 2–5 с пока активен job, затем остановить |
| Inventory/locations | 1–5 мин либо refresh после изменения |

Эти интервалы **рекомендации для UI**, а не договорённость об обязательных Backend SLA. При превышении лимитов/429/5xx делать backoff. При скрытой вкладке polling ослаблять или останавливать. Не путать 3-секундный SNMP polling Collector с необходимой частотой перерисовки браузера.

### 9.4. Времена и свежесть

Отличать:

- `source_timestamp` — может отсутствовать;
- `observed_at` — когда наблюдение получено на источнике/Collector;
- `collected_at` — окончание сбора, если доступно;
- `received_at` — когда Backend принял;
- `last_seen` / freshness — вычисляются/передаются Backend.

UI поддерживает local timezone и UTC, относительные «5 мин назад» с tooltip на абсолютный timestamp. Никогда не создавать source timestamp из received time. При `unsynced`/`unknown` clock quality показывать предупреждение, если API предоставляет сведения.

### 9.5. DataQuality как общая UI-модель

```text
loading
empty
healthy
warning
critical
offline
stale
unknown
partial
simulated
unsupported
error
```

Это **presentation statuses**, не новые Backend enum. В adapters отображаем реальные значения сервера, не сводя всё к boolean `online`.

### 9.6. Server-side identity

- `asset_id` — canonical backend-owned opaque ID.
- `device_id`, `collector_id`, `source_binding_id`, `resource_id` — отдельные идентификаторы.
- Не угадывать Entity Resolution по IP/name/MAC.
- UI для SourceBindings/conflicts показывает подтверждённость и evidence.
- Применение исправления DATA-02 — приоритет Backend, не клиентский workaround.

### 9.7. Partial / optional данные

API models рассматриваются через `null`/optional/unknown. Для отсутствующего датчика «Нет данных», а не `0`. Для пустых логов — «Записей нет», для ошибки сети — «Не удалось загрузить». Legacy SIP metadata не обязательна. Ограничение hardware metrics пока не закрыто в исходном Backend — UI не должен считать отсутствие sensors подтверждённым OK.

---

## 10. Структура кода Frontend

Рекомендуемая feature-first структура:

```text
InfraPulse-Frontend/
├── docs/
│   ├── frontend-plan.md
│   ├── frontend-api-contract.md
│   ├── frontend-design-system.md
│   ├── frontend-test-plan.md
│   └── frontend-demo-script.md
├── public/
│   ├── favicon.svg
│   └── ...
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   ├── layouts/
│   │   └── styles/
│   ├── api/
│   │   ├── generated/         # автоматически созданные OpenAPI types
│   │   ├── client/            # fetch/auth/errors
│   │   ├── query-keys/
│   │   └── adapters/          # contract → view models
│   ├── features/
│   │   ├── auth/
│   │   ├── overview/
│   │   ├── sources/
│   │   ├── collectors/
│   │   ├── assets/
│   │   ├── topology/
│   │   ├── locations/
│   │   ├── metrics/
│   │   ├── hardware/
│   │   ├── logs/
│   │   ├── telephony/
│   │   ├── incidents/
│   │   ├── configuration/
│   │   ├── automation/
│   │   ├── ai/
│   │   ├── reports/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/                # shadcn/ui source components
│   │   └── shared/            # app-level reusable components
│   ├── hooks/
│   ├── lib/
│   │   ├── dates/
│   │   ├── units/
│   │   ├── status/
│   │   └── permissions/
│   ├── mocks/                 # MSW fixtures; dev/test only
│   ├── test/
│   ├── main.tsx
│   └── vite-env.d.ts
├── e2e/
├── .env.example
├── .node-version
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
└── README.md
```

Каждая feature владеет страницами, компонентами, query hooks, сервисами, формами и тестами; общие API/types живут в `api` и `shared`. Не допускать «папки components на 300 файлов» без предметных границ.

**Не писать бизнес-логику в render JSX**: нормализация статусов/единиц в pure helpers, fetch в API layer, mutations в feature services. Не хранить весь граф/логи в глобальном state manager без необходимости.

---

## 11. Mock / fixtures без имитации готовности Backend

Разработка Frontend стартует параллельно с проверкой интеграции, поэтому нужен **контрактный MSW mock layer**. Он решает только задачу разработки UI и автоматизированных тестов.

Примеры fixture scenarios:

- healthy infrastructure;
- one Collector offline;
- Zabbix problem + SNMP error + SIP failure → one Incident;
- two SourceBindings per Asset;
- conflicting identity / unresolved neighbor;
- Redfish partial hardware inventory;
- IPMI temperature 42°C и fan 1200 RPM (явно simulated fixture);
- syslog search and audit group;
- configuration drift VLAN 30 вместо expected 20;
- remediation proposal approved → running → verifying → succeeded;
- expired/stale proposal and unknown job outcome;
- AI analysis pending/complete with evidence refs;
- 401/403/409/429/500;
- empty data and stale/partial states.

Fixtures должны соответствовать schemas OpenAPI. Если важного endpoint ещё нет — поставить **feature/API blocker**, а не молча создавать альтернативный API в UI. Development demo-data визуально маркировать; не подмешивать в production dashboard без явного демонстрационного режима.

---

## 12. RBAC, CSRF и безопасность Frontend

### 12.1. Обязательное

- Backend — единственный исполнитель authorization; Frontend лишь скрывает/блокирует недоступные controls.
- Сессионные cookies: предпочтительно HttpOnly/Secure/SameSite; CSRF согласно действующему Backend API.
- Не хранить пароли, API tokens, Ansible credentials, Collector private keys в localStorage или frontend source.
- Не помещать секреты в Vite env: `VITE_*` видны в браузере.
- Не показывать raw sensitive configs/logs без прав; не выводить их в telemetry/error logger.
- Защита от XSS: React escaping, sanitization Markdown AI, safe handling logs, link URL allowlists.
- RBAC на action, asset scope и approval; защита от случайных двойных кликов и повторных запросов.
- CSP, `X-Content-Type-Options`, HSTS, безопасная политика iframe — на уровне Nginx/deployment.
- Автоматически очищать sensitive form fields по закрытию диалога, не кешировать secrets в Query.
- При авторизационной ошибке не оставлять на экране чувствительные кешированные данные предыдущего пользователя.

### 12.2. Опасные действия

Разделить:

1. `READ_ONLY` — просмотр.
2. `MUTATION_SAFE` — заметка/acknowledge/управление разрешёнными источниками.
3. `CONTROL_ACTION` — изменение Targets/команд.
4. `REMEDIATION` — изменение конфигурации сетевого устройства.

Для 3–4: явный контекст, permission, confirmed intent, states и audit reference. Никаких универсальных «execute command» форм. AI output никогда не является утверждённым действием.

---

## 13. Производительность и работа с большими данными

- Route-level code splitting/lazy imports; особенно ECharts, Cytoscape и diff viewer.
- HTTP cache, request cancellation, bounded polling, request deduplication через TanStack Query.
- Pagination/virtual scroll для Assets, Logs, audit/events; API filtering — на сервере.
- ECharts downsampling/range queries по Backend; UI не хранит бессрочно сырые samples.
- Topology graph: ограничивать nodes/edges, переключать site/cluster subgraph, не выполнять дорогой layout на каждую telemetry tick.
- Статические ассеты — hashed и долгий cache; HTML — no-cache.
- Performance-budget targets для стартовой разработки (уточнить по стенду): приемлемая интерактивность Dashboard на desktop, отсутствие freezes при средних demo-fixtures, не более одной одновременной полной topology layout recalculation на обновление topology.
- Нагрузочные лимиты UI не должны превращаться в скрытое усечение данных без объяснения.
- Не закладывать отдельный WebSocket server ради «real-time», пока backend API его не предусматривает.

---

## 14. Наблюдаемость и UX сбоев

Глобальные состояния приложения:

- Backend unavailable/503;
- session expired;
- insufficient permission;
- source partially degraded;
- stale observations;
- request timed out;
- invalid config rejected;
- job outcome unknown;
- REST schema mismatch;
- simulation marker.

Показывать toast для пользовательских mutation outcomes, inline error panel для загрузки данных, retry при безопасном GET, не делать автоматический retry для опасных POST без подтверждённой idempotency семантики.

В development включать подробные diagnostics; в production не логировать credentials, HTTP response bodies с чувствительными data, raw logs/config. Crash/telemetry service не обязателен для MVP; можно добавить безопасную агрегированную frontend error reporting позже.

---

## 15. Международность, доступность, управление временем

- UI copy — русский, готовая словарная структура `ru`/`en`, английский перевод P2 при ограничении времени.
- Времена ISO8601/UTC в API, форматирование на клиенте по timezone пользователя с возможностью UTC.
- Единые числовые форматы: bytes/bits, duration ms/s, percent, RPM, Celsius, V/A/W.
- WCAG-подобные базовые требования: keyboard navigation, focus-visible, accessible form labels, aria-live для асинхронных job statuses, контраст, не полагаться только на цвет.
- A11y для topology: альтернативный табличный список связей, search и keyboard доступность; интерактивный граф не может быть единственным способом увидеть соседей.
- Dark/light темы — сохранять локальное предпочтение только как безопасную UI-настройку.

---

## 16. Поэтапный roadmap Frontend (F0–F12)

**Правило:** каждый этап выдаёт работающий, интегрируемый результат, а не набор пустых экранов. Формулировки ниже — **план**, не промт для Codex.

### F0 — API freeze для старта и инфраструктура разработки (P0)

**Зависимость:** доступ к Backend OpenAPI и test server.

Результат:

- Создан `InfraPulse-Frontend` Git repository.
- Согласована ветка/версия/хеш OpenAPI; записаны известные API gaps.
- Установлены Node LTS, pnpm, React/Vite/TS, инструменты lint/format.
- Configured Vite proxy, `.env.example`, scripts `dev/build/typecheck/lint/test`.
- Typed OpenAPI generator + client и проверка воспроизводимости типов.
- Настроены MSW, Vitest, Playwright scaffold и CI build.

**Приёмка:** `pnpm install --frozen-lockfile`, typecheck, build, базовый fetch test и статический build работают.

### F1 — Design System / Shell / Routing (P0)

Результат:

- InfraPulse brand tokens и base dark theme, общие состояния UI.
- Header/sidebar, navigation, breadcrumbs, responsive layout, 404/403/503.
- shadcn primitives, charts container, DataTable foundation, date/time utils.
- Shared permission/status/source/evidence components.

**Приёмка:** переходы между пустыми route skeletons без ошибок, единый визуальный стиль, keyboard navigation.

### F2 — Auth и API integration foundation (P0)

Результат:

- Login/session/logout по реальным API; cookie/CSRF, role guard.
- TanStack Query conventions, API errors, loading/error/empty.
- MSW contract fixtures для ключевых data types.

**Приёмка:** login → protected route → refresh → logout; 401/403/expired проходят E2E.

### F3 — Data Sources + Collectors (P0)

Результат:

- Data Sources overview/status/diagnostics.
- Collectors list/details, heartbeat, health, target list.
- Connected/stale/offline семантика.
- B9 desired/applied revision read-only UI.

**Приёмка:** можно увидеть существующие подключения и отличить Collector online от актуальности данных Targets.

### F4 — Unified Assets + Inventory + Hardware (P0)

Результат:

- Assets list/filter/pagination.
- Asset detail Overview, Sources, Inventory, Identity, Hardware.
- Источники фактов, BMC/System/Chassis distinction, partial/simulated states.
- API adapters для metadata и optional fields.

**Приёмка:** у одного Asset видны разные источники, hardware health, реальные IDs; опасного client merge нет.

### F5 — Topology + Physical Location (P0 core / P1 editing)

Результат:

- Global L2 topology graph через Cytoscape.
- Click node/edge, filters, unresolved neighbors, history/TTL/source labels.
- Asset ↔ Topology deep links.
- Read-only location hierarchy и Rack Unit view по доступному API.

**Приёмка:** graph соответствует Backend edges; направленные и неизвестные связи отображаются корректно; Site/Room/Rack привязаны к Asset.

### F6 — Metrics + Logs + SIP (P0)

Результат:

- ECharts metrics and hardware history.
- Syslog full-text search, filters, audit group UI.
- SIP endpoints list/history.
- Time range/polling/data-freshness logic.

**Приёмка:** реальные или контрактные fixture values видны с корректными единицами, временем и provenance.

### F7 — Incident Center + Correlation Evidence (P0)

Результат:

- Incident list/details/timeline.
- Sources grouped, EvidenceRefs, affected Assets and topology context.
- Status history, authorized acknowledge/action where exists.

**Приёмка:** multi-source incident понятен без перехода в сырые REST payloads; все evidence links работают или честно помечены unavailable.

### F8 — Configuration Drift + Ansible Remediation (P1)

Результат:

- Drift list, config diff/snapshots/history.
- Immutable remediation preview, approval, async status, post-execution verification.
- Automation job history и role/policy gating.
- Отдельные опасные действия защищены от двойного вызова.

**Приёмка:** контролируемый mock E2E `DRIFT→PROPOSE→APPROVE→RUNNING→VERIFYING→SUCCEEDED`, плюс stale/unknown/failure cases; никаких прямых shell commands.

### F9 — AI Analysis + Reports / Chronic Problems (P1)

Результат:

- AI IncidentContext preview/confirmation, result with evidence refs.
- Daily/weekly report screens, chronic problems, saved snapshots, scheduled reports при реальном API.
- Demo dataset linked across these screens.

**Приёмка:** AI recommendation не запускает действия; показатели reports являются Backend facts, а не клиентской генерацией.

### F10 — Administrative Screens + Managed Target Write UI (P1)

Результат:

- Пользователи/роли/аудит в соответствии с OpenAPI.
- Read/write управление Collector Targets по действующему B9 contract.
- DataSource CRUD если API подтверждён.
- Form validation и безопасная обратная связь.

**Приёмка:** revision `desired≠applied` корректно показана; запреты Backend обработаны и не подменены успехом.

### F11 — E2E, Visual QA, Error/Security Regression (P0)

Результат:

- Playwright regression основных flows.
- Контрактная генерация types из actual Backend.
- Проверка ролей, CSRF, null/partial/stale/unsupported, 404/409/5xx.
- Visual snapshots Desktop, accessibility базовых controls, performance smoke.
- Полный cross-feature demo scenario.

**Приёмка:** нет критичных ошибок навигации, смешения Assets, ложных success после mutations, падений от optional fields.

### F12 — Release, Deploy, Demo & Handoff (P0)

Результат:

- Production `dist`, Nginx SPA/static + `/api` proxy, HTTPS/cookie semantics.
- Развёртывание на отдельном домене/поддомене по решению команды (в документе адрес не фиксируется).
- README, эксплуатационные инструкции, demo checklist, API assumptions/limitations.
- Presentation mode только с явной маркировкой simulated fixtures.

**Приёмка:** открытие любого client route после refresh, рабочая авторизация, реальные REST запросы, нет dev секретов/запросов на `localhost` в production assets.

---

## 17. Приоритеты при дефиците времени

### P0 — обязательно завершить для работающей демонстрации

1. F0–F2: инфраструктура, дизайн-система, auth, типизированный API.
2. Data Sources/Collectors — показать интеграционный характер продукта.
3. Assets/Inventory/Hardware и доказательство нескольких источников.
4. Global Topology, хотя бы read-only graph.
5. Incidents + evidence timeline.
6. Logs search + SIP health.
7. Configuration Drift read-only и базовый diff.
8. Сквозная browser→REST→Backend демонстрация.
9. Регрессия и deployment.

### P1 — наиболее сильные расширения для защиты

1. **B11.2 remediation UI:** безопасный approval и verification.
2. AI-analysis с реальными evidence refs.
3. Chronic Problems + Reports.
4. Managed configuration update UI.
5. Physical Location/Rack view (read-only желательно как часть требования кейса; расширенное редактирование P1).
6. User/admin screens и расширенные source details.

### P2 — откладывать без ущерба ядру

- Очень сложный rack drag-and-drop.
- Полноценная локализация EN.
- Advanced Grafana embeds.
- Customizable Dashboard widgets.
- Power-user visual graph editor.
- Animated maps и сложная трёхмерная DCIM-визуализация.
- Собственный real-time WebSocket layer без серверного контракта.
- Mobile-first write operations.

**Компромисс по физическому расположению:** минимальный read-only Site/Room/Rack/Unit нужен для демонстрации исходного требования; подробная система редактирования может подождать.

---

## 18. Параллельная командная работа

Чтобы разработка не шла строго F0→F12 одним человеком:

| Поток | Начало после | Область | Основной риск |
|---|---|---|---|
| A — Foundation | F0 | shell/auth/API/design tokens | совместимый OpenAPI |
| B — Inventory | F1/F2 | Assets/Collectors/Data Sources/Hardware | DATA-02, optional hardware |
| C — Monitoring | F1/F2 | Topology/Metrics/Logs/SIP | большие данные, stale/time |
| D — Operations | F1/F2 | Incidents/Drift/Automation/AI/Reports | permission/status contracts |
| E — QA/Integration | F2 | fixtures, Playwright, REST smoke, deploy | отсутствие реального тестового Backend |

Один человек/модуль владеет своими страницами и state. Общие изменения UI kit, API client и routes — через PR review. Не дублировать одни и те же типы `Asset`, `Incident` и `Collector` в четырёх feature-папках.

### 18.1. Передача контракта Backend-командой

Минимальный handoff:

- согласованный OpenAPI и его hash/version;
- один тестовый Backend и credentials/roles для теста;
- список реально работающих UI-relevant endpoints;
- seed/fixture datasets для Sources, Assets, Topology, Incidents, Logs, SIP, Drift, Jobs;
- статус DATA-01–03;
- RBAC/CSRF/auth contract;
- статус реальной AI/Ansible/external integrations;
- описание semantics `stale`, `unknown`, `simulated` и `Asset confidence`;
- контакт владельца Backend API и процедура уведомления о breaking changes.

### 18.2. Управление API-изменениями

- При каждом Backend API change — OpenAPI update и regeneration TypeScript types.
- Проверять diff схемы и CI на typecheck.
- По умолчанию additive optional fields; breaking change только с согласованием.
- Списки полей и enum брать из схемы, не из README/скриншота.
- DATA-01–03 исправляются на стороне Backend и не должны превращаться в постоянные хаки Frontend.

---

## 19. Тест-план Frontend

### 19.1. Unit

- unit/date/percent/throughput formatters;
- status freshness/unknown mapping;
- permission guards;
- safe evidence routing;
- API adapter optional fields;
- transformation `source/observed/received` timestamps;
- query key construction;
- security: safe URL and link target.

### 19.2. Component

- DataTable pagination/filter/skeleton/error;
- Asset card with partial inventory;
- SourceBinding confidence/identity conflict;
- graph node/edge detail panel;
- log search with audit grouping;
- ECharts rendering with null gaps and units;
- SIP history without `observation`;
- immutable proposal approval dialog;
- job status `UNKNOWN`/`VERIFYING`/`SUCCEEDED`.

### 19.3. Contract/MSW

- Generate types from actual OpenAPI.
- MSW handlers typed against generated types.
- Parse fixtures; flag unsupported/missing operation.
- Enforce no hardcoded production data in features.

### 19.4. Playwright / browser E2E

1. Login/logout/expired session.
2. Navigate Sources→Asset→Topology.
3. Search/filter Assets and Logs.
4. View SIP and hardware partial data.
5. Incident→evidence deep links.
6. Drift→preview→approved→job→verification.
7. Viewer cannot execute action; Backend 403 handled.
8. 409 stale proposal/no retry.
9. Backend 503/reconnect.
10. SPA refresh on deep route.

### 19.5. Final E2E с настоящим Backend

Минимум один реальный browser→Backend→PostgreSQL scenario. Источники могут быть явно simulated fixtures; UI не должен путать это с реальным оборудованием. Для remediation реальный write operation — только на авторизованном тестовом стенде; иначе fake Runner и честная маркировка.

---

## 20. Рекомендуемый демонстрационный сценарий хакатона

1. **Data Sources:** Zabbix, Prometheus, Collector, Ansible со статусами подключения. Тексты о «реальной интеграции» допустимы только при реально проверенном стенде.
2. **Unified Assets:** показано оборудование различных зарубежных и отечественных вендоров; у одного Asset несколько источников данных.
3. **Inventory/Physical Placement:** модель, serial, ПО/firmware, Site/Room/Rack/Unit.
4. **Topology:** маршрут Router→Core→Access→Voice Gateway/Server, links LLDP/CDP/MNDP, unresolved neighbors.
5. **Controlled issue:** порт/VLAN либо interface degradation; данные Zabbix + SNMP + SIP + Syslog/drift.
6. **Incident:** один объединённый инцидент, evidence timeline и affected service.
7. **AI:** probable cause и evidence refs, уверенность/ограничения.
8. **Config Diff:** actual VLAN 30 вместо expected 20.
9. **Approval:** пользователь видит конкретный порт, VLAN и разрешённый шаблон.
10. **Execution/Verification:** Ansible job→повторное чтение→backend подтверждает исправление.
11. **Report:** incident outcome/chronic and historical metrics.

При отсутствии реального SSH-устройства показывать mock execution с явной пометкой тестового сценария, не выдавать его за живой remediation. Приоритет — достоверная законченная история, не количество эффектных графиков.

---

## 21. Матрица соответствия исходному кейсу

| Требование кейса | Экраны Frontend | Приёмка |
|---|---|---|
| Не менее 6 вендоров | Assets, Inventory, Vendor filters | Отображение фактической матрицы supported/tested, не список «для галочки» |
| Мониторинг здоровья в реальном времени | Dashboard, Assets/Metrics, Hardware | Актуальные показатели, freshness, provenance и история |
| Регулярные отчёты | Reports | Отчёт за период, daily/weekly если доступно |
| Хронические проблемы | Chronic Problems | Реальные частоты, affected resources, evidence |
| Телефония | SIP Monitoring | Response/latency/status и history |
| rsyslog/auditd | Logs/Audit | Поиск, фильтр, группировка и source attribution |
| AI вероятная причина и рекомендации | Incidents/AI | Evidence-linked structured result, no auto-execution |
| Автоматическая инвентаризация | Assets/Inventory/Hardware | Serial/model/software/hardware revision с источниками |
| Физическое размещение | Locations/Rack | Site/Room/Rack/Unit, Asset placement |
| Автоматическая карта сети | Global Topology | Nodes/edges/source/unknown/TTL |
| Управление и восстановление | Configuration/Automation | RBAC→approval→allowlisted job→verification |

---

## 22. Риски, блокеры и стратегия снижения

| Риск | Вероятное влияние | Предусмотренное решение |
|---|---|---|
| Backend без согласованной Git-базы и обновляемого OpenAPI | Frontend расходится с API | Заморозить стартовый OpenAPI artifact; CI generator; один владелец контракта |
| DATA-02 auto-merge Assets | Неправильные факты в карточках | Backend fix до демо, отображать SourceBindings/identities, не объединять на клиенте |
| DATA-01 SIP observation optional | Пустые поля metadata | Optional rendering + контрактный regression |
| DATA-03 limits hardware metrics | Отсутствующие датчики | Partial/unknown UI, Backend fix до hardware stress demo |
| Несогласованные job states B11.2 | Ложный «успех» или опасное повторение | Только state machine Backend, explicit verification, без auto-resubmit |
| Нет SSE/WebSocket | UI недостаточно живой | Разумный refetch + paused polling + manual refresh |
| Тяжёлая топология/графики | Зависания браузера | Lazy loading, bounded graph, filters, aggregation |
| Отсутствует live Zabbix/Prometheus/LLM | Некорректная презентация | Чёткое различие live/test/simulated; build UI независимо от среды |
| Недостаток времени | Несвязанные недоделанные экраны | F0–F7 + demo-first; P1 узко и после P0 |
| Изменения Backend API в последний момент | Переписывание компонентов | Generated types + adapters + feature isolation |
| Секреты/CSRF в браузере | Security issue | Same-origin cookies, Server RBAC, no secrets in Vite, gated operations |

---

## 23. Definition of Done и итоговая приёмка Frontend

Frontend v1 готов для демонстрации, если выполнено:

- [ ] Отдельный репозиторий InfraPulse-Frontend, lockfile и воспроизводимая сборка.
- [ ] Actual Backend OpenAPI pinned; generated client проходит typecheck.
- [ ] Авторизация/сессии/ошибки/роли работают через настоящий API.
- [ ] Data Sources и Collectors отображают реальные server statuses.
- [ ] Unified Assets, SourceBindings и Inventory доступны.
- [ ] Hardware Health корректно различает status/state/unknown.
- [ ] Global Topology отражает реальный Backend graph с source/TTL/unresolved.
- [ ] Site/Room/Rack/Unit показывается хотя бы read-only.
- [ ] Метрики с верными единицами и временными диапазонами.
- [ ] Syslog/Audit поиск и SIP history работают.
- [ ] Incident detail содержит cross-source evidence/timeline.
- [ ] Configuration Drift показывает expected/actual/diff.
- [ ] Remediation UI не допускает исполнения без явного серверного approval; SUCCEEDED только после verification.
- [ ] AI UI не даёт модели права выполнения и содержит ссылки на evidence.
- [ ] Reports/Chronic показывают данные Backend, не fabricated metrics.
- [ ] `loading`, `empty`, `partial`, `stale`, `error`, `simulated` обрабатываются.
- [ ] Запрещённые действия не доступны viewer; Backend RBAC/CSRF не обходятся.
- [ ] Playwright smoke tests, build/typecheck/lint пройдены.
- [ ] Frontend загружается через Nginx как SPA и обращается к `/api` same-origin.
- [ ] Сквозной demo сценарий проведён в тестовом окружении.
- [ ] Список невыполненных live acceptance честно зафиксирован.

**Не требовать для frontend v1:** новый транспорт Collector, новый Backend, собственный real-time socket server, новый TSDB, HA cluster, массовый frontend SSR, полный i18n или 3D DCIM.

---

## 24. Что нужно получить от команды перед стартом реализации

**Обязательные входные данные:**

1. Текущий `openapi.yaml`/`openapi.json` Backend и согласованная версия/хеш.
2. Test URL Backend с разрешённым CORS либо same-origin Vite proxy.
3. Тестовые accounts Viewer/Operator/Admin; documented cookie/CSRF workflow.
4. Примеры фактических ответов: assets, sources, collectors, topology, incidents, logs, SIP, hardware, drift, jobs, reports.
5. Данные для сквозного demo-инцидента.
6. Подтверждение, применены ли fixes DATA-01/02/03 и какой Base checkout у Backend.
7. Конкретный перечень разрешённых action APIs (B9/B11.2/typed RouterOS commands).
8. Согласование branding (название InfraPulse, логотип, цветовáя гамма) и домена для deployment.

**Необязательные на старте:** реальный Zabbix/Prometheus/Ansible/Grafana стенд, доступ к BMC, production SSL, готовый LLM provider, окончательная модель HA. Они не должны блокировать F0–F3.

---

## 25. Запуск разработки — организационный план, не Codex-промт

Когда команда утвердит этот документ, последовательность практического старта:

1. Создать **отдельный** `InfraPulse-Frontend` (React + TypeScript, Vite) через WebStorm terminal/CLI.
2. Подключить git, pnpm/lockfile, lint/typecheck/build/test scripts.
3. Скопировать этот файл в `docs/frontend-plan.md`.
4. Получить актуальный OpenAPI от Backend и настроить codegen/types.
5. Поднять dev proxy к Backend, проверить login/session/CSRF.
6. Создать AppShell/dark design tokens/shadcn kit.
7. Сделать один **вертикальный срез**: `Sources → Asset → Incident`, реально получая данные Backend.
8. После доказанного среза параллелить Topology, Metrics/Logs/SIP, Configuration/AI/Reports.
9. Проверить production static dist под Nginx, зафиксировать demo script.

**Следующий отдельный документ после утверждения плана:** подробный пошаговый Codex-промт на Frontend F0/F1 либо единый многоэтапный промт со стоп-условиями, контрактами и acceptance criteria. **В этом файле промта намеренно нет.**

---

## 26. Ссылки на документацию инструментов

Эти внешние ссылки используются как ориентиры выбора стека, не заменяют фактическую проверку совместимости конкретных установленных версий:

- React: https://react.dev/
- Vite: https://vite.dev/
- Node.js release schedule: https://github.com/nodejs/Release
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- shadcn/ui + Vite: https://ui.shadcn.com/docs/installation/vite
- TanStack Query: https://tanstack.com/query/latest/docs/framework/react
- TanStack Table: https://tanstack.com/table/latest
- openapi-typescript: https://openapi-ts.dev/
- Apache ECharts: https://echarts.apache.org/
- Cytoscape.js: https://js.cytoscape.org/
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- Vitest: https://vitest.dev/
- MSW: https://mswjs.io/
- Playwright: https://playwright.dev/

---

## 27. Зафиксированные архитектурные решения

| Решение | Статус |
|---|---|
| React + TypeScript + Vite SPA | **Принято в рамках плана** |
| Отдельный Frontend repository | **Принято в рамках плана** |
| Static Nginx deployment, no Node production runtime | **Принято в рамках плана** |
| REST only from browser, no direct Collector gRPC | **Принято в рамках плана** |
| OpenAPI-generated typed client | **Принято в рамках плана** |
| Tailwind + shadcn/ui | **Рекомендуется** |
| ECharts + Cytoscape.js | **Рекомендуется** |
| HTTP polling until server push contract appears | **Принято в рамках плана** |
| Dark theme first; light theme possible | **Рекомендуется** |
| Russian first; English-ready | **Рекомендуется** |
| Backend-owned Asset identity, RBAC and remediation outcomes | **Обязательно** |
| AI has no direct action permissions | **Обязательно** |
| Dashboard numbers from Backend, not hardcoded | **Обязательно** |
| F0–F7 before P2 polishing | **Рекомендуемый приоритет** |

**Итог:** InfraPulse Frontend — самостоятельная, типизированная, безопасная SPA-консоль поверх уже существующего Backend. Её задача — связать всю функциональность NetOps Control Plane в понятный рабочий процесс: **видеть → локализовать → объяснить → подтвердить действие → проверить → отчитаться**.
