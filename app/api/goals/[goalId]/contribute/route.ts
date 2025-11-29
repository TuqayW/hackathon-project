import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { differenceInDays } from "date-fns";

const contributeSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goalId } = await params;
    const body = await request.json();
    const data = contributeSchema.parse(body);

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Create contribution
    const contribution = await prisma.goalContribution.create({
      data: {
        goalId,
        amount: data.amount,
        note: data.note,
      },
    });

    // Update goal progress
    const newCurrentAmount = goal.currentAmount + data.amount;
    const today = new Date();
    const daysRemaining = Math.max(
      0,
      differenceInDays(goal.targetDate, today)
    );
    const remainingToSave = Math.max(0, goal.requiredAmount - newCurrentAmount);
    const dailySaveRate =
      daysRemaining > 0 ? remainingToSave / daysRemaining : remainingToSave;
    const weeklySaveRate = dailySaveRate * 7;

    const isCompleted = newCurrentAmount >= goal.requiredAmount;

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: newCurrentAmount,
        daysRemaining,
        dailySaveRate,
        weeklySaveRate,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      contribution,
      goalProgress: {
        currentAmount: newCurrentAmount,
        isCompleted,
        dailySaveRate,
      },
    });
  } catch (error) {
    console.error("Contribute to goal error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add contribution" },
      { status: 500 }
    );
  }
}

