import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Initialize Google Generative AI with the @google/genai SDK
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ExpenseData {
  name: string;
  cost: number;
  efficiencyRating: number;
  description?: string;
  headcount?: number;
}

interface AnalysisRequest {
  goalType: "EFFICIENCY" | "GROWTH";
  growthTarget?: number;
}

interface Suggestion {
  title: string;
  description: string;
  potentialSavings?: string;
  priority: "high" | "medium" | "low";
  actionItems?: string[];
  impactArea?: string;
}

/**
 * POST /api/analyze
 * 
 * AI-powered business analysis endpoint using Google Gemini.
 * Analyzes expense data with efficiency ratings to provide actionable suggestions.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only company users can use this feature
    if (session.user.role !== "COMPANY") {
      return NextResponse.json(
        { error: "This feature is only available for business accounts" },
        { status: 403 }
      );
    }

    const body: AnalysisRequest = await request.json();
    const { goalType, growthTarget } = body;

    // Fetch company's departments with efficiency ratings
    const departments = await prisma.department.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        efficiencyRating: "asc",
      },
    });

    if (departments.length === 0) {
      return NextResponse.json(
        { error: "No departments found. Please add departments with efficiency ratings first." },
        { status: 400 }
      );
    }

    // Format expense data for AI
    const expenseData: ExpenseData[] = departments.map((dept: {
      name: string;
      totalBudget: number;
      efficiencyRating: number;
      description: string | null;
      headcount: number | null;
    }) => ({
      name: dept.name,
      cost: dept.totalBudget,
      efficiencyRating: dept.efficiencyRating,
      description: dept.description || undefined,
      headcount: dept.headcount || undefined,
    }));

    // Calculate totals for context
    const totalBudget = expenseData.reduce((sum, e) => sum + e.cost, 0);
    const avgEfficiency =
      expenseData.reduce((sum, e) => sum + e.efficiencyRating, 0) /
      expenseData.length;

    // Identify problem areas
    const lowEfficiencyDepts = expenseData.filter(e => e.efficiencyRating < 5);
    const highEfficiencyDepts = expenseData.filter(e => e.efficiencyRating >= 7);
    const highCostDepts = [...expenseData].sort((a, b) => b.cost - a.cost).slice(0, 3);

    // Build comprehensive prompt based on goal type
    let prompt = "";

    if (goalType === "EFFICIENCY") {
      prompt = `You are an expert business financial consultant. Analyze this company's financial data and provide DETAILED, SPECIFIC cost-saving recommendations.

## COMPANY FINANCIAL DATA

**Overview:**
- Total Monthly Budget: $${totalBudget.toLocaleString()}
- Average Efficiency Score: ${avgEfficiency.toFixed(1)}/10
- Number of Departments: ${expenseData.length}
- Departments with Low Efficiency (below 5/10): ${lowEfficiencyDepts.length}
- Departments with High Efficiency (7+ /10): ${highEfficiencyDepts.length}

**Department Details:**
${expenseData.map((e, i) => `
${i + 1}. **${e.name}**
   - Monthly Cost: $${e.cost.toLocaleString()}
   - Efficiency Rating: ${e.efficiencyRating}/10 ${e.efficiencyRating < 5 ? '⚠️ LOW' : e.efficiencyRating >= 7 ? '✅ HIGH' : ''}
   - Cost per Efficiency Point: $${(e.cost / e.efficiencyRating).toLocaleString()}
   ${e.headcount ? `- Headcount: ${e.headcount} employees` : ''}
   ${e.headcount ? `- Cost per Employee: $${(e.cost / e.headcount).toLocaleString()}` : ''}
   ${e.description ? `- Notes: ${e.description}` : ''}
`).join('')}

**Highest Cost Departments:** ${highCostDepts.map(d => d.name).join(', ')}
**Lowest Efficiency Departments:** ${lowEfficiencyDepts.map(d => `${d.name} (${d.efficiencyRating}/10)`).join(', ') || 'None'}

## YOUR TASK

Provide exactly 5 detailed cost-saving recommendations. For EACH recommendation, you MUST include:

1. **Clear Title** - A specific, actionable title
2. **Detailed Explanation** - Why this recommendation matters (2-3 sentences)
3. **Specific Actions** - Bullet points of exact steps to take
4. **Savings Estimate** - Quantified potential savings (dollar amount or percentage)
5. **Priority Level** - HIGH (immediate action needed), MEDIUM (plan within 30 days), or LOW (long-term consideration)
6. **Risk Assessment** - Any potential downsides to consider

Format your response as follows for each recommendation:

### RECOMMENDATION 1: [TITLE]
**Priority:** [HIGH/MEDIUM/LOW]
**Potential Savings:** $[AMOUNT] per month (or [X]%)
**Impact Area:** [Department name or "Company-wide"]

**Why This Matters:**
[2-3 sentence explanation]

**Action Steps:**
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]

**Risk Consideration:**
[Brief note on any risks]

---

(Repeat for all 5 recommendations)

Focus on:
- Departments with HIGH cost but LOW efficiency (best targets for cuts)
- Redundant processes or overstaffing
- Opportunities to consolidate or outsource
- Quick wins vs. long-term structural changes`;

    } else {
      // GROWTH goal type
      prompt = `You are an expert business growth strategist. Analyze this company's financial data and provide DETAILED, SPECIFIC recommendations to achieve revenue growth of $${(growthTarget || 10000).toLocaleString()}/month.

## COMPANY FINANCIAL DATA

**Overview:**
- Total Monthly Budget: $${totalBudget.toLocaleString()}
- Average Efficiency Score: ${avgEfficiency.toFixed(1)}/10
- Number of Departments: ${expenseData.length}
- Growth Target: +$${(growthTarget || 10000).toLocaleString()}/month
- Required ROI for Growth Investment: ${((growthTarget || 10000) / totalBudget * 100).toFixed(1)}%

**Department Details:**
${expenseData.map((e, i) => `
${i + 1}. **${e.name}**
   - Monthly Cost: $${e.cost.toLocaleString()}
   - Efficiency Rating: ${e.efficiencyRating}/10 ${e.efficiencyRating >= 7 ? '✅ HIGH ROI POTENTIAL' : e.efficiencyRating < 5 ? '⚠️ NEEDS IMPROVEMENT' : ''}
   - Budget Share: ${((e.cost / totalBudget) * 100).toFixed(1)}%
   ${e.headcount ? `- Headcount: ${e.headcount} employees` : ''}
   ${e.description ? `- Notes: ${e.description}` : ''}
`).join('')}

**High Efficiency Departments (Best for Investment):** ${highEfficiencyDepts.map(d => `${d.name} (${d.efficiencyRating}/10)`).join(', ') || 'None identified'}
**Low Efficiency Departments (Reallocate Funds From):** ${lowEfficiencyDepts.map(d => `${d.name} (${d.efficiencyRating}/10)`).join(', ') || 'None identified'}

## YOUR TASK

Provide exactly 5 detailed growth recommendations. For EACH recommendation, you MUST include:

1. **Clear Title** - A specific, actionable growth initiative
2. **Detailed Explanation** - Why this will drive growth (2-3 sentences)
3. **Investment Required** - How much to invest and where to get the funds
4. **Expected ROI** - Projected revenue increase
5. **Priority Level** - HIGH (implement immediately), MEDIUM (plan within 30 days), or LOW (long-term initiative)
6. **Timeline** - When to expect results

Format your response as follows for each recommendation:

### RECOMMENDATION 1: [TITLE]
**Priority:** [HIGH/MEDIUM/LOW]
**Investment Needed:** $[AMOUNT] per month
**Expected Revenue Increase:** $[AMOUNT] per month (or [X]% growth)
**Impact Area:** [Department name or "Company-wide"]
**Timeline:** [When to expect results]

**Growth Strategy:**
[2-3 sentence explanation of the growth opportunity]

**Action Steps:**
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]

**Funding Source:**
[Where to reallocate budget from, if applicable]

---

(Repeat for all 5 recommendations)

Focus on:
- Investing MORE in high-efficiency departments (they deliver best ROI)
- Cutting low-efficiency areas to fund growth initiatives
- Sales and marketing optimization
- Technology investments that scale
- Strategic hiring in revenue-generating roles`;
    }

    // Call Gemini API using @google/genai SDK
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9,
      },
    });

    const rawResponse = response.text || "";

    if (!rawResponse) {
      throw new Error("Empty response from AI");
    }

    // Parse the response into structured suggestions
    const suggestions = parseDetailedSuggestions(rawResponse, goalType);

    // Store the analysis in the database
    await prisma.aIAnalysis.create({
      data: {
        userId: session.user.id,
        goalType: goalType,
        inputData: expenseData as any,   // ← FIX
        suggestions: suggestions as any, // optional but recommended
        rawResponse: rawResponse,
        model: "gemini-2.0-flash",
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      },
    });


    return NextResponse.json({
      success: true,
      analysis: {
        goalType,
        totalBudget,
        avgEfficiency,
        suggestions,
        rawResponse,
        metadata: {
          departmentCount: expenseData.length,
          lowEfficiencyCount: lowEfficiencyDepts.length,
          highEfficiencyCount: highEfficiencyDepts.length,
        }
      },
    });
  } catch (error) {
    console.error("AI Analysis error:", error);

    // Check for specific API errors
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("API key") || error.message.includes("apiKey")) {
        return NextResponse.json(
          { error: "AI service not configured. Please add your GEMINI_API_KEY to .env file." },
          { status: 503 }
        );
      }
      if (error.message.includes("quota") || error.message.includes("rate") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "AI service rate limit reached. Please try again in a moment." },
          { status: 429 }
        );
      }
      console.error("Error details:", error.message);
    }

    return NextResponse.json(
      { error: "Failed to analyze business data. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Parse AI response into structured suggestions with detailed information
 */
function parseDetailedSuggestions(response: string, goalType: "EFFICIENCY" | "GROWTH"): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Split by recommendation headers
  const recommendationBlocks = response.split(/###\s*RECOMMENDATION\s*\d+:/i);

  for (const block of recommendationBlocks) {
    if (!block.trim() || block.length < 50) continue;

    // Extract title (first line after split)
    const lines = block.trim().split('\n');
    const titleLine = lines[0]?.trim();
    if (!titleLine) continue;

    const title = titleLine.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '').trim();

    // Extract priority
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(HIGH|MEDIUM|LOW)/i);
    let priority: "high" | "medium" | "low" = "medium";
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase() as "high" | "medium" | "low";
    }

    // Extract potential savings/investment
    let potentialSavings: string | undefined;
    const savingsMatch = block.match(/\*\*(?:Potential Savings|Expected Revenue Increase|Investment Needed):\*\*\s*([^\n]+)/i);
    if (savingsMatch) {
      potentialSavings = savingsMatch[1].trim();
    }

    // Extract impact area
    const impactMatch = block.match(/\*\*Impact Area:\*\*\s*([^\n]+)/i);
    const impactArea = impactMatch ? impactMatch[1].trim() : undefined;

    // Extract description (Why This Matters or Growth Strategy section)
    let description = "";
    const descMatch = block.match(/\*\*(?:Why This Matters|Growth Strategy):\*\*\s*([\s\S]*?)(?=\*\*Action Steps|\*\*Funding|---|\n\n\*\*|$)/i);
    if (descMatch) {
      description = descMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
    }

    // If no description found, try to get general content
    if (!description) {
      const generalDesc = block.slice(0, 500).replace(/\*\*/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ');
      description = generalDesc.slice(0, 300) + (generalDesc.length > 300 ? '...' : '');
    }

    // Extract action items
    const actionItems: string[] = [];
    const actionsMatch = block.match(/\*\*Action Steps:\*\*\s*([\s\S]*?)(?=\*\*Risk|\*\*Funding|---|\n\n\*\*|$)/i);
    if (actionsMatch) {
      const actionLines = actionsMatch[1].split('\n');
      for (const line of actionLines) {
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine && cleanLine.length > 5) {
          actionItems.push(cleanLine);
        }
      }
    }

    // Add the suggestion
    if (title && title.length > 3) {
      suggestions.push({
        title: title.slice(0, 100),
        description: description || `${goalType === 'EFFICIENCY' ? 'Cost optimization' : 'Growth'} recommendation for your business.`,
        potentialSavings,
        priority,
        actionItems: actionItems.slice(0, 5),
        impactArea,
      });
    }
  }

  // If parsing failed, try alternative parsing
  if (suggestions.length === 0) {
    // Try splitting by numbered items
    const numberedBlocks = response.split(/\n(?=\d+\.\s)/);
    
    for (const block of numberedBlocks) {
      if (block.trim().length < 20) continue;

      const firstLine = block.split('\n')[0] || '';
      const title = firstLine.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      
      if (title && title.length > 5) {
        const restOfBlock = block.slice(firstLine.length).trim();
        
        // Determine priority from content
        let priority: "high" | "medium" | "low" = "medium";
        const lowerBlock = block.toLowerCase();
        if (lowerBlock.includes("critical") || lowerBlock.includes("immediate") || lowerBlock.includes("urgent")) {
          priority = "high";
        } else if (lowerBlock.includes("consider") || lowerBlock.includes("long-term") || lowerBlock.includes("optional")) {
          priority = "low";
        }

        // Extract savings/growth amounts
        const amountMatch = block.match(/\$[\d,]+(?:\.?\d{0,2})?(?:\s*-\s*\$[\d,]+)?|\d+(?:\.\d+)?%/);

        suggestions.push({
          title: title.slice(0, 100),
          description: restOfBlock.replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 400).trim() || 'Business optimization recommendation.',
          potentialSavings: amountMatch?.[0],
          priority,
        });
      }
    }
  }

  // If still no suggestions, return the raw response as a single suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      title: goalType === 'EFFICIENCY' ? "Cost Optimization Analysis" : "Growth Strategy Analysis",
      description: response.slice(0, 500).replace(/\*\*/g, '').replace(/###/g, '').replace(/\n/g, ' ').trim(),
      priority: "medium",
    });
  }

  return suggestions.slice(0, 5); // Return max 5 suggestions
}

/**
 * GET /api/analyze
 * 
 * Fetch past analyses for the current user (company only - EFFICIENCY and GROWTH types)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only fetch company analyses (EFFICIENCY and GROWTH), not personal goal analyses
    const analyses = await prisma.aIAnalysis.findMany({
      where: {
        userId: session.user.id,
        goalType: {
          in: ["EFFICIENCY", "GROWTH"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Fetch analyses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
