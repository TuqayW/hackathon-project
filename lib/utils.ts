import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with proper locale and symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (part / total) * 100));
}

/**
 * Days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
}

/**
 * Normalize income/expense amount to monthly
 */
export function normalizeToMonthly(
  amount: number,
  frequency: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
): number {
  const multipliers = {
    HOURLY: 160, // 40 hours/week * 4 weeks
    DAILY: 30,
    WEEKLY: 4.33,
    MONTHLY: 1,
    YEARLY: 1 / 12,
  };
  return amount * multipliers[frequency];
}

/**
 * Normalize income/expense amount to daily
 */
export function normalizeToDaily(
  amount: number,
  frequency: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
): number {
  const multipliers = {
    HOURLY: 8, // 8 hours/day
    DAILY: 1,
    WEEKLY: 1 / 7,
    MONTHLY: 1 / 30,
    YEARLY: 1 / 365,
  };
  return amount * multipliers[frequency];
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date to relative time (e.g., "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Generate a random color from a predefined palette
 */
export function getChartColor(index: number): string {
  const colors = [
    "hsl(142, 76%, 36%)", // emerald-600
    "hsl(262, 83%, 58%)", // violet-500
    "hsl(25, 95%, 53%)",  // coral-500
    "hsl(199, 89%, 48%)", // sky-500
    "hsl(45, 93%, 47%)",  // amber-500
    "hsl(340, 82%, 52%)", // rose-500
    "hsl(173, 80%, 40%)", // teal-500
    "hsl(280, 87%, 65%)", // fuchsia-400
  ];
  return colors[index % colors.length];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Sleep utility for animations/delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

