"use client"

import { useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"
import { AnimatedStatCard } from "@/components/dashboard/animated-stat-card"
import { TransactionsAnalytics } from "@/components/dashboard/transactions-analytics"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { APP_CURRENCIES, getCurrencyForCountry, isAppCurrency, type AppCurrency } from "@/lib/currency-options"
import type { Transaction } from "@/lib/mock-data"

type ExchangeRatesResponse = {
  base: "USD"
  date: string
  rates: Record<AppCurrency, number>
  stale?: boolean
}

function convertCurrencyAmount(
  amount: number,
  sourceCurrency: string | undefined,
  targetCurrency: AppCurrency,
  rates: Record<AppCurrency, number> | null
) {
  if (!Number.isFinite(amount) || !rates) return amount

  const normalizedSourceCurrency: AppCurrency = isAppCurrency(sourceCurrency) ? sourceCurrency : "USD"
  if (normalizedSourceCurrency === targetCurrency) return amount

  const sourceRate = rates[normalizedSourceCurrency]
  const targetRate = rates[targetCurrency]
  if (!sourceRate || !targetRate) return amount

  const amountInUsd = amount / sourceRate
  return amountInUsd * targetRate
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<AppCurrency>("USD")
  const [exchangeRates, setExchangeRates] = useState<Record<AppCurrency, number> | null>(null)
  const [exchangeRateDate, setExchangeRateDate] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createSupabaseBrowserClient()

    const hydrateDashboard = async () => {
      const [transactionsResult, userResult, exchangeRatesResult] = await Promise.allSettled([
        fetch("/api/transactions").then((res) => res.json()),
        supabase.auth.getUser(),
        fetch("/api/exchange-rates").then((res) => res.json()),
      ])

      if (!active) return

      if (transactionsResult.status === "fulfilled" && Array.isArray(transactionsResult.value)) {
        setTransactions(transactionsResult.value)
      } else {
        setTransactions([])
      }

      if (userResult.status === "fulfilled") {
        const metadata = userResult.value.data.user?.user_metadata ?? {}
        const preferredCurrency = typeof metadata.preferred_currency === "string" ? metadata.preferred_currency : null
        const selectedCountry = typeof metadata.country === "string" ? metadata.country : null

        if (isAppCurrency(preferredCurrency)) {
          setSelectedCurrencyCode(preferredCurrency)
        } else {
          const derivedCurrency = getCurrencyForCountry(selectedCountry)
          if (derivedCurrency) setSelectedCurrencyCode(derivedCurrency)
        }
      }

      if (exchangeRatesResult.status === "fulfilled") {
        const payload = exchangeRatesResult.value as Partial<ExchangeRatesResponse>
        const rates = payload.rates
        if (rates && typeof rates === "object") {
          const normalizedRates = APP_CURRENCIES.reduce<Record<AppCurrency, number>>((acc, currencyCode) => {
            const rawRate = Number((rates as Record<string, unknown>)[currencyCode])
            acc[currencyCode] = Number.isFinite(rawRate) && rawRate > 0 ? rawRate : 0
            return acc
          }, {} as Record<AppCurrency, number>)

          normalizedRates.USD = 1
          setExchangeRates(normalizedRates)
          if (typeof payload.date === "string") setExchangeRateDate(payload.date)
        }
      }

      setLoading(false)
    }

    hydrateDashboard().catch(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const convertedTransactions = useMemo(() => {
    return transactions.map((transaction) => {
      const originalAmount = Number(transaction.amount) || 0
      const convertedAmount = convertCurrencyAmount(
        originalAmount,
        transaction.currency,
        selectedCurrencyCode,
        exchangeRates
      )

      return {
        ...transaction,
        amount: convertedAmount,
        currency: selectedCurrencyCode,
      }
    })
  }, [exchangeRates, selectedCurrencyCode, transactions])

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

  const successfulTransactions = convertedTransactions.filter((transaction) => transaction.status === "successful")
  const revenue = successfulTransactions.reduce((sum, transaction) => {
    const amount = Number(transaction.amount) || 0
    return amount > 0 ? sum + amount : sum
  }, 0)
  const paymentIssues = convertedTransactions.filter(
    (transaction) => transaction.status === "failed" || transaction.status === "pending"
  ).length
  const salesPrediction = revenue * 1.15

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
          subtitle={
            exchangeRateDate
              ? `Settled revenue to date. FX rate date: ${exchangeRateDate}.`
              : "Settled revenue to date."
          }
          icon={<Check className="h-4 w-4 text-white" strokeWidth={3} />}
          action={(
            <Select value={selectedCurrencyCode} onValueChange={(value) => setSelectedCurrencyCode(value as AppCurrency)}>
              <SelectTrigger className="h-8 w-[120px] border border-[#E5E7EB] bg-white text-xs text-[#374151] shadow-none dark:border-zinc-800 dark:bg-black dark:text-gray-200">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="border-[#E5E7EB] bg-white text-[#374151] dark:border-zinc-800 dark:bg-black dark:text-gray-200">
                {APP_CURRENCIES.map((currencyCode) => (
                  <SelectItem
                    key={currencyCode}
                    value={currencyCode}
                    className="focus:bg-[#E5E7EB]/60 focus:text-[#374151] dark:focus:bg-zinc-800 dark:focus:text-gray-100"
                  >
                    {currencyCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <AnimatedStatCard
          title="Payment Issues"
          value={paymentIssues.toString()}
          subtitle="Failed or pending transactions."
          tone="negative"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
              <path d="M12 6v8" />
              <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
            </svg>
          }
          delay={0.06}
        />

        <AnimatedStatCard
          title="Sales Predictions"
          value={formatCurrency(salesPrediction)}
          subtitle="Projection based on recent trend."
          tone="positive"
          delay={0.12}
        />
      </div>

      <TransactionsAnalytics
        transactions={convertedTransactions}
        currencyCode={selectedCurrencyCode}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
