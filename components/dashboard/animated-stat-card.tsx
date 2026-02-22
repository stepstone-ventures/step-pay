"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { BudgetCard } from "@/components/dashboard/budget-card"

type AnimatedStatCardTone = "neutral" | "positive" | "negative"

type AnimatedStatCardProps = {
  title: string
  value: string
  subtitle: string
  tone?: AnimatedStatCardTone
  icon?: React.ReactNode
  action?: React.ReactNode
  delay?: number
  className?: string
  progress?: number
}

const accentColorByTone: Record<AnimatedStatCardTone, string> = {
  neutral: "#10B981",
  positive: "#10B981",
  negative: "#EF4444",
}

export function AnimatedStatCard({
  title,
  value,
  subtitle,
  tone = "neutral",
  icon,
  action,
  delay = 0,
  className,
  progress,
}: AnimatedStatCardProps) {
  const progressValue = typeof progress === "number" ? Math.round(progress) : null
  const clampedProgressWidth = progressValue !== null
    ? `${Math.min(Math.max(progressValue, 0), 100)}%`
    : "0%"
  const accentColor = accentColorByTone[tone]

  return (
    <BudgetCard
      delay={delay}
      className={cn("border border-[#E5E7EB] dark:border-[#374151]", className)}
      backgroundColor="#ffffff"
      radius={20}
      showShadow
    >
      <div className="flex items-center">
        <div
          className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: accentColor }}
        >
          {icon ?? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-white"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          )}
        </div>

        <p className="ml-2 m-0 text-[15px] text-[#374151] dark:text-gray-200">
          {title}
        </p>

        {action ? (
          <div className="ml-auto pl-2">{action}</div>
        ) : progressValue !== null ? (
          <span className="ml-auto pl-2 text-sm font-semibold" style={{ color: accentColor }}>
            {progressValue}%
          </span>
        ) : null}
      </div>

      <p className={cn("m-0 my-4 text-left text-[34px] font-semibold leading-none tracking-[-0.02em] text-[#1F2937] dark:text-gray-100")}>
        {value}
      </p>

      {progressValue !== null ? (
        <div className="relative h-2 w-full overflow-hidden rounded bg-[#E5E7EB] dark:bg-zinc-800">
          <div
            className="absolute left-0 top-0 h-full rounded transition-all duration-300 ease-out"
            style={{ width: clampedProgressWidth, backgroundColor: accentColor }}
          />
        </div>
      ) : null}

      <p className="mt-3 text-xs text-[#6B7280] dark:text-gray-400">{subtitle}</p>
    </BudgetCard>
  )
}
