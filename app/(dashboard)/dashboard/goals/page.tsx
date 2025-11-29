"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Target,
  Plus,
  Shield,
  Loader2,
  PiggyBank,
  PartyPopper,
  Sparkles,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Lightbulb,
  Award,
  History,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GoalProgressCircle } from "@/components/dashboard/circular-progress";
import { useToast } from "@/hooks/use-toast";
import { usePathfinder } from "@/hooks/use-pathfinder";
import { personalGoalSchema, type PersonalGoalInput } from "@/lib/validations";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  isEmergencyFund: boolean;
  requiredAmount: number;
  daysRemaining: number;
  dailySaveRate: number;
  weeklySaveRate: number;
  isCompleted: boolean;
}

interface GoalAnalysis {
  summary: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  milestones: Array<{
    date: string;
    amount: number;
    description: string;
  }>;
  strategies: Array<{
    title: string;
    description: string;
    savingsAmount: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
  }>;
  warnings: string[];
  motivationalTip: string;
  feasibilityScore: number;
}

interface PastAnalysis {
  id: string;
  createdAt: string;
  suggestions: Array<{
    title: string;
    description: string;
    potentialSavings?: string;
    priority: string;
  }>;
}

export default function GoalsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  
  // AI Analysis states
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<GoalAnalysis | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<PastAnalysis[]>([]);
  const [showPastAnalyses, setShowPastAnalyses] = useState(false);
  const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PersonalGoalInput>({
    resolver: zodResolver(personalGoalSchema),
    defaultValues: {
      isEmergencyFund: false,
    },
  });

  const watchedAmount = watch("targetAmount");
  const watchedDate = watch("targetDate");
  const watchedEmergency = watch("isEmergencyFund");

  // Preview pathfinder calculation
  const pathfinderPreview = usePathfinder({
    goalAmount: watchedAmount || 0,
    targetDate: watchedDate || new Date(),
    isEmergencyFund: watchedEmergency,
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      const data = await response.json();
      setGoals(data.goals || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PersonalGoalInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          targetDate: data.targetDate.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create goal");

      toast({
        title: "Goal created!",
        description: `Your path to "${data.name}" has been calculated.`,
        variant: "success",
      });

      reset();
      setDialogOpen(false);
      fetchGoals();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async () => {
    if (!selectedGoal || !contributeAmount) return;

    try {
      const response = await fetch(
        `/api/goals/${selectedGoal.id}/contribute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(contributeAmount),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add contribution");

      const data = await response.json();

      toast({
        title: data.goalProgress.isCompleted
          ? "🎉 Goal Achieved!"
          : "Contribution added!",
        description: data.goalProgress.isCompleted
          ? `Congratulations! You've reached your "${selectedGoal.name}" goal!`
          : `$${contributeAmount} added to "${selectedGoal.name}"`,
        variant: "success",
      });

      setContributeAmount("");
      setContributeDialogOpen(false);
      setSelectedGoal(null);
      fetchGoals();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add contribution",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeGoal = async (goal: Goal) => {
    setSelectedGoal(goal);
    setAnalyzeDialogOpen(true);
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    setPastAnalyses([]);

    try {
      // Fetch past analyses first
      const historyResponse = await fetch(`/api/goals/${goal.id}/analyze`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setPastAnalyses(historyData.analyses || []);
      }

      // Run new analysis
      const response = await fetch(`/api/goals/${goal.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const data = await response.json();
      setCurrentAnalysis(data.analysis);

      toast({
        title: "Analysis complete!",
        description: `Found ${data.analysis.strategies.length} savings strategies for you.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "🍔",
      entertainment: "🎬",
      transportation: "🚗",
      subscriptions: "📱",
      shopping: "🛍️",
      income: "💰",
      other: "💡",
    };
    return icons[category] || "💡";
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Your Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Set savings goals and get AI-powered plans to achieve them
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Vacation, New Laptop, Emergency Fund"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1000"
                    className="pl-8"
                    {...register("targetAmount", { valueAsNumber: true })}
                  />
                </div>
                {errors.targetAmount && (
                  <p className="text-sm text-destructive">
                    {errors.targetAmount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  {...register("targetDate", { valueAsDate: true })}
                />
                {errors.targetDate && (
                  <p className="text-sm text-destructive">
                    {errors.targetDate.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium">Emergency Fund Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Adds 20% buffer for safety
                    </p>
                  </div>
                </div>
                <Switch
                  checked={watchedEmergency}
                  onCheckedChange={(checked) =>
                    setValue("isEmergencyFund", checked)
                  }
                />
              </div>

              {/* Path Preview */}
              {watchedAmount > 0 && watchedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <p className="text-sm font-medium mb-2">📊 Your Path:</p>
                  <p className="text-lg">
                    Save{" "}
                    <span className="font-bold text-gradient">
                      ${pathfinderPreview.dailySave.toFixed(2)}
                    </span>{" "}
                    per day
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or ${pathfinderPreview.weeklySave.toFixed(2)} per week •{" "}
                    {pathfinderPreview.daysRemaining} days remaining
                  </p>
                  {watchedEmergency && (
                    <p className="text-xs text-amber-500 mt-2">
                      +20% buffer: Total target $
                      {pathfinderPreview.requiredAmount.toFixed(2)}
                    </p>
                  )}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Create Goal
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-muted rounded-full" />
                  <div className="mt-4 h-6 w-32 bg-muted rounded" />
                  <div className="mt-2 h-4 w-24 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
        <Card className="py-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start your financial journey by creating your first savings goal.
              We&apos;ll calculate exactly how much you need to save each day!
            </p>
            <Button variant="gradient" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {activeGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="card-hover h-full">
                        <CardContent className="pt-6">
                          <GoalProgressCircle
                            goalName={goal.name}
                            currentAmount={goal.currentAmount}
                            targetAmount={goal.requiredAmount}
                            daysRemaining={goal.daysRemaining}
                            dailySaveRate={goal.dailySaveRate}
                            isEmergencyFund={goal.isEmergencyFund}
                            size={180}
                          />

                          <div className="mt-4 space-y-2">
                            <div className="flex gap-2">
                              <Button
                                variant="gradient"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedGoal(goal);
                                  setContributeDialogOpen(true);
                                }}
                              >
                                <PiggyBank className="w-4 h-4 mr-1" />
                                Add Savings
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleAnalyzeGoal(goal)}
                              >
                                <Sparkles className="w-4 h-4 mr-1" />
                                AI Plan
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Target: {formatDate(goal.targetDate)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-emerald-500" />
                Completed Goals
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {completedGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className="bg-emerald-500/5 border-emerald-500/20"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{goal.name}</p>
                          <p className="text-sm text-emerald-500">
                            {formatCurrency(goal.targetAmount)} achieved!
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contribute Dialog */}
      <Dialog
        open={contributeDialogOpen}
        onOpenChange={setContributeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to "{selectedGoal?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount to add</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                />
              </div>
            </div>

            {selectedGoal && (
              <div className="p-3 rounded-xl bg-muted/50 text-sm">
                <p>
                  Current: {formatCurrency(selectedGoal.currentAmount)} /{" "}
                  {formatCurrency(selectedGoal.requiredAmount)}
                </p>
                {contributeAmount && (
                  <p className="text-emerald-500 mt-1">
                    After:{" "}
                    {formatCurrency(
                      selectedGoal.currentAmount + parseFloat(contributeAmount)
                    )}
                  </p>
                )}
              </div>
            )}

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleContribute}
              disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
            >
              <PiggyBank className="w-4 h-4 mr-2" />
              Add Savings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={analyzeDialogOpen} onOpenChange={setAnalyzeDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Savings Plan for "{selectedGoal?.name}"
            </DialogTitle>
          </DialogHeader>

          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <p className="mt-4 font-medium">Analyzing your finances...</p>
              <p className="text-sm text-muted-foreground">
                Creating a personalized savings plan for you
              </p>
            </div>
          ) : currentAnalysis ? (
            <div className="space-y-6">
              {/* Feasibility Score */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-emerald-500/10 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Goal Feasibility</span>
                  <span className={`text-2xl font-bold ${
                    currentAnalysis.feasibilityScore >= 80 ? 'text-emerald-500' :
                    currentAnalysis.feasibilityScore >= 50 ? 'text-amber-500' :
                    'text-red-500'
                  }`}>
                    {currentAnalysis.feasibilityScore}%
                  </span>
                </div>
                <Progress value={currentAnalysis.feasibilityScore} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {currentAnalysis.summary}
                </p>
              </div>

              {/* Savings Targets */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">
                    ${currentAnalysis.dailyTarget.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">
                    ${currentAnalysis.weeklyTarget.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">per week</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">
                    ${currentAnalysis.monthlyTarget.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>

              {/* Milestones */}
              {currentAnalysis.milestones.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Milestones
                  </h3>
                  <div className="space-y-2">
                    {currentAnalysis.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {formatCurrency(milestone.amount)} saved
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(milestone.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Savings Strategies */}
              {currentAnalysis.strategies.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Savings Strategies
                  </h3>
                  <div className="space-y-2">
                    {currentAnalysis.strategies.map((strategy, index) => (
                      <div
                        key={index}
                        className="border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setExpandedStrategy(expandedStrategy === index ? null : index)}
                      >
                        <div className="p-3 flex items-center gap-3">
                          <span className="text-xl">
                            {getCategoryIcon(strategy.category)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">{strategy.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(strategy.difficulty)}`}>
                                {strategy.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-emerald-500 font-medium">
                              {strategy.savingsAmount}
                            </p>
                          </div>
                          {expandedStrategy === index ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <AnimatePresence>
                          {expandedStrategy === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t bg-muted/30"
                            >
                              <p className="p-3 text-sm text-muted-foreground">
                                {strategy.description}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {currentAnalysis.warnings.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Things to Watch Out For
                  </h4>
                  <ul className="space-y-1">
                    {currentAnalysis.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Motivational Tip */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {currentAnalysis.motivationalTip}
                </p>
              </div>

              {/* Past Analyses Toggle */}
              {pastAnalyses.length > 0 && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowPastAnalyses(!showPastAnalyses)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showPastAnalyses ? "Hide" : "Show"} Past Analyses ({pastAnalyses.length})
                  </Button>
                  
                  <AnimatePresence>
                    {showPastAnalyses && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {pastAnalyses.map((analysis) => (
                          <div
                            key={analysis.id}
                            className="p-3 rounded-lg bg-muted/30 border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Analysis from {formatDate(analysis.createdAt)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {analysis.suggestions.length} strategies
                              </span>
                            </div>
                            <div className="space-y-1">
                              {analysis.suggestions.slice(0, 3).map((s, i) => (
                                <p key={i} className="text-xs text-muted-foreground">
                                  • {s.title}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load analysis. Please try again.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
