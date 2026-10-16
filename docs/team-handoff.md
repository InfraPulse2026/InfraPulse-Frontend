# Границы работ и передача команде

По решению Олега текущая работа охватывает оставшиеся четыре блока разработки frontend:

1. Typed rollback — реализован в v0.6.0, локальные проверки описаны в rollback.md.
2. Мониторинг — срез v0.7.0 реализован: network precision/rates, external pages, hardware context/cursor, Audit filters/groups/records. Подробно monitoring.md.
3. Топология и размещение — реализованы в v0.8.0: layout в памяти сессии, bounded canvas/обновления, BMC relations и atomic bulk placement review. Подробно topology-placement.md.
4. Общий интерфейс — реализован в v0.9.0: вложенная навигация, темы графиков, focus соседей, локальные AI refs и protocol-specific options. Итог: final-handoff.md; детали interface-and-protocols.md.

После каждого этапа предоставляется один полный frontend ZIP, включающий предыдущие изменения. ZIP не требуется объединять с предыдущими архивами. Agent/backend не изменяются; публикация в GitHub отдельно не выполняется.

## Другим разработчикам: живой стенд

- Согласовать фактическую версию backend/OpenAPI с api/contract.json, проверить DATA-01–03.
- Настроить тестовые Collector/mTLS/PKI; проверить enrollment/renew/revoke и закрытие stream.
- Поднять командные Zabbix 7.0.31/7.4.15 и Prometheus 3.15.0, проверить mappings/credentials/историю на своих данных.
- Проверить Ansible Runner на разрешённом Linux/SSH-устройстве, approval/cancel/verification и реальные ограничения.
- Для typed rollback использовать разрешённое тестовое RouterOS устройство/эмулятор с interfaces/resource.rollback capabilities; проверить fresh telemetry, protected management interface, candidate/reserved/consumed/uncertain и недоступный snapshot.
- Подключить согласованный AI provider только после preview/consent; не передавать сырые секреты.
- Проверить все роли, истечение сессий, нагрузку, доступность интерфейса и большие объёмы данных.

Не выдавать simulated fixtures за подтверждение живой интеграции. Локальные браузерные тесты и TypeScript проверяют UI/контракт, а не физическое оборудование.

## Другим разработчикам: финальный выпуск

- Создать/обновить отдельный frontend repo в согласованной ветке, выполнить review и публикацию.
- Проверить Dockerfile, Nginx/Compose на своём стенде; SPA fallback, API proxy, static cache headers.
- Настроить HTTPS/domain/certs, AUTH_PUBLIC_ORIGIN и secure cookies с одним origin.
- Проверить deep links, CSRF/401/403/429/503 через реальный reverse proxy.
- Провести сквозной Sources → Asset → Topology → Incident → Evidence/AI → Approval → Job → Verification → Report.
- Для защиты разделить реально проверенные сценарии и simulated возможности. Подготовить согласованный финальный release.

Базовая инструкция запуска — README.md. Детальная матрица готовности — implementation-status.md. Историческая native Backend/PostgreSQL проверка относится к v0.5.0; она не подтверждает новый typed rollback и не заменяет стендовую приёмку.
