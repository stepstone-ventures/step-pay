"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const

const buttonSizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
} as const

const rippleColorClasses = {
  default: "[--ripple-button-ripple-color:var(--primary-foreground)]",
  accent: "[--ripple-button-ripple-color:var(--accent-foreground)]",
  destructive: "[--ripple-button-ripple-color:var(--destructive-foreground)]",
  outline: "[--ripple-button-ripple-color:var(--foreground)]",
  secondary: "[--ripple-button-ripple-color:var(--secondary-foreground)]",
  ghost: "[--ripple-button-ripple-color:var(--foreground)]",
  link: "[--ripple-button-ripple-color:var(--primary)]",
} as const

type RippleButtonVariant = keyof typeof buttonVariantClasses
type RippleButtonSize = keyof typeof buttonSizeClasses

type Ripple = {
  id: number
  x: number
  y: number
  size: number
}

type RippleContextValue = {
  ripples: Ripple[]
}

const RippleContext = React.createContext<RippleContextValue | null>(null)

export type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: RippleButtonVariant
  size?: RippleButtonSize
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(function RippleButton(
  {
    className,
    variant = "default",
    size = "default",
    onClick,
    children,
    ...props
  },
  ref
) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const timeoutIdsRef = React.useRef<number[]>([])

  React.useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    const rect = event.currentTarget.getBoundingClientRect()
    const rippleSize = Math.max(rect.width, rect.height) * 1.5
    const rippleId = Date.now() + Math.random()
    const x = event.clientX - rect.left - rippleSize / 2
    const y = event.clientY - rect.top - rippleSize / 2

    setRipples((current) => [...current, { id: rippleId, x, y, size: rippleSize }])

    const timeoutId = window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== rippleId))
    }, 650)

    timeoutIdsRef.current.push(timeoutId)
  }

  return (
    <button
      ref={ref}
      className={cn(
        "ripple-button relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        rippleColorClasses[variant],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <RippleContext.Provider value={{ ripples }}>{children}</RippleContext.Provider>
    </button>
  )
})

type RippleButtonRipplesProps = React.ComponentPropsWithoutRef<"span">

function RippleButtonRipples({ className, ...props }: RippleButtonRipplesProps) {
  const context = React.useContext(RippleContext)
  if (!context) return null

  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      {...props}
    >
      {context.ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-[var(--ripple-button-ripple-color,currentColor)]/35"
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </span>
  )
}

export { RippleButton, RippleButtonRipples, type RippleButtonRipplesProps }
