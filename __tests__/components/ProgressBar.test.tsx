/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders label', () => {
    render(<ProgressBar label="AGI Progress" value={67} max={100} />);
    expect(screen.getByText('AGI Progress')).toBeInTheDocument();
  });

  it('renders percentage text', () => {
    render(<ProgressBar label="AGI Progress" value={67} max={100} />);
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('bar fill has correct width style', () => {
    const { container } = render(<ProgressBar label="Test" value={50} max={100} />);
    const bar = container.querySelector('[data-testid="progress-fill"]');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('clamps to 100%', () => {
    render(<ProgressBar label="Test" value={150} max={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
