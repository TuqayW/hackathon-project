"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Target,
  ArrowRight,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DepartmentEfficiencyChart } from "./expense-chart";
import { CircularProgress } from "./circular-progress";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type {
  Income,
  Transaction,
  Goal,
  Department,
  BudgetSummary,
} from "@prisma/client";

interface CompanyDashboardProps {
  user: {
    name?: string | null;
    companyName?: string | null;
  };
  incomes: Income[];
  transactions: Transaction[];
  goals: Goal[];
  departments: Department[];
  budgetSummary: BudgetSummary | null;
}

interface AISuggestion {
  title: string;
  description: string;
  potentialSavings?: string;
  priority: "high" | "medium" | "low";
}

export function CompanyDashboard({
  user,
  incomes,
  transactions,
  goals,
  departments,
}: CompanyDashboardProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [analysisGoalType, setAnalysisGoalType] = useState<
    "EFFICIENCY" | "GROWTH"
  >("EFFICIENCY");

  // Calculate totals
  const totalMonthlyIncome = incomes.reduce(
    (sum, inc) => sum + inc.monthlyAmount,
    0
  );
  const totalDepartmentBudget = departments.reduce(
    (sum, dept) => sum + dept.totalBudget,
    0
  );
  const avgEfficiency =
    departments.length > 0
      ? departments.reduce((sum, d) => sum + d.efficiencyRating, 0) /
        departments.length
      : 0;

  // Find low efficiency departments (rating < 5)
  const lowEfficiencyDepts = departments.filter(
    (d) => d.efficiencyRating < 5
  );

  // Get company goal
  const companyGoal = goals.find(
    (g) => g.goalType === "EFFICIENCY" || g.goalType === "GROWTH"
  );

  const handleAnalyze = async () => {
    if (departments.length === 0) {
      toast({
        title: "No departments",
        description: "Add departments with efficiency ratings first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType: analysisGoalType,
          growthTarget: companyGoal?.growthTarget || 10000,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAiSuggestions(data.analysis.suggestions);

      toast({
        title: "Analysis complete!",
        description: "AI has generated recommendations for your business.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
          {user.companyName || "Company"} Dashboard 🏢
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your business finances and optimize efficiency
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
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomes.length} revenue stream{incomes.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Department Budgets
            </CardTitle>
            <Building2 className="w-5 h-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">
              {formatCurrency(totalDepartmentBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {departments.length} department{departments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Efficiency
            </CardTitle>
            <BarChart3 className="w-5 h-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                avgEfficiency >= 7
                  ? "text-emerald-500"
                  : avgEfficiency >= 5
                  ? "text-amber-500"
                  : "text-destructive"
              }`}
            >
              {avgEfficiency.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowEfficiencyDepts.length} dept{lowEfficiencyDepts.length !== 1 ? "s" : ""} need attention
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            {totalMonthlyIncome - totalDepartmentBudget >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalMonthlyIncome - totalDepartmentBudget >= 0
                  ? "text-emerald-500"
                  : "text-destructive"
              }`}
            >
              {formatCurrency(Math.abs(totalMonthlyIncome - totalDepartmentBudget))}
              {totalMonthlyIncome - totalDepartmentBudget < 0 && (
                <span className="text-xs ml-1">loss</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly net result
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Efficiency Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Department Efficiency
              </CardTitle>
              <Link href="/dashboard/departments">
                <Button variant="ghost" size="sm">
                  Manage
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {departments.length > 0 ? (
                <DepartmentEfficiencyChart
                  departments={departments.map((d) => ({
                    name: d.name,
                    budget: d.totalBudget,
                    efficiency: d.efficiencyRating,
                  }))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No departments yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your departments with efficiency ratings to unlock AI analysis
                  </p>
                  <Link href="/dashboard/departments">
                    <Button variant="gradient">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis Panel */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Business Analyst
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Goal Type Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Analysis Goal</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={
                      analysisGoalType === "EFFICIENCY" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setAnalysisGoalType("EFFICIENCY")}
                    className="justify-start"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Save Money
                  </Button>
                  <Button
                    variant={
                      analysisGoalType === "GROWTH" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setAnalysisGoalType("GROWTH")}
                    className="justify-start"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Grow Revenue
                  </Button>
                </div>
              </div>

              {/* Analyze Button */}
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleAnalyze}
                disabled={isAnalyzing || departments.length === 0}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Business Path
                  </>
                )}
              </Button>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h4 className="font-semibold text-sm">Recommendations</h4>
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-xl border ${
                        suggestion.priority === "high"
                          ? "border-destructive/50 bg-destructive/5"
                          : suggestion.priority === "medium"
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-border bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {suggestion.priority === "high" ? (
                          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {suggestion.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.description.slice(0, 150)}...
                          </p>
                          {suggestion.potentialSavings && (
                            <p className="text-xs text-emerald-500 mt-1 font-medium">
                              Potential impact: {suggestion.potentialSavings}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {departments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add departments with efficiency ratings to unlock AI analysis
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Department List with Efficiency Sliders */}
      {departments.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Department Overview</CardTitle>
              <Link href="/dashboard/departments">
                <Button variant="ghost" size="sm">
                  Edit All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(dept.totalBudget)}/month
                            {dept.headcount && ` • ${dept.headcount} employees`}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            dept.efficiencyRating >= 7
                              ? "text-emerald-500"
                              : dept.efficiencyRating >= 5
                              ? "text-amber-500"
                              : "text-destructive"
                          }`}
                        >
                          {dept.efficiencyRating}/10
                        </div>
                      </div>
                      <Slider
                        value={[dept.efficiencyRating]}
                        max={10}
                        min={1}
                        step={1}
                        disabled
                        className="w-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

