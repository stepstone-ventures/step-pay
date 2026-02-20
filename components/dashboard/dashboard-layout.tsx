"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { GlobalUI } from "./global-ui"
import { ContactUsFab } from "./contact-us-fab"

const COMPLIANCE_STEP_IDS = new Set(["profile", "contact", "owner", "account", "service-agreement"])
const TRANSACTION_ROUTE_PREFIXES = [
  "/dashboard/transactions",
  "/dashboard/send-payment",
  "/dashboard/payouts",
  "/dashboard/refunds",
  "/dashboard/payments",
  "/dashboard/payment-pages",
  "/dashboard/subscriptions",
  "/dashboard/orders",
  "/dashboard/invoices",
]

function hasTransactionAccess() {
  if (typeof window === "undefined") return false
  if (localStorage.getItem("compliance_complete") === "true") return true
  try {
    const parsed = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
    if (!Array.isArray(parsed)) return false
    const completed = new Set(parsed.filter((step) => COMPLIANCE_STEP_IDS.has(step)))
    return completed.size >= COMPLIANCE_STEP_IDS.size
  } catch {
    return false
  }
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const requiresCompliance = TRANSACTION_ROUTE_PREFIXES.some((prefix) =>
      pathname?.startsWith(prefix)
    )

    if (requiresCompliance && !hasTransactionAccess()) {
      router.replace("/dashboard/compliance")
    }
  }, [pathname, router])

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="dashboard-static-cards relative z-10 flex min-h-screen overflow-hidden">
        <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

        <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
          <GlobalUI mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

          <main
            className="flex-1 overflow-y-auto"
            onClick={() => {
              // Close sidebar when clicking on main content (mobile only)
              if (mobileMenuOpen && window.innerWidth < 768) {
                setMobileMenuOpen(false)
              }
            }}
          >
            <div className="px-4 sm:px-6 md:px-8 pt-[105px] pb-6 md:pb-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      <ContactUsFab />
    </div>
  )
}
