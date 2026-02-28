// lib/types.ts

export type RoleId =
  | 'head-of-sales'
  | 'cto'
  | 'cfo'
  | 'head-of-research'
  | 'growth-hacker';

export interface StatModifier {
  revenuePerRepMultiplier?: number;
  repRampTimeMultiplier?: number;
  researchSpeedMultiplier?: number;
  engineeringHireCostMultiplier?: number;
  startingCashMultiplier?: number;
  burnRateMultiplier?: number;
  agiProgressMultiplier?: number;
  computeCostMultiplier?: number;
  userAcquisitionMultiplier?: number;
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  condition: (state: GameState) => boolean;
  bonus: StatModifier;
}

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  passiveBonus: StatModifier;
  achievementPath: string;
}

export type Department = 'engineering' | 'sales' | 'operations';

export interface Headcount {
  engineering: number;
  sales: number;
  operations: number;
}

export interface BudgetAllocation {
  rd: number;
  sales: number;
  compute: number;
  ops: number;
}

export type DecisionType = 'hire' | 'budget' | 'research';

export interface HireDecision {
  type: 'hire';
  department: Department;
}

export interface BudgetDecision {
  type: 'budget';
  allocation: BudgetAllocation;
}

export interface ResearchDecision {
  type: 'research';
  milestoneId: string;
}

export type Decision = HireDecision | BudgetDecision | ResearchDecision;

export interface StatDelta {
  cash?: number;
  burnRate?: number;
  revenue?: number;
  agiProgress?: number;
  researchPoints?: number;
}

export interface EventOption {
  label: string;
  effect: StatDelta;
  risk: string;
}

export interface GameEvent {
  headline: string;
  flavourText: string;
  options: EventOption[];
}

export interface ResearchMilestone {
  id: string;
  name: string;
  description: string;
  cost: number;
  agiBonus: number;
  unlocked: boolean;
  completed: boolean;
}

export type GamePhase = 'role-select' | 'playing' | 'won' | 'lost';

export interface GameState {
  phase: GamePhase;
  month: number;
  cash: number;
  burnRate: number;
  revenue: number;
  agiProgress: number;
  researchPoints: number;
  headcount: Headcount;
  budgetAllocation: BudgetAllocation;
  role: RoleId | null;
  achievements: Achievement[];
  milestones: ResearchMilestone[];
  currentEvent: GameEvent | null;
  pendingDecisions: Decision[];
}
