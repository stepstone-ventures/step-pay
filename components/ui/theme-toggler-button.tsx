"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

interface ThemeTogglerButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "default" | "accent" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
  modes?: ("light" | "dark" | "system")[]
  direction?: "btt" | "ttb" | "ltr" | "rtl"
  onImmediateChange?: (theme: "light" | "dark" | "system") => void
}

export function ThemeTogglerButton({
  className,
  variant = "default",
  size = "default",
  modes = ["light", "dark"],
  direction = "ltr",
  onImmediateChange,
  onClick,
  ...props
}: ThemeTogglerButtonProps) {
  const { theme, setTheme } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)
  const { style: userStyle, ...restProps } = props

  const getNextTheme = () => {
    const currentIndex = modes.indexOf(theme as any)
    const nextIndex = (currentIndex + 1) % modes.length
    return modes[nextIndex]
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) {
      return
    }

    setIsAnimating(true)
    const nextTheme = getNextTheme()
    
    if (onImmediateChange) {
      onImmediateChange(nextTheme as any)
    }

    setTimeout(() => {
      setTheme(nextTheme as "light" | "dark")
      setIsAnimating(false)
    }, 150)
  }

  const getIcon = () => {
    if (theme === "dark") return <Moon className="h-5 w-5" />
    return <Sun className="h-5 w-5" />
  }

  const getDirectionClass = () => {
    switch (direction) {
      case "btt":
        return "origin-top"
      case "ttb":
        return "origin-bottom"
      case "rtl":
        return "origin-right"
      default:
        return "origin-left"
    }
  }

  const mergedStyle = {
    ["--liquid-button-fill-width" as any]: "-1%",
    ["--liquid-button-fill-height" as any]: "3px",
    ["--liquid-button-delay" as any]: "0s",
    ["--liquid-button-color" as any]: "var(--liquid-fill)",
    ["--liquid-button-background-color" as any]: "var(--liquid-bg)",
    background:
      "linear-gradient(var(--liquid-button-color, #000000) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)",
    backgroundColor: "var(--liquid-button-background-color, #ffffff)",
    transition:
      "background 0.3s var(--liquid-button-delay, 0s), color 180ms ease-out, background-position 0.3s calc(0.3s - var(--liquid-button-delay, 0s))",
    ...(userStyle || {}),
  } as React.CSSProperties

  return (
    <motion.button
      className={cn(
        "liquid-button relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
        {
          "text-primary-foreground": variant === "default",
          "text-accent-foreground": variant === "accent",
          "text-destructive-foreground": variant === "destructive",
          "border border-input": variant === "outline",
          "border border-border/60 text-secondary-foreground": variant === "secondary",
          "border border-border/60": variant === "ghost",
          "text-primary underline-offset-4 hover:underline": variant === "link",
          "h-10 w-10": size === "default",
          "h-9 w-9": size === "sm",
          "h-11 w-11": size === "lg",
        },
        className
      )}
      onClick={handleClick}
      whileHover={{
        scale: 1.05,
        ["--liquid-button-fill-width" as any]: "100%",
        ["--liquid-button-fill-height" as any]: "100%",
        ["--liquid-button-delay" as any]: "0.3s",
        transition: {
          ["--liquid-button-fill-width" as any]: { duration: 0 },
          ["--liquid-button-fill-height" as any]: { duration: 0 },
          ["--liquid-button-delay" as any]: { duration: 0 },
        },
      }}
      whileTap={{ scale: 0.95 }}
      style={mergedStyle}
      {...restProps}
    >
      <motion.div
        className={cn("relative flex items-center justify-center", getDirectionClass())}
        animate={isAnimating ? { rotateX: 90, opacity: 0 } : { rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {getIcon()}
      </motion.div>
    </motion.button>
  )
}
