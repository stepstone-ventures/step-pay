"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { GlobalUI } from "./global-ui"
import { ContactUsFab } from "./contact-us-fab"
import { PageSkeletonOverlay } from "@/components/ui/page-skeleton-overlay"

const AUTH_DASHBOARD_LOADER_KEY = "auth_dashboard_loader_pending"
const DASHBOARD_READY_EVENT = "dashboard:ready"
const AUTH_DASHBOARD_LOADER_MAX_MS = 15000

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAuthDashboardLoader, setShowAuthDashboardLoader] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    const authLoaderMarker = window.sessionStorage.getItem(AUTH_DASHBOARD_LOADER_KEY)
    if (!authLoaderMarker) return

    window.sessionStorage.removeItem(AUTH_DASHBOARD_LOADER_KEY)
    setShowAuthDashboardLoader(true)

    const hideLoader = () => setShowAuthDashboardLoader(false)
    const fallbackTimeout = window.setTimeout(hideLoader, AUTH_DASHBOARD_LOADER_MAX_MS)
    window.addEventListener(DASHBOARD_READY_EVENT, hideLoader)

    return () => {
      window.clearTimeout(fallbackTimeout)
      window.removeEventListener(DASHBOARD_READY_EVENT, hideLoader)
    }
  }, [])

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
              <div key={pathname} className="dashboard-page-reveal">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      <ContactUsFab />
      <PageSkeletonOverlay visible={showAuthDashboardLoader} variant="dashboard" durationMs={null} />
    </div>
  )
}
