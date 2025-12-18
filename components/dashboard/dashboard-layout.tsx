"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { GlobalUI } from "./global-ui"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
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
          <div className="px-4 sm:px-6 md:px-8 pt-[180px] pb-6 md:pb-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
