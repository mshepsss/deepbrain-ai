import type { GameState, StatDelta, RoleId, Department } from './types';
import { getRoleById } from './roles';
import { getInitialMilestones, RESEARCH_MILESTONES } from './milestones';
import { getInitialAchievements, getAchievementBonuses } from './achievements';

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
    role: roleId,
    achievements: getInitialAchievements(),
    milestones: getInitialMilestones(),
    currentEvent: null,
  };
};

export const applyEventChoice = (state: GameState, delta: StatDelta): GameState => ({
  ...state,
  cash: state.cash + (delta.cash ?? 0),
  burnRate: state.burnRate + (delta.burnRate ?? 0),
  revenue: state.revenue + (delta.revenue ?? 0),
  agiProgress: Math.min(100, state.agiProgress + (delta.agiProgress ?? 0)),
  researchPoints: state.researchPoints + (delta.researchPoints ?? 0),
  headcount: delta.headcount ? {
    engineering: state.headcount.engineering + (delta.headcount.engineering ?? 0),
    sales: state.headcount.sales + (delta.headcount.sales ?? 0),
    operations: state.headcount.operations + (delta.headcount.operations ?? 0),
  } : state.headcount,
});

export const processTurnEnd = (state: GameState): GameState => {
  const role = state.role ? getRoleById(state.role) : null;
  const achievementBonuses = getAchievementBonuses(state.achievements);
  const researchMultiplier =
    (role?.passiveBonus.researchSpeedMultiplier ?? 1) *
    (achievementBonuses.researchSpeedMultiplier ?? 1);
  const burnMultiplier = achievementBonuses.burnRateMultiplier ?? 1;

  return {
    ...state,
    month: state.month + 1,
    cash: state.cash + state.revenue - state.burnRate * burnMultiplier,
    researchPoints: state.researchPoints + RESEARCH_POINTS_PER_TURN * researchMultiplier,
    currentEvent: null,
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
  const achievementBonuses = getAchievementBonuses(state.achievements);
  const agiMultiplier =
    (role?.passiveBonus.agiProgressMultiplier ?? 1) *
    (achievementBonuses.agiProgressMultiplier ?? 1);

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

const BASE_HIRE_COSTS: Record<Department, number> = {
  engineering: 15_000,
  sales: 10_000,
  operations: 8_000,
};
const BASE_HIRE_REVENUE: Record<Department, number> = {
  engineering: 0,
  sales: 5_000,
  operations: 0,
};
const BASE_BURN_INCREASE: Record<Department, number> = {
  engineering: 12_000,
  sales: 8_000,
  operations: 6_000,
};

export const computeHireDelta = (dept: Department, state: GameState): StatDelta => {
  const role = state.role ? getRoleById(state.role) : null;
  const achievementBonuses = getAchievementBonuses(state.achievements);

  let hireCost = BASE_HIRE_COSTS[dept];
  if (dept === 'engineering') {
    hireCost *= (role?.passiveBonus.engineeringHireCostMultiplier ?? 1);
  }

  let revenueGain = BASE_HIRE_REVENUE[dept];
  if (dept === 'sales') {
    revenueGain *=
      (role?.passiveBonus.revenuePerRepMultiplier ?? 1) *
      (achievementBonuses.revenuePerRepMultiplier ?? 1);
  }

  return {
    cash: -hireCost,
    burnRate: BASE_BURN_INCREASE[dept],
    revenue: revenueGain,
    headcount: {
      engineering: dept === 'engineering' ? 1 : 0,
      sales: dept === 'sales' ? 1 : 0,
      operations: dept === 'operations' ? 1 : 0,
    },
  };
};
