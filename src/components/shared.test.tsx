import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Badge, Facts, DataTable, ConfirmDialog } from './shared';
describe('common UI', () => {
  it('renders an unknown status and null fact without a fake zero', () => {
    render(
      <>
        <Badge />
        <Facts values={{ Temperature: null }} />
      </>,
    );
    expect(screen.getByText('Неизвестно')).toBeInTheDocument();
    expect(screen.getByText('Не указано')).toBeInTheDocument();
  });
  it('escapes log-like content rather than rendering HTML', () => {
    render(<Facts values={{ Message: '<img src=x onerror=alert(1)>' }} />);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });
  it('shows an empty data state', () => {
    render(<DataTable data={[]} columns={[]} />);
    expect(screen.getByText('Здесь пока нет данных')).toBeInTheDocument();
  });
  it('requires an explicit confirmation click', async () => {
    let calls = 0;
    render(
      <ConfirmDialog
        open
        title="Подтвердить VLAN"
        description="Изменение тестового порта"
        onClose={() => {}}
        onConfirm={() => calls++}
      />,
    );
    expect(calls).toBe(0);
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(calls).toBe(1);
  });
});
