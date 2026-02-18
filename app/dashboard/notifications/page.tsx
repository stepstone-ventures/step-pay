"use client"

import { Bell, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardNotifications } from "@/lib/dashboard-notifications"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground">Latest updates appear first.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboardNotifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{notification.title}</h3>
                {notification.count ? (
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{notification.count}</span>
                  </div>
                ) : null}
              </div>
              {notification.subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{notification.subtitle}</p>
              ) : null}
              {notification.time ? (
                <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
