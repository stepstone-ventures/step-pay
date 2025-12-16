import { Sidebar } from "./sidebar"
import { GlobalUI } from "./global-ui"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background/50">
      <Sidebar />
      <GlobalUI />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

