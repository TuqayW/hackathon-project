"use client";

import { useMemo } from "react";
import { differenceInDays, isBefore, isToday, startOfDay } from "date-fns";

interface PathfinderResult {
  dailySave: number;
  weeklySave: number;
  monthlySave: number;
  daysRemaining: number;
  requiredAmount: number;
  isPossible: boolean;
  isOverdue: boolean;
  progressPercentage: number;
  projectedDate: Date | null;
  statusMessage: string;
  savingsMessage: string;
}

interface PathfinderOptions {
  goalAmount: number;
  targetDate: Date;
  isEmergencyFund?: boolean;
  currentSaved?: number;
  dailyDisposableIncome?: number;
}

/**
 * The Pathfinder Hook
 * 
 * Calculates the mathematical "path" to achieve a financial goal.
 * This is the core algorithm that powers FinMate's goal system.
 * 
 * @param options - Goal parameters
 * @returns PathfinderResult with daily/weekly savings targets and feasibility analysis
 */
export function usePathfinder(options: PathfinderOptions): PathfinderResult {
  const {
    goalAmount,
    targetDate,
    isEmergencyFund = false,
    currentSaved = 0,
    dailyDisposableIncome,
  } = options;

  return useMemo(() => {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(targetDate));
    
    // Calculate days remaining
    const daysRemaining = differenceInDays(target, today);
    const isOverdue = isBefore(target, today) && !isToday(target);
    
    // Calculate required amount (add 20% buffer for emergency funds)
    const emergencyMultiplier = isEmergencyFund ? 1.2 : 1;
    const requiredAmount = goalAmount * emergencyMultiplier;
    
    // Calculate remaining amount to save
    const remainingToSave = Math.max(0, requiredAmount - currentSaved);
    
    // Calculate progress percentage
    const progressPercentage = requiredAmount > 0 
      ? Math.min(100, (currentSaved / requiredAmount) * 100) 
      : 0;
    
    // Calculate savings rates
    let dailySave = 0;
    let weeklySave = 0;
    let monthlySave = 0;
    let isPossible = true;
    let projectedDate: Date | null = null;
    let statusMessage = "";
    let savingsMessage = "";

    if (remainingToSave <= 0) {
      // Goal already achieved!
      statusMessage = "🎉 Congratulations! You've reached your goal!";
      savingsMessage = "Goal achieved!";
      projectedDate = today;
    } else if (daysRemaining <= 0) {
      // Target date has passed
      if (daysRemaining === 0) {
        // It's today
        dailySave = remainingToSave;
        weeklySave = remainingToSave;
        monthlySave = remainingToSave;
        statusMessage = "⚠️ Today is the deadline!";
        savingsMessage = `Save $${remainingToSave.toFixed(2)} today to hit your goal!`;
      } else {
        // Overdue
        isPossible = false;
        statusMessage = "❌ Target date has passed. Consider updating your goal.";
        savingsMessage = `You still need $${remainingToSave.toFixed(2)}`;
      }
    } else {
      // Calculate required saving rates
      dailySave = remainingToSave / daysRemaining;
      weeklySave = dailySave * 7;
      monthlySave = dailySave * 30;

      // Check if it's possible based on disposable income
      if (dailyDisposableIncome !== undefined) {
        if (dailySave > dailyDisposableIncome) {
          isPossible = false;
          
          // Calculate when it would actually be achievable
          if (dailyDisposableIncome > 0) {
            const actualDaysNeeded = Math.ceil(remainingToSave / dailyDisposableIncome);
            projectedDate = new Date(today);
            projectedDate.setDate(projectedDate.getDate() + actualDaysNeeded);
            
            statusMessage = `⚠️ This goal needs $${dailySave.toFixed(2)}/day, but you only have $${dailyDisposableIncome.toFixed(2)}/day available.`;
            savingsMessage = `At your current rate, you'd reach this goal by ${projectedDate.toLocaleDateString()}`;
          } else {
            statusMessage = "❌ No disposable income available for savings.";
            savingsMessage = "Review your budget to free up funds.";
          }
        } else {
          isPossible = true;
          const bufferDays = Math.floor((dailyDisposableIncome - dailySave) / dailySave * daysRemaining);
          
          if (bufferDays > 7) {
            statusMessage = "🚀 Great pace! You have room to save even more.";
          } else if (bufferDays > 0) {
            statusMessage = "✅ You're on track! Keep it up.";
          } else {
            statusMessage = "💪 Tight but achievable. Stay focused!";
          }
          
          savingsMessage = `Save $${dailySave.toFixed(2)}/day or $${weeklySave.toFixed(2)}/week`;
        }
      } else {
        // No income data, just show the requirements
        statusMessage = `📊 ${daysRemaining} days remaining`;
        savingsMessage = `Save $${dailySave.toFixed(2)}/day or $${weeklySave.toFixed(2)}/week`;
      }
    }

    return {
      dailySave: Math.round(dailySave * 100) / 100,
      weeklySave: Math.round(weeklySave * 100) / 100,
      monthlySave: Math.round(monthlySave * 100) / 100,
      daysRemaining: Math.max(0, daysRemaining),
      requiredAmount,
      isPossible,
      isOverdue,
      progressPercentage,
      projectedDate,
      statusMessage,
      savingsMessage,
    };
  }, [goalAmount, targetDate, isEmergencyFund, currentSaved, dailyDisposableIncome]);
}

/**
 * Calculate pathfinder results without React hook (for server-side use)
 */
export function calculatePathfinder(options: PathfinderOptions): PathfinderResult {
  const {
    goalAmount,
    targetDate,
    isEmergencyFund = false,
    currentSaved = 0,
  } = options;

  const today = startOfDay(new Date());
  const target = startOfDay(new Date(targetDate));
  
  const daysRemaining = differenceInDays(target, today);
  const isOverdue = isBefore(target, today) && !isToday(target);
  
  const emergencyMultiplier = isEmergencyFund ? 1.2 : 1;
  const requiredAmount = goalAmount * emergencyMultiplier;
  const remainingToSave = Math.max(0, requiredAmount - currentSaved);
  
  const progressPercentage = requiredAmount > 0 
    ? Math.min(100, (currentSaved / requiredAmount) * 100) 
    : 0;
  
  let dailySave = 0;
  let weeklySave = 0;
  let monthlySave = 0;

  if (daysRemaining > 0 && remainingToSave > 0) {
    dailySave = remainingToSave / daysRemaining;
    weeklySave = dailySave * 7;
    monthlySave = dailySave * 30;
  }

  return {
    dailySave: Math.round(dailySave * 100) / 100,
    weeklySave: Math.round(weeklySave * 100) / 100,
    monthlySave: Math.round(monthlySave * 100) / 100,
    daysRemaining: Math.max(0, daysRemaining),
    requiredAmount,
    isPossible: daysRemaining > 0,
    isOverdue,
    progressPercentage,
    projectedDate: null,
    statusMessage: "",
    savingsMessage: `Save $${dailySave.toFixed(2)}/day or $${weeklySave.toFixed(2)}/week`,
  };
}

