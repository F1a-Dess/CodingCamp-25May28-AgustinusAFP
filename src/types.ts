/**
 * Types and Interfaces for the Expense & Budget Visualizer application
 */

export interface Transaction {
  id: string;             // Unique identifier
  date: string;           // E.g., YYYY-MM-DD
  name: string;           // Item/description
  amount: number;         // Amount spent
  category: string;       // E.g., "Food", "Entertainment"
  monthKey: string;       // e.g., "2026-05" - maps transaction to a specific budgeted month
}

export interface MonthlyBudget {
  monthKey: string;       // e.g., "2026-05" (Format: YYYY-MM)
  budget: number;         // The assigned limit
}

export interface CategorySpec {
  name: string;
  color: string;          // Hex or tailwind colors
  icon: string;           // Lucide icon name proxy
}

export interface MonthSummary {
  monthKey: string;
  budget: number;
  totalSpent: number;
  remaining: number;
  savings: number;        // Add to total savings if remaining > 0
}
