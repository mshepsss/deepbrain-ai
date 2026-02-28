/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';

const baseProps = {
  cash: 2_100_000,
  burnRate: 180_000,
  revenue: 95_000,
  agiProgress: 67,
  researchPoints: 22,
  month: 14,
  headcount: { engineering: 4, sales: 2, operations: 1 },
};

describe('Dashboard', () => {
  it('displays cash formatted as millions', () => {
    render(<Dashboard {...baseProps} />);
    expect(screen.getByText(/\$2\.1M/)).toBeInTheDocument();
  });

  it('shows amber warning class when runway < 3 months', () => {
    // 300k cash / 180k burn = 1.67 months < 3
    const { container } = render(<Dashboard {...baseProps} cash={300_000} />);
    expect(container.querySelector('.text-amber-600')).toBeInTheDocument();
  });

  it('does not show amber warning when runway >= 3 months', () => {
    // 2.1M / 180k = 11.7 months, no warning
    const { container } = render(<Dashboard {...baseProps} />);
    expect(container.querySelector('.text-amber-600')).not.toBeInTheDocument();
  });

  it('shows total headcount', () => {
    render(<Dashboard {...baseProps} />);
    // total = 4 + 2 + 1 = 7
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
