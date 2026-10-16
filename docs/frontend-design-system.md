# Визуальная система

Инженерная NOC-консоль. Нейтральный тёмный фон, панели с тонкой границей, бирюзовый InfraPulse accent, читаемая плотность таблиц. Светлая тема использует те же токены. Цвет всегда сопровождается подписью.

В `src/app/styles.css`: цвета `--bg/--panel/--line/--text/--muted/--accent`; semantic red/amber/blue; сетки 1440/1920, 1280, tablet/mobile. System sans и Consolas для идентификаторов/данных. Внешние шрифты не загружаются.

UI primitives: source-owned Button (Radix Slot/CVA), Radix Dialog, status/source badges, QueryState, DataTable (TanStack), Facts, JsonView, Timeline, MetricChart (ECharts), Cytoscape canvas, RackView. Это небольшая собственная библиотека совместимых primitives, не заявление об установке всех компонентов shadcn registry.

Accessibility: skip link, focus-visible, подписи полей, семантические таблицы, Radix focus trap, text status, таблица-альтернатива графу, reduced motion. Формальную полную WCAG-сертификацию не заявляем.
