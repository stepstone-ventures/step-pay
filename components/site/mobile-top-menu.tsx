"use client"

import { useState, type ComponentType, type ReactNode, type SVGProps } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Ghost, Instagram, Menu, X } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-button"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type SharePlatform = "instagram" | "x" | "snapchat"

type ShareItem = {
  id: SharePlatform
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

function XBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 4h4l10 16h-4z" />
      <path d="M19 4h-4L5 20h4z" />
    </svg>
  )
}

const SHARE_ITEMS: ShareItem[] = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com", icon: Instagram },
  { id: "x", label: "X", href: "https://x.com", icon: XBrandIcon },
  { id: "snapchat", label: "Snapchat", href: "https://www.snapchat.com", icon: Ghost },
]

function MenuRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/80 px-4 py-3 text-left text-sm font-medium transition-colors duration-200 hover:bg-muted/70 focus-visible:bg-muted/70",
        className
      )}
    >
      {children}
    </button>
  )
}

type MobileTopMenuProps = {
  className?: string
  contactSalesAsMenuRow?: boolean
}

export function MobileTopMenu({ className, contactSalesAsMenuRow = false }: MobileTopMenuProps) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)
  const [referOpen, setReferOpen] = useState(false)

  const closeSheet = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80",
            className
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        animationPreset="right-in-left-out"
        showCloseButton={false}
        className="flex h-full flex-col p-0"
      >
        <SheetHeader className="border-b border-border/60">
          <div className="flex items-center justify-between gap-6">
            <SheetTitle>Menu</SheetTitle>
            <div className="ml-auto flex items-center gap-5">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-2.5 py-2">
                <span className="text-xs text-muted-foreground">Theme</span>
                <Switch
                  aria-label="Toggle dark mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  className="bg-muted peer-checked:bg-foreground/90 after:bg-background after:border-border transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] after:duration-700 after:ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </div>
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            <MenuRow onClick={() => setPaymentsOpen((prev) => !prev)}>
              <span>Receive Payments</span>
              <motion.span
                animate={{ rotate: paymentsOpen ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </MenuRow>
            <AnimatePresence initial={false}>
              {paymentsOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 rounded-lg border border-border/50 bg-muted/35 p-2">
                    <Link
                      href="/login"
                      onClick={closeSheet}
                      className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-muted focus-visible:bg-muted active:bg-muted"
                    >
                      Request Money from Anyone Anywhere
                    </Link>
                    <Link
                      href="/login"
                      onClick={closeSheet}
                      className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-muted focus-visible:bg-muted active:bg-muted"
                    >
                      Charge Clients In-Shop
                    </Link>
                    <Link
                      href="/login"
                      onClick={closeSheet}
                      className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-muted focus-visible:bg-muted active:bg-muted"
                    >
                      Integrate Online Checkout
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {contactSalesAsMenuRow ? (
              <MenuRow
                onClick={() => {
                  closeSheet()
                  window.location.assign("mailto:support@steppay.com?subject=StepPay%20Contact%20Sales")
                }}
              >
                <span>Contact Sales</span>
              </MenuRow>
            ) : (
              <a href="mailto:support@steppay.com?subject=StepPay%20Contact%20Sales" onClick={closeSheet} className="block">
                <LiquidButton className="w-full px-4 py-3 text-sm font-semibold border border-border/60">
                  Contact Sales
                </LiquidButton>
              </a>
            )}

            <MenuRow onClick={() => setReferOpen((prev) => !prev)}>
              <span>Refer A Friend</span>
              <motion.span
                animate={{ rotate: referOpen ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </MenuRow>
            <AnimatePresence initial={false}>
              {referOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 rounded-lg border border-border/50 bg-muted/35 p-2">
                    {SHARE_ITEMS.map((item) => {
                      const Icon = item.icon
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-muted focus-visible:bg-muted active:bg-muted"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      )
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <SheetFooter className="border-t border-border/60">
          <Link href="/login" onClick={closeSheet} className="block">
            <LiquidButton className="w-full px-4 py-3 text-sm font-semibold border border-border/60">
              Sign In
            </LiquidButton>
          </Link>
          <Link href="/signup" onClick={closeSheet} className="block">
            <LiquidButton className="w-full px-4 py-3 text-sm font-semibold border border-border/60">
              Get Started for Free
            </LiquidButton>
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
