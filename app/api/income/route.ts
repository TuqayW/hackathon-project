import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizeToMonthly, normalizeToDaily } from "@/lib/utils";

const incomeSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  reliabilityRating: z.number().min(1).max(10).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomes = await prisma.income.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incomes });
  } catch (error) {
    console.error("Fetch income error:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
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
    const data = incomeSchema.parse(body);

    // Normalize amounts
    const monthlyAmount = normalizeToMonthly(data.amount, data.frequency);
    const dailyAmount = normalizeToDaily(data.amount, data.frequency);

    const income = await prisma.income.create({
      data: {
        userId: session.user.id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        monthlyAmount,
        dailyAmount,
        reliabilityRating: data.reliabilityRating,
      },
    });

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error("Create income error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}

