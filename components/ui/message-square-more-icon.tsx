"use client"

import * as React from "react"
import { motion } from "framer-motion"

type MessageSquareMoreIconProps = {
  size?: number
  className?: string
}

export function MessageSquareMoreIcon({
  size = 18,
  className,
}: MessageSquareMoreIconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <motion.g
        style={{ transformOrigin: "bottom left" }}
        animate={{ rotate: [0, 8, -8, 2, 0] }}
        transition={{
          ease: "easeInOut",
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <motion.line
          x1="16"
          y1="10"
          x2="16"
          y2="10"
          animate={{ y1: [10, 8.5, 10], y2: [10, 11.5, 10] }}
          transition={{
            ease: "easeInOut",
            duration: 0.6,
            delay: 0.2,
            repeat: Infinity,
            repeatDelay: 1.2,
          }}
        />
        <motion.line
          x1="12"
          y1="10"
          x2="12"
          y2="10"
          animate={{ y1: [10, 8.5, 10], y2: [10, 11.5, 10] }}
          transition={{
            ease: "easeInOut",
            duration: 0.6,
            delay: 0.1,
            repeat: Infinity,
            repeatDelay: 1.2,
          }}
        />
        <motion.line
          x1="8"
          y1="10"
          x2="8"
          y2="10"
          animate={{ y1: [10, 8.5, 10], y2: [10, 11.5, 10] }}
          transition={{
            ease: "easeInOut",
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 1.2,
          }}
        />
      </motion.g>
    </motion.svg>
  )
}
