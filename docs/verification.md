# Что проверено в этой поставке

Дата: **16 октября 2026 года**. Изолированное локальное окружение Windows; Node 24.19.0. Результаты относятся к этому frontend и зафиксированному backend, не к неизвестному будущему GitHub main.

## Проверки исходников и сборки

- `pnpm install --frozen-lockfile`: воспроизводимая установка прошла.
- `pnpm api:check`: generated types воспроизводятся; SHA-256 OpenAPI `91e0abcd53b4a6e83fe0dcb468672684715cb68c3cf1d5859b0b3e6d802e8441`.
- Strict TypeScript и ESLint прошли.
- Prettier проверяет единый стиль; generated schema и оригинальный план не переписываются форматтером.
- Peer dependencies согласованы.
- **97 unit/component/API/contract tests**: прежние проверки, PKI/typed rollback, protobuf counters/rates/availability, uint64, RFC3339/calendar/UTF-8/numeric filters и новые monitoring/Audit fixtures.
- Production build прошёл. Route-level lazy chunks для графа и ECharts; demo dataset и mock Service Worker не включаются в dist.

## 42 браузерных сценария — PASS

Google Chrome, отдельный автоматизированный профиль без личных вкладок пользователя. MSW fixtures явно simulated.

1. Login → Sources → Asset bindings → reload → Topology → Incident → logout.
2. Viewer не получает administrative controls и не может запускать AI.
3. SIP timeout отображается null latency, Logs q фильтрует записи, detail показывает Host claim.
4. Запрос исправления → отдельное административное одобрение → backend-style verified; отдельный AI preview/consent/result. Исполнение и модель в этом тесте fake.
5. Основные routes, hardware/metrics/rack/reports/admin/automation: без React crashes и page overflow на desktop.
6. Истёкшая demo cookie → login, private data не остаются на экране.
7. 503 отличается от empty data; 409 revision conflict не вызывает повторный POST.
8. Снимки desktop dark/light, Assets, Topology, Incident и mobile 390px. Визуально просмотрены; изображения в `docs/screenshots` показывают только тестовый набор.
9. Managed Targets: отправлен полный typed snapshot, expected_revision=2, fast_interval=60s, credential_ref сохранён; desired/pending видны до отдельного applied. Секрет/password не передаётся.

10. Report schedule create/edit/pause с сохранением просмотренной ревизии.
11. User role/password editor и защита последнего администратора.
12. Baseline snapshot и remediation policy editors: Asset/baseline/policy revisions и idempotency.
13. SSH target и отмена pending remediation: сохранённая ревизия, credential ref, без запуска SSH.
14. Prometheus mapping, Zabbix item и явное удаление source credential.
15. Создание/изменение локаций, размещение Asset и конфликт занятых юнитов.

16. Предметные evidence views для configuration/hardware/log/topology/Zabbix/SIP, история состояний и понятные основания корреляции.

17. Identity split → явный merge обратно: просмотренные ревизии, canonical binding, отдельные Idempotency-Key, сохранённый alias.
18. Identity 409 блокирует старое подтверждение; source с размещением не допускается к объединению.
19. Viewer видит сведения и историю, но не получает merge/split controls.
20. PKI: UUID/TTL validation, одноразовый секрет только в форме, удаление из формы, отсутствие секрета в списках/storage, отзыв токена/сертификата и аудит.
21. Viewer не видит управление PKI, не запрашивает metadata из страницы; прямой API получает 403.
22. PKI disabled и 409: действия не повторяются, подтверждение конфликта блокируется.
23. Viewer меняет собственный пароль: проверка повтора, скрытые значения в подтверждении, выход из сессии и отсутствие пароля в URL/storage.
24. Ошибка смены пароля: поля очищены, старое подтверждение недоступно для повторного запроса.
25. Команды: точные Agent/Device filters, снимок с неизвестным сроком, explicit false, timeout, typed rollback payload/CSRF/Idempotency-Key, отдельная команда и fake Agent read-back.
26. Исход uncertain, consumed snapshot и отключённая политика блокируют исполнение; неверный command ID не запрашивается.
27. Viewer читает команду и метаданные; controls отсутствуют, прямой POST получает 403.
28. Изменение контекста review блокирует POST; серверный 409 блокирует старое подтверждение без повтора.
29. Неопределённый результат rollback остаётся uncertain и не повторяется.
30. Закрытый снимок Ansible читается только явно; скрытие/focus/refresh не вызывают нового закрытого чтения.
31. Network counter 18446744073709551615 сохранён строкой; qualified false/zero отличается от unknown, доступны detail и graph; external metrics переходят на offset=50 и сохраняют 0 %.
32. Hardware detail показывает раздельный контекст, история продолжена по next_after_id=10 без подмены observation key.
33. Audit filters сохраняют UID/AUID/PID=0, success=false и RFC3339; открыты записи группы с before_id=251.
34. Неполный или слишком большой contains window не вызывает API query; сброс очищает форму.
35. Prometheus range использует существующие mapping/target/source, без произвольного PromQL; период и конец окна обновляются явно.

36. Сохранённый layout переживает table toggle и SPA navigation; logout очищает его.
37. Bulk placement preview только читает API; подтверждение отправляет точные revisions/CSRF/Idempotency-Key, результат содержит обе строки.
38. Дубликаты блокируются до записи; серверный 409 блокирует повтор и не сохраняет часть партии.
39. Viewer не получает import UI; прямой POST возвращает 403.

Unit-проверки дополнены неоднозначными ID/границами canvas, координатами, строгим JSON/ревизиями, UTF-8, пересечениями и атомарной перестановкой размещений.

40. IPMI использует medium=86400s без fast, полный review показывает request timeout/privilege/limits и исходную revision.
41. SNMP v3→v2c очищает options; неверный интервал блокируется; SIP TLS получает CA/server name/latency без credential_ref.
42. Вложенные breadcrumbs, светлая история/карта, доступный focus узла/соседей и локальные ссылки AI на Asset/основание; unknown ref не становится ссылкой.

Unit-проверки дополнены сменой протоколов, protobuf durations/24h/границами, безопасными refs, иерархией маршрутов и сохранением null/0 при смене темы.

Baseline-сценарий дополнительно проверяет: закрытый снимок не запрашивается до клика администратора; назначение недоступно до успешного preview.

## Историческая проверка v0.5.0: browser → backend → PostgreSQL

Ниже — сохранённые результаты предыдущего этапа. В v0.6.0/v0.7.0 новый живой стенд не запускался: по решению Олега это работа других разработчиков. Новые typed rollback и monitoring проверены только локально по контракту и на simulated fixtures.

Дополнительно запущены неизменённый executable Backend B16, PostgreSQL 18 в отдельной временной схеме и native `infrapulse-simulator-p3.exe` с gRPC output. **MSW выключен**. Симулятор не выдавался за физический Collector на оборудовании.

Проверено:

- настоящий login через Vite same-origin proxy;
- backend выдал HttpOnly cookie;
- `/api/auth/me` вернул фактические права администратора;
- mutation без X-CSRF-Token получил 403;
- в отдельном прогоне из native simulated transport поступило 7 объектов; для identity acceptance добавлены ещё 2 явно simulated наблюдения через неизменённый storage-модуль backend;
- открылись карточка, resolved inventory и глобальная топология;
- из React-формы создан отдельный Viewer, запись подтверждена SQL-запросом PostgreSQL;
- настоящий Viewer не видит управление, backend отклоняет его запрос access/users кодом 403;
- Reports v2 GET ответил 200;
- формы смены роли и сброса пароля прошли с настоящим backend;
- расписание создано и изменено до revision=2, cadence=weekly, enabled=false;
- через React-формы создана полная физическая иерархия Site → Building → Room → Rack и размещён Asset; повторный GET подтвердил path из четырёх локаций и сохранённый rack placement;
- через реальные React-формы выполнены merge и split двух синтетических наблюдений в одной source/session области; ownership, alias и история проверены повторным GET, два решения дополнительно подтверждены SQL;
- разные simulated области корректно блокируются уже в форме;
- PKI_DISABLED настоящего backend отображается как отключённый сервис; выпуск токена недоступен;
- собственный пароль Viewer изменён через React-форму; backend отозвал текущую и вторую независимую сессии (оба `/api/auth/me` → 401); новый пароль принят при повторном входе;
- в браузере не было page crashes.

Тестовая схема удалена после остановки собственных процессов. Запущенный этой проверкой кластер остановлен; существующие файлы базы не удалялись. Runtime/identity Simulator находились вне исходников Agent. Backend Git working tree остался чистым.

## Что этим не доказано

- Нет live acceptance реальных Zabbix 7.0.31/7.4.15 и Prometheus 3.15.0 команды.
- Не выполнялись реальные Ansible/SSH write, физический rollback, платный LLM вызов или опрос шести физических вендоров.
- B9 browser test проверяет форму и контракт на fixture; отдельная настоящая mTLS-сеть с Collector проверяется владельцами backend/Collector на стенде.
- PKI issue/revoke/audit UI проверены на явно simulated contract fixtures. Настоящий CA/enrollment и разрыв mTLS stream при отзыве сертификата в этой поставке не запускались; live smoke проверил отключённую границу PKI и реальные пароли/сессии.
- Docker/Nginx image и HTTPS domain в этой поставке не запускались; подготовлены конфигурации, а не сертификаты/развёрнутый сайт.
- Полный performance/accessibility audit и оставшиеся API/P2 ограничения перечислены в `implementation-status.md`.

Эти ограничения не заменяют результаты PASS и не превращают fixture в реальное оборудование.
