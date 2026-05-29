import { Transaction, MonthlyBudget } from '../types';

// Constants for LocalStorage keys
const TRANSACTIONS_KEY = 'eb_transactions';
const BUDGETS_KEY = 'eb_monthly_budgets';
const DARK_MODE_KEY = 'eb_dark_mode';
const SELECTED_MONTH_KEY = 'eb_selected_month';

// Default categories with colors matching our sage brand theme
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#10b981', icon: 'Utensils' }, // Emerald
  { name: 'Rent & Housing', color: '#3b82f6', icon: 'Home' },     // Blue
  { name: 'Transportation', color: '#f59e0b', icon: 'Car' },      // Amber
  { name: 'Entertainment', color: '#8b5cf6', icon: 'Film' },     // Violet
  { name: 'Utilities & Bills', color: '#ef4444', icon: 'Lightbulb' }, // Red
  { name: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' }, // Pink
  { name: 'Healthcare', color: '#14b8a6', icon: 'HeartPulse' }, // Teal
  { name: 'Education', color: '#6366f1', icon: 'GraduationCap' }, // Indigo
  { name: 'Others', color: '#6b7280', icon: 'Sparkles' }          // Gray
];

// Helper to get present month in YYYY-MM format
export function getCurrentMonthKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Initial budgets and transactions seed data for rich user experience
const SEED_BUDGETS: MonthlyBudget[] = [
  { monthKey: getCurrentMonthKey(), budget: 2500 },
  { monthKey: '2026-04', budget: 2000 }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: getCurrentMonthKey() + '-05',
    name: 'Weekly Grocery Shopping',
    amount: 145.50,
    category: 'Food & Dining',
    monthKey: getCurrentMonthKey()
  },
  {
    id: 'tx-2',
    date: getCurrentMonthKey() + '-01',
    name: 'Apartment Monthly Rent',
    amount: 1200.00,
    category: 'Rent & Housing',
    monthKey: getCurrentMonthKey()
  },
  {
    id: 'tx-3',
    date: getCurrentMonthKey() + '-10',
    name: 'Gas Station Refuel',
    amount: 60.00,
    category: 'Transportation',
    monthKey: getCurrentMonthKey()
  },
  {
    id: 'tx-4',
    date: getCurrentMonthKey() + '-15',
    name: 'Movie Night & Snacks',
    amount: 38.50,
    category: 'Entertainment',
    monthKey: getCurrentMonthKey()
  },
  {
    id: 'tx-5',
    date: getCurrentMonthKey() + '-18',
    name: 'Electricity / Water Bill',
    amount: 185.20,
    category: 'Utilities & Bills',
    monthKey: getCurrentMonthKey()
  },
  {
    id: 'tx-6',
    date: getCurrentMonthKey() + '-22',
    name: 'Tech Accessories & Cable',
    amount: 110.00,
    category: 'Shopping',
    monthKey: getCurrentMonthKey()
  },
  {
    id: 'tx-apr-1',
    date: '2026-04-01',
    name: 'Apartment Monthly Rent (April)',
    amount: 1200.00,
    category: 'Rent & Housing',
    monthKey: '2026-04'
  },
  {
    id: 'tx-apr-2',
    date: '2026-04-08',
    name: 'Organic Groceries Run',
    amount: 112.40,
    category: 'Food & Dining',
    monthKey: '2026-04'
  },
  {
    id: 'tx-apr-3',
    date: '2026-04-15',
    name: 'Concert Ticket',
    amount: 85.50,
    category: 'Entertainment',
    monthKey: '2026-04'
  },
  {
    id: 'tx-apr-4',
    date: '2026-04-22',
    name: 'Electric Power Grid Utility',
    amount: 142.50,
    category: 'Utilities & Bills',
    monthKey: '2026-04'
  },
  {
    id: 'tx-apr-5',
    date: '2026-04-26',
    name: 'Weekend Casual Shoes',
    amount: 69.99,
    category: 'Shopping',
    monthKey: '2026-04'
  }
];

// Load Budgets from LocalStorage, seeding if empty
export function getSavedBudgets(): MonthlyBudget[] {
  try {
    const data = localStorage.getItem(BUDGETS_KEY);
    if (!data) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(SEED_BUDGETS));
      return SEED_BUDGETS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse budgets from localStorage:', error);
    return SEED_BUDGETS;
  }
}

// Save Budgets to LocalStorage
export function saveBudgets(budgets: MonthlyBudget[]): void {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}

// Load Transactions from LocalStorage, seeding if empty
export function getSavedTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    let list: Transaction[] = [];
    if (!data) {
      list = SEED_TRANSACTIONS;
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    } else {
      list = JSON.parse(data);
    }
    // Guarantee April seed transactions exist for history log page
    const hasApril = list.some(t => t.monthKey === '2026-04');
    if (!hasApril) {
      const aprilSeeds: Transaction[] = [
        {
          id: 'tx-apr-1',
          date: '2026-04-01',
          name: 'Apartment Monthly Rent (April)',
          amount: 1200.00,
          category: 'Rent & Housing',
          monthKey: '2026-04'
        },
        {
          id: 'tx-apr-2',
          date: '2026-04-08',
          name: 'Organic Groceries Run',
          amount: 112.40,
          category: 'Food & Dining',
          monthKey: '2026-04'
        },
        {
          id: 'tx-apr-3',
          date: '2026-04-15',
          name: 'Concert Ticket',
          amount: 85.50,
          category: 'Entertainment',
          monthKey: '2026-04'
        },
        {
          id: 'tx-apr-4',
          date: '2026-04-22',
          name: 'Electric Power Grid Utility',
          amount: 142.50,
          category: 'Utilities & Bills',
          monthKey: '2026-04'
        },
        {
          id: 'tx-apr-5',
          date: '2026-04-26',
          name: 'Weekend Casual Shoes',
          amount: 69.99,
          category: 'Shopping',
          monthKey: '2026-04'
        }
      ];
      list = [...list, ...aprilSeeds];
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    }
    return list;
  } catch (error) {
    console.error('Failed to parse transactions from localStorage:', error);
    return SEED_TRANSACTIONS;
  }
}

// Save Transactions to LocalStorage
export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// Get/Set selected budget month
export function getSavedSelectedMonth(): string {
  const saved = localStorage.getItem(SELECTED_MONTH_KEY);
  return saved || getCurrentMonthKey();
}

export function saveSelectedMonth(monthKey: string): void {
  localStorage.setItem(SELECTED_MONTH_KEY, monthKey);
}

// Load Dark Mode Preference
export function getSavedDarkMode(): boolean {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  if (saved === null) {
    // Detect system preference if no user preference is saved yet
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return saved === 'true';
}

// Save Dark Mode Preference
export function saveDarkMode(isDark: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, String(isDark));
}
