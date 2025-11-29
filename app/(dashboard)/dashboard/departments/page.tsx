"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Plus,
  Loader2,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { departmentSchema, type DepartmentInput } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  totalBudget: number;
  efficiencyRating: number;
  description?: string;
  headcount?: number;
}

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      efficiencyRating: 5,
    },
  });

  const efficiencyRating = watch("efficiencyRating");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DepartmentInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add department");

      toast({
        title: "Department added!",
        description: `"${data.name}" has been added with efficiency rating ${data.efficiencyRating}/10.`,
        variant: "success",
      });

      reset();
      setDialogOpen(false);
      fetchDepartments();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add department",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEfficiencyColor = (rating: number) => {
    if (rating >= 7) return "text-emerald-500";
    if (rating >= 5) return "text-amber-500";
    return "text-destructive";
  };

  const getEfficiencyBg = (rating: number) => {
    if (rating >= 7) return "bg-emerald-500/10";
    if (rating >= 5) return "bg-amber-500/10";
    return "bg-destructive/10";
  };

  const totalBudget = departments.reduce((sum, d) => sum + d.totalBudget, 0);
  const avgEfficiency =
    departments.length > 0
      ? departments.reduce((sum, d) => sum + d.efficiencyRating, 0) /
        departments.length
      : 0;
  const totalHeadcount = departments.reduce(
    (sum, d) => sum + (d.headcount || 0),
    0
  );

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-amber-500" />
            Departments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage department budgets and efficiency ratings
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input
                  placeholder="e.g., Engineering, Marketing, HR"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      {...register("totalBudget", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.totalBudget && (
                    <p className="text-sm text-destructive">
                      {errors.totalBudget.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Headcount (Optional)</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="pl-9"
                      {...register("headcount", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Efficiency Rating</Label>
                  <span
                    className={`text-lg font-bold ${getEfficiencyColor(
                      efficiencyRating || 5
                    )}`}
                  >
                    {efficiencyRating || 5}/10
                  </span>
                </div>
                <Slider
                  value={[efficiencyRating || 5]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) =>
                    setValue("efficiencyRating", value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Rate this department&apos;s ROI (1 = poor, 10 = excellent)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Notes about this department..."
                  {...register("description")}
                />
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
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {formatCurrency(totalBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${getEfficiencyColor(
                avgEfficiency
              )}`}
            >
              {avgEfficiency.toFixed(1)}/10
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Headcount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalHeadcount} <span className="text-lg">employees</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No departments yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add departments with efficiency ratings to unlock AI analysis
              </p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Department
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${getEfficiencyBg(
                            dept.efficiencyRating
                          )} flex items-center justify-center`}
                        >
                          <Building2
                            className={`w-6 h-6 ${getEfficiencyColor(
                              dept.efficiencyRating
                            )}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{dept.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(dept.totalBudget)}/month
                            {dept.headcount && ` • ${dept.headcount} employees`}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-xl font-bold ${getEfficiencyColor(
                          dept.efficiencyRating
                        )}`}
                      >
                        {dept.efficiencyRating}/10
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Slider
                        value={[dept.efficiencyRating]}
                        max={10}
                        min={1}
                        step={1}
                        disabled
                      />
                      {dept.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

