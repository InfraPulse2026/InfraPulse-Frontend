# Состояние реализации по плану v1

Это самостоятельная интегрируемая версия frontend v0.9.0, не утверждение, что вся production-приёмка F0–F12 закончена.

| Этап | Реализованная часть                                                                                                                              | Дальнейшая доводка                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| F0   | Отдельная папка, Node/pnpm/lockfile, pinned OpenAPI/hash, codegen/check, strict TS, lint/tests, CI                                               | Командный отдельный GitHub repo создаётся/публикуется отдельно                                        |
| F1   | Shell, responsive sidebar, темы, общие таблицы/диалоги/статусы, lazy графики/routes                                                              | Вложенные breadcrumbs и темы графиков реализованы; P2 и неизвестные поля остаются отдельно            |
| F2   | Реальные cookie login/me/logout, CSRF, истечение, cache isolation, permissions                                                                   | Полная матрица throttling/expired на командном reverse proxy                                          |
| F3   | Sources CRUD/test/sync; mappings и credential rotation; Collector desired/applied; PKI certificates/tokens/audit, explicit issue/revoke          | Реальная CA/enrollment/revoke приёмка с Collector; mappings на командных Zabbix/Prometheus            |
| F4   | Assets/Inventory/Hardware, таблица identities, backend candidates, merge/split с revisions/idempotency, история решений и resolution events      | Server-side поиск, когда backend предоставит его; проверка на реальных неоднозначных inventory данных |
| F5   | Graph/table/evidence/TTL, session layout, bounded canvas, BMC relations, placement editor и atomic bulk import                                   | Большие графы и конкурентные изменения размещений на живом стенде; persistent layout API отсутствует  |
| F6   | CPU/RAM/network rates, masks/uint64, external pages, mapped Prometheus range/refresh, hardware context/cursor, Audit filters/groups/records, SIP | Проверка живых источников и больших объёмов — другая команда; range cursor отсутствует в API          |
| F7   | Коррелированные случаи/симптомы, понятные основания связей, предметные evidence views, timeline/history, acknowledge                             | Расширение представлений новых категорий backend; диагностика неизвестных дополнительных полей        |
| F8   | Drift/baseline/policy/SSH editors, approval/verification/cancel/jobs; typed Agent command journal, snapshots и rollback с immutable review       | Реальные Agent rollback и Linux Ansible acceptance — другая команда; Ansible rollback API отсутствует |
| F9   | AI preview/consent/results/refs, v2 reports/chronic/snapshots, создание/редактирование/пауза расписаний с revision                               | Локальные AI refs реализованы; настоящий provider проверяет стендовая команда                         |
| F10  | Пользователи list/create/role/disable/password/audit; собственный пароль для всех ролей с отзывом сессий; B9 snapshot; ротация credentials       | Protocol options реализованы; фактическое применение проверяет владелец Collector                     |
| F11  | Unit/component/API/contract tests, browser scenarios, real backend+PostgreSQL smoke                                                              | Нагрузочная/доступностная проверка всего живого стенда и всех ролей                                   |
| F12  | Static dist, Dockerfile/Nginx/Compose, инструкции, demo flow, ZIP                                                                                | Проверка Docker image на стенде, HTTPS/domain/certs, окончательный release review                     |

## Что не следует считать готовым

Исходный план шире этого среза. Не все P1/P2 формы и UX глубины реализованы. Нельзя объявлять завершённым весь F0–F12 только потому, что меню содержит соответствующий раздел.

Существование реального backend и browser smoke не доказывает испытания Zabbix 7.0.31/7.4.15, Prometheus 3.15.0, шести физических вендоров, IPMI/Redfish устройств, настоящего LLM или Ansible write. Тестовый Native Simulator обозначен как simulated. Экземпляры этих систем/credentials/сеть предоставляет команда.

Срез мониторинга v0.7.0: network rates/counters + detail, external pages, refresh Prometheus window, hardware context/cursor и расширенный Audit/log search реализованы. Range API не имеет cursor — он не придуман. Топология/размещение реализованы в v0.8.0 (topology-placement.md). Общая доводка интерфейса и protocol options завершены в v0.9.0 (interface-and-protocols.md). Четыре согласованных блока закончены локально; передача описана в final-handoff.md. Typed rollback завершён на уровне UI и локальных проверок. По решению Олега стендовые проверки (F11 live) и финальное развёртывание/публикация (F12 deploy) переданы другим разработчикам, а не считаются выполненными. Инструкции: team-handoff.md. Agent и backend сохраняют своё владение и контракты.
