"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, RotateCcw } from "lucide-react"
import { motion, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"
import { dashboardNotifications } from "@/lib/dashboard-notifications"

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

type NotificationListProps = React.ComponentProps<"div"> & {
  onNavigate?: () => void
}

function NotificationList({ className, onNavigate }: NotificationListProps) {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState(false)
  const [expandedByTap, setExpandedByTap] = React.useState(false)

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

  const previewNotifications = dashboardNotifications.slice(0, 3)
  const animationState = isMobileOrTablet && expandedByTap ? "expanded" : "collapsed"

  return (
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
        {previewNotifications.map((notification, i) => (
          <motion.div
            key={notification.id}
            className="relative rounded-xl bg-card px-4 py-2 shadow-sm transition-shadow duration-200 hover:shadow-lg"
            variants={getCardVariants(i)}
            transition={transition}
            style={{
              zIndex: previewNotifications.length - i,
            }}
          >
            <div className="flex items-center justify-between">
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
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
          {dashboardNotifications.length}
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
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation()
                onNavigate?.()
              }}
            >
              View all <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </span>
      </div>
    </motion.div>
  )
}

export { NotificationList }
