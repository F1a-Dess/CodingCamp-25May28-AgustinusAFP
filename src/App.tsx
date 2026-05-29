import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  Terminal, 
  Sparkles, 
  PiggyBank, 
  Compass, 
  GraduationCap
} from 'lucide-react';

// Core imports
import { Transaction, MonthlyBudget } from './types';
import { 
  getSavedBudgets, 
  saveBudgets, 
  getSavedTransactions, 
  saveTransactions,
  getSavedSelectedMonth,
  saveSelectedMonth,
  getSavedDarkMode,
  saveDarkMode,
  getCurrentMonthKey
} from './utils/localStorage';

// Component imports
import { BudgetSummaryCards } from './components/BudgetSummaryCards';
import { BudgetInput } from './components/BudgetInput';
import { TransactionForm } from './components/TransactionForm';
import { BudgetChart } from './components/BudgetChart';
import { TransactionsTable } from './components/TransactionsTable';
import { fiaHyperlink } from './javascript/footer';

export default function App() {
  // 1. Core States
  const [selectedMonth, setSelectedMonth] = useState<string>(getSavedSelectedMonth());
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(getSavedBudgets());
  const [transactions, setTransactions] = useState<Transaction[]>(getSavedTransactions());
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getSavedDarkMode());

  const budgetConfigRef = useRef<HTMLDivElement | null>(null);

  // 2. Dark mode class sync effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveDarkMode(isDarkMode);
  }, [isDarkMode]);

  // 3. Coordinate State Persistence
  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSelectedMonth(selectedMonth);
  }, [selectedMonth]);

  // 4. Action Event Handlers
  const handleMonthChange = (monthKey: string) => {
    setSelectedMonth(monthKey);
    setEditingTransaction(null); // Clear editing if moving context
  };

  const handleBudgetUpdate = (monthKey: string, amount: number) => {
    setBudgets(prev => {
      const exists = prev.some(b => b.monthKey === monthKey);
      if (exists) {
        return prev.map(b => b.monthKey === monthKey ? { ...b, budget: amount } : b);
      } else {
        return [...prev, { monthKey, budget: amount }];
      }
    });
  };

  const handleAddNewMonth = (monthKey: string, initialBudget: number) => {
    setBudgets(prev => [...prev, { monthKey, budget: initialBudget }]);
    setSelectedMonth(monthKey);
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'monthKey'> & { monthKey: string }) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}` // Generate local unique key
    };

    // Auto-create/seed month budget if adding transaction to unregistered month
    const monthExists = budgets.some(b => b.monthKey === newTx.monthKey);
    if (!monthExists) {
      setBudgets(prev => [...prev, { monthKey: newTx.monthKey, budget: 2000 }]);
    }

    setTransactions(prev => [newTx, ...prev]);

    // Automatically set view month if backdating/future testing so the user sees the output
    if (newTx.monthKey !== selectedMonth) {
      setSelectedMonth(newTx.monthKey);
    }
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    // Safety guard: prevent updates for past months
    const originalTx = transactions.find(t => t.id === updatedTx.id);
    if (originalTx && originalTx.monthKey < getCurrentMonthKey()) {
      alert("Transactions of past months are locked and cannot be modified.");
      return;
    }

    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setEditingTransaction(null);
    
    // Auto-create budget for matching month if modified transaction shifts target month
    const monthExists = budgets.some(b => b.monthKey === updatedTx.monthKey);
    if (!monthExists) {
      setBudgets(prev => [...prev, { monthKey: updatedTx.monthKey, budget: 2000 }]);
    }

    // Switch selection view to matching month
    if (updatedTx.monthKey !== selectedMonth) {
      setSelectedMonth(updatedTx.monthKey);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    // Safety guard: prevent deletion for past months
    const tx = transactions.find(t => t.id === id);
    if (tx && tx.monthKey < getCurrentMonthKey()) {
      alert("Transactions of past months are locked and cannot be deleted.");
      return;
    }

    // If we are currently editing the transaction, cancel edit selection
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTrigger = (tx: Transaction) => {
    // Safety guard: prevent editing triggers for past months
    if (tx.monthKey < getCurrentMonthKey()) {
      return;
    }

    setEditingTransaction(tx);
    // Scroll window smoothly to form panel
    const formPanel = document.getElementById('transaction-form-panel');
    if (formPanel) {
      formPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentBudgetObj = budgets.find(b => b.monthKey === selectedMonth);
  const currentBudget = currentBudgetObj ? currentBudgetObj.budget : 0;

  const scrollToSetup = () => {
    if (budgetConfigRef.current) {
      budgetConfigRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 dark:bg-sage-950 text-sage-900 dark:text-sage-100 flex flex-col font-sans transition-colors duration-250">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-sage-900/95 backdrop-blur-md border-b border-sage-100 dark:border-sage-800 shadow-xs px-4 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-200 rounded-xl flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-extrabold text-sage-950 dark:text-sage-50 tracking-tight flex items-center gap-1.5">
                Expense &amp; Budget Visualizer
                <span className="hidden sm:inline-flex text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  LocalStorage Storage
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-sage-500 dark:text-sage-400 leading-none mt-0.5">
                Educational finance planner with instant canvas analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Accessibility Dark toggle buttons */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-sage-50 dark:bg-sage-800 hover:bg-sage-100 dark:hover:bg-sage-700 text-sage-600 dark:text-sage-200 cursor-pointer border border-sage-100 dark:border-sage-700/80 transition-colors"
              aria-label="Toggle brightness theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-900" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top row cards summarizations */}
        <BudgetSummaryCards
          currentMonthKey={selectedMonth}
          budgets={budgets}
          transactions={transactions}
          onEditBudgetClick={scrollToSetup}
        />

        {/* Middle complex workspace organizing using grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column (Input & Setups) - spans 5 columns on desktop */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div ref={budgetConfigRef}>
              <BudgetInput
                selectedMonth={selectedMonth}
                budgets={budgets}
                onMonthChange={handleMonthChange}
                onBudgetUpdate={handleBudgetUpdate}
                onAddNewMonth={handleAddNewMonth}
              />
            </div>

            <div className="flex-grow">
              <TransactionForm
                editingTransaction={editingTransaction}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onCancelEdit={() => setEditingTransaction(null)}
                currentSelectedMonth={selectedMonth}
              />
            </div>
          </div>

          {/* Right Column (Visualizations) - spans 7 columns on desktop */}
          <div className="lg:col-span-7">
            <BudgetChart
              currentMonthKey={selectedMonth}
              transactions={transactions}
              currentBudget={currentBudget}
              isDarkMode={isDarkMode}
            />
          </div>

        </div>

        {/* Bottom Transaction Table row */}
        <div className="w-full" id="history-section">
          <TransactionsTable
            currentMonthKey={selectedMonth}
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTrigger}
            onMonthChange={handleMonthChange}
            budgets={budgets}
          />
        </div>

      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-white dark:bg-sage-900 border-t border-sage-100 dark:border-sage-800/80 py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-xs text-sage-500 dark:text-sage-400 gap-2 text-center">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sage-800 dark:text-sage-200">
              RevoU - ExpenSE CC
            </span>
          </div>
          <div className="text-[11px] font-mono text-sage-400 dark:text-sage-500">
            version B.25.5.26
          </div>
          <div className="text-[11px] text-sage-400 dark:text-sage-500 mt-1">
            made with love by{' '}
            <a
              href={fiaHyperlink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              id="footer-author-link"
            >
              Fia
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
