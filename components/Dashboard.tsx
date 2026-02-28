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
  const totalHeadcount = headcount.engineering + headcount.sales + headcount.operations;

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
          <span className="font-medium text-slate-900">{totalHeadcount}</span>
        </div>
      </div>
    </div>
  );
};
