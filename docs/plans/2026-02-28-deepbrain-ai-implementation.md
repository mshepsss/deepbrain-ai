# DeepBrain AI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a turn-based web sim game where the player races to build AGI before running out of money, powered by Claude-generated AI industry events.

**Architecture:** Next.js app router with React + Tailwind for UI, a server-side API route for Claude calls, React Context + localStorage for game state, and pure TypeScript functions for all game logic.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, Anthropic SDK (`@anthropic-ai/sdk`), Jest + React Testing Library

---

## Task 1: Scaffold Next.js into existing project

**Files:**
- Modify: `package.json`
- Create: `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `app/layout.tsx`, `app/globals.css`
- Modify: `tsconfig.json`
- Create: `.gitignore`

**Step 1: Replace existing scaffold with Next.js**

```bash
cd /c/Users/Matt/deepbrain-ai
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

When prompted about existing files, overwrite `package.json`, `tsconfig.json`, and `README.md`.

**Step 2: Re-install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

**Step 3: Create `.env.local` with API key placeholder**

```bash
echo "ANTHROPIC_API_KEY=" > .env.local
```

**Step 4: Update `.gitignore` to protect secrets**

Add to `.gitignore`:
```
.env.local
.env
```

**Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000`, default Next.js page loads.

**Step 6: Commit**

```bash
git add -A
git commit -m "scaffold next.js with tailwind"
```

---

## Task 2: Define TypeScript types

**Files:**
- Create: `lib/types.ts`

**Step 1: Write the types file**

```typescript
// lib/types.ts

export type RoleId =
  | 'head-of-sales'
  | 'cto'
  | 'cfo'
  | 'head-of-research'
  | 'growth-hacker';

export interface StatModifier {
  revenuPerRepMultiplier?: number;    // e.g. 1.2 = +20%
  repRampTimeMultiplier?: number;     // e.g. 0.85 = -15%
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
  achievementPath: string; // description of achievement arc
}

export type Department = 'engineering' | 'sales' | 'operations';

export interface Headcount {
  engineering: number;
  sales: number;
  operations: number;
}

export interface BudgetAllocation {
  rd: number;       // % to R&D → research points
  sales: number;    // % to Sales → revenue
  compute: number;  // % to Compute → AGI speed
  ops: number;      // % to Ops → burn reduction
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
  cost: number;        // research points
  agiBonus: number;   // AGI progress awarded
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
  agiProgress: number;       // 0–100
  researchPoints: number;
  headcount: Headcount;
  budgetAllocation: BudgetAllocation;
  role: RoleId | null;
  achievements: Achievement[];
  milestones: ResearchMilestone[];
  currentEvent: GameEvent | null;
  pendingDecisions: Decision[];
}
```

**Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "add typescript types"
```

---

## Task 3: Set up Jest

**Files:**
- Create: `jest.config.ts`, `jest.setup.ts`
- Modify: `package.json`

**Step 1: Install Jest dependencies**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

**Step 2: Create `jest.config.ts`**

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
};

export default createJestConfig(config);
```

**Step 3: Create `jest.setup.ts`**

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';
```

**Step 4: Add test script to `package.json`**

In `package.json`, add to `scripts`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

**Step 5: Write a smoke test to verify setup**

Create `__tests__/smoke.test.ts`:
```typescript
describe('jest setup', () => {
  it('runs', () => {
    expect(true).toBe(true);
  });
});
```

**Step 6: Run test to verify it passes**

```bash
npm test -- --testPathPattern=smoke
```

Expected: PASS

**Step 7: Commit**

```bash
git add jest.config.ts jest.setup.ts __tests__/smoke.test.ts package.json
git commit -m "add jest test setup"
```

---

## Task 4: Implement roles data

**Files:**
- Create: `lib/roles.ts`
- Create: `__tests__/lib/roles.test.ts`

**Step 1: Write the failing test**

Create `__tests__/lib/roles.test.ts`:
```typescript
import { getRoleById, ALL_ROLES } from '@/lib/roles';

describe('roles', () => {
  it('has 5 roles', () => {
    expect(ALL_ROLES).toHaveLength(5);
  });

  it('finds role by id', () => {
    const role = getRoleById('cto');
    expect(role.name).toBe('CTO');
  });

  it('cto has research speed bonus', () => {
    const role = getRoleById('cto');
    expect(role.passiveBonus.researchSpeedMultiplier).toBe(1.25);
  });

  it('cfo has starting cash multiplier', () => {
    const role = getRoleById('cfo');
    expect(role.passiveBonus.startingCashMultiplier).toBe(2);
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=roles
```

Expected: FAIL — "Cannot find module '@/lib/roles'"

**Step 3: Implement `lib/roles.ts`**

```typescript
// lib/roles.ts
import type { Role, RoleId } from './types';

export const ALL_ROLES: Role[] = [
  {
    id: 'head-of-sales',
    name: 'Head of Sales',
    description: 'Revenue-focused leader who scales the sales org fast.',
    passiveBonus: {
      revenuPerRepMultiplier: 1.2,
      repRampTimeMultiplier: 0.85,
    },
    achievementPath: 'Revenue milestones unlock enterprise deals',
  },
  {
    id: 'cto',
    name: 'CTO',
    description: 'Technical visionary who ships research breakthroughs faster.',
    passiveBonus: {
      researchSpeedMultiplier: 1.25,
      engineeringHireCostMultiplier: 0.9,
    },
    achievementPath: 'Hiring milestones unlock senior engineer tier',
  },
  {
    id: 'cfo',
    name: 'CFO',
    description: 'Financial operator who extends runway and controls burn.',
    passiveBonus: {
      startingCashMultiplier: 2,
      burnRateMultiplier: 0.85,
    },
    achievementPath: 'Runway milestones unlock investor relations events',
  },
  {
    id: 'head-of-research',
    name: 'Head of Research',
    description: 'AGI-obsessed researcher who pushes progress faster at higher cost.',
    passiveBonus: {
      agiProgressMultiplier: 1.3,
      computeCostMultiplier: 1.1,
    },
    achievementPath: 'Research milestones unlock breakthrough events',
  },
  {
    id: 'growth-hacker',
    name: 'Growth Hacker',
    description: 'Viral marketing expert who acquires users and press fast.',
    passiveBonus: {
      userAcquisitionMultiplier: 1.25,
    },
    achievementPath: 'User milestones unlock press coverage bonuses',
  },
];

export const getRoleById = (id: RoleId): Role => {
  const role = ALL_ROLES.find(r => r.id === id);
  if (!role) throw new Error(`Unknown role: ${id}`);
  return role;
};
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=roles
```

Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add lib/roles.ts __tests__/lib/roles.test.ts
git commit -m "add roles data"
```

---

## Task 5: Implement game engine

**Files:**
- Create: `lib/gameEngine.ts`
- Create: `lib/milestones.ts`
- Create: `__tests__/lib/gameEngine.test.ts`

**Step 1: Create `lib/milestones.ts`**

```typescript
// lib/milestones.ts
import type { ResearchMilestone } from './types';

export const RESEARCH_MILESTONES: Omit<ResearchMilestone, 'unlocked' | 'completed'>[] = [
  { id: 'gpt2-class', name: 'GPT-2 Class Model', description: 'Train your first language model', cost: 10, agiBonus: 5 },
  { id: 'gpt3-class', name: 'GPT-3 Class Model', description: 'Scale to billions of parameters', cost: 25, agiBonus: 12 },
  { id: 'gpt4-class', name: 'GPT-4 Class Model', description: 'Near-human reasoning capability', cost: 50, agiBonus: 20 },
  { id: 'reasoning-engine', name: 'Reasoning Engine', description: 'Chain-of-thought planning at scale', cost: 80, agiBonus: 25 },
  { id: 'agi-prototype', name: 'AGI Prototype', description: 'The final breakthrough', cost: 120, agiBonus: 38 },
];

export const getInitialMilestones = (): ResearchMilestone[] =>
  RESEARCH_MILESTONES.map((m, i) => ({
    ...m,
    unlocked: i === 0,
    completed: false,
  }));
```

**Step 2: Write failing tests**

Create `__tests__/lib/gameEngine.test.ts`:
```typescript
import {
  createInitialState,
  applyEventChoice,
  processTurnEnd,
  checkWinLose,
  applyResearchMilestone,
} from '@/lib/gameEngine';
import type { GameState, StatDelta } from '@/lib/types';

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
});

describe('applyEventChoice', () => {
  it('applies stat delta to state', () => {
    const state = createInitialState('cto');
    const delta: StatDelta = { cash: -100_000, agiProgress: 5 };
    const next = applyEventChoice(state, delta);
    expect(next.cash).toBe(state.cash - 100_000);
    expect(next.agiProgress).toBe(5);
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

  it('cfo burn rate multiplier reduces burn', () => {
    const state = createInitialState('cfo');
    expect(state.burnRate).toBeLessThan(200_000);
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
});
```

**Step 3: Run to verify they fail**

```bash
npm test -- --testPathPattern=gameEngine
```

Expected: FAIL — "Cannot find module '@/lib/gameEngine'"

**Step 4: Implement `lib/gameEngine.ts`**

```typescript
// lib/gameEngine.ts
import type { GameState, StatDelta, RoleId } from './types';
import { getRoleById } from './roles';
import { getInitialMilestones, RESEARCH_MILESTONES } from './milestones';

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
    achievements: [],
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
```

**Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=gameEngine
```

Expected: PASS (all tests)

**Step 6: Commit**

```bash
git add lib/gameEngine.ts lib/milestones.ts __tests__/lib/gameEngine.test.ts
git commit -m "add game engine logic"
```

---

## Task 6: Implement Claude API route

**Files:**
- Create: `app/api/events/route.ts`
- Create: `__tests__/api/events.test.ts`

**Step 1: Write the failing test**

Create `__tests__/api/events.test.ts`:
```typescript
import { POST } from '@/app/api/events/route';
import { NextRequest } from 'next/server';

jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            headline: 'OpenAI releases GPT-5',
            flavourText: 'The industry reacts to a major capability jump.',
            options: [
              { label: 'Accelerate compute spend', effect: { cash: -200000, agiProgress: 8 }, risk: 'High burn' },
              { label: 'Stay the course', effect: { cash: 0, agiProgress: 2 }, risk: 'Lose ground' },
            ],
          }),
        }],
      }),
    },
  })),
}));

describe('POST /api/events', () => {
  it('returns a game event with headline and options', async () => {
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ month: 3, cash: 4000000, agiProgress: 10, headcount: 5, role: 'cto' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.headline).toBe('OpenAI releases GPT-5');
    expect(data.options).toHaveLength(2);
    expect(data.options[0].effect).toBeDefined();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=events
```

Expected: FAIL — "Cannot find module '@/app/api/events/route'"

**Step 3: Implement `app/api/events/route.ts`**

```typescript
// app/api/events/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an AI game master for a business simulation game about running an AI company.
Generate realistic in-game events based on plausible real-world AI industry developments.
Scale event financial impact to the game month: early months (1-6) = small stakes ($50k-$200k),
late months (18+) = high stakes ($500k-$2M).
Always respond with valid JSON matching exactly this schema:
{
  "headline": "string (news headline, max 80 chars)",
  "flavourText": "string (1-2 sentences of narrative context)",
  "options": [
    {
      "label": "string (action label, max 40 chars)",
      "effect": { "cash": number, "burnRate": number, "revenue": number, "agiProgress": number, "researchPoints": number },
      "risk": "string (one short phrase describing the downside)"
    }
  ]
}
Provide 2-3 options. All effect fields are optional (omit zeros).`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, cash, agiProgress, headcount, role } = body;

  const userPrompt = `Game state: Month ${month}, Cash $${(cash / 1_000_000).toFixed(1)}M, AGI Progress ${agiProgress}%, Headcount ${headcount}, Player role: ${role}. Generate the next industry event.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const event = JSON.parse(text);

  return NextResponse.json(event);
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=events
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/events/route.ts __tests__/api/events.test.ts
git commit -m "add claude events api route"
```

---

## Task 7: Implement React Context + localStorage

**Files:**
- Create: `context/GameContext.tsx`
- Create: `__tests__/context/GameContext.test.tsx`

**Step 1: Write failing tests**

Create `__tests__/context/GameContext.test.tsx`:
```typescript
import { render, screen, act } from '@testing-library/react';
import { GameProvider, useGame } from '@/context/GameContext';

const TestConsumer = () => {
  const { state, startGame } = useGame();
  return (
    <div>
      <span data-testid="phase">{state.phase}</span>
      <button onClick={() => startGame('cto')}>Start</button>
    </div>
  );
};

describe('GameContext', () => {
  it('starts in role-select phase', () => {
    render(<GameProvider><TestConsumer /></GameProvider>);
    expect(screen.getByTestId('phase')).toHaveTextContent('role-select');
  });

  it('transitions to playing after startGame', () => {
    render(<GameProvider><TestConsumer /></GameProvider>);
    act(() => { screen.getByText('Start').click(); });
    expect(screen.getByTestId('phase')).toHaveTextContent('playing');
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=GameContext
```

Expected: FAIL

**Step 3: Implement `context/GameContext.tsx`**

```typescript
// context/GameContext.tsx
'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { GameState, RoleId, StatDelta, Decision } from '@/lib/types';
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
      try { dispatch({ type: 'LOAD_STATE', state: JSON.parse(saved) }); }
      catch { /* ignore corrupt state */ }
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
```

**Step 4: Wrap the app in `app/layout.tsx`**

Add `GameProvider` to the root layout:
```typescript
// app/layout.tsx — add GameProvider import and wrap children
import { GameProvider } from '@/context/GameContext';

// Inside the body:
<GameProvider>{children}</GameProvider>
```

**Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=GameContext
```

Expected: PASS

**Step 6: Commit**

```bash
git add context/GameContext.tsx app/layout.tsx __tests__/context/GameContext.test.tsx
git commit -m "add game context and state management"
```

---

## Task 8: Build ProgressBar component

**Files:**
- Create: `components/ProgressBar.tsx`
- Create: `__tests__/components/ProgressBar.test.tsx`

**Step 1: Write failing test**

```typescript
// __tests__/components/ProgressBar.test.tsx
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders label and percentage', () => {
    render(<ProgressBar label="AGI Progress" value={67} max={100} />);
    expect(screen.getByText('AGI Progress')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('bar width reflects value', () => {
    const { container } = render(<ProgressBar label="AGI Progress" value={50} max={100} />);
    const bar = container.querySelector('[data-testid="progress-fill"]');
    expect(bar).toHaveStyle({ width: '50%' });
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=ProgressBar
```

**Step 3: Implement `components/ProgressBar.tsx`**

```typescript
// components/ProgressBar.tsx
interface Props {
  label: string;
  value: number;
  max: number;
  colorClass?: string;
}

export const ProgressBar = ({ label, value, max, colorClass = 'bg-indigo-500' }: Props) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200">
        <div
          data-testid="progress-fill"
          className={`h-3 rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=ProgressBar
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/ProgressBar.tsx __tests__/components/ProgressBar.test.tsx
git commit -m "add progress bar component"
```

---

## Task 9: Build Dashboard component

**Files:**
- Create: `components/Dashboard.tsx`
- Create: `__tests__/components/Dashboard.test.tsx`

**Step 1: Write failing test**

```typescript
// __tests__/components/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';

const mockState = {
  cash: 2_100_000,
  burnRate: 180_000,
  revenue: 95_000,
  agiProgress: 67,
  researchPoints: 22,
  month: 14,
  headcount: { engineering: 4, sales: 2, operations: 1 },
};

describe('Dashboard', () => {
  it('displays cash in millions', () => {
    render(<Dashboard {...mockState} />);
    expect(screen.getByText(/\$2\.1M/)).toBeInTheDocument();
  });

  it('shows amber warning when runway < 3 months', () => {
    const lowCash = { ...mockState, cash: 300_000 };  // < 3 * 180k
    const { container } = render(<Dashboard {...lowCash} />);
    expect(container.querySelector('.text-amber-600')).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=Dashboard
```

**Step 3: Implement `components/Dashboard.tsx`**

```typescript
// components/Dashboard.tsx
import { ProgressBar } from './ProgressBar';

interface Props {
  cash: number;
  burnRate: number;
  revenue: number;
  agiProgress: number;
  researchPoints: number;
  month: number;
  headcount: { engineering: number; sales: number; operations: number };
}

const fmt = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
};

export const Dashboard = ({ cash, burnRate, revenue, agiProgress, researchPoints, month, headcount }: Props) => {
  const runway = burnRate > 0 ? cash / burnRate : Infinity;
  const isLowRunway = runway < 3;
  const netBurn = burnRate - revenue;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Company Stats</h2>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Cash</span>
          <span className={`text-sm font-semibold ${isLowRunway ? 'text-amber-600' : 'text-slate-900'}`}>
            {fmt(cash)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Monthly burn</span>
          <span className="text-sm font-medium text-slate-700">{fmt(burnRate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Revenue</span>
          <span className="text-sm font-medium text-slate-700">{fmt(revenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Net</span>
          <span className={`text-sm font-medium ${netBurn > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {netBurn > 0 ? `-${fmt(netBurn)}` : `+${fmt(-netBurn)}`}/mo
          </span>
        </div>
      </div>

      <ProgressBar label="AGI Progress" value={agiProgress} max={100} />

      <div className="pt-1 space-y-1 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Research pts</span>
          <span className="font-medium text-slate-900">{researchPoints}</span>
        </div>
        <div className="flex justify-between">
          <span>Headcount</span>
          <span className="font-medium text-slate-900">
            {headcount.engineering + headcount.sales + headcount.operations}
          </span>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=Dashboard
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/Dashboard.tsx __tests__/components/Dashboard.test.tsx
git commit -m "add dashboard component"
```

---

## Task 10: Build EventCard component

**Files:**
- Create: `components/EventCard.tsx`
- Create: `__tests__/components/EventCard.test.tsx`

**Step 1: Write failing test**

```typescript
// __tests__/components/EventCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/EventCard';

const mockEvent = {
  headline: 'OpenAI releases GPT-5',
  flavourText: 'The industry scrambles to respond.',
  options: [
    { label: 'Double compute', effect: { cash: -500000, agiProgress: 8 }, risk: 'High burn' },
    { label: 'Stay the course', effect: { agiProgress: 2 }, risk: 'Lose ground' },
  ],
};

describe('EventCard', () => {
  it('renders headline', () => {
    render(<EventCard event={mockEvent} onChoose={jest.fn()} />);
    expect(screen.getByText('OpenAI releases GPT-5')).toBeInTheDocument();
  });

  it('calls onChoose with the correct effect when option clicked', () => {
    const onChoose = jest.fn();
    render(<EventCard event={mockEvent} onChoose={onChoose} />);
    fireEvent.click(screen.getByText('Double compute'));
    expect(onChoose).toHaveBeenCalledWith({ cash: -500000, agiProgress: 8 });
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=EventCard
```

**Step 3: Implement `components/EventCard.tsx`**

```typescript
// components/EventCard.tsx
import type { GameEvent, StatDelta } from '@/lib/types';

interface Props {
  event: GameEvent;
  onChoose: (effect: StatDelta) => void;
  disabled?: boolean;
}

export const EventCard = ({ event, onChoose, disabled = false }: Props) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">Breaking News</p>
      <h3 className="text-base font-semibold text-slate-900">{event.headline}</h3>
      <p className="text-sm text-slate-500 mt-1">{event.flavourText}</p>
    </div>
    <div className="space-y-2">
      {event.options.map((opt, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onChoose(opt.effect)}
          className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          <p className="text-sm font-medium text-slate-900">{opt.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">Risk: {opt.risk}</p>
        </button>
      ))}
    </div>
  </div>
);
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=EventCard
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/EventCard.tsx __tests__/components/EventCard.test.tsx
git commit -m "add event card component"
```

---

## Task 11: Build DecisionPanel component

**Files:**
- Create: `components/DecisionPanel.tsx`
- Create: `__tests__/components/DecisionPanel.test.tsx`

**Step 1: Write failing test**

```typescript
// __tests__/components/DecisionPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DecisionPanel } from '@/components/DecisionPanel';
import type { ResearchMilestone } from '@/lib/types';

const mockMilestones: ResearchMilestone[] = [
  { id: 'gpt2-class', name: 'GPT-2 Class Model', description: 'First model', cost: 10, agiBonus: 5, unlocked: true, completed: false },
];

describe('DecisionPanel', () => {
  it('renders hire buttons for all departments', () => {
    render(
      <DecisionPanel
        researchPoints={15}
        milestones={mockMilestones}
        onHire={jest.fn()}
        onResearch={jest.fn()}
        onEndTurn={jest.fn()}
        decisionsMade={0}
      />
    );
    expect(screen.getByText(/engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/sales/i)).toBeInTheDocument();
    expect(screen.getByText(/operations/i)).toBeInTheDocument();
  });

  it('calls onEndTurn when End Month is clicked', () => {
    const onEndTurn = jest.fn();
    render(
      <DecisionPanel
        researchPoints={15}
        milestones={mockMilestones}
        onHire={jest.fn()}
        onResearch={jest.fn()}
        onEndTurn={onEndTurn}
        decisionsMade={0}
      />
    );
    fireEvent.click(screen.getByText(/end month/i));
    expect(onEndTurn).toHaveBeenCalled();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern=DecisionPanel
```

**Step 3: Implement `components/DecisionPanel.tsx`**

```typescript
// components/DecisionPanel.tsx
import type { Department, ResearchMilestone } from '@/lib/types';

interface Props {
  researchPoints: number;
  milestones: ResearchMilestone[];
  onHire: (dept: Department) => void;
  onResearch: (milestoneId: string) => void;
  onEndTurn: () => void;
  decisionsMade: number;
}

const MAX_DECISIONS = 3;

export const DecisionPanel = ({ researchPoints, milestones, onHire, onResearch, onEndTurn, decisionsMade }: Props) => {
  const atLimit = decisionsMade >= MAX_DECISIONS;
  const availableMilestone = milestones.find(m => m.unlocked && !m.completed);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Decisions</h2>
        <span className="text-xs text-slate-400">{decisionsMade}/{MAX_DECISIONS} used</span>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Hire</p>
        <div className="grid grid-cols-3 gap-2">
          {(['engineering', 'sales', 'operations'] as Department[]).map(dept => (
            <button
              key={dept}
              disabled={atLimit}
              onClick={() => onHire(dept)}
              className="rounded-lg border border-slate-200 py-2 px-3 text-xs font-medium text-slate-700 capitalize hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-40"
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {availableMilestone && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Research ({researchPoints} pts)</p>
          <button
            disabled={atLimit || researchPoints < availableMilestone.cost}
            onClick={() => onResearch(availableMilestone.id)}
            className="w-full rounded-lg border border-slate-200 py-2 px-3 text-left hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-40"
          >
            <p className="text-xs font-medium text-slate-900">{availableMilestone.name}</p>
            <p className="text-xs text-slate-400">Cost: {availableMilestone.cost} pts · +{availableMilestone.agiBonus}% AGI</p>
          </button>
        </div>
      )}

      <button
        onClick={onEndTurn}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        End Month →
      </button>
    </div>
  );
};
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=DecisionPanel
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/DecisionPanel.tsx __tests__/components/DecisionPanel.test.tsx
git commit -m "add decision panel component"
```

---

## Task 12: Build Achievements component

**Files:**
- Create: `lib/achievements.ts`
- Create: `components/AchievementsList.tsx`
- Create: `__tests__/components/AchievementsList.test.tsx`

**Step 1: Create `lib/achievements.ts`**

```typescript
// lib/achievements.ts
import type { Achievement, GameState } from './types';

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  // Head of Sales path
  {
    id: 'revenue-1m',
    label: '$1M Revenue',
    description: 'Hit $1M cumulative revenue',
    condition: (s: GameState) => s.revenue >= 83_333,  // ~$1M/yr
    bonus: { revenuPerRepMultiplier: 1.1 },
  },
  // CTO path
  {
    id: 'team-10-engineers',
    label: '10 Engineers',
    description: 'Build a team of 10 engineers',
    condition: (s: GameState) => s.headcount.engineering >= 10,
    bonus: { researchSpeedMultiplier: 1.1 },
  },
  // CFO path
  {
    id: 'runway-12m',
    label: '12-Month Runway',
    description: 'Maintain 12 months of runway',
    condition: (s: GameState) => s.burnRate > 0 && s.cash / s.burnRate >= 12,
    bonus: { burnRateMultiplier: 0.95 },
  },
  // Head of Research path
  {
    id: 'first-milestone',
    label: 'First Breakthrough',
    description: 'Complete the GPT-2 class milestone',
    condition: (s: GameState) => s.milestones.find(m => m.id === 'gpt2-class')?.completed ?? false,
    bonus: { agiProgressMultiplier: 1.1 },
  },
  // Growth Hacker path
  {
    id: 'sales-team-5',
    label: 'Sales Army',
    description: 'Hire 5 sales reps',
    condition: (s: GameState) => s.headcount.sales >= 5,
    bonus: { userAcquisitionMultiplier: 1.1 },
  },
];

export const checkAchievements = (state: GameState): GameState => {
  const updatedAchievements = state.achievements.map(a =>
    !a.unlocked && a.condition(state) ? { ...a, unlocked: true } : a
  );
  return { ...state, achievements: updatedAchievements };
};

export const getInitialAchievements = (): Achievement[] =>
  ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));
```

**Step 2: Write failing test**

```typescript
// __tests__/components/AchievementsList.test.tsx
import { render, screen } from '@testing-library/react';
import { AchievementsList } from '@/components/AchievementsList';
import { getInitialAchievements } from '@/lib/achievements';

describe('AchievementsList', () => {
  it('shows locked achievements with circle icon', () => {
    const achievements = getInitialAchievements();
    render(<AchievementsList achievements={achievements} />);
    expect(screen.getByText('$1M Revenue')).toBeInTheDocument();
  });

  it('shows unlocked achievement with check', () => {
    const achievements = getInitialAchievements().map((a, i) =>
      i === 0 ? { ...a, unlocked: true } : a
    );
    const { container } = render(<AchievementsList achievements={achievements} />);
    expect(container.querySelector('[data-testid="unlocked-0"]')).toBeInTheDocument();
  });
});
```

**Step 3: Run to verify it fails**

```bash
npm test -- --testPathPattern=AchievementsList
```

**Step 4: Implement `components/AchievementsList.tsx`**

```typescript
// components/AchievementsList.tsx
import type { Achievement } from '@/lib/types';

interface Props {
  achievements: Achievement[];
}

export const AchievementsList = ({ achievements }: Props) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-3">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Achievements</h2>
    <ul className="space-y-2">
      {achievements.map((a, i) => (
        <li key={a.id} className="flex items-center gap-2">
          {a.unlocked
            ? <span data-testid={`unlocked-${i}`} className="text-indigo-500 text-sm">✓</span>
            : <span className="text-slate-300 text-sm">○</span>
          }
          <div>
            <p className={`text-xs font-medium ${a.unlocked ? 'text-slate-900' : 'text-slate-400'}`}>{a.label}</p>
            {a.unlocked && <p className="text-xs text-indigo-500">Bonus active</p>}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
```

**Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=AchievementsList
```

Expected: PASS

**Step 6: Update `createInitialState` in `lib/gameEngine.ts` to include achievements**

Modify the `createInitialState` function to import and use `getInitialAchievements`:
```typescript
import { getInitialAchievements } from './achievements';
// in createInitialState:
achievements: getInitialAchievements(),
```

**Step 7: Commit**

```bash
git add lib/achievements.ts components/AchievementsList.tsx __tests__/components/AchievementsList.test.tsx lib/gameEngine.ts
git commit -m "add achievements system"
```

---

## Task 13: Build Role Selection screen

**Files:**
- Modify: `app/page.tsx`
- Create: `__tests__/app/page.test.tsx`

**Step 1: Write failing test**

```typescript
// __tests__/app/page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '@/context/GameContext';
import RoleSelectPage from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('Role Selection', () => {
  it('renders all 5 role cards', () => {
    render(<GameProvider><RoleSelectPage /></GameProvider>);
    expect(screen.getByText('Head of Sales')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.getByText('CFO')).toBeInTheDocument();
    expect(screen.getByText('Head of Research')).toBeInTheDocument();
    expect(screen.getByText('Growth Hacker')).toBeInTheDocument();
  });

  it('Start Company button is disabled until a role is selected', () => {
    render(<GameProvider><RoleSelectPage /></GameProvider>);
    expect(screen.getByText('Select a role to begin')).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -- --testPathPattern="app/page"
```

**Step 3: Implement `app/page.tsx`**

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { ALL_ROLES } from '@/lib/roles';
import type { RoleId } from '@/lib/types';

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<RoleId | null>(null);
  const { startGame } = useGame();
  const router = useRouter();

  const handleStart = () => {
    if (!selected) return;
    startGame(selected);
    router.push('/game');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">DeepBrain AI</h1>
          <p className="text-slate-500 mt-2">Choose your starting role. Race to AGI before you run out of money.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`rounded-2xl p-5 text-left border-2 transition-all ${
                selected === role.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <h3 className="text-base font-semibold text-slate-900">{role.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{role.description}</p>
              <p className="text-xs text-indigo-500 mt-3">{role.achievementPath}</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            disabled={!selected}
            onClick={handleStart}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selected ? 'Start Company →' : 'Select a role to begin'}
          </button>
        </div>
      </div>
    </main>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="app/page"
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx __tests__/app/page.test.tsx
git commit -m "add role selection screen"
```

---

## Task 14: Build main game screen

**Files:**
- Create: `app/game/page.tsx`

**Step 1: Implement `app/game/page.tsx`**

This is the main game loop page — it wires all components together.

```typescript
// app/game/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Dashboard } from '@/components/Dashboard';
import { EventCard } from '@/components/EventCard';
import { DecisionPanel } from '@/components/DecisionPanel';
import { AchievementsList } from '@/components/AchievementsList';
import { applyResearchMilestone } from '@/lib/gameEngine';
import type { Department, GameEvent, StatDelta } from '@/lib/types';

export default function GamePage() {
  const { state, applyChoice, endTurn, reset } = useGame();
  const router = useRouter();
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [eventChosen, setEventChosen] = useState(false);
  const [decisionsMade, setDecisionsMade] = useState(0);
  const [loading, setLoading] = useState(false);

  // Redirect to role select if no role chosen
  useEffect(() => {
    if (state.phase === 'role-select') router.push('/');
  }, [state.phase, router]);

  // Fetch event at start of each month
  useEffect(() => {
    if (state.phase !== 'playing') return;
    setEventChosen(false);
    setDecisionsMade(0);
    setLoading(true);
    setEvent(null);

    const totalHeadcount = state.headcount.engineering + state.headcount.sales + state.headcount.operations;

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: state.month,
        cash: state.cash,
        agiProgress: state.agiProgress,
        headcount: totalHeadcount,
        role: state.role,
      }),
    })
      .then(r => r.json())
      .then(data => { setEvent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [state.month]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleEventChoice = (effect: StatDelta) => {
    applyChoice(effect);
    setEventChosen(true);
  };

  const handleHire = (dept: Department) => {
    const costs: Record<Department, number> = { engineering: 15_000, sales: 10_000, operations: 8_000 };
    const revenueGain: Record<Department, number> = { engineering: 0, sales: 5_000, operations: 0 };
    const burnIncrease: Record<Department, number> = { engineering: 12_000, sales: 8_000, operations: 6_000 };

    applyChoice({
      cash: -costs[dept],
      burnRate: burnIncrease[dept],
      revenue: revenueGain[dept],
    });
    setDecisionsMade(d => d + 1);
  };

  const handleResearch = (milestoneId: string) => {
    // Apply milestone directly via game engine helper
    // We dispatch by applying the resulting state delta manually
    const next = applyResearchMilestone(state, milestoneId);
    const delta: StatDelta = {
      agiProgress: next.agiProgress - state.agiProgress,
      researchPoints: next.researchPoints - state.researchPoints,
    };
    applyChoice(delta);
    setDecisionsMade(d => d + 1);
  };

  const handleEndTurn = () => {
    endTurn();
  };

  if (state.phase === 'won') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-4xl font-bold text-indigo-600">AGI Achieved!</h1>
          <p className="text-slate-500">You built artificial general intelligence in {state.month} months.</p>
          <button onClick={() => { reset(); router.push('/'); }} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            Play Again
          </button>
        </div>
      </main>
    );
  }

  if (state.phase === 'lost') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-4xl font-bold text-red-500">Out of Runway</h1>
          <p className="text-slate-500">Your company ran out of money after {state.month} months. AGI was {state.agiProgress}% complete.</p>
          <button onClick={() => { reset(); router.push('/'); }} className="rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition-colors">
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">DeepBrain AI</h1>
          <span className="text-sm text-slate-500">Month {state.month}</span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left: stats + achievements */}
          <div className="col-span-3 space-y-4">
            <Dashboard
              cash={state.cash}
              burnRate={state.burnRate}
              revenue={state.revenue}
              agiProgress={state.agiProgress}
              researchPoints={state.researchPoints}
              month={state.month}
              headcount={state.headcount}
            />
            <AchievementsList achievements={state.achievements} />
          </div>

          {/* Center: event */}
          <div className="col-span-5">
            {loading && (
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 text-sm text-slate-400 animate-pulse">
                Generating this month's event...
              </div>
            )}
            {event && (
              <EventCard
                event={event}
                onChoose={handleEventChoice}
                disabled={eventChosen}
              />
            )}
          </div>

          {/* Right: decisions */}
          <div className="col-span-4">
            <DecisionPanel
              researchPoints={state.researchPoints}
              milestones={state.milestones}
              onHire={handleHire}
              onResearch={handleResearch}
              onEndTurn={handleEndTurn}
              decisionsMade={decisionsMade}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Verify dev server runs with no type errors**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 3: Commit**

```bash
git add app/game/page.tsx
git commit -m "add main game screen"
```

---

## Task 15: Final polish and smoke test

**Step 1: Update `app/layout.tsx` with Soft Tech theme globals**

In `app/globals.css`, ensure Tailwind base is imported and set body defaults:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-slate-50 text-slate-900;
}
```

**Step 2: Add `.env.local` reminder check**

Verify `ANTHROPIC_API_KEY` is set in `.env.local` before testing the full flow manually:
```bash
grep -c "ANTHROPIC_API_KEY=" .env.local
```
Expected: output is `1` and the key has a value after `=`.

**Step 3: Run all tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 4: Manual smoke test**

```bash
npm run dev
```

1. Open `http://localhost:3000`
2. Select a role → click Start Company
3. Game screen loads, event fetches from Claude
4. Click an event option, make decisions, click End Month
5. Month increments, new event appears

**Step 5: Final commit**

```bash
git add -A
git commit -m "add global styles and finalize game"
git push origin main
```

---

## Summary

| Task | What it delivers |
|---|---|
| 1 | Next.js + Tailwind scaffold |
| 2 | All TypeScript types |
| 3 | Jest test setup |
| 4 | Role definitions |
| 5 | Game engine (turn logic, win/lose) |
| 6 | Claude API route |
| 7 | React Context + localStorage |
| 8 | ProgressBar component |
| 9 | Dashboard component |
| 10 | EventCard component |
| 11 | DecisionPanel component |
| 12 | Achievements system |
| 13 | Role selection screen |
| 14 | Main game screen |
| 15 | Polish + smoke test |
