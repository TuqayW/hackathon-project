import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PersonalDashboard } from "@/components/dashboard/personal-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company-dashboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

async function getDashboardData(userId: string, role: "PERSONAL" | "COMPANY") {
  const [incomes, transactions, goals, budgetSummary] = await Promise.all([
    prisma.income.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: "desc" },
      take: 50,
    }),
    prisma.goal.findMany({
      where: { userId, isCompleted: false },
      orderBy: { targetDate: "asc" },
    }),
    prisma.budgetSummary.findUnique({
      where: { userId },
    }),
  ]);

  // For company users, also fetch departments
  let departments = null;
  if (role === "COMPANY") {
    departments = await prisma.department.findMany({
      where: { userId, isActive: true },
      orderBy: { efficiencyRating: "asc" },
    });
  }

  return {
    incomes,
    transactions,
    goals,
    budgetSummary,
    departments,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id, session.user.role);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {session.user.role === "COMPANY" ? (
        <CompanyDashboard
          user={session.user}
          incomes={data.incomes}
          transactions={data.transactions}
          goals={data.goals}
          departments={data.departments || []}
          budgetSummary={data.budgetSummary}
        />
      ) : (
        <PersonalDashboard
          user={session.user}
          incomes={data.incomes}
          transactions={data.transactions}
          goals={data.goals}
          budgetSummary={data.budgetSummary}
        />
      )}
    </Suspense>
  );
}

