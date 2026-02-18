export type DashboardNotification = {
  id: number
  title: string
  subtitle?: string
  time?: string
  count?: number
  sortOrder: number
}

const rawNotifications: DashboardNotification[] = [
  {
    id: 1,
    title: "Compliance checklist: 0/5 completed",
    sortOrder: 3,
  },
  {
    id: 2,
    title: "Complete Compliance checklist to begin making transactions",
    sortOrder: 2,
  },
  {
    id: 3,
    title: "Congratulations! Your business email has been approved.",
    sortOrder: 1,
  },
]

export const dashboardNotifications = rawNotifications
  .slice()
  .sort((a, b) => b.sortOrder - a.sortOrder)
