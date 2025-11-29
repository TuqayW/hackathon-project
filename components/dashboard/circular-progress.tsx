"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
  gradientId?: string;
}

export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 12,
  className,
  children,
  showPercentage = true,
  gradientId = "progressGradient",
}: CircularProgressProps) {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: "drop-shadow(0 4px 20px rgba(139, 92, 246, 0.3))" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: 0.2,
          }}
          filter="url(#glow)"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : showPercentage ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-emerald-500 bg-clip-text text-transparent">
              {Math.round(normalizedPercentage)}%
            </span>
            <p className="text-sm text-muted-foreground mt-1">Complete</p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

interface MultiRingProgressProps {
  rings: Array<{
    percentage: number;
    color: string;
    label: string;
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MultiRingProgress({
  rings,
  size = 200,
  strokeWidth = 10,
  className,
}: MultiRingProgressProps) {
  const gap = 4;
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {rings.map((ring, index) => {
          const adjustedRadius = (size - strokeWidth) / 2 - (strokeWidth + gap) * index;
          const circumference = adjustedRadius * 2 * Math.PI;
          const strokeDashoffset = circumference - (ring.percentage / 100) * circumference;

          return (
            <g key={index}>
              {/* Background */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={adjustedRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted/20"
              />
              {/* Progress */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={adjustedRadius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 0.2 + index * 0.15,
                }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {rings.slice(0, 3).map((ring, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-muted-foreground">{ring.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface GoalProgressCircleProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  daysRemaining: number;
  dailySaveRate: number;
  isEmergencyFund?: boolean;
  size?: number;
}

export function GoalProgressCircle({
  goalName,
  currentAmount,
  targetAmount,
  daysRemaining,
  dailySaveRate,
  isEmergencyFund = false,
  size = 220,
}: GoalProgressCircleProps) {
  const uniqueId = useId();
  const percentage = (currentAmount / targetAmount) * 100;
  
  return (
    <div className="flex flex-col items-center">
      <CircularProgress
        percentage={percentage}
        size={size}
        strokeWidth={14}
        showPercentage={false}
        gradientId={`goal-${uniqueId}`}
      >
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {goalName}
          </h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-emerald-500 bg-clip-text text-transparent">
            ${currentAmount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            of ${targetAmount.toLocaleString()}
          </p>
        </motion.div>
      </CircularProgress>
      
      <motion.div
        className="mt-4 text-center space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm font-medium">
          {daysRemaining > 0 ? (
            <>
              <span className="text-emerald-500">{daysRemaining}</span> days left
            </>
          ) : (
            <span className="text-amber-500">Goal deadline reached</span>
          )}
        </p>
        {dailySaveRate > 0 && daysRemaining > 0 && (
          <p className="text-xs text-muted-foreground">
            Save <span className="font-semibold text-foreground">${dailySaveRate.toFixed(2)}</span>/day
          </p>
        )}
        {isEmergencyFund && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            +20% Emergency Buffer
          </span>
        )}
      </motion.div>
    </div>
  );
}

