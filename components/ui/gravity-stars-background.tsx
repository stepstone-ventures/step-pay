"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GravityStarsBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  starsCount?: number
  starsSize?: number
  starsOpacity?: number
  glowIntensity?: number
  glowAnimation?: "instant" | "ease" | "spring"
  movementSpeed?: number
  mouseInfluence?: number
  mouseGravity?: "attract" | "repel"
  gravityStrength?: number
  starsInteraction?: boolean
  starsInteractionType?: "bounce" | "merge"
}

export function GravityStarsBackground({
  className,
  starsCount = 75,
  starsSize = 2,
  starsOpacity = 0.75,
  glowIntensity = 15,
  glowAnimation = "ease",
  movementSpeed = 0.3,
  mouseInfluence = 100,
  mouseGravity = "attract",
  gravityStrength = 75,
  starsInteraction = false,
  starsInteractionType = "bounce",
  ...props
}: GravityStarsBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 })
  const [stars, setStars] = React.useState(
    Array.from({ length: starsCount }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * movementSpeed,
      vy: (Math.random() - 0.5) * movementSpeed,
    }))
  )

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => {
          let vx = star.vx
          let vy = star.vy

          // Apply mouse gravity
          const dx = mousePos.x - star.x
          const dy = mousePos.y - star.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0 && distance < mouseInfluence) {
            const force = (mouseInfluence - distance) / mouseInfluence
            const angle = Math.atan2(dy, dx)
            const gravity = (gravityStrength * force) / 1000
            
            if (mouseGravity === "attract") {
              vx += Math.cos(angle) * gravity
              vy += Math.sin(angle) * gravity
            } else {
              vx -= Math.cos(angle) * gravity
              vy -= Math.sin(angle) * gravity
            }
          }

          // Update position
          let newX = star.x + vx
          let newY = star.y + vy

          // Boundary bounce
          if (newX < 0 || newX > 100) vx *= -1
          if (newY < 0 || newY > 100) vy *= -1
          newX = Math.max(0, Math.min(100, newX))
          newY = Math.max(0, Math.min(100, newY))

          return { x: newX, y: newY, vx, vy }
        })
      )
    }, 16)

    return () => clearInterval(interval)
  }, [mousePos, mouseInfluence, mouseGravity, gravityStrength])

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 -z-10 overflow-hidden", className)}
      {...props}
    >
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-foreground"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${starsSize}px`,
            height: `${starsSize}px`,
            opacity: starsOpacity,
            boxShadow: `0 0 ${glowIntensity}px currentColor`,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            ease: glowAnimation === "spring" ? "easeInOut" : "linear",
          }}
        />
      ))}
    </div>
  )
}