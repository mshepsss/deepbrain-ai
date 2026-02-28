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
