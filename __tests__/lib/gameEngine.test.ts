import {
  createInitialState,
  applyEventChoice,
  processTurnEnd,
  checkWinLose,
  applyResearchMilestone,
  computeHireDelta,
} from '@/lib/gameEngine';
import { getInitialAchievements } from '@/lib/achievements';
import type { StatDelta } from '@/lib/types';

describe('createInitialState', () => {
  it('creates state with default cash of 5M', () => {
    const state = createInitialState('cto');
    expect(state.cash).toBe(5_000_000);
  });

  it('doubles cash for cfo role', () => {
    const state = createInitialState('cfo');
    expect(state.cash).toBe(10_000_000);
  });

  it('sets role correctly', () => {
    const state = createInitialState('head-of-sales');
    expect(state.role).toBe('head-of-sales');
  });

  it('starts at month 1', () => {
    const state = createInitialState('cto');
    expect(state.month).toBe(1);
  });

  it('starts in playing phase', () => {
    const state = createInitialState('cto');
    expect(state.phase).toBe('playing');
  });
});

describe('applyEventChoice', () => {
  it('applies stat delta to state', () => {
    const state = createInitialState('cto');
    const delta: StatDelta = { cash: -100_000, agiProgress: 5 };
    const next = applyEventChoice(state, delta);
    expect(next.cash).toBe(state.cash - 100_000);
    expect(next.agiProgress).toBe(5);
  });

  it('clamps agiProgress to 100', () => {
    const state = { ...createInitialState('cto'), agiProgress: 98 };
    const next = applyEventChoice(state, { agiProgress: 10 });
    expect(next.agiProgress).toBe(100);
  });
});

describe('processTurnEnd', () => {
  it('increments month', () => {
    const state = createInitialState('cto');
    const next = processTurnEnd(state);
    expect(next.month).toBe(2);
  });

  it('deducts burn from cash and adds revenue', () => {
    const state = createInitialState('cto');
    const next = processTurnEnd(state);
    expect(next.cash).toBe(state.cash + state.revenue - state.burnRate);
  });

  it('cfo burn rate is lower than default', () => {
    const cfoState = createInitialState('cfo');
    const defaultState = createInitialState('cto');
    expect(cfoState.burnRate).toBeLessThan(defaultState.burnRate);
  });

});

describe('checkWinLose', () => {
  it('returns continue for normal state', () => {
    const state = createInitialState('cto');
    expect(checkWinLose(state)).toBe('continue');
  });

  it('returns lost when cash <= 0', () => {
    const state = { ...createInitialState('cto'), cash: 0 };
    expect(checkWinLose(state)).toBe('lost');
  });

  it('returns lost when cash is negative', () => {
    const state = { ...createInitialState('cto'), cash: -1 };
    expect(checkWinLose(state)).toBe('lost');
  });

  it('returns won when agiProgress >= 100', () => {
    const state = { ...createInitialState('cto'), agiProgress: 100 };
    expect(checkWinLose(state)).toBe('won');
  });
});

describe('applyResearchMilestone', () => {
  it('awards agi progress and deducts research points', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = applyResearchMilestone(state, 'gpt2-class');
    expect(next.researchPoints).toBe(5);   // 15 - 10
    expect(next.agiProgress).toBe(5);       // gpt2 awards 5
  });

  it('marks milestone completed', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = applyResearchMilestone(state, 'gpt2-class');
    const m = next.milestones.find(m => m.id === 'gpt2-class');
    expect(m?.completed).toBe(true);
  });

  it('unlocks the next milestone', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = applyResearchMilestone(state, 'gpt2-class');
    const m = next.milestones.find(m => m.id === 'gpt3-class');
    expect(m?.unlocked).toBe(true);
  });

  it('returns unchanged state for unknown milestone', () => {
    const state = createInitialState('cto');
    const next = applyResearchMilestone(state, 'nonexistent');
    expect(next).toEqual(state);
  });
});

describe('processTurnEnd achievement bonuses', () => {
  it('applies researchSpeedMultiplier from unlocked team-10-engineers achievement', () => {
    const state = {
      ...createInitialState('cto'),
      achievements: getInitialAchievements().map(a =>
        a.id === 'team-10-engineers' ? { ...a, unlocked: true } : a
      ),
    };
    // CTO base: 5 pts/turn * 1.25 role bonus = 6.25. With achievement 1.1: 6.25 * 1.1 = 6.875
    const next = processTurnEnd(state);
    expect(next.researchPoints).toBeCloseTo(5 * 1.25 * 1.1);
  });

  it('applies burnRateMultiplier from unlocked runway-12m achievement', () => {
    const state = {
      ...createInitialState('cto'),
      achievements: getInitialAchievements().map(a =>
        a.id === 'runway-12m' ? { ...a, unlocked: true } : a
      ),
    };
    // With achievement: cash changes by revenue - burnRate * 0.95
    const next = processTurnEnd(state);
    expect(next.cash).toBe(state.cash + state.revenue - state.burnRate * 0.95);
  });
});

describe('applyResearchMilestone achievement bonuses', () => {
  it('applies agiProgressMultiplier from unlocked first-milestone achievement', () => {
    const state = {
      ...createInitialState('cto'),
      researchPoints: 15,
      achievements: getInitialAchievements().map(a =>
        a.id === 'first-milestone' ? { ...a, unlocked: true } : a
      ),
    };
    // CTO role gives agiProgressMultiplier: 1.0 (no bonus), achievement adds 1.1
    // gpt2-class agiBonus = 5 → 5 * 1.1 = 5.5
    const next = applyResearchMilestone(state, 'gpt2-class');
    expect(next.agiProgress).toBeCloseTo(5 * 1.1);
  });
});

describe('computeHireDelta', () => {
  it('returns base costs for operations with no role modifiers', () => {
    const state = createInitialState('cto');
    const delta = computeHireDelta('operations', state);
    expect(delta.cash).toBe(-8_000);
    expect(delta.burnRate).toBe(6_000);
    expect(delta.revenue).toBe(0);
  });

  it('applies engineeringHireCostMultiplier for CTO hiring engineers', () => {
    const state = createInitialState('cto'); // CTO: engineeringHireCostMultiplier = 0.9
    const delta = computeHireDelta('engineering', state);
    expect(delta.cash).toBe(-15_000 * 0.9);
  });

  it('applies revenuePerRepMultiplier for head-of-sales hiring sales reps', () => {
    const state = createInitialState('head-of-sales'); // revenuePerRepMultiplier = 1.2
    const delta = computeHireDelta('sales', state);
    expect(delta.revenue).toBe(5_000 * 1.2);
  });

  it('includes headcount delta of 1 for the hired department', () => {
    const state = createInitialState('cto');
    const engDelta = computeHireDelta('engineering', state);
    expect(engDelta.headcount).toEqual({ engineering: 1, sales: 0, operations: 0 });

    const salesDelta = computeHireDelta('sales', state);
    expect(salesDelta.headcount).toEqual({ engineering: 0, sales: 1, operations: 0 });
  });

  it('applies revenuePerRepMultiplier from unlocked revenue-1m achievement to sales hire', () => {
    const state = {
      ...createInitialState('cto'),
      achievements: getInitialAchievements().map(a =>
        a.id === 'revenue-1m' ? { ...a, unlocked: true } : a
      ),
    };
    // revenue-1m bonus: revenuePerRepMultiplier = 1.1
    const delta = computeHireDelta('sales', state);
    expect(delta.revenue).toBe(5_000 * 1.1);
  });
});
