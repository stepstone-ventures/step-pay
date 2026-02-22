"use client"

import * as React from "react"
import { MoonStar, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import IconWebglShader from "@/components/ui/icon-webgl-shader"

type ThemeMode = "light" | "dark" | "system"

interface ThemeTogglerButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "default" | "accent" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
  modes?: ThemeMode[]
  direction?: "btt" | "ttb" | "ltr" | "rtl"
  onImmediateChange?: (theme: ThemeMode) => void
}

const shaderSizeMap: Record<NonNullable<ThemeTogglerButtonProps["size"]>, number> = {
  default: 40,
  sm: 36,
  lg: 44,
}

const iconSizeMap: Record<NonNullable<ThemeTogglerButtonProps["size"]>, number> = {
  default: 16,
  sm: 14,
  lg: 18,
}

export function ThemeTogglerButton({
  className,
  variant: _variant = "default",
  size = "default",
  modes = ["light", "dark"],
  direction: _direction,
  onImmediateChange,
  onClick,
  type = "button",
  disabled,
  ...props
}: ThemeTogglerButtonProps) {
  const { theme, setTheme } = useTheme()

  const availableModes = React.useMemo<Array<"light" | "dark">>(() => {
    const resolved = modes.filter((mode): mode is "light" | "dark" => mode === "light" || mode === "dark")
    return resolved.length > 0 ? resolved : ["light", "dark"]
  }, [modes])

  const currentTheme: "light" | "dark" = theme === "dark" ? "dark" : "light"
  const isDark = currentTheme === "dark"

  const getNextTheme = React.useCallback((): "light" | "dark" => {
    const currentIndex = availableModes.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % availableModes.length
    return availableModes[nextIndex] ?? availableModes[0]
  }, [availableModes, currentTheme])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled) {
      return
    }

    const nextTheme = getNextTheme()
    onImmediateChange?.(nextTheme)
    setTheme(nextTheme)
  }

  const iconSize = iconSizeMap[size]

  return (
    <button
      type={type}
      role="switch"
      aria-label="Toggle theme"
      aria-checked={isDark}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <IconWebglShader
        size={shaderSizeMap[size]}
        strokeWidth={3}
        iconSize={iconSize}
        innerTop={isDark ? "#1c1c1c" : "#ffffff"}
        innerBottom={isDark ? "#000000" : "#ffffff"}
        innerShadow={isDark ? "inset 0 1px 4px rgba(255,255,255,0.1), inset 0 -6px 12px rgba(0,0,0,0.6)" : "none"}
        iconColor={isDark ? "#d4d4d8" : "#000000"}
        icon={
          isDark ? (
            <MoonStar width={iconSize} height={iconSize} />
          ) : (
            <Sun width={iconSize} height={iconSize} />
          )
        }
      />
    </button>
  )
}
