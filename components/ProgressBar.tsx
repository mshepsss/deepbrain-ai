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
