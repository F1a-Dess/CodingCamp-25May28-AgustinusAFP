import React, { useState } from 'react';
import { Calendar, Check, Plus, AlertCircle, Lock } from 'lucide-react';
import { MonthlyBudget } from '../types';
import { getCurrentMonthKey } from '../utils/localStorage';

interface BudgetInputProps {
  selectedMonth: string;
  budgets: MonthlyBudget[];
  onMonthChange: (month: string) => void;
  onBudgetUpdate: (month: string, amount: number) => void;
  onAddNewMonth: (month: string, initialBudget: number) => void;
}

export const BudgetInput: React.FC<BudgetInputProps> = ({
  selectedMonth,
  budgets,
  onMonthChange,
  onBudgetUpdate,
  onAddNewMonth,
}) => {
  const [budgetVal, setBudgetVal] = useState<string>('');
  const [showAddMonth, setShowAddMonth] = useState<boolean>(false);
  const [newMonthInput, setNewMonthInput] = useState<string>('');
  const [newBudgetInput, setNewBudgetInput] = useState<string>('2000');
  const [validationError, setValidationError] = useState<string>('');

  // Find budget for selected month
  const currentBudgetObj = budgets.find(b => b.monthKey === selectedMonth);

  // Sync initial input value
  React.useEffect(() => {
    if (currentBudgetObj) {
      setBudgetVal(String(currentBudgetObj.budget));
    } else {
      setBudgetVal('');
    }
    setValidationError('');
  }, [selectedMonth, currentBudgetObj]);

  const handleUpdateCurrentBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMonth < getCurrentMonthKey()) {
      setValidationError('You cannot modify the budget limit for a past month.');
      return;
    }
    const parsed = parseFloat(budgetVal);
    if (isNaN(parsed) || parsed < 0) {
      setValidationError('Please enter a valid positive number');
      return;
    }
    onBudgetUpdate(selectedMonth, parsed);
    setValidationError('');
  };

  const handleCreateNewMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthInput) {
      setValidationError('Please select a valid month');
      return;
    }

    if (newMonthInput < getCurrentMonthKey()) {
      setValidationError('You cannot register or configure a past month.');
      return;
    }

    const exists = budgets.some(b => b.monthKey === newMonthInput);
    if (exists) {
      setValidationError('This month is already registered. Please select it in the dropdown instead.');
      return;
    }

    const parsedBudget = parseFloat(newBudgetInput);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setValidationError('Please enter a valid positive budget');
      return;
    }

    onAddNewMonth(newMonthInput, parsedBudget);
    setShowAddMonth(false);
    setNewMonthInput('');
    setValidationError('');
  };

  const presetBudgets = [1000, 2000, 3000, 5000];
  const isPastSelectedMonth = selectedMonth < getCurrentMonthKey();

  return (
    <div className="glass-card p-5" id="budget-input-manager">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-sage-800/60 pb-3 mb-4">
        <h4 className="font-bold text-slate-800 dark:text-sage-50 flex items-center gap-2 text-md">
          <Calendar className="w-5 h-5 text-green-500" />
          Active Month &amp; Budget Config
        </h4>
        <button
          onClick={() => setShowAddMonth(!showAddMonth)}
          className="text-xs font-bold py-1.5 px-3 bg-green-500/10 dark:bg-sage-800 hover:bg-green-500/15 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddMonth ? 'Close New' : 'Add New Month'}
        </button>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {showAddMonth ? (
        /* Create New Calendar Month Flow */
        <form onSubmit={handleCreateNewMonth} className="space-y-4" id="form-add-new-month">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-wider mb-1.5">
                Choose Month
              </label>
              <input
                type="month"
                min={getCurrentMonthKey()}
                value={newMonthInput}
                onChange={(e) => setNewMonthInput(e.target.value)}
                className="w-full tracking-wide rounded-xl border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-wider mb-1.5">
                Initial Budget Limit ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="2000"
                value={newBudgetInput}
                onChange={(e) => setNewBudgetInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddMonth(false)}
              className="py-2 px-3 border border-slate-200 dark:border-sage-700 text-slate-600 dark:text-sage-400 rounded-xl hover:bg-slate-50 dark:hover:bg-sage-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors flex items-center gap-1"
            >
              Create Month
            </button>
          </div>
        </form>
      ) : (
        /* Adjust Budget configuration of selected active month */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-wider mb-1.5">
                Selected Active Calendar Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="w-full tracking-wide rounded-xl border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 cursor-pointer"
                id="select-month-picker"
              >
                {budgets.map((b) => {
                  const [year, month] = b.monthKey.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1, 15);
                  const display = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
                  return (
                    <option key={b.monthKey} value={b.monthKey} className="bg-white dark:bg-sage-900 text-slate-900 dark:text-sage-100">
                      {display}
                    </option>
                  );
                })}
              </select>
            </div>

            <form onSubmit={handleUpdateCurrentBudget} className="flex flex-col justify-end">
              <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 uppercase tracking-wider mb-1.5">
                Set Monthly Budget Limit ($)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono font-medium">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter limit"
                    disabled={isPastSelectedMonth}
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(e.target.value)}
                    className="w-full rounded-xl disabled:opacity-50 disabled:cursor-not-allowed pl-7 pr-3 py-2 border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 font-bold"
                    id="input-budget-value"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPastSelectedMonth}
                  className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-sage-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                  title={isPastSelectedMonth ? "Budget limit is locked (Past month)" : "Apply Changes"}
                  id="btn-apply-budget"
                >
                  {isPastSelectedMonth ? <Lock className="w-5 h-5 text-slate-400 dark:text-sage-500" /> : <Check className="w-5 h-5 font-bold" />}
                </button>
              </div>
            </form>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-sage-400 uppercase tracking-widest mb-1.5">Quick Budget Presets</span>
            <div className="flex flex-wrap gap-2">
              {presetBudgets.map(amt => (
                <button
                  key={amt}
                  type="button"
                  disabled={isPastSelectedMonth}
                  onClick={() => {
                    if (isPastSelectedMonth) return;
                    setBudgetVal(String(amt));
                    onBudgetUpdate(selectedMonth, amt);
                    setValidationError('');
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-all border ${
                    currentBudgetObj?.budget === amt
                      ? 'bg-green-600 border-green-600 text-white font-bold'
                      : 'bg-green-500/5 dark:bg-sage-900 border-slate-200/60 dark:border-sage-800 text-slate-600 dark:text-slate-300 hover:bg-green-500/10'
                  } ${isPastSelectedMonth ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {isPastSelectedMonth && (
            <div className="p-3 bg-slate-100 dark:bg-sage-950/60 border border-slate-200/40 dark:border-sage-800 text-slate-500 dark:text-sage-400 rounded-xl text-xs flex items-center gap-2 font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-450 dark:text-sage-500 flex-shrink-0 animate-pulse" />
              <span>This month is in the past. Budget limits, presets, and transaction edits are locked.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
