import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit, ListFilter, Sparkles, ShoppingBag, Calendar, Lock } from 'lucide-react';
import { Transaction, MonthlyBudget } from '../types';
import { DEFAULT_CATEGORIES, getCurrentMonthKey } from '../utils/localStorage';

interface TransactionsTableProps {
  currentMonthKey: string;
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onMonthChange?: (month: string) => void;
  budgets?: MonthlyBudget[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  currentMonthKey,
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onMonthChange,
  budgets,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [localMonth, setLocalMonth] = useState<string>(currentMonthKey);

  // Sync prop changes to local state
  React.useEffect(() => {
    setLocalMonth(currentMonthKey);
  }, [currentMonthKey]);

  // Handle local month change and bubble up to app if callback is present
  const handleMonthSelect = (mKey: string) => {
    setLocalMonth(mKey);
    if (onMonthChange) {
      onMonthChange(mKey);
    }
  };

  const currentActualMonthKey = getCurrentMonthKey();

  // Check if a month is in the past
  const isPastMonth = (mKey: string) => {
    return mKey < currentActualMonthKey;
  };

  // Build the list of all selectable months
  const uniqueMonths = Array.from(new Set([
    ...(budgets || []).map(b => b.monthKey),
    ...transactions.map(t => t.monthKey),
    currentMonthKey,
    localMonth
  ])).sort().reverse();

  // Filter transactions for ONLY the active selected month in table
  const monthlyTxs = transactions.filter(t => t.monthKey === localMonth);

  // Filter by search bar query and category selector
  const filteredTxs = monthlyTxs.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || tx.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort descending by date, then by latest ID
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getCategoryColor = (catName: string) => {
    const found = DEFAULT_CATEGORIES.find(c => c.name === catName);
    return found ? found.color : '#6b7280';
  };

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-card p-5 flex flex-col h-full" id="transactions-manager">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-sage-800/60 pb-3 mb-4 gap-2">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-sage-50 flex items-center gap-2 text-md">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            Transaction History Log
          </h4>
          <p className="text-xs text-slate-400 dark:text-sage-400 mt-0.5 font-medium">
            Showing {sortedTxs.length} of {monthlyTxs.length} items registered
          </p>
        </div>

        {/* Quick Clear Controls */}
        <div className="flex items-center gap-2">
          {searchTerm || selectedCategoryFilter !== 'All' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoryFilter('All');
              }}
              className="text-[10px] bg-green-500/10 dark:bg-sage-800 text-green-700 dark:text-green-400 font-bold uppercase rounded-xl px-2.5 py-1.5 border border-green-500/10 hover:bg-green-500/15 cursor-pointer"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Filter Toolbar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Search Input field */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full placeholder:text-slate-300 bg-white/50 dark:bg-sage-950/40 border border-slate-200 dark:border-sage-800 text-sm pl-9 pr-3 py-2 rounded-xl text-slate-800 dark:text-sage-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20"
            id="tx-search-input"
          />
        </div>

        {/* Month Selection filter */}
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={localMonth}
            onChange={(e) => handleMonthSelect(e.target.value)}
            className="w-full bg-white/50 dark:bg-sage-950/40 border border-slate-200 dark:border-sage-800 text-sm pl-9 px-3 py-2 rounded-xl text-slate-800 dark:text-sage-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 cursor-pointer"
            id="tx-month-select"
          >
            {uniqueMonths.map((mKey) => {
              const [year, month] = mKey.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1, 15);
              const display = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
              return (
                <option key={mKey} value={mKey} className="bg-white dark:bg-sage-900 text-slate-900 dark:text-slate-100">
                  {display}
                </option>
              );
            })}
          </select>
        </div>

        {/* Category Breakdown list selector */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-white/50 dark:bg-sage-950/40 border border-slate-200 dark:border-sage-800 text-sm pl-9 pr-3 py-2 rounded-xl text-slate-800 dark:text-sage-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:ring-opacity-20 cursor-pointer"
            id="tx-category-select"
          >
            <option value="All" className="bg-white dark:bg-sage-900 text-slate-900 dark:text-slate-100">All Categories Breakdown</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name} className="bg-white dark:bg-sage-900 text-slate-900 dark:text-slate-100">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main viewport */}
      <div className="flex-grow overflow-y-auto max-h-[380px] pr-1">
        {sortedTxs.length > 0 ? (
          <>
            {/* 1. Desktop HTML Table Interface */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-100 dark:border-sage-800/80 font-sans">
              <table className="w-full text-left border-collapse" id="history-data-table">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-sage-950/30 text-slate-400 dark:text-sage-400 text-xs font-bold uppercase border-b border-slate-100 dark:border-sage-800/60">
                    <th className="p-3">Date</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-sage-800/40 text-sm text-slate-700 dark:text-sage-200">
                  {sortedTxs.map((tx) => {
                    const isTxLocked = isPastMonth(tx.monthKey);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-green-500/[0.02] dark:hover:bg-sage-950/10 transition-colors"
                      >
                        <td className="p-3 font-mono text-xs text-slate-400 dark:text-sage-400">
                          {formatFriendlyDate(tx.date)}
                        </td>
                        <td className="p-3 font-bold text-slate-800 dark:text-sage-50">
                          {tx.name}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{
                            backgroundColor: `${getCategoryColor(tx.category)}15`,
                            color: getCategoryColor(tx.category)
                          }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(tx.category) }} />
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold font-mono text-slate-800 dark:text-sage-100">
                          ${tx.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1">
                            {isTxLocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-slate-100 dark:bg-sage-900 text-slate-400 dark:text-sage-500 rounded-lg border border-slate-200/40 dark:border-sage-800" title="Locked (Past month transaction)">
                                <Lock className="w-3 h-3 text-slate-400 dark:text-sage-500" />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => onEditTransaction(tx)}
                                  className="p-1 px-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                                  title="Edit transaction"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => onDeleteTransaction(tx.id)}
                                  className="p-1 px-2.5 text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Responsive Listing (Lists styled cards) */}
            <div className="md:hidden space-y-3" id="mobile-tx-cards">
              {sortedTxs.map((tx) => {
                const isTxLocked = isPastMonth(tx.monthKey);
                return (
                  <div
                    key={tx.id}
                    className="p-4 bg-white/40 dark:bg-sage-950/20 border border-slate-100 dark:border-sage-800 rounded-xl flex flex-col space-y-3 hover:translate-y-[-2px] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-sage-500 block uppercase">
                          {formatFriendlyDate(tx.date)}
                        </span>
                        <h5 className="font-bold text-slate-800 dark:text-sage-50 text-sm mt-0.5">
                          {tx.name}
                        </h5>
                      </div>
                      <span className="font-bold text-base font-mono text-slate-800 dark:text-sage-50">
                        ${tx.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-sage-800/85 pt-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                        backgroundColor: `${getCategoryColor(tx.category)}15`,
                        color: getCategoryColor(tx.category)
                      }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(tx.category) }} />
                        {tx.category}
                      </span>

                      <div className="flex items-center gap-1">
                        {isTxLocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-slate-100 dark:bg-sage-900 text-slate-400 dark:text-sage-505 rounded-lg border border-slate-200/40 dark:border-sage-800" title="Locked (Past month transaction)">
                            <Lock className="w-3 h-3 text-slate-400 dark:text-sage-500" />
                            <span>Locked</span>
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="py-1 px-2.5 bg-white dark:bg-sage-800 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 rounded-xl text-xs font-bold cursor-pointer active:scale-95"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="py-1 px-2.5 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-bold cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty Search and Empty Lists illustration */
          <div className="text-center py-12 bg-green-500/5 dark:bg-sage-950/10 rounded-2xl border border-dashed border-slate-200 dark:border-sage-800/80 flex flex-col items-center">
            <div className="w-10 h-10 bg-white dark:bg-sage-900 rounded-full flex items-center justify-center text-slate-400 shadow-xs mb-3">
              <ListFilter className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-sage-300">
              {monthlyTxs.length > 0 ? 'No Matching Results' : 'No Transactions Recorded'}
            </p>
            <p className="text-xs text-slate-400 dark:text-sage-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
              {monthlyTxs.length > 0
                ? 'Adjust your search queries or select a different category to see matches.'
                : 'Any item you add through the transaction panel of this active month will be listed here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
