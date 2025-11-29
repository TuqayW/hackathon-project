"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wallet,
  TrendingUp,
  Target,
  Loader2,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  variableExpenseSchema,
  extraEarningSchema,
  type VariableExpenseInput,
  type ExtraEarningInput,
} from "@/lib/validations";
import type { UserRole } from "@prisma/client";

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: UserRole;
}

export function QuickAddDialog({
  open,
  onOpenChange,
  userRole,
}: QuickAddDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"expense" | "earning">("expense");

  const expenseForm = useForm<VariableExpenseInput>({
    resolver: zodResolver(variableExpenseSchema),
    defaultValues: { name: "", amount: 0 },
  });

  const earningForm = useForm<ExtraEarningInput>({
    resolver: zodResolver(extraEarningSchema),
    defaultValues: { name: "", amount: 0 },
  });

  const handleExpenseSubmit = async (data: VariableExpenseInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: "VARIABLE_EXPENSE",
        }),
      });

      if (!response.ok) throw new Error("Failed to add expense");

      toast({
        title: "Expense added!",
        description: `$${data.amount} for "${data.name}" has been logged.`,
        variant: "success",
      });

      expenseForm.reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEarningSubmit = async (data: ExtraEarningInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: "EARNING",
        }),
      });

      if (!response.ok) throw new Error("Failed to add earning");

      toast({
        title: "Earning added!",
        description: `$${data.amount} from "${data.name}" has been logged.`,
        variant: "success",
      });

      earningForm.reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add earning. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Quick Add</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "expense" | "earning")}
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="expense" className="gap-2">
              <Wallet className="w-4 h-4" />
              Expense
            </TabsTrigger>
            <TabsTrigger value="earning" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Earning
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="expense" className="mt-6">
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="expense-name">What did you spend on?</Label>
                  <Input
                    id="expense-name"
                    placeholder="e.g., Groceries, Coffee, Gas"
                    {...expenseForm.register("name")}
                  />
                  {expenseForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {expenseForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-10"
                      {...expenseForm.register("amount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  {expenseForm.formState.errors.amount && (
                    <p className="text-sm text-destructive">
                      {expenseForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Log Expense
                    </>
                  )}
                </Button>
              </motion.form>
            </TabsContent>

            <TabsContent value="earning" className="mt-6">
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={earningForm.handleSubmit(handleEarningSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="earning-name">Source of income</Label>
                  <Input
                    id="earning-name"
                    placeholder="e.g., Freelance, Bonus, Gift"
                    {...earningForm.register("name")}
                  />
                  {earningForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {earningForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="earning-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="earning-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-10"
                      {...earningForm.register("amount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  {earningForm.formState.errors.amount && (
                    <p className="text-sm text-destructive">
                      {earningForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="success"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Log Earning
                    </>
                  )}
                </Button>
              </motion.form>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Quick links */}
        <div className="mt-4 pt-4 border-t flex items-center justify-center gap-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              router.push("/dashboard/goals");
            }}
          >
            <Target className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

