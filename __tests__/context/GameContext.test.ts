import { reducer } from '@/context/GameContext';
import { createInitialState } from '@/lib/gameEngine';

describe('reducer END_TURN', () => {
  it('unlocks team-10-engineers achievement after turn when headcount >= 10', () => {
    const state = {
      ...createInitialState('cto'),
      headcount: { engineering: 10, sales: 0, operations: 0 },
    };
    const next = reducer(state, { type: 'END_TURN' });
    const ach = next.achievements.find(a => a.id === 'team-10-engineers');
    expect(ach?.unlocked).toBe(true);
  });

  it('unlocks runway-12m achievement when cash/burnRate >= 12 after turn deduction', () => {
    // Need cash high enough that after burnRate deduction, ratio is still >= 12
    // cash=2_600_000, burnRate=200_000 → after turn: 2_400_000/200_000 = 12 ✓
    const state = { ...createInitialState('cto'), cash: 2_600_000, burnRate: 200_000 };
    const next = reducer(state, { type: 'END_TURN' });
    const ach = next.achievements.find(a => a.id === 'runway-12m');
    expect(ach?.unlocked).toBe(true);
  });
});

describe('reducer APPLY_EVENT_CHOICE', () => {
  it('unlocks revenue-1m achievement when revenue reaches threshold after choice', () => {
    const state = createInitialState('cto');
    const next = reducer(state, { type: 'APPLY_EVENT_CHOICE', delta: { revenue: 83_333 } });
    const ach = next.achievements.find(a => a.id === 'revenue-1m');
    expect(ach?.unlocked).toBe(true);
  });
});

describe('reducer COMPLETE_MILESTONE', () => {
  it('marks the milestone completed in state', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = reducer(state, { type: 'COMPLETE_MILESTONE', milestoneId: 'gpt2-class' });
    const m = next.milestones.find(m => m.id === 'gpt2-class');
    expect(m?.completed).toBe(true);
  });

  it('unlocks the next milestone in state', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = reducer(state, { type: 'COMPLETE_MILESTONE', milestoneId: 'gpt2-class' });
    const m = next.milestones.find(m => m.id === 'gpt3-class');
    expect(m?.unlocked).toBe(true);
  });

  it('deducts research points and grants AGI progress', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = reducer(state, { type: 'COMPLETE_MILESTONE', milestoneId: 'gpt2-class' });
    expect(next.researchPoints).toBe(5);   // 15 - 10
    expect(next.agiProgress).toBe(5);      // gpt2 grants 5
  });

  it('unlocks first-milestone achievement after completing gpt2-class', () => {
    const state = { ...createInitialState('cto'), researchPoints: 15 };
    const next = reducer(state, { type: 'COMPLETE_MILESTONE', milestoneId: 'gpt2-class' });
    const ach = next.achievements.find(a => a.id === 'first-milestone');
    expect(ach?.unlocked).toBe(true);
  });
});
