import React from 'react';
import StatCard from './StatCard';
import { FaWallet } from 'react-icons/fa';
import { formatInr } from '../../../lib/pricing';

const RemainingBudgetWidget = ({ overview }) => {
  const totalBudget = Number(overview?.totalBudget || 0);
  const spentBudget = Number(overview?.spentBudget || 0);
  const remainingBudget = Number(overview?.remainingBudget || 0);
  const usedPercent = totalBudget > 0 ? Math.min(100, (spentBudget / totalBudget) * 100) : 0;

  return (
    <StatCard>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        <FaWallet className="text-[11px]" /> Remaining Budget
      </div>

      <h3 className="font-primary text-3xl font-semibold text-slate-900">{formatInr(remainingBudget)}</h3>
      <p className="mt-1 text-xs text-slate-500">
        Spent {formatInr(spentBudget)} of {formatInr(totalBudget)}
      </p>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-primary to-[#4f7df0]"
          style={{ width: `${usedPercent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>Used {Math.round(usedPercent)}%</span>
        <span>{Math.max(0, 100 - Math.round(usedPercent))}% left</span>
      </div>
    </StatCard>
  );
};

export default RemainingBudgetWidget;
