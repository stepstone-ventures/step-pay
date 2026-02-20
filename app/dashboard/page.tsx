"use client"

import { useEffect, useState } from "react"
import { AnimatedStatCard } from "@/components/dashboard/animated-stat-card"
import { TransactionsAnalytics } from "@/components/dashboard/transactions-analytics"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/mock-data"

type CurrencyOption = {
  id: string
  country: string
  flag: string
  currencyCode: string
}

const DEFAULT_USD_ID = "United States of America::USD"

const FALLBACK_CURRENCY_OPTIONS: CurrencyOption[] = [
  { id: "United States of America::USD", country: "United States of America", flag: "🇺🇸", currencyCode: "USD" },
  { id: "United Kingdom::GBP", country: "United Kingdom", flag: "🇬🇧", currencyCode: "GBP" },
  { id: "European Union::EUR", country: "European Union", flag: "🇪🇺", currencyCode: "EUR" },
  { id: "Nigeria::NGN", country: "Nigeria", flag: "🇳🇬", currencyCode: "NGN" },
  { id: "Ghana::GHS", country: "Ghana", flag: "🇬🇭", currencyCode: "GHS" },
]

const normalizeCountryName = (countryName: string) => {
  if (countryName === "United States") return "United States of America"
  return countryName
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>(FALLBACK_CURRENCY_OPTIONS)
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(DEFAULT_USD_ID)

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((transactionsData) => {
        setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let active = true

    const loadCurrencyOptions = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flag,currencies")
        if (!response.ok) return

        const countries = await response.json()
        const byCountry = new Map<string, CurrencyOption>()

        for (const country of countries) {
          const name =
            typeof country?.name?.common === "string"
              ? normalizeCountryName(country.name.common)
              : ""
          const flag = typeof country?.flag === "string" ? country.flag : "🏳️"
          const currencyEntries =
            country?.currencies && typeof country.currencies === "object"
              ? Object.keys(country.currencies)
              : []

          if (!name || currencyEntries.length === 0) continue

          const currencyCode = currencyEntries.sort((a: string, b: string) => a.localeCompare(b))[0]
          if (!currencyCode) continue

          byCountry.set(name, {
            id: `${name}::${currencyCode}`,
            country: name,
            flag,
            currencyCode,
          })
        }

        const sorted = Array.from(byCountry.values()).sort((a, b) =>
          a.country.localeCompare(b.country, undefined, { sensitivity: "base" })
        )

        if (!active || sorted.length === 0) return

        setCurrencyOptions(sorted)
        const usaOption = sorted.find((option) => option.country === "United States of America")
        const usdOption = sorted.find((option) => option.currencyCode === "USD")
        setSelectedCurrencyId((prev) => {
          if (sorted.some((option) => option.id === prev)) return prev
          return usaOption?.id ?? usdOption?.id ?? sorted[0]?.id ?? DEFAULT_USD_ID
        })
      } catch {
        // Keep fallback options when API fetch fails.
      }
    }

    loadCurrencyOptions()

    return () => {
      active = false
    }
  }, [])

  const selectedCurrencyOption = currencyOptions.find((option) => option.id === selectedCurrencyId)
  const selectedCurrencyCode = selectedCurrencyOption?.currencyCode ?? "USD"

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: selectedCurrencyCode,
      }).format(amount)
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    }
  }

  // New user defaults
  const revenue = 0
  const paymentIssues = 0
  const salesPrediction = 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your payment activity</p>
        </div>
        <div className="py-12 text-center text-muted-foreground">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-6 sm:space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatedStatCard
          title="Revenue"
          value={formatCurrency(revenue)}
          subtitle="No settled revenue yet."
          action={(
            <Select value={selectedCurrencyId} onValueChange={setSelectedCurrencyId}>
              <SelectTrigger className="h-8 w-[220px] border-white/25 bg-black/70 text-xs text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="border-white/15 bg-black text-white">
                {currencyOptions.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="focus:bg-white/10 focus:text-white"
                  >
                    {option.flag} {option.country} - {option.currencyCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <AnimatedStatCard
          title="Payment Issues"
          value={paymentIssues.toString()}
          subtitle="No failed or pending payments."
          tone="negative"
          delay={0.06}
        />

        <AnimatedStatCard
          title="Sales Predictions"
          value={formatCurrency(salesPrediction)}
          subtitle="Insufficient history for forecasting."
          tone="positive"
          delay={0.12}
        />
      </div>

      <TransactionsAnalytics
        transactions={transactions}
        currencyCode={selectedCurrencyCode}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
