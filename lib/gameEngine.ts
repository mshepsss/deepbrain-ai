import type { GameState, StatDelta, RoleId } from './types';
import { getRoleById } from './roles';
import { getInitialMilestones, RESEARCH_MILESTONES } from './milestones';
import { getInitialAchievements } from './achievements';

const BASE_CASH = 5_000_000;
const BASE_BURN = 200_000;
const BASE_REVENUE = 0;
const RESEARCH_POINTS_PER_TURN = 5;

export const createInitialState = (roleId: RoleId): GameState => {
  const role = getRoleById(roleId);
  const cashMultiplier = role.passiveBonus.startingCashMultiplier ?? 1;
  const burnMultiplier = role.passiveBonus.burnRateMultiplier ?? 1;

  return {
    phase: 'playing',
    month: 1,
    cash: BASE_CASH * cashMultiplier,
    burnRate: BASE_BURN * burnMultiplier,
    revenue: BASE_REVENUE,
    agiProgress: 0,
    researchPoints: 0,
    headcount: { engineering: 1, sales: 0, operations: 1 },
    budgetAllocation: { rd: 40, sales: 20, compute: 30, ops: 10 },
    role: roleId,
    achievements: getInitialAchievements(),
    milestones: getInitialMilestones(),
    currentEvent: null,
    pendingDecisions: [],
  };
};

export const applyEventChoice = (state: GameState, delta: StatDelta): GameState => ({
  ...state,
  cash: state.cash + (delta.cash ?? 0),
  burnRate: state.burnRate + (delta.burnRate ?? 0),
  revenue: state.revenue + (delta.revenue ?? 0),
  agiProgress: Math.min(100, state.agiProgress + (delta.agiProgress ?? 0)),
  researchPoints: state.researchPoints + (delta.researchPoints ?? 0),
});

export const processTurnEnd = (state: GameState): GameState => {
  const role = state.role ? getRoleById(state.role) : null;
  const researchMultiplier = role?.passiveBonus.researchSpeedMultiplier ?? 1;

  return {
    ...state,
    month: state.month + 1,
    cash: state.cash + state.revenue - state.burnRate,
    researchPoints: state.researchPoints + RESEARCH_POINTS_PER_TURN * researchMultiplier,
    currentEvent: null,
    pendingDecisions: [],
  };
};

export const checkWinLose = (state: GameState): 'won' | 'lost' | 'continue' => {
  if (state.agiProgress >= 100) return 'won';
  if (state.cash <= 0) return 'lost';
  return 'continue';
};

export const applyResearchMilestone = (state: GameState, milestoneId: string): GameState => {
  const milestoneData = RESEARCH_MILESTONES.find(m => m.id === milestoneId);
  if (!milestoneData) return state;

  const role = state.role ? getRoleById(state.role) : null;
  const agiMultiplier = role?.passiveBonus.agiProgressMultiplier ?? 1;

  const milestoneIndex = RESEARCH_MILESTONES.findIndex(m => m.id === milestoneId);
  const nextMilestoneId = RESEARCH_MILESTONES[milestoneIndex + 1]?.id;

  const updatedMilestones = state.milestones.map(m => {
    if (m.id === milestoneId) return { ...m, completed: true };
    if (m.id === nextMilestoneId) return { ...m, unlocked: true };
    return m;
  });

  return {
    ...state,
    researchPoints: state.researchPoints - milestoneData.cost,
    agiProgress: Math.min(100, state.agiProgress + milestoneData.agiBonus * agiMultiplier),
    milestones: updatedMilestones,
  };
};
