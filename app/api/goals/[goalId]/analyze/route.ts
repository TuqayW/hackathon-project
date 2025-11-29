import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInDays, format, addDays } from "date-fns";

// Initialize Google Generative AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GoalAnalysisResult {
  summary: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  milestones: Array<{
    date: string;
    amount: number;
    description: string;
  }>;
  strategies: Array<{
    title: string;
    description: string;
    savingsAmount: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
  }>;
  warnings: string[];
  motivationalTip: string;
  feasibilityScore: number;
}

/**
 * POST /api/goals/[goalId]/analyze
 * 
 * AI-powered goal analysis for personal users.
 * Provides detailed savings plan and strategies to reach the goal.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { goalId } = await params;

    // Fetch the goal
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // Fetch user's income and expenses for context
    const [incomes, transactions] = await Promise.all([
      prisma.income.findMany({
        where: { userId: session.user.id, isActive: true },
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { transactionDate: "desc" },
        take: 50,
      }),
    ]);

    // Calculate financial context
    const totalMonthlyIncome = incomes.reduce((sum, inc) => sum + inc.monthlyAmount, 0);
    const fixedExpenses = transactions
      .filter(t => t.type === "FIXED_EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const now = new Date();
    const thisMonthVariables = transactions
      .filter(t => {
        if (t.type !== "VARIABLE_EXPENSE") return false;
        const date = new Date(t.transactionDate);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const disposableIncome = totalMonthlyIncome - fixedExpenses - thisMonthVariables;
    const dailyDisposable = disposableIncome / 30;

    // Calculate goal metrics
    const daysRemaining = Math.max(0, differenceInDays(new Date(goal.targetDate), now));
    const amountRemaining = Math.max(0, goal.requiredAmount - goal.currentAmount);
    const requiredDaily = daysRemaining > 0 ? amountRemaining / daysRemaining : amountRemaining;
    const requiredWeekly = requiredDaily * 7;
    const requiredMonthly = requiredDaily * 30;

    const isFeasible = requiredDaily <= dailyDisposable;
    const feasibilityPercentage = dailyDisposable > 0 ? Math.min(100, (dailyDisposable / requiredDaily) * 100) : 0;

    // Build the AI prompt
    const prompt = `You are a friendly personal finance coach helping someone reach their savings goal. Analyze their situation and provide a detailed, actionable savings plan.

## USER'S GOAL DETAILS

**Goal:** ${goal.name}
**Target Amount:** $${goal.targetAmount.toLocaleString()}
${goal.isEmergencyFund ? `**Emergency Fund Buffer:** +20% (Total needed: $${goal.requiredAmount.toLocaleString()})` : ''}
**Already Saved:** $${goal.currentAmount.toLocaleString()} (${((goal.currentAmount / goal.requiredAmount) * 100).toFixed(1)}% complete)
**Amount Remaining:** $${amountRemaining.toLocaleString()}
**Target Date:** ${format(new Date(goal.targetDate), 'MMMM d, yyyy')}
**Days Remaining:** ${daysRemaining} days

## USER'S FINANCIAL SITUATION

**Monthly Income:** $${totalMonthlyIncome.toLocaleString()}
**Fixed Monthly Expenses:** $${fixedExpenses.toLocaleString()}
**Variable Expenses (this month):** $${thisMonthVariables.toLocaleString()}
**Estimated Disposable Income:** $${disposableIncome.toLocaleString()}/month ($${dailyDisposable.toFixed(2)}/day)

## REQUIRED SAVINGS RATE

- Daily: $${requiredDaily.toFixed(2)}
- Weekly: $${requiredWeekly.toFixed(2)}
- Monthly: $${requiredMonthly.toFixed(2)}

**Is this achievable?** ${isFeasible ? 'YES - User has enough disposable income' : 'CHALLENGING - Required savings exceeds current disposable income'}
**Feasibility Score:** ${feasibilityPercentage.toFixed(0)}%

## YOUR TASK

Provide a comprehensive savings plan with:

1. **SUMMARY** (2-3 sentences about their situation and likelihood of success)

2. **MILESTONES** - Create 4-5 milestone checkpoints from now until the goal date:
   For each milestone, provide:
   - Target date
   - Amount that should be saved by then
   - A brief description/celebration point

3. **SAVINGS STRATEGIES** - Provide 5-7 specific, actionable ways to save money:
   For each strategy:
   - A clear title
   - Detailed description of how to implement it
   - Estimated monthly savings amount
   - Difficulty level (easy/medium/hard)
   - Category (food, entertainment, transportation, subscriptions, shopping, income, other)

4. **WARNINGS** - Any concerns or obstacles to be aware of (2-3 points)

5. **MOTIVATIONAL TIP** - One encouraging message to keep them motivated

Format your response EXACTLY as follows (use this exact JSON structure):

\`\`\`json
{
  "summary": "Your 2-3 sentence summary here",
  "milestones": [
    {"date": "YYYY-MM-DD", "amount": 0, "description": "Milestone description"}
  ],
  "strategies": [
    {
      "title": "Strategy title",
      "description": "Detailed description",
      "savingsAmount": "$X per month",
      "difficulty": "easy|medium|hard",
      "category": "food|entertainment|transportation|subscriptions|shopping|income|other"
    }
  ],
  "warnings": ["Warning 1", "Warning 2"],
  "motivationalTip": "Your motivational message here"
}
\`\`\`

Be specific with dollar amounts and dates. Make strategies realistic and actionable for everyday people.`;

    // Call Gemini API
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const rawResponse = response.text || "";

    if (!rawResponse) {
      throw new Error("Empty response from AI");
    }

    // Parse the JSON response
    let analysisResult: GoalAnalysisResult;
    
    try {
      // Extract JSON from the response
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawResponse;
      const parsed = JSON.parse(jsonStr);
      
      analysisResult = {
        summary: parsed.summary || "Analysis complete.",
        dailyTarget: requiredDaily,
        weeklyTarget: requiredWeekly,
        monthlyTarget: requiredMonthly,
        milestones: parsed.milestones || [],
        strategies: parsed.strategies || [],
        warnings: parsed.warnings || [],
        motivationalTip: parsed.motivationalTip || "Keep going! Every dollar saved brings you closer to your goal.",
        feasibilityScore: Math.round(feasibilityPercentage),
      };
    } catch {
      // Fallback if JSON parsing fails
      analysisResult = {
        summary: rawResponse.slice(0, 300),
        dailyTarget: requiredDaily,
        weeklyTarget: requiredWeekly,
        monthlyTarget: requiredMonthly,
        milestones: generateDefaultMilestones(goal, daysRemaining, amountRemaining),
        strategies: [],
        warnings: ["Could not parse AI response fully. Please try again."],
        motivationalTip: "Stay focused on your goal!",
        feasibilityScore: Math.round(feasibilityPercentage),
      };
    }

    // Store the analysis
    await prisma.aIAnalysis.create({
      data: {
        userId: session.user.id,
        goalType: "PERSONAL_GOAL",
        inputData: {
          goalId: goal.id,
          goalName: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate,
          daysRemaining,
          monthlyIncome: totalMonthlyIncome,
          monthlyExpenses: fixedExpenses + thisMonthVariables,
        },
        suggestions: analysisResult.strategies.map(s => ({
          title: s.title,
          description: s.description,
          potentialSavings: s.savingsAmount,
          priority: s.difficulty === "easy" ? "low" : s.difficulty === "hard" ? "high" : "medium",
        })),
        rawResponse: rawResponse,
        model: "gemini-2.0-flash",
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      goal: {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        requiredAmount: goal.requiredAmount,
        targetDate: goal.targetDate,
        daysRemaining,
        progress: (goal.currentAmount / goal.requiredAmount) * 100,
      },
      financialContext: {
        monthlyIncome: totalMonthlyIncome,
        monthlyExpenses: fixedExpenses + thisMonthVariables,
        disposableIncome,
        dailyDisposable,
        isFeasible,
      },
    });
  } catch (error) {
    console.error("Goal analysis error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("apiKey")) {
        return NextResponse.json(
          { error: "AI service not configured. Please add GEMINI_API_KEY." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze goal. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Generate default milestones if AI parsing fails
 */
function generateDefaultMilestones(
  goal: { requiredAmount: number; currentAmount: number; targetDate: Date },
  daysRemaining: number,
  amountRemaining: number
) {
  const milestones = [];
  const today = new Date();
  const steps = 4;
  
  for (let i = 1; i <= steps; i++) {
    const daysToMilestone = Math.round((daysRemaining / steps) * i);
    const targetAmount = goal.currentAmount + (amountRemaining / steps) * i;
    const milestoneDate = addDays(today, daysToMilestone);
    
    milestones.push({
      date: format(milestoneDate, "yyyy-MM-dd"),
      amount: Math.round(targetAmount),
      description: i === steps 
        ? "🎉 Goal achieved!" 
        : `${Math.round((i / steps) * 100)}% milestone - Keep going!`,
    });
  }
  
  return milestones;
}

/**
 * GET /api/goals/[goalId]/analyze
 * 
 * Fetch past analyses for a specific goal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goalId } = await params;

    // Fetch analyses for this goal
    const analyses = await prisma.aIAnalysis.findMany({
      where: {
        userId: session.user.id,
        goalType: "PERSONAL_GOAL",
        inputData: {
          path: ["goalId"],
          equals: goalId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Fetch goal analyses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

