"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface IconButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "accent" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
  hoverScale?: number
  tapScale?: number
}

export function IconButton({
  children,
  className,
  variant = "default",
  size = "default",
  hoverScale = 1.05,
  tapScale = 0.95,
  ...props
}: IconButtonProps) {
  const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Create particles
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      x: centerX,
      y: centerY,
      id: Date.now() + i,
      angle: (i * 60) * (Math.PI / 180),
    }))

    setParticles((prev) => [...prev, ...newParticles])

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 1000)
  }

  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-accent text-accent-foreground hover:bg-accent/90": variant === "accent",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "text-primary underline-offset-4 hover:underline": variant === "link",
          "h-10 w-10": size === "default",
          "h-9 w-9": size === "sm",
          "h-11 w-11": size === "lg",
        },
        className
      )}
      onClick={handleClick}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      {...props}
    >
      {children}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-current"
          initial={{
            x: particle.x - 2,
            y: particle.y - 2,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: particle.x + Math.cos(particle.angle) * 30 - 2,
            y: particle.y + Math.sin(particle.angle) * 30 - 2,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ pointerEvents: "none" }}
        />
      ))}
    </motion.button>
  )
}