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
          <p className="text-slate-500 mt-2">
            Choose your starting role. Race to AGI before you run out of money.
          </p>
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
            {selected ? 'Start Company \u2192' : 'Select a role to begin'}
          </button>
        </div>
      </div>
    </main>
  );
}
