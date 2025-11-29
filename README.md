# 🎯 FinMate

A fun, gamified budget planning and goal-setting web application built with Next.js 15. FinMate helps individuals and businesses plan their financial path with smart savings goals, visual progress tracking, and AI-powered business analysis.

![FinMate](https://via.placeholder.com/1200x600/8b5cf6/ffffff?text=FinMate+-+Your+Financial+Journey+Starts+Here)

## ✨ Features

### For Personal Users
- **Pathfinder Goals** - Set savings goals with automatic daily/weekly/monthly breakdown
- **Emergency Fund Mode** - Add 20% buffer to any goal with a toggle
- **Income Tracking** - Add multiple income sources with frequency normalization (hourly, daily, weekly, monthly, yearly)
- **Fixed Expenses** - Schedule recurring expenses with automatic deduction on specific days
- **Variable Expenses** - Quick-add one-time expenses from the dashboard
- **Circular Progress Bars** - Beautiful animated progress visualization
- **Budget Breakdown Charts** - Pie charts showing income vs expenses

### For Business Users
- **Department Management** - Track department budgets with efficiency ratings (1-10)
- **AI Business Analyst** - GPT-4o powered analysis for cost optimization
- **Efficiency Analysis** - Identify high-cost, low-efficiency areas
- **Growth Planning** - Get AI recommendations for revenue growth
- **Team Analytics** - Track headcount and department ROI

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: PostgreSQL (via Supabase/Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **AI**: OpenAI API (GPT-4o mini)
- **Forms**: React Hook Form + Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TuqayW/hackathon-project
   cd FinMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database (Supabase or Neon PostgreSQL)
   DATABASE_URL="postgresql://username:password@localhost:5432/budgetpath?schema=public"

   # NextAuth.js
   AUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🗂️ Project Structure

```
budgetpath/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── goals/
│   │       ├── income/
│   │       ├── expenses/
│   │       ├── departments/
│   │       ├── analyze/
│   │       └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── goals/
│   │   ├── income/
│   │   ├── transactions/
│   │   ├── departments/
│   │   └── analyze/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── circular-progress.tsx
│   │   ├── expense-chart.tsx
│   │   ├── personal-dashboard.tsx
│   │   ├── company-dashboard.tsx
│   │   ├── header.tsx
│   │   ├── nav.tsx
│   │   └── quick-add-dialog.tsx
│   └── ui/
│       └── [shadcn components]
├── hooks/
│   ├── use-pathfinder.ts
│   ├── use-budget-summary.ts
│   └── use-toast.ts
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── validations.ts
└── prisma/
    └── schema.prisma
```

## 🧮 The Pathfinder Algorithm

The core of BudgetPath is the **Pathfinder** algorithm that calculates the exact daily savings needed:

```typescript
// Calculate days remaining
DaysRemaining = TargetDate - Today

// Calculate required amount (with optional 20% emergency buffer)
RequiredAmount = GoalAmount × (isEmergencyFund ? 1.20 : 1.00)

// Calculate daily and weekly save rates
DailySaveRate = RequiredAmount / DaysRemaining
WeeklySaveRate = DailySaveRate × 7

// Output: "Save $9 per day or $65 per week to reach your goal!"
```

## 🤖 AI Business Analysis

For business users, the AI analyst examines expense data with efficiency ratings:

1. **Input**: Department budgets + Efficiency ratings (1-10)
2. **Analysis**: Identifies high-cost, low-efficiency areas
3. **Output**: 3-5 specific, actionable recommendations

Example prompt structure:
```
Goal: EFFICIENCY (reduce costs)
Departments:
- Ad Department: $50,000/month | Efficiency: 4/10
- Engineering: $120,000/month | Efficiency: 9/10
- HR: $30,000/month | Efficiency: 3/10

→ AI suggests cutting HR by 20% and reallocating to Engineering
```

## 🎨 UI/UX Features

- **Dark Mode** by default with beautiful gradients
- **Animated circular progress bars** with glow effects
- **Responsive design** with mobile bottom navigation
- **Quick Add** floating action for instant expense/earning logging
- **Gamified progress** with celebration animations on goal completion

## 📱 Screenshots

### Landing Page
Clean, modern landing with gradient animations and feature cards.

### Personal Dashboard
Circular goal progress, budget breakdown charts, recent transactions.

### Company Dashboard
Department efficiency charts, AI analysis panel, expense optimization.

### Goals Page
Multiple goal tracking with individual progress circles and contribution buttons.

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT-based session management
- All API routes protected with authentication
- Role-based access control (PERSONAL vs COMPANY)
- Input validation with Zod schemas

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with 💜 by the FinMate team

