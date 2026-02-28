import { createInitialState } from '@/lib/gameEngine';
import { checkAchievements } from '@/lib/achievements';
import { reducer } from '@/context/GameContext';

describe('smoke: full turn cycle', () => {
  it('plays a turn without throwing', () => {
    const state = createInitialState('cto');
    const afterChoice = reducer(state, { type: 'APPLY_EVENT_CHOICE', delta: { cash: -50_000, researchPoints: 3 } });
    const afterTurn = reducer(afterChoice, { type: 'END_TURN' });
    expect(afterTurn.month).toBe(2);
    expect(afterTurn.phase).toBe('playing');
  });

  it('checkAchievements does not throw on default state', () => {
    const state = createInitialState('cfo');
    expect(() => checkAchievements(state)).not.toThrow();
  });
});
