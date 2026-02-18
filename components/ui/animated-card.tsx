"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
  hoverScale?: number
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hoverScale = 1.02,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      whileHover={{ 
        scale: hoverScale, 
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
