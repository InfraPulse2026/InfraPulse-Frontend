import type { ReactNode } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Copy,
  Inbox,
  RefreshCw,
  X,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { status } from '../lib/status';
import { timestamp, relative, text } from '../lib/format';
import { ApiError } from '../api/client';
import { Button } from './ui/button';

export function Badge({ value, label }: { value?: string | null; label?: string }) {
  const [name, tone] = status(value);
  return (
    <span className={`badge badge-${tone}`}>
      <Circle size={6} fill="currentColor" />
      {label || name}
    </span>
  );
}
export function SourceBadge({ children }: { children?: ReactNode }) {
  return <span className="source-badge">{children || 'Источник не указан'}</span>;
}
export function Time({ value }: { value?: string | null }) {
  return (
    <time dateTime={value || undefined} title={timestamp(value)}>
      {relative(value)}
    </time>
  );
}
export function PageHeader({
  eyebrow = 'Рабочая среда',
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="page-actions">{actions}</div>
    </div>
  );
}
export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <div className="panel-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
export function Loading() {
  return (
    <div role="status" aria-label="Загрузка данных" className="skeletons">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton" />
      ))}
    </div>
  );
}
export function Empty({
  title = 'Здесь пока нет данных',
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>
        {children ||
          'Подключите источник или измените фильтры. Отсутствие данных не означает исправность оборудования.'}
      </p>
    </div>
  );
}
export function ErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={22} />
      <div>
        <h3>
          {error instanceof ApiError && error.status === 403
            ? 'Недостаточно прав'
            : 'Не удалось загрузить данные'}
        </h3>
        <p>{error.message}</p>
        {error instanceof ApiError && (
          <small>
            {error.status || 'Сеть'} · {error.code}
            {error.requestId && ` · запрос ${error.requestId}`}
          </small>
        )}
      </div>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          <RefreshCw size={15} />
          Повторить
        </Button>
      )}
    </div>
  );
}
export function QueryState({
  query,
  children,
}: {
  query: { isPending: boolean; error: Error | null; refetch: () => unknown };
  children: ReactNode;
}) {
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  return <>{children}</>;
}
export function DataTable<T>({
  data,
  columns,
  emptyTitle,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  emptyTitle?: string;
}) {
  // React Compiler is not enabled; Table owns its mutable instance internally.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  if (!data.length) return <Empty title={emptyTitle} />;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          {table.getHeaderGroups().map((g) => (
            <tr key={g.id}>
              {g.headers.map((h) => (
                <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((c) => (
                <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Pagination({
  offset,
  count,
  size = 50,
  onChange,
}: {
  offset: number;
  count: number;
  size?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="pagination">
      <span>
        {count ? `${offset + 1}–${offset + count}` : '0'} записей · страница{' '}
        {Math.floor(offset / size) + 1}
      </span>
      <div>
        <Button
          variant="ghost"
          aria-label="Предыдущая страница"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - size))}
        >
          <ArrowLeft size={15} />
        </Button>
        <Button
          variant="ghost"
          aria-label="Следующая страница"
          disabled={count < size}
          onClick={() => onChange(offset + size)}
        >
          <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}
export function Facts({ values }: { values: Record<string, unknown> }) {
  return (
    <dl className="facts">
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : text(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
export function JsonView({
  value,
  title = 'Данные и происхождение',
}: {
  value: unknown;
  title?: string;
}) {
  return (
    <details className="json-view">
      <summary>{title}</summary>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
export function CopyId({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copy-id"
      title={value}
      onClick={async () => {
        if (value) {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        }
      }}
    >
      {value || '—'}
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}
export function Drawer({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="drawer">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="muted">
            Факты и метаданные, полученные от backend.
          </Dialog.Description>
          <Dialog.Close className="close-button" aria-label="Закрыть">
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  children,
  onConfirm,
  pending,
  error,
  confirmLabel = 'Подтвердить',
  confirmDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children?: ReactNode;
  onConfirm: () => void;
  pending?: boolean;
  error?: Error | null;
  confirmLabel?: string;
  confirmDisabled?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v && !pending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="confirm-dialog">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          {children}
          {error && <ErrorState error={error} />}
          <div className="dialog-actions">
            <Button variant="secondary" disabled={pending} onClick={onClose}>
              Отмена
            </Button>
            <Button disabled={pending || confirmDisabled} onClick={onConfirm}>
              {pending ? 'Ожидание ответа…' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Tabs({
  items,
  active,
  onChange,
}: {
  items: { value: string; label: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={active === item.value}
          className={active === item.value ? 'active' : ''}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function EntityLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="entity-link" to={to}>
      {children}
      <ArrowRight size={13} />
    </Link>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <AlertCircle size={16} />
      <div>{children}</div>
    </div>
  );
}
