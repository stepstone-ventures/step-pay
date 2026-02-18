import * as React from "react"
import { cn } from "@/lib/utils"
import { LiquidButton } from "@/components/ui/liquid-button"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const extractText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (!node || typeof node === "boolean") return ""
  if (Array.isArray(node)) return node.map(extractText).join(" ")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children)
  }
  return ""
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, children, ...props }, ref) => {
    const classNameText = typeof className === "string" ? className : ""
    const buttonText = extractText(children).toLowerCase()
    const hasLegacyColorClass = /\bbg-(green|blue)-(400|500|600|700)\b/.test(classNameText) || /\bbg-primary\b/.test(classNameText)
    const hasActionLabel = /(filter|filters|export|\bstart\b|review|edit|reset|cancel|sort|add|currency|chart|account|time)/.test(buttonText)
    const isDefaultButton = variant === "default" && size !== "icon"
    const shouldUseLiquid =
      hasLegacyColorClass || hasActionLabel || isDefaultButton

    if (shouldUseLiquid) {
      return (
        <LiquidButton
          ref={ref}
          className={cn(
            "border border-border/60 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            {
              "h-10 px-4 py-2": size === "default",
              "h-9 rounded-md px-3": size === "sm",
              "h-11 rounded-md px-8": size === "lg",
              "h-10 w-10": size === "icon",
            },
            className
          )}
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
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
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
