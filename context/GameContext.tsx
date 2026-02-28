'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, RoleId, StatDelta } from '@/lib/types';
import { createInitialState, applyEventChoice, processTurnEnd, checkWinLose } from '@/lib/gameEngine';

const STORAGE_KEY = 'deepbrain-ai-state';

const defaultState: GameState = {
  phase: 'role-select',
  month: 1,
  cash: 0,
  burnRate: 0,
  revenue: 0,
  agiProgress: 0,
  researchPoints: 0,
  headcount: { engineering: 0, sales: 0, operations: 0 },
  budgetAllocation: { rd: 40, sales: 20, compute: 30, ops: 10 },
  role: null,
  achievements: [],
  milestones: [],
  currentEvent: null,
  pendingDecisions: [],
};

type Action =
  | { type: 'START_GAME'; role: RoleId }
  | { type: 'APPLY_EVENT_CHOICE'; delta: StatDelta }
  | { type: 'END_TURN' }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'RESET' };

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.role);
    case 'APPLY_EVENT_CHOICE': {
      const next = applyEventChoice(state, action.delta);
      const result = checkWinLose(next);
      return { ...next, phase: result === 'continue' ? 'playing' : result };
    }
    case 'END_TURN': {
      const next = processTurnEnd(state);
      const result = checkWinLose(next);
      return { ...next, phase: result === 'continue' ? 'playing' : result };
    }
    case 'LOAD_STATE':
      return action.state;
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
};

interface GameContextValue {
  state: GameState;
  startGame: (role: RoleId) => void;
  applyChoice: (delta: StatDelta) => void;
  endTurn: () => void;
  reset: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        dispatch({ type: 'LOAD_STATE', state: JSON.parse(saved) });
      } catch {
        // ignore corrupt state
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{
      state,
      startGame: (role) => dispatch({ type: 'START_GAME', role }),
      applyChoice: (delta) => dispatch({ type: 'APPLY_EVENT_CHOICE', delta }),
      endTurn: () => dispatch({ type: 'END_TURN' }),
      reset: () => dispatch({ type: 'RESET' }),
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
