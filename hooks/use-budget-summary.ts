"use client";

import { useMemo } from "react";

interface Income {
  id: string;
  name: string;
  amount: number;
  monthlyAmount: number;
  dailyAmount: number;
  frequency: string;
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: "EARNING" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE";
  transactionDate: Date | string;
  monthlyAmount?: number | null;
  dailyAmount?: number | null;
}

interface BudgetSummaryResult {
  totalMonthlyIncome: number;
  totalDailyIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalExpenses: number;
  netMonthly: number;
  netDaily: number;
  savingsRate: number;
  expenseBreakdown: {
    fixed: number;
    variable: number;
    income: number;
  };
  recentTransactions: Transaction[];
}

/**
 * Custom hook to calculate budget summary from income and transactions
 */
export function useBudgetSummary(
  incomes: Income[],
  transactions: Transaction[],
  currentMonth: Date = new Date()
): BudgetSummaryResult {
  return useMemo(() => {
    // Calculate total income
    const totalMonthlyIncome = incomes.reduce(
      (sum, income) => sum + (income.monthlyAmount || 0),
      0
    );
    const totalDailyIncome = incomes.reduce(
      (sum, income) => sum + (income.dailyAmount || 0),
      0
    );

    // Separate transactions by type
    const fixedExpenses = transactions.filter(
      (t) => t.type === "FIXED_EXPENSE"
    );
    const variableExpenses = transactions.filter(
      (t) => t.type === "VARIABLE_EXPENSE"
    );
    const extraEarnings = transactions.filter((t) => t.type === "EARNING");

    // Calculate fixed expenses (monthly)
    const totalFixedExpenses = fixedExpenses.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Calculate variable expenses for current month
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const thisMonthVariableExpenses = variableExpenses.filter((t) => {
      const date = new Date(t.transactionDate);
      return date >= startOfMonth && date <= endOfMonth;
    });

    const totalVariableExpenses = thisMonthVariableExpenses.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Calculate extra earnings for current month
    const thisMonthEarnings = extraEarnings.filter((t) => {
      const date = new Date(t.transactionDate);
      return date >= startOfMonth && date <= endOfMonth;
    });

    const totalExtraEarnings = thisMonthEarnings.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Calculate totals
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const adjustedMonthlyIncome = totalMonthlyIncome + totalExtraEarnings;
    const netMonthly = adjustedMonthlyIncome - totalExpenses;
    const netDaily = netMonthly / 30;

    // Calculate savings rate
    const savingsRate =
      adjustedMonthlyIncome > 0 ? (netMonthly / adjustedMonthlyIncome) * 100 : 0;

    // Expense breakdown for charts
    const expenseBreakdown = {
      fixed: totalFixedExpenses,
      variable: totalVariableExpenses,
      income: adjustedMonthlyIncome,
    };

    // Recent transactions (last 10)
    const recentTransactions = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      )
      .slice(0, 10);

    return {
      totalMonthlyIncome: adjustedMonthlyIncome,
      totalDailyIncome,
      totalFixedExpenses,
      totalVariableExpenses,
      totalExpenses,
      netMonthly,
      netDaily,
      savingsRate,
      expenseBreakdown,
      recentTransactions,
    };
  }, [incomes, transactions, currentMonth]);
}

