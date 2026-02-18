"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface FlipButtonProps extends HTMLMotionProps<"button"> {
  from?: "top" | "right" | "bottom" | "left"
  tapScale?: number
  frontText: string
  backText: string
  className?: string
}

export function FlipButton({
  from = "top",
  tapScale = 0.95,
  frontText,
  backText,
  className,
  ...props
}: FlipButtonProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  const variants = {
    top: { rotateX: isFlipped ? -180 : 0 },
    right: { rotateY: isFlipped ? 180 : 0 },
    bottom: { rotateX: isFlipped ? 180 : 0 },
    left: { rotateY: isFlipped ? -180 : 0 },
  }

  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      whileTap={{ scale: tapScale }}
      style={{ perspective: "1000px" }}
      {...props}
    >
      <motion.span
        className="relative block preserve-3d"
        animate={variants[from]}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="block backface-hidden">{frontText}</span>
        <span
          className="block backface-hidden absolute inset-0"
          style={{
            transform: from === "top" || from === "bottom" ? "rotateX(180deg)" : "rotateY(180deg)",
          }}
        >
          {backText}
        </span>
      </motion.span>
    </motion.button>
  )
}