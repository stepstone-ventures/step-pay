"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

function Sheet({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-[sheet-overlay-in_1000ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-overlay-out_1000ms_cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
      {...props}
    />
  )
}

type SheetSide = "top" | "right" | "bottom" | "left"
type SheetAnimationPreset = "default" | "genie" | "right-in-left-out"

function getSheetSideClasses(side: SheetSide, animationPreset: SheetAnimationPreset) {
  if (animationPreset === "right-in-left-out" && side === "right") {
    return "inset-y-0 right-0 h-full w-[88vw] max-w-sm border-l data-[state=open]:animate-[sheet-in-right_1800ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-out-right_1800ms_cubic-bezier(0.22,1,0.36,1)]"
  }

  if (animationPreset === "genie" && side === "right") {
    return "inset-y-0 right-0 h-full w-[88vw] max-w-sm border-l [transform-origin:calc(100%-1.25rem)_1.25rem] data-[state=open]:animate-[sheet-genie-in_950ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-genie-out_950ms_cubic-bezier(0.22,1,0.36,1)]"
  }

  if (side === "top") {
    return "inset-x-0 top-0 border-b data-[state=open]:animate-[sheet-in-top_1000ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-out-top_1000ms_cubic-bezier(0.22,1,0.36,1)]"
  }
  if (side === "bottom") {
    return "inset-x-0 bottom-0 border-t data-[state=open]:animate-[sheet-in-bottom_1000ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-out-bottom_1000ms_cubic-bezier(0.22,1,0.36,1)]"
  }
  if (side === "left") {
    return "inset-y-0 left-0 h-full w-[88vw] max-w-sm border-r data-[state=open]:animate-[sheet-in-left_1000ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-out-left_1000ms_cubic-bezier(0.22,1,0.36,1)]"
  }
  return "inset-y-0 right-0 h-full w-[88vw] max-w-sm border-l data-[state=open]:animate-[sheet-in-right_1000ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-out-right_1000ms_cubic-bezier(0.22,1,0.36,1)]"
}

function SheetContent({
  side = "right",
  animationPreset = "default",
  className,
  children,
  showCloseButton = true,
  closeButtonClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: SheetSide
  animationPreset?: SheetAnimationPreset
  showCloseButton?: boolean
  closeButtonClassName?: string
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 bg-background shadow-2xl will-change-transform",
          getSheetSideClasses(side, animationPreset),
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            className={cn(
              "absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring",
              closeButtonClassName
            )}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
