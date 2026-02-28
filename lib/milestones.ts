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
