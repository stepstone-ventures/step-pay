export const DASHBOARD_CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "CNY",
  "GHS",
  "NGN",
  "ZAR",
] as const

export type DashboardCurrency = (typeof DASHBOARD_CURRENCIES)[number]

export const DEFAULT_DASHBOARD_CURRENCY: DashboardCurrency = "GHS"

