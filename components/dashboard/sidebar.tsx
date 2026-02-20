"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Package,
  Receipt,
  Repeat,
  RotateCcw,
  Shield,
  ShoppingBag,
  Split,
  Store,
  Tablet,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationList } from "@/components/animate-ui/components/community/notification-list"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SidebarRouteLoader } from "@/components/dashboard/sidebar-route-loader"

const pinnedNavigation = [
  {
    name: "Compliance",
    href: "/dashboard/compliance",
    icon: Shield,
  },
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
]

const sectionNavigation = [
  {
    name: "PAYMENTS",
    children: [
      { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Refunds", href: "/dashboard/refunds", icon: RotateCcw },
      { name: "Payouts", href: "/dashboard/payouts", icon: Wallet },
      { name: "Disputes", href: "/dashboard/disputes", icon: AlertCircle },
      { name: "Transaction Splits", href: "/dashboard/transaction-splits", icon: Split },
      { name: "Subaccounts", href: "/dashboard/subaccounts", icon: Building2 },
      { name: "Terminals", href: "/dashboard/terminals", icon: Tablet },
    ],
  },
  {
    name: "RECURRING",
    children: [
      { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
      { name: "Plans", href: "/dashboard/plans", icon: Calendar },
      { name: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat },
    ],
  },
  {
    name: "COMMERCE",
    children: [
      { name: "Payment Pages", href: "/dashboard/payment-pages", icon: FileText },
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Storefronts", href: "/dashboard/storefronts", icon: Store },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
    ],
  },
]

const COMPLIANCE_TOTAL_STEPS = 5
const COMPLIANCE_STEP_IDS = new Set(["profile", "contact", "owner", "account", "service-agreement"])
const sectionTransition = { type: "spring", stiffness: 90, damping: 12, mass: 1 } as const

const getComplianceProgress = (): number => {
  if (typeof window === "undefined") return 0

  if (localStorage.getItem("compliance_complete") === "true") {
    return COMPLIANCE_TOTAL_STEPS
  }

  try {
    const stored = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
    if (!Array.isArray(stored)) return 0
    const completed = new Set(stored.filter((step) => COMPLIANCE_STEP_IDS.has(step)))
    return Math.min(completed.size, COMPLIANCE_TOTAL_STEPS)
  } catch {
    return 0
  }
}

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [complianceProgress, setComplianceProgress] = useState(0)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const loaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const syncProgress = () => setComplianceProgress(getComplianceProgress())
    syncProgress()

    window.addEventListener("storage", syncProgress)
    window.addEventListener("focus", syncProgress)
    return () => {
      window.removeEventListener("storage", syncProgress)
      window.removeEventListener("focus", syncProgress)
    }
  }, [pathname])

  useEffect(() => {
    return () => {
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current)
      }
    }
  }, [])

  const toggleSection = (name: string) => {
    setExpandedSections((previous) => {
      const next = new Set(previous)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const closeMobileIfNeeded = () => {
    if (window.innerWidth < 768) {
      setMobileOpen?.(false)
    }
  }

  const startRouteLoader = () => {
    if (loaderTimeoutRef.current) {
      clearTimeout(loaderTimeoutRef.current)
    }
    setIsRouteLoading(true)
    loaderTimeoutRef.current = setTimeout(() => {
      setIsRouteLoading(false)
    }, 3000)
  }

  const navigateFromSidebar = (href: string) => {
    if (href !== pathname) {
      startRouteLoader()
    }
    closeMobileIfNeeded()
  }

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="h-[81px] shrink-0 border-b border-sidebar-hover/70 px-3">
        <div className="flex h-full items-center justify-between">
          <Link href="/dashboard" onClick={() => navigateFromSidebar("/dashboard")} className="flex items-center space-x-1.5">
            <div className="relative h-10 w-14">
              <img
                src="/steppay-logo-liquid.png?v=3"
                alt="StepPay logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">StepPay</span>
          </Link>

          {setMobileOpen ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="md:hidden h-10 w-10 text-sidebar-foreground hover:bg-sidebar-hover"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-b border-sidebar-hover/70 px-3 py-3">
        <ul className="space-y-1.5">
          {pinnedNavigation.map((item) => {
            const isActive =
              item.name === "Home"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith("/dashboard/compliance")
            const Icon = item.icon
            const isComplianceComplete = complianceProgress === COMPLIANCE_TOTAL_STEPS

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => navigateFromSidebar(item.href)}
                  className={cn(
                    "flex items-center justify-between gap-x-3 rounded-lg px-3 py-2.5 text-sm font-semibold leading-6 transition-smooth",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-hover/95 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="flex items-center gap-x-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </span>
                  {item.name === "Compliance" ? (
                    isComplianceComplete ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <span className="text-xs font-semibold text-sidebar-foreground/65">
                        {complianceProgress}/{COMPLIANCE_TOTAL_STEPS}
                      </span>
                    )
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-y-auto px-3 py-3" style={{ paddingBottom: "max(36%, 232px)" }}>
          <ul role="list" className="flex flex-col gap-y-1.5">
            {sectionNavigation.map((item) => {
              const isExpanded = expandedSections.has(item.name)

              return (
                <li key={item.name} className="rounded-lg bg-sidebar-hover/30">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-sidebar-foreground/75 transition-smooth hover:bg-sidebar-hover/95 hover:text-sidebar-foreground"
                  >
                    <motion.span
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={sectionTransition}
                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </motion.span>
                    <span>{item.name}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.ul
                        role="list"
                        initial={{ height: 0, opacity: 0, y: -8 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -8 }}
                        transition={sectionTransition}
                        className="space-y-1 overflow-hidden px-2 pb-2"
                      >
                        {item.children.map((child) => {
                          const isActive = pathname === child.href
                          const Icon = child.icon
                          return (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                onClick={() => navigateFromSidebar(child.href)}
                                className={cn(
                                  "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 transition-smooth",
                                  isActive
                                    ? "bg-primary/20 text-primary font-medium"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-hover/95 hover:text-sidebar-foreground"
                                )}
                              >
                                <Icon className="h-4 w-4 shrink-0" />
                                {child.name}
                              </Link>
                            </li>
                          )
                        })}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[30%] min-h-[220px] border-t border-sidebar-hover/80 bg-sidebar/97 backdrop-blur-md">
          <div className="pointer-events-auto flex h-full min-h-0 flex-col px-3 pt-3 pb-3">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <NotificationList onNavigate={startRouteLoader} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {setMobileOpen ? (
        <Sheet open={Boolean(mobileOpen)} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-64 p-0 md:hidden data-[state=open]:animate-[sheet-in-left_1800ms_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[sheet-out-left_1800ms_cubic-bezier(0.22,1,0.36,1)]"
          >
            {sidebarContent}
          </SheetContent>
        </Sheet>
      ) : null}

      <div className="hidden md:fixed md:inset-y-0 md:z-30 md:flex md:w-64 md:flex-col">
        <div className="flex grow flex-col overflow-hidden border-r border-sidebar-hover/70 bg-sidebar shadow-xl">
          {sidebarContent}
        </div>
      </div>

      <SidebarRouteLoader visible={isRouteLoading} />
    </>
  )
}
