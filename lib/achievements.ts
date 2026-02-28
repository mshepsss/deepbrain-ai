import type { Achievement, GameState } from './types';

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'revenue-1m',
    label: '$1M Revenue',
    description: 'Hit $1M annual revenue run rate',
    condition: (s: GameState) => s.revenue >= 83_333,
    bonus: { revenuePerRepMultiplier: 1.1 },
  },
  {
    id: 'team-10-engineers',
    label: '10 Engineers',
    description: 'Build a team of 10 engineers',
    condition: (s: GameState) => s.headcount.engineering >= 10,
    bonus: { researchSpeedMultiplier: 1.1 },
  },
  {
    id: 'runway-12m',
    label: '12-Month Runway',
    description: 'Maintain 12 months of cash runway',
    condition: (s: GameState) => s.burnRate > 0 && s.cash / s.burnRate >= 12,
    bonus: { burnRateMultiplier: 0.95 },
  },
  {
    id: 'first-milestone',
    label: 'First Breakthrough',
    description: 'Complete the GPT-2 class model milestone',
    condition: (s: GameState) => s.milestones.find(m => m.id === 'gpt2-class')?.completed ?? false,
    bonus: { agiProgressMultiplier: 1.1 },
  },
  {
    id: 'sales-army',
    label: 'Sales Army',
    description: 'Hire 5 sales reps',
    condition: (s: GameState) => s.headcount.sales >= 5,
    bonus: { userAcquisitionMultiplier: 1.1 },
  },
];

export const getInitialAchievements = (): Achievement[] =>
  ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));

export const checkAchievements = (state: GameState): GameState => {
  const updatedAchievements = state.achievements.map(a =>
    !a.unlocked && a.condition(state) ? { ...a, unlocked: true } : a
  );
  return { ...state, achievements: updatedAchievements };
};
