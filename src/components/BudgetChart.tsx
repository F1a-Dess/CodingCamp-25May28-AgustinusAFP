import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/localStorage';
import { ChartPie, MessageSquarePlus } from 'lucide-react';

interface BudgetChartProps {
  currentMonthKey: string;
  transactions: Transaction[];
  currentBudget: number;
  isDarkMode: boolean;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({
  currentMonthKey,
  transactions,
  currentBudget,
  isDarkMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart<'pie'> | null>(null);

  // Filter transactions for this specific month
  const currentTransactions = transactions.filter(t => t.monthKey === currentMonthKey);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  currentTransactions.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const categoryNames = Object.keys(categoryTotals);
  const categoryAmounts = Object.values(categoryTotals);

  // Compute remaining budget
  const totalSpent = currentTransactions.reduce((acc, t) => acc + t.amount, 0);
  const remainingBudget = Math.max(0, currentBudget - totalSpent);

  // We can include standard unspent budget sliver or just show expense breakdown.
  // Showing active expense slice is great, but we can also have a toggle or include unspent.
  // Let's draw expenses by category. If unspent is higher than zero, let's show an "Unspent Budget" slice in the pie chart!
  // This visualizes how much is saved vs spent.
  const chartLabels = [...categoryNames];
  const chartData = [...categoryAmounts];
  const chartColors = chartLabels.map(label => {
    const meta = DEFAULT_CATEGORIES.find(c => c.name === label);
    return meta ? meta.color : '#9ca3af'; // Gray fallback
  });

  if (remainingBudget > 0 && currentBudget > 0) {
    chartLabels.push('Unspent (Savings)');
    chartData.push(remainingBudget);
    chartColors.push('#86efac'); // Sage/light green for savings
  }

  const hasData = chartData.some(val => val > 0);

  useEffect(() => {
    // If we have no canvas, or no data, clean up and exit
    if (!canvasRef.current) return;

    // Clean up existing chart instances to avoid canvas overlay errors
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!hasData) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Detect if dark mode is active to style the legend text
    const labelColor = isDarkMode ? '#f2fcf3' : '#1f2937';

    // Create a new Chart.js dynamic instance
    const newChart = new Chart<'pie'>(canvasRef.current, {
      type: 'pie',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: chartData,
            backgroundColor: chartColors,
            borderColor: isDarkMode ? '#141e18' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              color: labelColor,
              font: {
                family: 'Noto Sans',
                size: 11,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            padding: 10,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return ` ${label}: $${value.toFixed(2)} (${percent}%)`;
              },
            },
          },
        },
      },
    });

    chartInstanceRef.current = newChart;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [currentMonthKey, transactions, currentBudget, hasData, isDarkMode]);

  return (
    <div className="glass-card p-5 flex flex-col h-full" id="budget-chart-container">
      <h4 className="font-bold text-slate-800 dark:text-sage-50 border-b border-slate-100 dark:border-sage-800/60 pb-3 mb-4 flex items-center gap-2 text-md">
        <ChartPie className="w-5 h-5 text-green-500" />
        Budget Allocation Breakdown
      </h4>

      <div className="flex-grow flex items-center justify-center min-h-[280px] relative">
        {hasData ? (
          <div className="w-full h-full max-h-[320px] relative">
            <canvas ref={canvasRef} id="expense-pie-chart" className="w-full h-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-green-500/5 rounded-2xl border border-dashed border-slate-200 dark:border-sage-800/60 w-full h-full py-12">
            <div className="p-3 bg-white dark:bg-sage-900 text-slate-400 dark:text-sage-600 rounded-full shadow-xs mb-3">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-sage-300">No Allocation Data Available</p>
            <p className="text-xs text-slate-400 dark:text-sage-400 mt-1 max-w-[240px] leading-relaxed">
              {currentBudget === 0 
                ? 'Please assign a budget for this month to activate visuals.' 
                : 'Log your first transaction or expense item below to view charts!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
