export type DashboardNotification = {
  id: string
  title: string
  subtitle?: string
  time?: string
  count?: number
  sortOrder: number
}

export const COMPLIANCE_TOTAL_STEPS = 5

export function getComplianceProgressFromStorage() {
  if (typeof window === "undefined") return 0

  if (localStorage.getItem("compliance_complete") === "true") {
    return COMPLIANCE_TOTAL_STEPS
  }

  try {
    const stored = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
    if (!Array.isArray(stored)) return 0
    const validSteps = new Set(["profile", "contact", "owner", "account", "service-agreement"])
    const completed = new Set(stored.filter((step) => validSteps.has(step)))
    return Math.min(completed.size, COMPLIANCE_TOTAL_STEPS)
  } catch {
    return 0
  }
}

export function buildDashboardNotifications({
  complianceProgress,
  hasStepTag,
}: {
  complianceProgress: number
  hasStepTag: boolean
}): DashboardNotification[] {
  const notifications: DashboardNotification[] = [
    {
      id: "product-send-payment",
      title: "Send Payment is now live in the sidebar.",
      subtitle: "Pay StepPay businesses instantly with StepTag.",
      time: "Major update",
      sortOrder: 70,
    },
    {
      id: "product-pending-tab",
      title: "Payouts moved to Pending in Payments.",
      subtitle: "Use Pending to track scheduled and processing payouts.",
      time: "Major update",
      sortOrder: 60,
    },
  ]

  if (complianceProgress < COMPLIANCE_TOTAL_STEPS) {
    notifications.unshift(
      {
        id: `compliance-progress-${complianceProgress}`,
        title: `Compliance checklist: ${complianceProgress}/${COMPLIANCE_TOTAL_STEPS} completed`,
        subtitle: "Finish all steps to unlock full account access.",
        count: complianceProgress,
        time: "Action required",
        sortOrder: 100,
      },
      {
        id: "compliance-required",
        title: "Complete Compliance checklist to begin making transactions.",
        time: "Action required",
        sortOrder: 90,
      }
    )
  } else {
    notifications.unshift({
      id: "compliance-complete",
      title: "Compliance complete: 5/5 steps approved.",
      subtitle: "You now have full transaction access.",
      time: "Completed",
      sortOrder: 80,
    })
  }

  if (!hasStepTag) {
    notifications.push({
      id: "account-steptag",
      title: "Set your StepTag to receive transfers by @username.",
      subtitle: "Go to User Account menu -> StepTag to save it once.",
      time: "Account setup",
      sortOrder: 85,
    })
  }

  return notifications.sort((a, b) => b.sortOrder - a.sortOrder)
}

export function getDashboardNotificationsFromStorage(): DashboardNotification[] {
  if (typeof window === "undefined") {
    return buildDashboardNotifications({
      complianceProgress: 0,
      hasStepTag: false,
    })
  }

  const complianceProgress = getComplianceProgressFromStorage()
  const hasStepTag = Boolean(
    localStorage.getItem("dashboard_step_tag") ||
      localStorage.getItem("dashboard_step_tag_locked")
  )

  return buildDashboardNotifications({
    complianceProgress,
    hasStepTag,
  })
}

export const dashboardNotifications = buildDashboardNotifications({
  complianceProgress: 0,
  hasStepTag: false,
})
