# DeepBrain AI

**A turn-based AI startup simulation powered by Claude.**

You are an executive at a cutting-edge AI company racing to build the world's first AGI. Manage your runway, grow your team, respond to live AI-generated events, and push your research to 100% — before the money runs out.

---

## What Is This?

DeepBrain AI is a strategic management game where every decision matters. Each turn, Claude generates a unique headline event tailored to your company's situation. You choose how to respond, weigh the tradeoffs, hire staff, fund research, and inch closer to the AGI breakthrough — or crash and burn trying.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and the **Anthropic SDK**.

---

## How to Play

### 1. Pick Your Role

Before the game starts, choose your executive role. Each role comes with a **passive bonus** that reshapes your entire strategy:

| Role | Bonus |
|---|---|
| **Head of Sales** | +20% revenue per sales rep, reps ramp 15% faster |
| **CTO** | +25% research speed, engineering hires cost 10% less |
| **CFO** | Double starting cash, 15% lower burn rate |
| **Head of Research** | +30% AGI progress per milestone, higher compute costs |
| **Growth Hacker** | +25% user acquisition multiplier |

Your role is not cosmetic — it fundamentally changes which levers are most powerful and which strategy wins.

---

### 2. Run Your Company

The main dashboard shows your core metrics at a glance:

- **Cash** — your total funds. Hit zero and it's game over.
- **Burn Rate** — monthly operating costs. Grows as you hire.
- **Revenue** — monthly income from your sales team.
- **AGI Progress** — your path to victory. Reach 100% to win.
- **Research Points** — currency for unlocking research milestones.
- **Headcount** — engineers, sales reps, and operations staff.

Each turn, you earn research points passively and net the difference between revenue and burn rate against your cash.

---

### 3. Respond to Live Events

Every turn, **Claude generates a unique event** based on your company's state — a regulatory hearing, a competitor announcement, a viral press story, a key employee threatening to quit. Each event presents **two options** with different risk profiles and stat effects.

Choose carefully. Events can shift your cash, burn rate, revenue, research points, AGI progress, and headcount — in any direction.

---

### 4. Hire Your Team

Between turns, expand your company across three departments:

| Department | Hire Cost | Monthly Burn | Monthly Revenue |
|---|---|---|---|
| **Engineering** | $15,000 | +$12,000/mo | — |
| **Sales** | $10,000 | +$8,000/mo | +$5,000/mo |
| **Operations** | $8,000 | +$6,000/mo | — |

Engineers accelerate your research output. Sales reps generate direct revenue. Operations staff keep things running. Your role bonuses modify these numbers — a CTO pays only $13,500 per engineer, while a Head of Sales earns $6,000/mo from each rep instead of $5,000.

---

### 5. Complete Research Milestones

Spend your research points to unlock breakthrough milestones on the path to AGI:

| Milestone | Cost | AGI Bonus |
|---|---|---|
| GPT-2 Class Model | 10 pts | +5% |
| GPT-3 Class Model | 25 pts | +12% |
| GPT-4 Class Model | 50 pts | +20% |
| Reasoning Engine | 80 pts | +25% |
| AGI Prototype | 120 pts | +38% |

Milestones unlock sequentially — you must complete each one before the next becomes available. Role bonuses and achievement bonuses multiply the AGI progress you gain per milestone.

---

### 6. Unlock Achievements

Hit key company milestones to earn **permanent stat bonuses** that stack for the rest of the run:

| Achievement | Condition | Bonus |
|---|---|---|
| **$1M Revenue** | $1M annual run rate | +10% revenue per rep |
| **10 Engineers** | 10 engineers on staff | +10% research speed |
| **12-Month Runway** | 12+ months of cash remaining | −5% burn rate |
| **First Breakthrough** | Complete GPT-2 class model | +10% AGI progress multiplier |
| **Sales Army** | 5+ sales reps hired | +10% user acquisition |

Achievement bonuses compound with your role bonuses, creating powerful synergies as you progress.

---

## Win & Lose Conditions

- **Win:** Push AGI Progress to 100%.
- **Lose:** Run out of cash.

The tension is real — advancing research burns money while your team costs grow. Every hire is a tradeoff. Every event is a test of priorities.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **AI Events:** Anthropic SDK — `claude-haiku-4-5-20251001`
- **State:** React Context + localStorage (game persists on refresh)
- **Testing:** Jest 30 — 79 tests across 13 suites

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
git clone https://github.com/mshepsss/deepbrain-ai
cd deepbrain-ai
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Run Tests

```bash
npm test
```

---

## Project Structure

```
app/
  page.tsx           # Role selection screen
  game/page.tsx      # Main game screen
  api/events/        # Claude API route (event generation)
lib/
  types.ts           # Core game types
  gameEngine.ts      # State logic (turns, hiring, milestones)
  roles.ts           # Role definitions and bonuses
  milestones.ts      # Research milestone data
  achievements.ts    # Achievement conditions and bonuses
context/
  GameContext.tsx    # Global state with React Context + reducer
```

---

## License

MIT
