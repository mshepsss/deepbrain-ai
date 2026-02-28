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
            <p className={`text-xs font-medium ${a.unlocked ? 'text-slate-900' : 'text-slate-400'}`}>
              {a.label}
            </p>
            {a.unlocked && (
              <p className="text-xs text-indigo-500">Bonus active</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
