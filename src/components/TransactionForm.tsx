import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, RefreshCw, Layers, Lock } from 'lucide-react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES, getCurrentMonthKey } from '../utils/localStorage';

interface TransactionFormProps {
  editingTransaction: Transaction | null;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'monthKey'> & { monthKey: string }) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onCancelEdit: () => void;
  currentSelectedMonth: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  editingTransaction,
  onAddTransaction,
  onUpdateTransaction,
  onCancelEdit,
  currentSelectedMonth,
}) => {
  // Local states for fields
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0].name);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Get current date string in YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Populate form if in edit mode
  useEffect(() => {
    if (editingTransaction) {
      setName(editingTransaction.name);
      setAmount(String(editingTransaction.amount));
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setErrorMsg('');
    } else {
      // Clear inputs or pre-fill with logical defaults
      setName('');
      setAmount('');
      // Set to selected month + current day if possible, else today
      const today = getTodayStr();
      if (currentSelectedMonth && today.startsWith(currentSelectedMonth)) {
        setDate(today);
      } else {
        setDate(`${currentSelectedMonth}-01`);
      }
      setCategory(DEFAULT_CATEGORIES[0].name);
      setErrorMsg('');
    }
  }, [editingTransaction, currentSelectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name.trim()) {
      setErrorMsg('Please specify the name of the transaction');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid positive financial amount');
      return;
    }

    if (!date) {
      setErrorMsg('Please select a valid purchase date');
      return;
    }

    // Extract year-month mapping (e.g. "2026-05-18" -> "2026-05")
    const monthKey = date.substring(0, 7);
    const currentMonthKey = getCurrentMonthKey();

    if (monthKey < currentMonthKey) {
      setErrorMsg('Transactions cannot be logged for or edited to a past month.');
      return;
    }

    if (editingTransaction) {
      onUpdateTransaction({
        id: editingTransaction.id,
        name: name.trim(),
        amount: parsedAmount,
        date,
        category,
        monthKey
      });
    } else {
      onAddTransaction({
        name: name.trim(),
        amount: parsedAmount,
        date,
        category,
        monthKey
      });
      // Reset after successful addition
      setName('');
      setAmount('');
      setErrorMsg('');
    }
  };

  const isPastSelectedMonth = currentSelectedMonth < getCurrentMonthKey();

  return (
    <div className="glass-card p-5 h-full" id="transaction-form-panel">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-sage-800/60 pb-3 mb-4">
        <h4 className="font-bold text-slate-800 dark:text-sage-50 flex items-center gap-2 text-md">
          {editingTransaction ? (
            <>
              <Edit className="w-5 h-5 text-amber-500" />
              Adjust Transaction Entry
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-green-500" />
              Log New Expense / Transaction
            </>
          )}
        </h4>
        {editingTransaction && (
          <button
            onClick={onCancelEdit}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-sage-800 hover:text-slate-600 dark:hover:text-sage-300 cursor-pointer"
            title="Cancel Editing"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isPastSelectedMonth && (
        <div className="mb-4 p-3 bg-slate-100 dark:bg-sage-950/60 border border-slate-200/40 dark:border-sage-800 text-slate-500 dark:text-sage-400 rounded-xl text-xs flex items-center gap-2 font-medium">
          <Lock className="w-3.5 h-3.5 text-slate-450 dark:text-sage-500 flex-shrink-0 animate-pulse" />
          <span>New transaction logging is locked for past months.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" id="form-transaction">
        {/* Field 1: Transaction date */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 mb-1.5 uppercase tracking-wider">
            Purchase Date
          </label>
          <input
            type="date"
            required
            disabled={isPastSelectedMonth}
            min={`${getCurrentMonthKey()}-01`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full tracking-wide rounded-xl border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 ${
              isPastSelectedMonth ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            id="tx-field-date"
          />
        </div>

        {/* Field 2: Item Name */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 mb-1.5 uppercase tracking-wider">
            Item / Description Name
          </label>
          <input
            type="text"
            required
            disabled={isPastSelectedMonth}
            placeholder={isPastSelectedMonth ? "Form locked for past month" : "E.g., Groceries, Coffee, Rent..."}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-xl border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 placeholder:text-slate-300 ${
              isPastSelectedMonth ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            maxLength={60}
            id="tx-field-name"
          />
        </div>

        {/* Grid Area: Amount & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 mb-1.5 uppercase tracking-wider">
              Price / Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono font-bold">$</span>
              <input
                type="number"
                required
                disabled={isPastSelectedMonth}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-xl pl-7 pr-3 py-2 border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 font-bold ${
                  isPastSelectedMonth ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                id="tx-field-amount"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-sage-400 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              disabled={isPastSelectedMonth}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full rounded-xl border border-slate-200 dark:border-sage-700 bg-white/50 dark:bg-sage-950 text-slate-900 dark:text-sage-100 px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 ${
                isPastSelectedMonth ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              id="tx-field-category"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name} className="bg-white dark:bg-sage-900 text-slate-900 dark:text-slate-100">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          {editingTransaction ? (
            <>
              <button
                type="button"
                onClick={onCancelEdit}
                className="w-1/3 py-2 border border-slate-200 dark:border-sage-700 text-slate-600 dark:text-sage-400 rounded-xl hover:bg-slate-50 dark:hover:bg-sage-800 text-xs font-bold cursor-pointer transition-colors"
                id="btn-cancel-transaction-edit"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPastSelectedMonth}
                className={`w-2/3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors ${
                  isPastSelectedMonth ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer'
                }`}
                id="btn-save-transaction-edit"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                Commit Edit
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={isPastSelectedMonth}
              className={`w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors ${
                isPastSelectedMonth ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer'
              }`}
              id="btn-add-transaction-submit"
            >
              <Plus className="w-4 h-4" />
              Save Transaction
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
