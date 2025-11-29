"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wallet,
  Plus,
  Loader2,
  Calendar,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  fixedExpenseSchema,
  variableExpenseSchema,
  type FixedExpenseInput,
  type VariableExpenseInput,
} from "@/lib/validations";
import { formatCurrency, formatRelativeTime, getOrdinalSuffix } from "@/lib/utils";

interface Transaction {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: "FIXED_EXPENSE" | "VARIABLE_EXPENSE" | "EARNING";
  dayOfMonth?: number;
  transactionDate: string;
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseType, setExpenseType] = useState<"fixed" | "variable">("fixed");

  const fixedForm = useForm<FixedExpenseInput>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: { dayOfMonth: 1 },
  });

  const variableForm = useForm<VariableExpenseInput>({
    resolver: zodResolver(variableExpenseSchema),
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFixedSubmit = async (data: FixedExpenseInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "FIXED_EXPENSE" }),
      });

      if (!response.ok) throw new Error("Failed to add expense");

      toast({
        title: "Fixed expense added!",
        description: `"${data.name}" will be deducted on the ${getOrdinalSuffix(data.dayOfMonth)} of each month.`,
        variant: "success",
      });

      fixedForm.reset();
      setDialogOpen(false);
      fetchTransactions();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVariableSubmit = async (data: VariableExpenseInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "VARIABLE_EXPENSE" }),
      });

      if (!response.ok) throw new Error("Failed to add expense");

      toast({
        title: "Expense logged!",
        description: `$${data.amount} for "${data.name}" has been recorded.`,
        variant: "success",
      });

      variableForm.reset();
      setDialogOpen(false);
      fetchTransactions();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fixedExpenses = transactions.filter((t) => t.type === "FIXED_EXPENSE");
  const variableExpenses = transactions.filter(
    (t) => t.type === "VARIABLE_EXPENSE"
  );

  const totalFixed = fixedExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Get this month's variable expenses
  const now = new Date();
  const thisMonthVariables = variableExpenses.filter((t) => {
    const date = new Date(t.transactionDate);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
  const totalVariable = thisMonthVariables.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-8 h-8 text-violet-500" />
            Expenses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your fixed and variable expenses
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>

            <Tabs
              value={expenseType}
              onValueChange={(v) => setExpenseType(v as "fixed" | "variable")}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="fixed">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fixed
                </TabsTrigger>
                <TabsTrigger value="variable">
                  <Wallet className="w-4 h-4 mr-2" />
                  Variable
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fixed" className="mt-4">
                <form
                  onSubmit={fixedForm.handleSubmit(onFixedSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Expense Name</Label>
                    <Input
                      placeholder="e.g., Rent, Netflix, Insurance"
                      {...fixedForm.register("name")}
                    />
                    {fixedForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {fixedForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-9"
                          {...fixedForm.register("amount", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Day of Month</Label>
                      <Select
                        value={String(fixedForm.watch("dayOfMonth") || 1)}
                        onValueChange={(v) =>
                          fixedForm.setValue("dayOfMonth", parseInt(v))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <SelectItem key={day} value={String(day)}>
                                {getOrdinalSuffix(day)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Add Fixed Expense</>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="variable" className="mt-4">
                <form
                  onSubmit={variableForm.handleSubmit(onVariableSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>What did you spend on?</Label>
                    <Input
                      placeholder="e.g., Groceries, Coffee, Gas"
                      {...variableForm.register("name")}
                    />
                    {variableForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {variableForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9"
                        {...variableForm.register("amount", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Log Expense</>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-violet-500/5 border-violet-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fixed Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-500">
              {formatCurrency(totalFixed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {fixedExpenses.length} recurring expense
              {fixedExpenses.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variable Expenses (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {formatCurrency(totalVariable)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthVariables.length} transaction
              {thisMonthVariables.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Tabs */}
      <Tabs defaultValue="fixed">
        <TabsList>
          <TabsTrigger value="fixed">Fixed Expenses</TabsTrigger>
          <TabsTrigger value="variable">Variable Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fixed/Recurring Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : fixedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    No fixed expenses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add recurring expenses like rent, subscriptions, etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {fixedExpenses.map((expense, index) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-violet-500" />
                          </div>
                          <div>
                            <p className="font-semibold">{expense.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Due on the{" "}
                              {getOrdinalSuffix(expense.dayOfMonth || 1)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-violet-500">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variable">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Variable Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : variableExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    No variable expenses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Log your daily spending to track where your money goes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {variableExpenses.slice(0, 20).map((expense, index) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-semibold">{expense.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeTime(expense.transactionDate)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-orange-500">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

