"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Shield,
  Home,
  CreditCard,
  Users,
  RotateCcw,
  Wallet,
  AlertCircle,
  Split,
  Building2,
  Tablet,
  Repeat,
  Calendar,
  ShoppingBag,
  Store,
  Package,
  Receipt,
  FileText,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { isComplianceComplete } from "@/lib/compliance-utils"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Compliance",
    href: "/dashboard/compliance",
    icon: Shield,
    color: "text-red-400",
  },
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
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

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (open: boolean) => void }) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["PAYMENTS", "RECURRING", "COMMERCE"]))
  const [isComplianceDone, setIsComplianceDone] = useState(false)

  useEffect(() => {
    setIsComplianceDone(isComplianceComplete())
  }, [])

  const toggleSection = (name: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(name)) {
      newExpanded.delete(name)
    } else {
      newExpanded.add(name)
    }
    setExpandedSections(newExpanded)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-hidden px-4 pb-6 pt-0">
      {/* Logo Section - Fixed at top, always visible */}
      <div className="flex items-start justify-center px-2 pt-0 shrink-0 sticky top-0 z-10 bg-sidebar">
        <div className="flex items-center justify-center w-full relative">
          <img 
            src="/steppay-logo.png" 
            alt="STEPPAY" 
            className="h-[180px] w-auto object-contain"
          />
          {setMobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-sidebar-foreground hover:bg-sidebar-hover shrink-0 absolute top-0 right-0"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      {/* Navigation Section - Scrollable middle section */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <nav className="flex flex-col shrink-0 pt-6 pb-4">
          <ul role="list" className="flex flex-col gap-y-1">
            {navigation.map((item) => {
            if (item.children) {
              const isExpanded = expandedSections.has(item.name)
              return (
                <li key={item.name}>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className="w-full flex items-center gap-x-3 px-3 py-2.5 text-sm font-semibold leading-6 text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground rounded-lg transition-smooth"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span>{item.name}</span>
                  </button>
                  {isExpanded && (
                    <ul role="list" className="mt-1 ml-7 space-y-1">
                      {item.children.map((child) => {
                        const isActive = pathname === child.href
                        const Icon = child.icon
                        return (
                          <li key={child.name}>
                            <Link
                              href={child.href}
                              onClick={() => {
                                // Close sidebar on mobile after navigation
                                if (window.innerWidth < 768) {
                                  setMobileOpen?.(false)
                                }
                              }}
                              className={cn(
                                "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 transition-smooth",
                                isActive
                                  ? "bg-primary/20 text-primary font-medium"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              {child.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            }

            // For Home, use exact match. For Compliance, match compliance routes
            const isActive = item.name === "Home" 
              ? pathname === item.href
              : item.name === "Compliance"
              ? pathname === item.href || pathname.startsWith("/dashboard/compliance")
              : pathname === item.href || (item.href && pathname.startsWith(item.href + "/"))
            const Icon = item.icon || Shield
            const complianceColor = item.name === "Compliance" && isComplianceDone ? "text-green-300" : item.color || ""

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 768) {
                      setMobileOpen?.(false)
                    }
                  }}
                  className={cn(
                    "flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-semibold leading-6 transition-smooth",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                    complianceColor && !isActive ? complianceColor : ""
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              </li>
            )
          })}
          </ul>
        </nav>
      </div>
      
      {/* Bottom section for Audit Logs and Settings - Fixed at bottom, always visible */}
      <div className="shrink-0 sticky bottom-0 pt-4 border-t border-sidebar-border bg-sidebar">
        <ul role="list" className="space-y-1">
            <li>
              <Link
                href="/dashboard/audit-logs"
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) {
                    setMobileOpen?.(false)
                  }
                }}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-semibold leading-6 transition-smooth",
                  pathname === "/dashboard/audit-logs" || pathname.startsWith("/dashboard/audit-logs/")
                    ? "bg-primary/20 text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground"
                )}
              >
                <FileText className="h-5 w-5 shrink-0" />
                Audit Logs
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) {
                    setMobileOpen?.(false)
                  }
                }}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-semibold leading-6 transition-smooth",
                  pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/")
                    ? "bg-primary/20 text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-sidebar-foreground"
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                Settings
              </Link>
            </li>
          </ul>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && setMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:z-30 md:flex md:w-64 md:flex-col">
        <div className="flex grow flex-col bg-sidebar shadow-xl overflow-hidden">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-sidebar shadow-xl transform transition-transform duration-300 ease-out md:hidden overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}
