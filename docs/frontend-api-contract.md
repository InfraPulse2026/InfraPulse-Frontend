# API-контракт frontend

Стартовая точка: Backend `58d1e088f0fa0f744209b909e473a269779c1ea6`, OpenAPI `0.44.0`; hash в `api/contract.json`. Дата фиксации: 15.10.2026.

## Аутентификация и права

Login `POST /api/auth/login` → HttpOnly cookie + csrf_token; session `GET /api/auth/me` → user/permissions/expiry/CSRF; mutations → X-CSRF-Token, cookie, проверка Origin. Token/password не сохраняются в localStorage. Logout инвалидирует серверную сессию, затем удаляет private Query caches. 401 удаляет чужие данные и закрывает protected routes. Повторный вход не отрывает активного наблюдателя session query.

Фактические permission strings сверены с `internal/access/access.go`: `data.read`, `monitoring.write`, `commands.write`, `incidents.write`, `reports.write`, `analysis.write`, `access.manage`. Фронтенд использует выдаваемый сервером массив, не выводит права по названию роли.

**AUTH-01:** enum `AccessMe.permissions` в frozen OpenAPI перечисляет не все runtime permissions (нет incidents/reports/analysis). Generated artifact сохраняется без правок. Guard принимает readonly string[] и сравнивает точные runtime строки; неизвестные строки не превращаются в дополнительные права. Backend-команде следует расширить enum отдельным согласованным изменением.

## Списки и честная область данных

Assets поддерживает `kind`, `scope`, `limit`, `offset`. Полнотекстового фильтра и произвольной сортировки в этом endpoint нет. Поиск по имени явно помечен как поиск на текущей странице. Цифра Assets на Overview подписана «в первых 50 записях», не выдаётся за global total.

Logs — `q` (PostgreSQL full text), severity и before_id. Простой counter/rate не смешиваются. Нативная history возвращает последние samples без публичного произвольного range API. Prometheus range требует конкретных source_instance_id/target_id/mapping_id, а не произвольного PromQL. Большие decimal uint64 остаются строками; RAM ratio вычисляется через BigInt.

Нет глобального drift-list или all-automation-jobs endpoint: интерфейс требует конкретный Asset, не создаёт скрытый N+1 fan-out ко всему инвентарю. API не предоставляет generic list всех AI jobs: результат открывается в контексте инцидента.

## Семантика и безопасность действий

- Agent ID и device_id остаются отдельными; detail запросы native history используют оба ID из binding.
- Canonical Asset принадлежит backend; client merge по IP/name/MAC отсутствует.
- Lifecycle/resolution не означают доступность. Пустой датчик — не 0. Power Off не означает Critical.
- 202 означает принятую задачу. APPLIED, succeeded job и verified remediation — разные уровни результата.
- B9 GET/PUT требует access.manage. Нужны backend-enabled, capability, local opt-in и mTLS backend↔Collector. Просмотр/изменение не пытаются обходить местную политику Collector.
- B9 PUT — полный snapshot с expected_revision, reason, confirmed и явным allow_empty_snapshot при очистке.
- Proposal/approval подтверждают сохранённый на момент открытия диалога payload, не новую автоматически подставленную ревизию.
- POST/PUT не имеют автоматического retry. Идемпотентность используется только в операциях с соответствующим контрактом.
- AI preview не вызывает модель. Confirmation передаёт тот же preview_id/request_hash; никакой прямой отправки сырых логов из браузера внешнему LLM.
- Correlated case не закрывается клиентом после восстановления одного сигнала. Status/evidence/time confidence берутся из ответа backend.

## DATA-01–03 из плана

Исправления SIP observation/Asset auto-resolution/hardware limits не вносились в backend в рамках frontend. Optional provenance не восстанавливается искусственно. Конфликты и partial/unknown показываются. Статус внедрения candidate patches должен подтвердить владелец backend для текущего стенда.

## Транспорт

Один browser origin, Vite или Nginx proxy. HTTP polling, скрытая вкладка не получает interval refetch; background cache не persist-ится. SSE/WebSocket не придуманы. Внешние ключи, credential refs и private PKI принадлежат backend/Collector. Frontend не меняет protobuf и не общается с gRPC.

## Новые редакторы v0.2.0

Source PUT сохраняет просмотренную revision. При смене endpoint требуется заменить или явно удалить credential. Пустая строка означает удаление, omission — сохранение прежнего; секрет никогда не выводится в подтверждение.

Schedule create/edit использует существующие POST/PUT. У этого API нет idempotency header: автоматического повтора нет; после неизвестного сетевого результата нужно перечитать список. Редактор останавливает повтор из того же подтверждения при 409/сетевом результате без ответа. Календарные периоды — UTC.

Location POST/PUT и Placement PUT используют обязательный Idempotency-Key. Place revision независима от Asset revision. Тип/родитель существующей локации неизменяемы, занятые юниты и уменьшение стойки проверяет backend. Никакого автоматического вытеснения другого оборудования.

Baseline PUT использует Asset и baseline revisions + Idempotency-Key. Policy и SSH target PUT фиксируют свои ревизии. Cancel — запрос на остановку, а не rollback. OpenAPI annotation cancel remediation содержит историческую строку command.write; фактическая регистрация backend использует access.CommandWrite = commands.write, UI проверяет именно runtime permission.

## Identity review v0.4.0

Только backend вычисляет candidates/normalization/resolution. GET candidates ограничен 50, таблицы identities/decisions/events имеют отдельные страницы. Для ручного решения загружается до 200 bindings; если source_count не совпал с загрузкой, запись недоступна. Merge дополнительно ограничен суммарными 128 bindings по текущему ограничению backend. Split переносит 1..64 binding IDs, canonical_binding_id относится к переносимому набору.

POST merge/split требует access.manage и Idempotency-Key. Scope и kind должны совпадать, source для merge должен быть unplaced; формы не снимают размещение автоматически. Положительная безопасная integer revision обязательна; данные текущего Asset фиксируются при открытии формы. При подтверждении фиксируется весь payload. 409 не повторяется и не подставляет новую revision. После решения инвалидируются связанные frontend-кэши, а alias/new Asset IDs берутся исключительно из backend.

GET закрытого snapshot возвращает AutomationSnapshotContent: configuration и facts. Baseline preview использует именно этот контракт, выполняется явно, без interval/focus refetch и с gcTime=0.

## PKI и личный пароль v0.5.0

Управление PKI требует admin + access.manage. GET certificates/bootstrap-tokens/audit ограничен limit=200, agent_id optional, пагинации в контракте нет. Секрет bootstrap token возвращается только успешным POST создания. TokenIssuer возвращает из mutationFn undefined и хранит секрет только в состоянии открытой формы; GET metadata никогда не отображает token. Выпуск не поддерживает заявленную идемпотентность и не повторяется автоматически.

Revoke POST передаёт confirmed:true и точный token ID либо fingerprint. Отзыв сертификата закрывает Agent stream — это явно показано до отправки. После ошибки повтор старого подтверждения отключён. 503 pki_disabled отличается от пустого списка; frontend не пытается включить серверный PKI. Date validity — представление серверных метаданных по часам браузера, не доказательство подключения.

POST /api/auth/password доступен собственному пользователю и принимает current_password/password, проверяет CSRF, отзывает все его сессии. Пароли не проходят через Query/MutationCache. После каждой попытки поля очищаются; после успеха private cache удаляется через общее событие session-expired. Это отдельный контракт от административного POST /api/access/users/{id}/password.
