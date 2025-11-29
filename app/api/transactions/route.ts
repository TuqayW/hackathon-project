import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const transactionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(["EARNING", "FIXED_EXPENSE", "VARIABLE_EXPENSE"]),
  dayOfMonth: z.number().min(1).max(31).optional(),
  departmentId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { transactionDate: "desc" },
      include: { department: true },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
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
    const data = transactionSchema.parse(body);

    // Calculate monthly and daily amounts for fixed expenses
    let monthlyAmount = null;
    let dailyAmount = null;

    if (data.type === "FIXED_EXPENSE") {
      monthlyAmount = data.amount;
      dailyAmount = data.amount / 30;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        name: data.name,
        description: data.description,
        amount: data.amount,
        type: data.type,
        dayOfMonth: data.type === "FIXED_EXPENSE" ? data.dayOfMonth : null,
        monthlyAmount,
        dailyAmount,
        departmentId: data.departmentId,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

