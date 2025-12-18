"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, Bell, User, ChevronDown, Building2, Sun, Moon, Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { isComplianceComplete } from "@/lib/compliance-utils"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

// Page title mapping
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transactions": "Transactions",
  "/dashboard/customers": "Customers",
  "/dashboard/refunds": "Refunds",
  "/dashboard/payouts": "Payouts",
  "/dashboard/disputes": "Disputes",
  "/dashboard/transaction-splits": "Transaction Splits",
  "/dashboard/subaccounts": "Subaccounts",
  "/dashboard/terminals": "Terminals",
  "/dashboard/subscribers": "Subscribers",
  "/dashboard/plans": "Plans",
  "/dashboard/subscriptions": "Subscriptions",
  "/dashboard/payment-pages": "Payment Pages",
  "/dashboard/products": "Products",
  "/dashboard/storefronts": "Storefronts",
  "/dashboard/orders": "Orders",
  "/dashboard/invoices": "Invoices",
  "/dashboard/audit-logs": "Audit Logs",
  "/dashboard/settings": "Settings",
  "/dashboard/payments": "Collect Payment",
  "/dashboard/compliance": "Compliance",
  "/dashboard/compliance/profile": "Compliance",
  "/dashboard/compliance/contact": "Compliance",
  "/dashboard/compliance/owner": "Compliance",
  "/dashboard/compliance/account": "Compliance",
  "/dashboard/compliance/service-agreement": "Compliance",
}

// Page subtext mapping
const pageSubtexts: Record<string, string> = {
  "/dashboard": "Overview of your payment activity",
  "/dashboard/transactions": "View all your payment transactions",
  "/dashboard/customers": "Manage your customer database",
  "/dashboard/refunds": "Manage and track refunds",
  "/dashboard/payouts": "View and manage your payouts",
  "/dashboard/disputes": "Manage and respond to transaction disputes",
  "/dashboard/transaction-splits": "Split transaction payouts across multiple subaccounts",
  "/dashboard/subaccounts": "Manage your subaccounts for split payments",
  "/dashboard/terminals": "Choose between Virtual or Physical terminals",
  "/dashboard/subscribers": "Manage your subscription subscribers",
  "/dashboard/plans": "Create and manage subscription plans",
  "/dashboard/subscriptions": "Manage active subscriptions",
  "/dashboard/payment-pages": "Create custom payment pages to collect payments",
  "/dashboard/products": "Manage your product catalog",
  "/dashboard/storefronts": "Manage your online storefronts",
  "/dashboard/orders": "View and manage customer orders",
  "/dashboard/invoices": "Create and manage customer invoices",
  "/dashboard/audit-logs": "Track all activities and actions performed on your account",
  "/dashboard/settings": "Manage your account settings",
  "/dashboard/payments": "Collect one-time payments from customers",
  "/dashboard/compliance": "Complete your business verification",
  "/dashboard/compliance/profile": "Complete your business verification",
  "/dashboard/compliance/contact": "Complete your business verification",
  "/dashboard/compliance/owner": "Complete your business verification",
  "/dashboard/compliance/account": "Complete your business verification",
  "/dashboard/compliance/service-agreement": "Complete your business verification",
}

export function GlobalUI({ 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: { 
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void 
}) {
  const [isLive, setIsLive] = useState(false)
  const [businessName, setBusinessName] = useState("Stepstone Ventures")
  const [accountNumber, setAccountNumber] = useState("1234567")
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  
  // Get page title from pathname
  const getPageTitle = () => {
    // Check exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname]
    }
    // Check for compliance step pages and add step numbers
    if (pathname?.startsWith("/dashboard/compliance")) {
      if (pathname === "/dashboard/compliance") {
        return "Compliance"
      }
      const stepMap: Record<string, string> = {
        "/dashboard/compliance/profile": "1. Profile",
        "/dashboard/compliance/contact": "2. Contact",
        "/dashboard/compliance/owner": "3. Owner",
        "/dashboard/compliance/account": "4. Account",
        "/dashboard/compliance/service-agreement": "5. Service Agreement",
      }
      return stepMap[pathname] || "Compliance"
    }
    // Default fallback
    return pageTitles[pathname] || "Dashboard"
  }
  
  // Get page subtext from pathname
  const getPageSubtext = () => {
    if (pageSubtexts[pathname]) {
      return pageSubtexts[pathname]
    }
    if (pathname?.startsWith("/dashboard/compliance")) {
      return "Complete your business verification"
    }
    return pageSubtexts[pathname] || ""
  }
  
  const pageTitle = getPageTitle()
  const pageSubtext = getPageSubtext()

  useEffect(() => {
    setIsLive(isComplianceComplete())
    // Load business info from localStorage
    const signupData = localStorage.getItem("signup_data")
    if (signupData) {
      try {
        const data = JSON.parse(signupData)
        if (data.businessName) setBusinessName(data.businessName)
        // Generate account number if not exists
        if (!localStorage.getItem("account_number")) {
          const accNum = Math.floor(1000000 + Math.random() * 9000000).toString()
          localStorage.setItem("account_number", accNum)
          setAccountNumber(accNum)
        } else {
          setAccountNumber(localStorage.getItem("account_number") || "1234567")
        }
      } catch (e) {
        console.error("Error loading business data:", e)
      }
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <>
      {/* Top Bar - Test Mode, Theme Toggle, Notifications, Profile */}
      <div className={cn(
        "fixed top-0 right-0 z-50 border-t border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        mobileMenuOpen ? "left-64" : "left-0 md:left-64"
      )}>
        <div className="flex items-end justify-between h-[120px] pl-4 md:pl-4 pr-4 md:pr-6 pb-4">
          {/* Left side - Menu button (mobile only) and Page Title */}
          <div className="flex items-end gap-3">
            {/* Mobile Menu Button */}
            {setMobileMenuOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden h-10 w-10 shrink-0"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {/* Page Title */}
            <div className="flex items-end">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{pageTitle}</h1>
            </div>
          </div>
          
          {/* Toolbar Items on Right */}
          <div className="flex items-end gap-2 sm:gap-3">
        {/* Test Mode Indicator */}
        {!isLive && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="cursor-help text-xs sm:text-sm">
                  Test Mode
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your business is in Test Mode. Submit all compliance forms to activate Live Payments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Theme Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 sm:h-10 sm:w-10 bg-card hover:bg-accent transition-smooth"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 animate-fade-in">
            <div className="p-4">
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                No new notifications
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 sm:h-10 sm:px-3">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2">
                <AvatarFallback>
                  {businessName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-fade-in">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/add-business">Add a Business</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/permissions">Permissions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/preferences">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center space-x-2 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{businessName}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Account: {accountNumber}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="text-destructive">
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Subtext Bar - Below toolbar with thinner borders */}
      {pageSubtext && (
        <div className={cn(
          "fixed top-[120px] right-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/50",
          mobileMenuOpen ? "left-64" : "left-0 md:left-64"
        )}>
          <div className="flex items-end h-[60px] px-4 md:px-6 pb-4">
            <p className="text-sm text-muted-foreground">{pageSubtext}</p>
          </div>
        </div>
      )}

      {/* Support Button - Hidden on mobile */}
      <Link
        href="/dashboard/support"
        className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth hover:scale-105"
      >
        <HelpCircle className="h-6 w-6" />
      </Link>
    </>
  )
}
