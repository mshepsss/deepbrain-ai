import {
  createInitialState,
  applyEventChoice,
  processTurnEnd,
  checkWinLose,
  applyResearchMilestone,
} from '@/lib/gameEngine';
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

  it('clears pendingDecisions', () => {
    const state = createInitialState('cto');
    const next = processTurnEnd(state);
    expect(next.pendingDecisions).toHaveLength(0);
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
