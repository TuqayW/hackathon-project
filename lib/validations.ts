import { z } from "zod";

// ============================================
// AUTH VALIDATIONS
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["PERSONAL", "COMPANY"], {
      required_error: "Please select an account type",
    }),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "COMPANY" && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for business accounts",
      path: ["companyName"],
    }
  );

// ============================================
// INCOME VALIDATIONS
// ============================================

export const incomeSchema = z.object({
  name: z.string().min(1, "Income source name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  reliabilityRating: z.number().min(1).max(10).optional(),
});

// ============================================
// TRANSACTION VALIDATIONS
// ============================================

export const fixedExpenseSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be greater than 0"),
  dayOfMonth: z
    .number()
    .min(1, "Day must be between 1 and 31")
    .max(31, "Day must be between 1 and 31"),
});

export const variableExpenseSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be greater than 0"),
});

export const extraEarningSchema = z.object({
  name: z.string().min(1, "Source name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

// ============================================
// GOAL VALIDATIONS
// ============================================

export const personalGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  targetDate: z.date({
    required_error: "Target date is required",
  }),
  isEmergencyFund: z.boolean().default(false),
});

export const companyGoalSchema = z.object({
  goalType: z.enum(["EFFICIENCY", "GROWTH"]),
  growthTarget: z.number().positive().optional(),
});

// ============================================
// DEPARTMENT VALIDATIONS (Company Mode)
// ============================================

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  totalBudget: z.number().positive("Budget must be greater than 0"),
  efficiencyRating: z
    .number()
    .min(1, "Rating must be between 1 and 10")
    .max(10, "Rating must be between 1 and 10"),
  description: z.string().optional(),
  headcount: z.number().int().positive().optional(),
});

// ============================================
// GOAL CONTRIBUTION VALIDATION
// ============================================

export const goalContributionSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type FixedExpenseInput = z.infer<typeof fixedExpenseSchema>;
export type VariableExpenseInput = z.infer<typeof variableExpenseSchema>;
export type ExtraEarningInput = z.infer<typeof extraEarningSchema>;
export type PersonalGoalInput = z.infer<typeof personalGoalSchema>;
export type CompanyGoalInput = z.infer<typeof companyGoalSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type GoalContributionInput = z.infer<typeof goalContributionSchema>;

