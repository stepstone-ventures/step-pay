"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface AnimatedIconProps {
  icon: LucideIcon
  animation?: "default" | "path-loop" | "path"
  size?: number
  className?: string
  loop?: boolean
}

export function AnimatedIcon({
  icon: Icon,
  animation = "default",
  size = 28,
  className,
  loop = false,
}: AnimatedIconProps) {
  if (animation === "default") {
    return (
      <motion.div
        className={className}
        animate={loop ? { rotate: 360 } : {}}
        transition={{
          duration: 2,
          repeat: loop ? Infinity : 0,
          ease: "linear",
        }}
      >
        <Icon size={size} />
      </motion.div>
    )
  }

  // For path animations, animate opacity and scale for visual effect
  return (
    <motion.div
      className={className}
      initial={animation === "path" ? { opacity: 0, scale: 0.8 } : {}}
      animate={
        animation === "path-loop"
          ? {
              opacity: [1, 0.5, 1],
              scale: [1, 0.9, 1],
            }
          : animation === "path"
          ? { opacity: 1, scale: 1 }
          : {}
      }
      transition={{
        duration: animation === "path-loop" ? 1.5 : 0.5,
        repeat: animation === "path-loop" && loop ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      <Icon size={size} />
    </motion.div>
  )
}
