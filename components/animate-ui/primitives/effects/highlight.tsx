"use client"

import * as React from "react"
import { motion, type Transition } from "framer-motion"

import { cn } from "@/lib/utils"

type HighlightProps = React.ComponentProps<"div"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  mode?: "children" | "parent"
  containerClassName?: string
  hover?: boolean
  exitDelay?: number
  transition?: Transition
}

function Highlight({
  children,
  className,
  value,
  defaultValue,
  onValueChange,
  mode = "children",
  containerClassName,
  hover = false,
  exitDelay: _exitDelay = 200,
  transition = { type: "spring", stiffness: 350, damping: 30 },
  ...props
}: HighlightProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const layoutId = React.useId()

  const firstValue = React.useMemo(() => {
    const first = items[0] as React.ReactElement | undefined
    const dataValue = first?.props?.["data-value"]
    if (typeof dataValue === "string") return dataValue
    return undefined
  }, [items])

  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue ?? firstValue
  )
  const [hoverValue, setHoverValue] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (internalValue || !firstValue) return
    setInternalValue(firstValue)
  }, [firstValue, internalValue])

  const activeValue = value ?? internalValue
  const displayedValue = hover && hoverValue ? hoverValue : activeValue

  const selectValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
    },
    [onValueChange, value]
  )

  return (
    <div
      className={cn(mode === "parent" ? containerClassName : "inline-flex", "relative")}
      {...props}
    >
      {items.map((item, index) => {
        const child = item as React.ReactElement<any>
        const itemValue = typeof child.props?.["data-value"] === "string"
          ? child.props["data-value"]
          : `highlight-item-${index}`
        const isActive = displayedValue === itemValue

        const childClassName = cn("relative z-10", child.props.className)

        return (
          <div key={itemValue} className="relative">
            {isActive ? (
              <motion.div
                layoutId={`highlight-active-${layoutId}`}
                className={cn("pointer-events-none absolute inset-0", className)}
                transition={transition}
              />
            ) : null}
            {React.cloneElement(child, {
              className: childClassName,
              "data-active": isActive ? "true" : undefined,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                child.props.onClick?.(event)
                if (!event.defaultPrevented) {
                  selectValue(itemValue)
                }
              },
              onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
                child.props.onMouseEnter?.(event)
                if (hover) {
                  setHoverValue(itemValue)
                }
              },
              onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
                child.props.onMouseLeave?.(event)
                if (hover) {
                  setHoverValue(null)
                }
              },
            })}
          </div>
        )
      })}
    </div>
  )
}

export { Highlight, type HighlightProps }
