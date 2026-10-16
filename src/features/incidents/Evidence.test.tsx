import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Assessment, CorrelationFacts } from './Evidence';

function fact(name: string) {
  return screen.getByText(name, { selector: 'dt', exact: true }).parentElement?.querySelector('dd');
}
describe('incident evidence semantics', () => {
  it('preserves boolean zero, explicit null, and original units', () => {
    const view = render(
      <Assessment
        value={{ metric: 'sip.availability', unit: 'boolean', value: 0, recovery_eligible: false }}
      />,
    );
    expect(fact('Значение')).toHaveTextContent(/^0$/);
    expect(fact('Единица')).toHaveTextContent('boolean');
    expect(fact('Условия восстановления выполнены')).toHaveTextContent('Нет');
    view.rerender(
      <Assessment
        value={{ metric: 'sip.latency', unit: 'milliseconds', value: null, value_percent: 92 }}
      />,
    );
    expect(fact('Значение')).toHaveTextContent('Не указано');
    expect(fact('Единица')).toHaveTextContent('milliseconds');
    view.rerender(<Assessment value={{ unit: 'percent', value: null, value_percent: 92 }} />);
    expect(fact('Значение')).toHaveTextContent('Не указано');
  });
  it('keeps zero forecast separate from regression fit and explains its limits', () => {
    render(
      <Assessment
        value={{ seconds_to_critical: 0, r_squared: 0.97, slope_percent_per_second: 0.2 }}
      />,
    );
    expect(fact('До критического уровня, сек.')).toHaveTextContent(/^0$/);
    expect(fact('Качество регрессии R²')).toHaveTextContent('0.97');
    expect(screen.getByText(/не является вероятностью сбоя/)).toBeInTheDocument();
  });
  it('escapes untrusted evidence and only builds encoded local Asset links', () => {
    render(
      <MemoryRouter>
        <CorrelationFacts
          items={[
            {
              kind: 'same_asset',
              score: 50,
              details: {
                asset_ids: ['a/b?x=1'],
                causal_claim: false,
                service_ids: ['<img src=x onerror=alert(1)>'],
              },
            },
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'a/b?x=1' })).toHaveAttribute(
      'href',
      '/assets/a%2Fb%3Fx%3D1',
    );
    expect(fact('Причинная связь доказана')).toHaveTextContent('Нет');
    expect(document.querySelector('img')).toBeNull();
    expect(fact('Сервисы')).toHaveTextContent('<img src=x onerror=alert(1)>');
  });
});
