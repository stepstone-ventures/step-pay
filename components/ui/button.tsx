"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { LiquidButton } from "@/components/ui/liquid-button"
import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/components/buttons/ripple"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  forceLiquid?: boolean
}

const MOBILE_BREAKPOINT_QUERY = "(max-width: 639px)"

const extractText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (!node || typeof node === "boolean") return ""
  if (Array.isArray(node)) return node.map(extractText).join(" ")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children)
  }
  return ""
}

const solidVariantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const

const liquidVariantClasses = {
  default: "border border-border/60",
  destructive: "border border-border/60",
  outline: "border border-border/60",
  secondary: "border border-border/60",
  ghost: "border border-border/60",
  link: "",
} as const

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
} as const

const liquidConflictTokenPattern =
  /^(bg-|text-|hover:bg-|hover:text-|dark:bg-|dark:text-|focus:bg-|focus:text-|active:bg-|active:text-|from-|via-|to-)/i

const sanitizeLiquidClassName = (className?: string) => {
  if (!className) return className
  return className
    .split(/\s+/)
    .filter((token) => token && !liquidConflictTokenPattern.test(token))
    .join(" ")
}

const toRippleVariant = (variant: ButtonProps["variant"]) => {
  if (variant === "default") return "default"
  if (variant === "destructive") return "destructive"
  if (variant === "secondary") return "secondary"
  if (variant === "ghost" || variant === "link") return "ghost"
  return "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, children, forceLiquid = false, ...props }, ref) => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
      const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
      const updateMatch = () => setIsMobile(mediaQuery.matches)

      updateMatch()

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", updateMatch)
        return () => mediaQuery.removeEventListener("change", updateMatch)
      }

      mediaQuery.addListener(updateMatch)
      return () => mediaQuery.removeListener(updateMatch)
    }, [])

    const classNameText = typeof className === "string" ? className : ""
    const buttonText = extractText(children).toLowerCase()
    const hasLegacyColorClass = /\bbg-(green|blue)-(400|500|600|700)\b/.test(classNameText) || /\bbg-primary\b/.test(classNameText)
    const hasActionLabel = /(filter|filters|export|\bstart\b|review|edit|reset|cancel|sort|add|currency|chart|account|time)/.test(buttonText)
    const isDefaultButton = variant === "default" && size !== "icon"
    const shouldUseLiquid =
      forceLiquid || hasLegacyColorClass || hasActionLabel || isDefaultButton

    if (shouldUseLiquid) {
      const sanitizedClassName = sanitizeLiquidClassName(className)
      const responsiveButtonClasses = cn(
        "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        liquidVariantClasses[variant],
        sizeClasses[size],
        sanitizedClassName
      )

      if (isMobile) {
        return (
          <RippleButton
            variant={toRippleVariant(variant)}
            ref={ref}
            className={responsiveButtonClasses}
            style={style as React.CSSProperties | undefined}
            {...(props as any)}
          >
            {children}
            <RippleButtonRipples />
          </RippleButton>
        )
      }

      return (
        <LiquidButton
          ref={ref}
          className={responsiveButtonClasses}
          style={style as React.CSSProperties | undefined}
          {...(props as any)}
        >
          {children}
        </LiquidButton>
      )
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "transition-all duration-200",
          solidVariantClasses[variant],
          sizeClasses[size],
          className
        )}
        style={style}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
