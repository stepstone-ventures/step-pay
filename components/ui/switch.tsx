import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, disabled, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
      onChange?.(e)
    }

    return (
      <label
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className
        )}
      >
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-border/60 bg-muted transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] peer-checked:border-[#ff5b1f] peer-checked:bg-[#ff5b1f] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 text-xs font-semibold text-white/95 opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
        >
          I
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 text-[10px] font-semibold text-muted-foreground transition-opacity duration-300 peer-checked:opacity-0"
        >
          O
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full border border-black/10 bg-[radial-gradient(circle_at_30%_30%,#ffffff,#ececec)] shadow-[0_2px_3px_rgba(0,0,0,0.25),0_10px_18px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] peer-checked:translate-x-6"
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
