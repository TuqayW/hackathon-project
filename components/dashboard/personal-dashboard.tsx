"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  PiggyBank,
  ArrowRight,
  Plus,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalProgressCircle } from "./circular-progress";
import { IncomeVsExpenseChart } from "./expense-chart";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import type { Income, Transaction, Goal, BudgetSummary } from "@prisma/client";

interface PersonalDashboardProps {
  user: {
    name?: string | null;
  };
  incomes: Income[];
  transactions: Transaction[];
  goals: Goal[];
  budgetSummary: BudgetSummary | null;
}

export function PersonalDashboard({
  user,
  incomes,
  transactions,
  goals,
  budgetSummary,
}: PersonalDashboardProps) {
  // Calculate totals
  const totalMonthlyIncome = incomes.reduce(
    (sum, inc) => sum + inc.monthlyAmount,
    0
  );

  const fixedExpenses = transactions.filter(
    (t) => t.type === "FIXED_EXPENSE"
  );
  const variableExpenses = transactions.filter(
    (t) => t.type === "VARIABLE_EXPENSE"
  );

  const totalFixedExpenses = fixedExpenses.reduce((sum, t) => sum + t.amount, 0);
  
  // Get this month's variable expenses
  const now = new Date();
  const thisMonthVariables = variableExpenses.filter((t) => {
    const date = new Date(t.transactionDate);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
  const totalVariableExpenses = thisMonthVariables.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const netMonthly = totalMonthlyIncome - totalFixedExpenses - totalVariableExpenses;
  const dailyDisposable = netMonthly / 30;

  // Get primary goal (first upcoming)
  const primaryGoal = goals[0];

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    )
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 lg:pb-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your financial overview for {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Income
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomes.length} income source{incomes.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fixed Expenses
            </CardTitle>
            <Calendar className="w-5 h-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">
              {formatCurrency(totalFixedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {fixedExpenses.length} recurring expense{fixedExpenses.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variable Expenses
            </CardTitle>
            <Wallet className="w-5 h-5 text-coral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {formatCurrency(totalVariableExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month so far
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Disposable
            </CardTitle>
            <PiggyBank className="w-5 h-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                dailyDisposable >= 0 ? "text-sky-500" : "text-destructive"
              }`}
            >
              {formatCurrency(Math.abs(dailyDisposable))}
              {dailyDisposable < 0 && (
                <span className="text-xs ml-1">deficit</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to spend/save daily
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goal Progress */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Goal Progress
              </CardTitle>
              <Link href="/dashboard/goals">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {primaryGoal ? (
                <div className="flex flex-col items-center">
                  <GoalProgressCircle
                    goalName={primaryGoal.name}
                    currentAmount={primaryGoal.currentAmount}
                    targetAmount={primaryGoal.requiredAmount}
                    daysRemaining={primaryGoal.daysRemaining}
                    dailySaveRate={primaryGoal.dailySaveRate}
                    isEmergencyFund={primaryGoal.isEmergencyFund}
                  />
                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center w-full">
                    <p className="text-sm font-medium">
                      🎯 To reach your goal by{" "}
                      <span className="text-primary">
                        {formatDate(primaryGoal.targetDate)}
                      </span>
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      Save{" "}
                      <span className="text-gradient">
                        ${primaryGoal.dailySaveRate.toFixed(2)}
                      </span>{" "}
                      per day
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or ${primaryGoal.weeklySaveRate.toFixed(2)} per week
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No goals yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set your first savings goal to start your path!
                  </p>
                  <Link href="/dashboard/goals">
                    <Button variant="gradient">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalMonthlyIncome > 0 || totalFixedExpenses > 0 || totalVariableExpenses > 0 ? (
                <IncomeVsExpenseChart
                  income={totalMonthlyIncome}
                  fixedExpenses={totalFixedExpenses}
                  variableExpenses={totalVariableExpenses}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Wallet className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No data yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your income and expenses to see your budget breakdown
                  </p>
                  <div className="flex gap-2">
                    <Link href="/dashboard/income">
                      <Button variant="outline" size="sm">
                        Add Income
                      </Button>
                    </Link>
                    <Link href="/dashboard/expenses">
                      <Button variant="outline" size="sm">
                        Add Expense
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/dashboard/expenses">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === "EARNING"
                            ? "bg-emerald-500/10"
                            : transaction.type === "FIXED_EXPENSE"
                            ? "bg-violet-500/10"
                            : "bg-orange-500/10"
                        }`}
                      >
                        {transaction.type === "EARNING" ? (
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <TrendingDown
                            className={`w-5 h-5 ${
                              transaction.type === "FIXED_EXPENSE"
                                ? "text-violet-500"
                                : "text-orange-500"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(transaction.transactionDate)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        transaction.type === "EARNING"
                          ? "text-emerald-500"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.type === "EARNING" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent transactions. Use Quick Add to log your first expense!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

