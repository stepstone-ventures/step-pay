import { NextResponse } from "next/server"
import { APP_CURRENCIES, type AppCurrency } from "@/lib/currency-options"

type ExchangeRatesPayload = {
  base: "USD"
  date: string
  rates: Record<AppCurrency, number>
  stale?: boolean
}

function getTodayUtcDate() {
  return new Date().toISOString().slice(0, 10)
}

function toFiniteRate(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

export async function GET() {
  const today = getTodayUtcDate()

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 60 * 60 * 6 },
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Exchange rate request failed with status ${response.status}`)
    }

    const payload = await response.json()
    const sourceRates = payload?.rates

    if (!sourceRates || typeof sourceRates !== "object") {
      throw new Error("Exchange rate provider returned an invalid payload")
    }

    const mappedRates = APP_CURRENCIES.reduce<Record<AppCurrency, number>>((acc, currencyCode) => {
      const normalizedRate = toFiniteRate((sourceRates as Record<string, unknown>)[currencyCode])
      if (!normalizedRate) {
        throw new Error(`Missing or invalid rate for ${currencyCode}`)
      }
      acc[currencyCode] = normalizedRate
      return acc
    }, {} as Record<AppCurrency, number>)

    mappedRates.USD = 1

    const parsedDate = typeof payload?.time_last_update_utc === "string"
      ? new Date(payload.time_last_update_utc)
      : null
    const date =
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 10) : today

    const body: ExchangeRatesPayload = {
      base: "USD",
      date,
      rates: mappedRates,
    }

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error loading exchange rates:", error)

    const fallbackRates = APP_CURRENCIES.reduce<Record<AppCurrency, number>>((acc, currencyCode) => {
      acc[currencyCode] = currencyCode === "USD" ? 1 : 0
      return acc
    }, {} as Record<AppCurrency, number>)

    const body: ExchangeRatesPayload = {
      base: "USD",
      date: today,
      rates: fallbackRates,
      stale: true,
    }

    return NextResponse.json(body, { status: 200 })
  }
}
