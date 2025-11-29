import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { differenceInDays } from "date-fns";

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().transform((str) => new Date(str)),
  isEmergencyFund: z.boolean().default(false),
  goalType: z.enum(["PERSONAL_GOAL", "EFFICIENCY", "GROWTH"]).default("PERSONAL_GOAL"),
  growthTarget: z.number().positive().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { targetDate: "asc" },
      include: {
        contributions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Fetch goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = goalSchema.parse(body);

    const today = new Date();
    const daysRemaining = Math.max(0, differenceInDays(data.targetDate, today));

    // Calculate required amount (with 20% buffer for emergency fund)
    const requiredAmount = data.isEmergencyFund
      ? data.targetAmount * 1.2
      : data.targetAmount;

    // Calculate savings rates
    const dailySaveRate = daysRemaining > 0 ? requiredAmount / daysRemaining : requiredAmount;
    const weeklySaveRate = dailySaveRate * 7;

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate,
        isEmergencyFund: data.isEmergencyFund,
        requiredAmount,
        daysRemaining,
        dailySaveRate,
        weeklySaveRate,
        goalType: data.goalType,
        growthTarget: data.growthTarget,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

