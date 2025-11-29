"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseChartProps {
  data: ExpenseData[];
  title?: string;
}

const COLORS = [
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f97316", // coral
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#eab308", // yellow
];

export function ExpenseChart({ data, title }: ExpenseChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ExpenseData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-popover border rounded-xl shadow-xl p-3">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-muted-foreground">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="w-full h-[300px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            animationBegin={200}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="none"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

interface IncomeVsExpenseChartProps {
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
}

export function IncomeVsExpenseChart({
  income,
  fixedExpenses,
  variableExpenses,
}: IncomeVsExpenseChartProps) {
  const data = [
    { name: "Income", value: income, color: "#10b981" },
    { name: "Fixed Expenses", value: fixedExpenses, color: "#8b5cf6" },
    { name: "Variable Expenses", value: variableExpenses, color: "#f97316" },
  ];

  const savings = income - fixedExpenses - variableExpenses;
  if (savings > 0) {
    data.push({ name: "Savings", value: savings, color: "#06b6d4" });
  }

  return <ExpenseChart data={data} />;
}

interface DepartmentEfficiencyChartProps {
  departments: Array<{
    name: string;
    budget: number;
    efficiency: number;
  }>;
}

export function DepartmentEfficiencyChart({
  departments,
}: DepartmentEfficiencyChartProps) {
  // Color based on efficiency: red for low, green for high
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 7) return "#10b981"; // emerald
    if (efficiency >= 5) return "#eab308"; // yellow
    if (efficiency >= 3) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const data = departments.map((dept) => ({
    name: dept.name,
    value: dept.budget,
    color: getEfficiencyColor(dept.efficiency),
    efficiency: dept.efficiency,
  }));

  return <ExpenseChart data={data} title="Department Spending by Efficiency" />;
}

