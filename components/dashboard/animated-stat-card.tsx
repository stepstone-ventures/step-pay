"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedStatCardTone = "neutral" | "positive" | "negative"

type AnimatedStatCardProps = {
  title: string
  value: string
  subtitle: string
  tone?: AnimatedStatCardTone
  action?: React.ReactNode
  delay?: number
  className?: string
}

const valueColorByTone: Record<AnimatedStatCardTone, string> = {
  neutral: "text-white",
  positive: "text-green-400",
  negative: "text-red-400",
}

export function AnimatedStatCard({
  title,
  value,
  subtitle,
  tone = "neutral",
  action,
  delay = 0,
  className,
}: AnimatedStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/15 bg-black p-5 text-white shadow-[0_20px_45px_-30px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(255,255,255,0.02)_45%,rgba(0,0,0,0.7)_100%)] opacity-65" />
      <motion.div
        className="pointer-events-none absolute -left-1/2 top-0 h-px w-1/2 bg-white/70"
        animate={{ x: ["-20%", "250%"] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/65">
            {title}
          </p>
          {action}
        </div>
        <p className={cn("mt-3 text-3xl font-semibold tracking-tight", valueColorByTone[tone])}>
          {value}
        </p>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      </div>
    </motion.div>
  )
}
