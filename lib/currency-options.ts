export const APP_CURRENCIES = ["USD", "EUR", "GBP", "CNY", "JPY", "GHS"] as const

export type AppCurrency = (typeof APP_CURRENCIES)[number]

export const CURRENCY_LABELS: Record<AppCurrency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CNY: "Chinese Yuan",
  JPY: "Japanese Yen",
  GHS: "Ghanaian Cedi",
}

export const DEFAULT_CURRENCY: AppCurrency = "GHS"

export const DASHBOARD_CURRENCIES = APP_CURRENCIES
export type DashboardCurrency = AppCurrency
export const DEFAULT_DASHBOARD_CURRENCY: DashboardCurrency = DEFAULT_CURRENCY

const COUNTRY_CURRENCY_PAIRS: Array<[AppCurrency, readonly string[]]> = [
  [
    "USD",
    [
      "United States",
      "United States of America",
      "Ecuador",
      "El Salvador",
      "Panama",
      "Timor-Leste",
      "Palau",
      "Micronesia",
      "Federated States of Micronesia",
      "Marshall Islands",
    ],
  ],
  [
    "EUR",
    [
      "Austria",
      "Belgium",
      "Croatia",
      "Cyprus",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Ireland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Netherlands",
      "Portugal",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Andorra",
      "Monaco",
      "Kosovo",
      "Montenegro",
      "Vatican City",
      "Vatican",
      "San Marino",
    ],
  ],
  [
    "GBP",
    [
      "United Kingdom",
      "United Kingdom of Great Britain and Northern Ireland",
      "Great Britain",
      "England",
      "Scotland",
      "Wales",
      "Northern Ireland",
    ],
  ],
  ["CNY", ["China", "People's Republic of China"]],
  ["JPY", ["Japan"]],
  ["GHS", ["Ghana"]],
]

function normalizeCountryKey(country: string) {
  return country.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const COUNTRY_CURRENCY_LOOKUP: Record<string, AppCurrency> = (() => {
  const result: Record<string, AppCurrency> = {}

  for (const [currencyCode, countries] of COUNTRY_CURRENCY_PAIRS) {
    for (const country of countries) {
      result[normalizeCountryKey(country)] = currencyCode
    }
  }

  return result
})()

export function isAppCurrency(value: string | null | undefined): value is AppCurrency {
  if (!value) return false
  return APP_CURRENCIES.includes(value as AppCurrency)
}

export function getCurrencyForCountry(country: string | null | undefined): AppCurrency | null {
  if (!country) return null
  const normalizedCountry = normalizeCountryKey(country)
  return COUNTRY_CURRENCY_LOOKUP[normalizedCountry] ?? null
}
