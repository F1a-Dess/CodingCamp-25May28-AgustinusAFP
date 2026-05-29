import React from 'react';
import { DollarSign, Coins, ArrowUpRight, AlertTriangle, PiggyBank } from 'lucide-react';
import { Transaction, MonthlyBudget } from '../types';

interface BudgetSummaryCardsProps {
  currentMonthKey: string;
  budgets: MonthlyBudget[];
  transactions: Transaction[];
  onEditBudgetClick: () => void;
}

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  currentMonthKey,
  budgets,
  transactions,
  onEditBudgetClick
}) => {
  // Find current month's budget configuration
  const currentBudgetObj = budgets.find(b => b.monthKey === currentMonthKey);
  const currentBudget = currentBudgetObj ? currentBudgetObj.budget : 0;

  // Filter transactions for this specific month
  const currentTransactions = transactions.filter(t => t.monthKey === currentMonthKey);
  const totalSpent = currentTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Leftover for the current month
  const currentLeftover = currentBudget - totalSpent;

  // Format month to a readable string like "May 2026"
  const formatMonthName = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 15);
      return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  // Calculate Cumulative "Total Savings" across ALL months where we have budgets
  // Savings is positive budget leftover for each defined month
  const totalSavings = budgets.reduce((acc, b) => {
    const monthTxs = transactions.filter(t => t.monthKey === b.monthKey);
    const monthSpent = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const leftover = b.budget - monthSpent;
    return leftover > 0 ? acc + leftover : acc;
  }, 0);

  const spentPercentage = currentBudget > 0 ? (totalSpent / currentBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="budget-summary-grid">
      {/* 1. Monthly Budget Card */}
      <div className="glass-card p-5 transition-all flex flex-col justify-between" id="card-monthly-budget">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-widest">
              Monthly Budget
            </p>
            <h3 className="text-2xl font-extrabold text-green-900 dark:text-sage-50 mt-1">
              ${currentBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-green-500/10 dark:bg-sage-800 rounded-xl text-green-600 dark:text-sage-300">
            <Coins className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between pt-1 border-t border-slate-100/50 dark:border-sage-800/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-sage-400 tracking-wider">
            {currentBudget === 0 ? 'No budget assigned' : formatMonthName(currentMonthKey)}
          </span>
          <button
            onClick={onEditBudgetClick}
            className="text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline flex items-center gap-1 cursor-pointer"
            id="btn-edit-budget-trigger"
          >
            Adjust Budget
          </button>
        </div>
      </div>

      {/* 2. Total Expenditures Card */}
      <div className="glass-card p-5 transition-all flex flex-col justify-between" id="card-total-spent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-widest">
              Total Spent
            </p>
            <h3 className="text-2xl font-extrabold text-green-900 dark:text-sage-50 mt-1">
              ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${totalSpent > currentBudget && currentBudget > 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-green-500/10 text-green-600 dark:bg-sage-800'}`}>
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-100 dark:bg-sage-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
          <p className="text-right text-[10px] text-slate-400 dark:text-sage-400 mt-1 font-bold">
            {spentPercentage.toFixed(0)}% of limit
          </p>
        </div>
      </div>

      {/* 3. Monthly Leftover Status Card */}
      <div className="glass-card p-5 transition-all flex flex-col justify-between" id="card-monthly-status">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-widest">
              Remaining
            </p>
            <h3 className={`text-2xl font-extrabold mt-1 ${currentLeftover < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
              {currentLeftover < 0 ? '-' : ''}${Math.abs(currentLeftover).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${currentLeftover < 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-green-500/10 text-green-600 dark:bg-sage-800'}`}>
            {currentLeftover < 0 ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />}
          </div>
        </div>
        <div className="mt-4 pt-1 border-t border-slate-100/50 dark:border-sage-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-sage-400">
            {currentLeftover < 0 ? (
              <span className="text-red-500">Overdraft alert!</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">Balance Safe</span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Total Savings Card */}
      <div className="p-5 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-900 text-white rounded-2xl shadow-md transition-all flex flex-col justify-between" id="card-total-savings">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-200 uppercase tracking-widest">
              Total Savings
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-2.5 bg-white/10 text-emerald-300 rounded-xl">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[10px] text-green-200 leading-snug font-medium opacity-90">
            Rollover surpluses are compiled instantly. Keep expanding!
          </p>
        </div>
      </div>
    </div>
  );
};
