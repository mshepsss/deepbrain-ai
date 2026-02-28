import { checkAchievements, getAchievementBonuses, getInitialAchievements } from '@/lib/achievements';
import { createInitialState } from '@/lib/gameEngine';

describe('checkAchievements', () => {
  it('does not unlock achievements when conditions are not met', () => {
    // Low cash so runway-12m (cash/burnRate >= 12) is not triggered
    const state = { ...createInitialState('cto'), cash: 1_000_000, burnRate: 200_000 };
    const result = checkAchievements(state);
    expect(result.achievements.every(a => !a.unlocked)).toBe(true);
  });

  it('unlocks revenue-1m when revenue >= 83333', () => {
    const state = { ...createInitialState('cto'), revenue: 83_333 };
    const result = checkAchievements(state);
    const ach = result.achievements.find(a => a.id === 'revenue-1m');
    expect(ach?.unlocked).toBe(true);
  });

  it('unlocks team-10-engineers when engineering headcount >= 10', () => {
    const state = {
      ...createInitialState('cto'),
      headcount: { engineering: 10, sales: 0, operations: 0 },
    };
    const result = checkAchievements(state);
    const ach = result.achievements.find(a => a.id === 'team-10-engineers');
    expect(ach?.unlocked).toBe(true);
  });

  it('unlocks runway-12m when cash / burnRate >= 12', () => {
    const state = { ...createInitialState('cto'), cash: 2_400_000, burnRate: 200_000 };
    const result = checkAchievements(state);
    const ach = result.achievements.find(a => a.id === 'runway-12m');
    expect(ach?.unlocked).toBe(true);
  });

  it('unlocks first-milestone when gpt2-class is completed', () => {
    const state = createInitialState('cto');
    const stateWithMilestone = {
      ...state,
      milestones: state.milestones.map(m =>
        m.id === 'gpt2-class' ? { ...m, completed: true } : m
      ),
    };
    const result = checkAchievements(stateWithMilestone);
    const ach = result.achievements.find(a => a.id === 'first-milestone');
    expect(ach?.unlocked).toBe(true);
  });

  it('unlocks sales-army when sales headcount >= 5', () => {
    const state = {
      ...createInitialState('cto'),
      headcount: { engineering: 0, sales: 5, operations: 0 },
    };
    const result = checkAchievements(state);
    const ach = result.achievements.find(a => a.id === 'sales-army');
    expect(ach?.unlocked).toBe(true);
  });

  it('does not re-unlock an already-unlocked achievement', () => {
    const state = { ...createInitialState('cto'), revenue: 83_333 };
    const first = checkAchievements(state);
    const second = checkAchievements(first);
    const ach = second.achievements.find(a => a.id === 'revenue-1m');
    expect(ach?.unlocked).toBe(true);
    // Should be the same object reference (no spurious update)
    expect(second.achievements).toEqual(first.achievements);
  });
});

describe('getAchievementBonuses', () => {
  it('returns empty modifier when no achievements are unlocked', () => {
    const achievements = getInitialAchievements();
    const bonuses = getAchievementBonuses(achievements);
    expect(bonuses).toEqual({});
  });

  it('returns researchSpeedMultiplier when team-10-engineers is unlocked', () => {
    const achievements = getInitialAchievements().map(a =>
      a.id === 'team-10-engineers' ? { ...a, unlocked: true } : a
    );
    const bonuses = getAchievementBonuses(achievements);
    expect(bonuses.researchSpeedMultiplier).toBe(1.1);
  });

  it('returns burnRateMultiplier when runway-12m is unlocked', () => {
    const achievements = getInitialAchievements().map(a =>
      a.id === 'runway-12m' ? { ...a, unlocked: true } : a
    );
    const bonuses = getAchievementBonuses(achievements);
    expect(bonuses.burnRateMultiplier).toBe(0.95);
  });

  it('compounds multipliers when multiple achievements are unlocked', () => {
    const achievements = getInitialAchievements().map(a =>
      a.id === 'revenue-1m' || a.id === 'team-10-engineers' ? { ...a, unlocked: true } : a
    );
    const bonuses = getAchievementBonuses(achievements);
    expect(bonuses.revenuePerRepMultiplier).toBe(1.1);
    expect(bonuses.researchSpeedMultiplier).toBe(1.1);
  });
});
