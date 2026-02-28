/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { AchievementsList } from '@/components/AchievementsList';
import { getInitialAchievements } from '@/lib/achievements';

describe('AchievementsList', () => {
  it('shows all achievement labels', () => {
    const achievements = getInitialAchievements();
    render(<AchievementsList achievements={achievements} />);
    expect(screen.getByText('$1M Revenue')).toBeInTheDocument();
    expect(screen.getByText('10 Engineers')).toBeInTheDocument();
  });

  it('shows unlocked achievement with check marker', () => {
    const achievements = getInitialAchievements().map((a, i) =>
      i === 0 ? { ...a, unlocked: true } : a
    );
    const { container } = render(<AchievementsList achievements={achievements} />);
    expect(container.querySelector('[data-testid="unlocked-0"]')).toBeInTheDocument();
  });

  it('shows locked achievements without check marker', () => {
    const achievements = getInitialAchievements();
    const { container } = render(<AchievementsList achievements={achievements} />);
    expect(container.querySelector('[data-testid="unlocked-0"]')).not.toBeInTheDocument();
  });
});
