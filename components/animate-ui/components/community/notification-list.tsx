"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ArrowUpRight, RotateCcw } from "lucide-react"
import { motion, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  type DashboardNotification,
  getDashboardNotificationsFromStorage,
} from "@/lib/dashboard-notifications"

const READ_NOTIFICATION_IDS_KEY = "dashboard_notification_read_ids"

const transition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
}

const getCardVariants = (i: number) => ({
  collapsed: {
    marginTop: i === 0 ? 0 : -44,
    scaleX: 1 - i * 0.05,
  },
  expanded: {
    marginTop: i === 0 ? 0 : 4,
    scaleX: 1,
  },
})

const textSwitchTransition: Transition = {
  duration: 0.22,
  ease: "easeInOut",
}

const notificationTextVariants = {
  collapsed: { opacity: 1, y: 0, pointerEvents: "auto" as const },
  expanded: { opacity: 0, y: -16, pointerEvents: "none" as const },
}

const viewAllTextVariants = {
  collapsed: { opacity: 0, y: 16, pointerEvents: "none" as const },
  expanded: { opacity: 1, y: 0, pointerEvents: "auto" as const },
}

type NotificationListProps = React.ComponentProps<"div">

function getStoredReadNotificationIds() {
  if (typeof window === "undefined") return new Set<string>()
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_NOTIFICATION_IDS_KEY) || "[]")
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((value) => typeof value === "string"))
  } catch {
    return new Set<string>()
  }
}

function persistReadNotificationIds(ids: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(READ_NOTIFICATION_IDS_KEY, JSON.stringify(Array.from(ids)))
}

function NotificationList({ className }: NotificationListProps) {
  const pathname = usePathname()
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState(false)
  const [expandedByTap, setExpandedByTap] = React.useState(false)
  const [allNotifications, setAllNotifications] = React.useState<DashboardNotification[]>([])
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())
  const [viewAllOpen, setViewAllOpen] = React.useState(false)

  const refreshNotifications = React.useCallback(() => {
    setAllNotifications(getDashboardNotificationsFromStorage())
  }, [])

  React.useEffect(() => {
    const updateViewport = () => {
      const compact = window.innerWidth < 1024
      setIsMobileOrTablet(compact)
      if (!compact) {
        setExpandedByTap(false)
      }
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  React.useEffect(() => {
    refreshNotifications()
    setReadIds(getStoredReadNotificationIds())

    const syncNotifications = () => {
      refreshNotifications()
      setReadIds(getStoredReadNotificationIds())
    }

    window.addEventListener("focus", syncNotifications)
    window.addEventListener("storage", syncNotifications)
    window.addEventListener("complianceStatusChanged", syncNotifications)
    window.addEventListener("dashboardNotificationsChanged", syncNotifications)
    return () => {
      window.removeEventListener("focus", syncNotifications)
      window.removeEventListener("storage", syncNotifications)
      window.removeEventListener("complianceStatusChanged", syncNotifications)
      window.removeEventListener("dashboardNotificationsChanged", syncNotifications)
    }
  }, [refreshNotifications])

  React.useEffect(() => {
    refreshNotifications()
  }, [pathname, refreshNotifications])

  const unreadNotifications = React.useMemo(
    () => allNotifications.filter((notification) => !readIds.has(notification.id)),
    [allNotifications, readIds]
  )

  const previewNotifications = unreadNotifications.slice(0, 2)
  const animationState = isMobileOrTablet && expandedByTap ? "expanded" : "collapsed"

  const toggleReadState = (notificationId: string, checked: boolean) => {
    setReadIds((previous) => {
      const next = new Set(previous)
      if (checked) {
        next.add(notificationId)
      } else {
        next.delete(notificationId)
      }
      persistReadNotificationIds(next)
      return next
    })
  }

  return (
    <>
      <motion.div
        className={cn("w-full space-y-3 rounded-2xl bg-muted/70 p-3 shadow-md", className)}
        initial="collapsed"
        animate={animationState}
        whileHover={isMobileOrTablet ? undefined : "expanded"}
        onClick={() => {
          if (isMobileOrTablet) {
            setExpandedByTap((previous) => !previous)
          }
        }}
      >
        <div>
          {previewNotifications.length === 0 ? (
            <motion.div
              className="relative rounded-xl bg-card px-4 py-2 shadow-sm"
              variants={getCardVariants(0)}
              transition={transition}
            >
              <h1 className="text-sm font-medium">All caught up.</h1>
              <div className="text-xs font-medium text-muted-foreground">
                New updates will appear here.
              </div>
            </motion.div>
          ) : (
            previewNotifications.map((notification, i) => (
              <motion.div
                key={notification.id}
                className="relative rounded-xl bg-card px-4 py-2 shadow-sm transition-shadow duration-200 hover:shadow-lg"
                variants={getCardVariants(i)}
                transition={transition}
                style={{
                  zIndex: previewNotifications.length - i,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-sm font-medium">{notification.title}</h1>
                  {notification.count ? (
                    <div className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                      <RotateCcw className="size-3" />
                      <span>{notification.count}</span>
                    </div>
                  ) : null}
                </div>
                {notification.time || notification.subtitle ? (
                  <div className="text-xs font-medium text-muted-foreground">
                    {notification.time ? <span>{notification.time}</span> : null}
                    {notification.time && notification.subtitle ? <span>&nbsp;•&nbsp;</span> : null}
                    {notification.subtitle ? <span>{notification.subtitle}</span> : null}
                  </div>
                ) : null}
              </motion.div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
            {unreadNotifications.length}
          </div>
          <span className="grid">
            <motion.span
              className="row-start-1 col-start-1 text-sm font-medium text-muted-foreground"
              variants={notificationTextVariants}
              transition={textSwitchTransition}
            >
              Notifications
            </motion.span>
            <motion.div
              className="row-start-1 col-start-1"
              variants={viewAllTextVariants}
              transition={textSwitchTransition}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
                onClick={(event) => {
                  event.stopPropagation()
                  setViewAllOpen(true)
                }}
              >
                View all <ArrowUpRight className="size-4" />
              </button>
            </motion.div>
          </span>
        </div>
      </motion.div>

      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>All notifications</DialogTitle>
            <DialogDescription>
              Mark as read to hide an update from the sidebar notification stack.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {allNotifications.map((notification) => {
              const isRead = readIds.has(notification.id)
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-xl border border-border/70 bg-card px-4 py-3 transition-opacity",
                    isRead && "opacity-55"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{notification.title}</h3>
                        {notification.count ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <RotateCcw className="size-3" />
                            {notification.count}
                          </span>
                        ) : null}
                      </div>
                      {notification.subtitle ? (
                        <p className="text-sm text-muted-foreground">{notification.subtitle}</p>
                      ) : null}
                      {notification.time ? (
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      ) : null}
                    </div>

                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Checkbox
                        checked={isRead}
                        onCheckedChange={(checked) => toggleReadState(notification.id, checked)}
                      />
                      Mark as read
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { NotificationList }
