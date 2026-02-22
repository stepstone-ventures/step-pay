"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type BudgetCardProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  backgroundColor?: string
  darkBackgroundColor?: string
  radius?: number
  showShadow?: boolean
}

export function BudgetCard({
  children,
  className,
  delay = 0,
  backgroundColor = "#ffffff",
  darkBackgroundColor = "#000000",
  radius = 20,
  showShadow = true,
}: BudgetCardProps) {
  const { theme } = useTheme()
  const resolvedBackgroundColor = theme === "dark" ? darkBackgroundColor : backgroundColor

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={cn("flex h-full w-full flex-col justify-between overflow-hidden", className)}
      style={{
        backgroundColor: resolvedBackgroundColor,
        borderRadius: `${radius}px`,
        boxShadow: showShadow
          ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          : "none",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {children}
    </motion.div>
  )
}
