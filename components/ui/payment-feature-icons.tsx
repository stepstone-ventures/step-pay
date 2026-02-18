"use client"

import * as React from "react"
import { motion } from "framer-motion"

type FeatureIconProps = {
  size?: number
  className?: string
}

export function NfcFeatureIcon({ size = 28, className }: FeatureIconProps) {
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
      {[
        "M6 8.32a7.43 7.43 0 0 1 0 7.36",
        "M9.46 6.21a11.76 11.76 0 0 1 0 11.58",
        "M12.91 4.1a15.91 15.91 0 0 1 .01 15.8",
        "M16.37 2a20.16 20.16 0 0 1 0 20",
      ].map((d, index) => (
        <motion.path
          key={d}
          d={d}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: [1, 0, 1], scale: [1, 0, 1] }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            delay: index * 0.2,
            repeat: Infinity,
            repeatDelay: 0.8,
          }}
        />
      ))}
    </motion.svg>
  )
}

export function PhoneCallFeatureIcon({ size = 28, className }: FeatureIconProps) {
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
      <motion.path
        d="M13 6a5 5 0 0 1 5 5"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: [1, 0, 1], scale: [1, 0, 1] }}
        transition={{ duration: 0.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
      />
      <motion.path
        d="M13 2a9 9 0 0 1 9 9"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: [1, 0, 1], scale: [1, 0, 1] }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: 0.2, repeat: Infinity, repeatDelay: 0.8 }}
      />
      <motion.path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </motion.svg>
  )
}

export function ChartLineFeatureIcon({ size = 28, className }: FeatureIconProps) {
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
      <motion.path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <motion.path
        d="m19 9-5 5-4-4-3 3"
        initial={{ opacity: 1, pathLength: 1, pathOffset: 0 }}
        animate={{ opacity: [1, 0, 1], pathLength: [1, 0, 1], pathOffset: [0, 1, 0] }}
        transition={{
          duration: 1.6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </motion.svg>
  )
}

export function LayersFeatureIcon({ size = 28, className }: FeatureIconProps) {
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
      <motion.path
        d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
        initial={{ y: 0 }}
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <motion.path
        d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity }}
      />
    </motion.svg>
  )
}
