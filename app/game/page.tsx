'use client';

import { useEffect, useState, useCallback } from 'react';
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

  // Redirect if no role selected
  useEffect(() => {
    if (state.phase === 'role-select') {
      router.push('/');
    }
  }, [state.phase, router]);

  const fetchEvent = useCallback(async () => {
    setEventChosen(false);
    setDecisionsMade(0);
    setEvent(null);
    setLoading(true);

    const totalHeadcount =
      state.headcount.engineering +
      state.headcount.sales +
      state.headcount.operations;

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: state.month,
          cash: state.cash,
          agiProgress: state.agiProgress,
          headcount: totalHeadcount,
          role: state.role,
        }),
      });
      const data = await res.json();
      setEvent(data);
    } catch {
      // If event fetch fails, show a fallback event
      setEvent({
        headline: 'Market conditions shift',
        flavourText: 'The AI landscape continues to evolve rapidly.',
        options: [
          { label: 'Stay focused', effect: { researchPoints: 3 }, risk: 'Minimal impact' },
          { label: 'Adapt strategy', effect: { cash: -50_000, agiProgress: 2 }, risk: 'Small cost' },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [state.month, state.headcount, state.cash, state.agiProgress, state.role]);

  // Fetch event when month changes (and game is active)
  useEffect(() => {
    if (state.phase === 'playing') {
      fetchEvent();
    }
  }, [state.month]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEventChoice = (effect: StatDelta) => {
    applyChoice(effect);
    setEventChosen(true);
  };

  const handleHire = (dept: Department) => {
    const costs: Record<Department, number> = {
      engineering: 15_000,
      sales: 10_000,
      operations: 8_000,
    };
    const revenueGain: Record<Department, number> = {
      engineering: 0,
      sales: 5_000,
      operations: 0,
    };
    const burnIncrease: Record<Department, number> = {
      engineering: 12_000,
      sales: 8_000,
      operations: 6_000,
    };

    applyChoice({
      cash: -costs[dept],
      burnRate: burnIncrease[dept],
      revenue: revenueGain[dept],
    });
    setDecisionsMade(d => d + 1);
  };

  const handleResearch = (milestoneId: string) => {
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

  // Win screen
  if (state.phase === 'won') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4 p-10 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
          <div className="text-5xl">🏆</div>
          <h1 className="text-3xl font-bold text-indigo-600">AGI Achieved!</h1>
          <p className="text-slate-500">
            You built artificial general intelligence in{' '}
            <span className="font-semibold text-slate-900">{state.month} months</span>.
          </p>
          <button
            onClick={() => { reset(); router.push('/'); }}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      </main>
    );
  }

  // Lose screen
  if (state.phase === 'lost') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4 p-10 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
          <div className="text-5xl">💸</div>
          <h1 className="text-3xl font-bold text-red-500">Out of Runway</h1>
          <p className="text-slate-500">
            Your company ran out of money after{' '}
            <span className="font-semibold text-slate-900">{state.month} months</span>.
            AGI was <span className="font-semibold text-slate-900">{state.agiProgress}%</span> complete.
          </p>
          <button
            onClick={() => { reset(); router.push('/'); }}
            className="rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Main game screen
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <h1 className="text-xl font-bold text-slate-900">DeepBrain AI</h1>
          <span className="text-sm text-slate-500 font-medium">Month {state.month}</span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left column: stats + achievements */}
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

          {/* Center: event card */}
          <div className="col-span-5">
            {loading && (
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 h-48 flex items-center justify-center">
                <p className="text-sm text-slate-400 animate-pulse">Generating event...</p>
              </div>
            )}
            {!loading && event && (
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
