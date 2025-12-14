"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  CreditCard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  RefreshCw,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Split,
  Building2,
  Terminal,
  Repeat,
  Calendar,
  Receipt,
  ShoppingCart,
  Store,
  Package,
  FileCheck,
  ClipboardList,
  FileText as FileTextIcon,
  FileQuestion,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

// Check if compliance is complete
const getComplianceStatus = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("compliance_complete") === "true"
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isComplianceComplete, setIsComplianceComplete] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    payments: true,
    recurring: false,
    commerce: false,
  })

  useEffect(() => {
    const updateComplianceStatus = () => {
      setIsComplianceComplete(getComplianceStatus())
    }
    
    // Initial check
    updateComplianceStatus()
    
    // Listen for storage changes (cross-tab)
    window.addEventListener("storage", updateComplianceStatus)
    
    // Listen for custom event (same-tab)
    window.addEventListener("complianceStatusChanged", updateComplianceStatus)
    
    // Check periodically (for same-tab updates)
    const interval = setInterval(updateComplianceStatus, 1000)
    
    return () => {
      window.removeEventListener("storage", updateComplianceStatus)
      window.removeEventListener("complianceStatusChanged", updateComplianceStatus)
      clearInterval(interval)
    }
  }, [pathname])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const paymentsNav = [
    { name: "Transactions", href: "/dashboard/transactions", icon: FileText },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Refunds", href: "/dashboard/refunds", icon: RefreshCw },
    { name: "Payouts", href: "/dashboard/payouts", icon: TrendingUp },
    { name: "Disputes", href: "/dashboard/disputes", icon: AlertCircle },
    { name: "Transaction Splits", href: "/dashboard/transaction-splits", icon: Split },
    { name: "Subaccounts", href: "/dashboard/subaccounts", icon: Building2 },
    { name: "Terminals", href: "/dashboard/terminals", icon: Terminal },
  ]

  const recurringNav = [
    { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
    { name: "Plans", href: "/dashboard/plans", icon: Calendar },
    { name: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat },
  ]

  const commerceNav = [
    { name: "Payment Pages", href: "/dashboard/payment-pages", icon: FileTextIcon },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Storefronts", href: "/dashboard/storefronts", icon: Store },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  ]

  const renderNavItem = (
    item: { name: string; href: string; icon: any },
    level: number = 0
  ) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          level > 0 && "ml-8",
          isActive
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
        <span>{item.name}</span>
      </Link>
    )
  }

  const renderSection = (
    title: string,
    items: { name: string; href: string; icon: any }[],
    sectionKey: string
  ) => {
    const isExpanded = expandedSections[sectionKey]
    const hasActiveChild = items.some((item) => pathname === item.href)

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            hasActiveChild
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <span>{title}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "transform rotate-90"
            )}
          />
        </button>
        {isExpanded && (
          <div className="space-y-1">
            {items.map((item) => renderNavItem(item, 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card/95 backdrop-blur-sm border-r border-border/50 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-border/50">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">StepPay</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {/* Compliance */}
            <Link
              href="/dashboard/compliance"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                pathname?.startsWith("/dashboard/compliance")
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Shield
                className={cn(
                  "h-5 w-5",
                  pathname?.startsWith("/dashboard/compliance") ? "text-primary" : "",
                  isComplianceComplete ? "text-green-600" : "text-red-600"
                )}
              />
              <span>Compliance</span>
            </Link>

            {/* Home */}
            {renderNavItem({ name: "Home", href: "/dashboard", icon: Home })}

            {/* PAYMENTS Section */}
            {renderSection("PAYMENTS", paymentsNav, "payments")}

            {/* RECURRING Section */}
            {renderSection("RECURRING", recurringNav, "recurring")}

            {/* COMMERCE Section */}
            {renderSection("COMMERCE", commerceNav, "commerce")}
          </nav>

          {/* Bottom Navigation - Audit Logs and Settings */}
          <div className="px-3 pb-4 space-y-1 border-t border-border/50 pt-4">
            {renderNavItem({ name: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList })}
            {renderNavItem({ name: "Settings", href: "/dashboard/settings", icon: Settings })}
          </div>

          {/* User menu */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Merchant Name</span>
                    <span className="text-xs text-muted-foreground">merchant@email.com</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
