"use client"

import { cn } from "@/lib/utils"

type GhanaFlagBadgeProps = {
  className?: string
}

export function GhanaFlagBadge({ className }: GhanaFlagBadgeProps) {
  return (
    <span
      aria-label="Ghana flag"
      role="img"
      className={cn(
        "relative inline-flex h-7 w-11 overflow-hidden rounded-md border border-border/60 shadow-sm",
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/3 bg-[#CE1126]" />
      <span className="absolute inset-x-0 top-1/3 h-1/3 bg-[#FCD116]" />
      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[#006B3F]" />
      <span className="absolute inset-0 flex items-center justify-center text-[11px] leading-none text-black">
        ★
      </span>
    </span>
  )
}
