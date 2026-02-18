import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      onCheckedChange,
      onChange,
      checked,
      defaultChecked,
      disabled,
      ...props
    },
    ref
  ) => {
    const isControlled = checked !== undefined
    const [internalChecked, setInternalChecked] = React.useState(Boolean(defaultChecked))
    const isChecked = isControlled ? Boolean(checked) : internalChecked

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(event.target.checked)
      }
      onCheckedChange?.(event.target.checked)
      onChange?.(event)
    }

    return (
      <span
        className={cn(
          "relative inline-flex h-4 w-4 shrink-0 items-center justify-center",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <input
          type="checkbox"
          className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          checked={isControlled ? Boolean(checked) : internalChecked}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          ref={ref}
          onChange={handleChange}
          {...props}
        />

        <motion.span
          className={cn(
            "pointer-events-none relative z-10 block h-full w-full overflow-hidden rounded-[5px] border border-border/70 bg-background/80",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
          )}
          animate={{
            borderColor: isChecked ? "hsl(var(--primary))" : "hsl(var(--border))",
            backgroundColor: isChecked ? "hsl(var(--primary) / 0.2)" : "hsl(var(--background))",
            scale: isChecked ? 1.04 : 1,
          }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="absolute inset-0 rounded-[4px] bg-primary"
            animate={{
              scale: isChecked ? 1 : 0.45,
              opacity: isChecked ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />

          <AnimatePresence initial={false}>
            {isChecked ? (
              <motion.span
                className="absolute inset-0 z-10 flex items-center justify-center text-primary-foreground"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.65 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M3.5 8.4 6.5 11 12.5 5.2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.span>
      </span>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
