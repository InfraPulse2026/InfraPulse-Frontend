# Передача frontend команде — v0.9.0

## Какой архив брать

Используйте **один последний InfraPulse-Frontend-v0.9.0.zip**. В нём весь frontend, включая предыдущие этапы, инструкции, тесты и готовый static dist. Старые ZIP не являются отдельными модулями: не нужно загружать их все или смешивать их содержимое.

Распакуйте архив в новую папку. Внутри InfraPulse-Frontend должны сохраниться src/, public/, api/, docs/, e2e/ и остальные каталоги. Не складывайте все файлы в корень. Код Agent и backend в этот архив не входит.

## Быстрый запуск

Node 24 LTS, pnpm 11.25.0. Из папки InfraPulse-Frontend:

```powershell
pnpm install --frozen-lockfile
pnpm dev:demo
```

Открыть http://127.0.0.1:5173. Аккаунты demo/demo, operator/demo и viewer/demo существуют только в явно обозначенном режиме симуляции. Этот запуск не проверяет оборудование.

Для настоящего backend создайте .env по .env.example, отключите VITE_DEMO_MODE и укажите BACKEND_URL. Backend запускается отдельно. Точный Origin, режим auth и cookies должны соответствовать README.md; не отключайте CSRF ради обхода ошибки входа. Production build создаётся pnpm build, демонстрационные данные и mock worker в него не включаются.

## Что закончено в последних четырёх блоках

1. v0.6.0: журнал типизированных команд Agent, проверка snapshot/policy/ожидаемого состояния, отдельное подтверждение rollback, результат и uncertain без автоповтора. См. rollback.md.
2. v0.7.0: сетевые счётчики без потери uint64, masks/нулевые значения/скорости, история и paging внешних метрик, mapped Prometheus range, hardware context/cursor, расширенные log/Audit filters и записи групп. См. monitoring.md.
3. v0.8.0: сохранение layout в памяти сессии, обновление графа без полной перераскладки, bounded canvas, BMC relations отдельно, atomic bulk placement review. См. topology-placement.md.
4. v0.9.0: вложенная навигация, доступный выбор узла/соседей, темы графиков/карты, локальные ссылки AI и расширенные настройки протоколов. Исправлены hardware polling, очистка несовместимых опций и повторное подтверждение после ошибки. См. interface-and-protocols.md.

Матрица остальных реализованных разделов F0–F12 — implementation-status.md. Последние блоки не заменяют уже существующие Sources, Assets, incidents, configuration/remediation, reports, accounts/PKI.

## Как проходит взаимодействие

Agent/Collector опрашивает оборудование и отправляет данные backend по gRPC. Backend хранит и сопоставляет факты, авторизует действия и выдаёт REST API. React обращается только к этому API. Браузер не подключается напрямую к SNMP/RouterOS/SSH/Redfish/IPMI и не получает локальные файлы credentials Collector.

Команды, изменённые настройки и размещения проходят через существующие endpoints с явным подтверждением там, где оно предусмотрено контрактом. Backend отвечает за итоговую валидацию, транзакции, dispatch и исполнение. Desired, queued, applied, verified и uncertain показываются раздельно.

Контракт зафиксирован в api/contract.json: backend commit 58d1e088f0fa0f744209b909e473a269779c1ea6, OpenAPI 0.44.0. Если командный main уже другой, сравните контракт до интеграции. Типы проверяются pnpm api:check; generated schema вручную не редактируется.

## Что проверено локально

97 unit/component/API/contract tests, 42 браузерных сценария Chrome, strict TypeScript, ESLint, Prettier, воспроизводимость OpenAPI types и production build. Браузерные сценарии последних блоков используют явно simulated fixtures. Подробная история и границы — verification.md; итоговые метаданные — release.json.

Историческая проверка React → настоящий backend → PostgreSQL относится к v0.5.0. Она не выдаётся за live acceptance новых protocol/rollback/placement возможностей. Agent/backend исходники при разработке frontend не редактировались.

## Два этапа другой команды

**Живой стенд:** Collector/mTLS/PKI, Zabbix 7.0.31/7.4.15, Prometheus 3.15.0, разрешённые Ansible/Agent write, настоящий AI provider, матрица ролей, конкурентные операции, нагрузка и полноценная доступность интерфейса. Подробный список — team-handoff.md.

**Финальный выпуск:** проверить Docker/Nginx/Compose, настроить HTTPS/domain/cookies, пройти общий demo flow, выполнить release review и опубликовать frontend в согласованном репозитории/ветке. Git commit/push этой поставкой не выполнялся.

## Что сознательно не объявляется готовым

Отдельного API для постоянного хранения layout, произвольного frontend PromQL, range cursor, серверного поиска Assets и Ansible rollback контракт не предоставляет. Frontend их не придумывает. Layout хранится в памяти сессии и исчезает при logout/reload. Расширения P2 исходного плана — сложный rack drag-and-drop, 3D-карта, EN, Grafana iframe, собственный WebSocket и configurable widgets — остаются будущей работой.

Разработка согласованных четырёх блоков завершена на уровне исходников и локальных проверок. Готовность всего production-стенда подтверждается только после двух командных этапов выше.
