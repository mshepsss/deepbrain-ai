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
            <p className="text-xs text-slate-400">{`Cost: ${availableMilestone.cost} pts · +${availableMilestone.agiBonus}% AGI`}</p>
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
