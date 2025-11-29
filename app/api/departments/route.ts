import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1),
  totalBudget: z.number().positive(),
  efficiencyRating: z.number().min(1).max(10),
  description: z.string().optional(),
  headcount: z.number().int().positive().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify company account
    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "This feature is only available for business accounts" },
        { status: 403 }
      );
    }

    const departments = await prisma.department.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { name: "asc" },
      include: {
        transactions: {
          take: 5,
          orderBy: { transactionDate: "desc" },
        },
      },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Fetch departments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
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

    // Verify company account
    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "This feature is only available for business accounts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = departmentSchema.parse(body);

    const department = await prisma.department.create({
      data: {
        userId: session.user.id,
        name: data.name,
        totalBudget: data.totalBudget,
        efficiencyRating: data.efficiencyRating,
        description: data.description,
        headcount: data.headcount,
      },
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("Create department error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}

