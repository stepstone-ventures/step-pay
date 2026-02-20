"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/mock-data"

type TransactionsAnalyticsProps = {
  transactions: Transaction[]
  currencyCode: string
  formatCurrency: (value: number) => string
}

type FrequencyKey = "weekly" | "monthly" | "quarterly" | "biannually" | "annually"

type SeriesPeriod = {
  label: string
  start: Date
  end: Date
  moneyIn: number
  moneyOut: number
  netCashflow: number
}

const BASELINE_START = new Date(2026, 0, 1)
const DURATION_OPTIONS = [4, 8, 12]

const FREQUENCY_OPTIONS: Array<{ value: FrequencyKey; label: string }> = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "biannually", label: "Bi-annually" },
  { value: "annually", label: "Annually" },
]

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + months)
  return copy
}

function nextPeriodStart(start: Date, frequency: FrequencyKey) {
  switch (frequency) {
    case "weekly":
      return addDays(start, 7)
    case "monthly":
      return addMonths(start, 1)
    case "quarterly":
      return addMonths(start, 3)
    case "biannually":
      return addMonths(start, 6)
    case "annually":
      return addMonths(start, 12)
    default:
      return addMonths(start, 1)
  }
}

function formatPeriodLabel(start: Date, frequency: FrequencyKey) {
  switch (frequency) {
    case "weekly":
      return `Wk ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(start)}`
    case "monthly":
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(start)
    case "quarterly": {
      const quarter = Math.floor(start.getMonth() / 3) + 1
      return `Q${quarter} ${String(start.getFullYear()).slice(-2)}`
    }
    case "biannually":
      return `${start.getMonth() < 6 ? "H1" : "H2"} ${String(start.getFullYear()).slice(-2)}`
    case "annually":
      return `${start.getFullYear()}`
    default:
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(start)
  }
}

function parseTransactionDate(transaction: Transaction) {
  const parsed = new Date(transaction.date)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getMoneyFlow(transaction: Transaction) {
  const amount = Number(transaction.amount) || 0
  if (amount < 0) {
    return { moneyIn: 0, moneyOut: Math.abs(amount) }
  }
  if (transaction.status === "successful") {
    return { moneyIn: amount, moneyOut: 0 }
  }
  if (transaction.status === "failed") {
    return { moneyIn: 0, moneyOut: amount }
  }
  return { moneyIn: 0, moneyOut: 0 }
}

function buildSeriesPeriods(
  frequency: FrequencyKey,
  transactions: Transaction[],
  now: Date
): SeriesPeriod[] {
  const start = startOfDay(BASELINE_START)
  const endExclusive = addDays(startOfDay(now), 1)
  const result: SeriesPeriod[] = []

  const parsedTransactions = transactions
    .map((transaction) => {
      const txDate = parseTransactionDate(transaction)
      return txDate ? { transaction, txDate } : null
    })
    .filter((item): item is { transaction: Transaction; txDate: Date } => item !== null)

  let cursor = start
  while (cursor < endExclusive) {
    const next = nextPeriodStart(cursor, frequency)
    const periodEnd = next < endExclusive ? next : endExclusive

    let moneyIn = 0
    let moneyOut = 0
    for (const item of parsedTransactions) {
      if (item.txDate < cursor || item.txDate >= periodEnd) continue
      const flow = getMoneyFlow(item.transaction)
      moneyIn += flow.moneyIn
      moneyOut += flow.moneyOut
    }

    result.push({
      label: formatPeriodLabel(cursor, frequency),
      start: cursor,
      end: periodEnd,
      moneyIn,
      moneyOut,
      netCashflow: moneyIn - moneyOut,
    })

    cursor = next
  }

  return result
}

function getMaxPage(periodCount: number, duration: number) {
  return Math.max(0, Math.ceil(periodCount / duration) - 1)
}

function getWindow(periods: SeriesPeriod[], duration: number, page: number) {
  const safeDuration = Math.max(1, duration)
  const endExclusive = Math.max(0, periods.length - page * safeDuration)
  const start = Math.max(0, endExclusive - safeDuration)
  return periods.slice(start, endExclusive)
}

function formatRangeLabel(window: SeriesPeriod[]) {
  if (window.length === 0) return "No range"
  const first = window[0]
  const last = window[window.length - 1]
  const firstLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(first.start)
  const lastLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    addDays(last.end, -1)
  )
  return `${firstLabel} - ${lastLabel}`
}

type ChartControlsProps = {
  frequency: FrequencyKey
  onFrequencyChange: (value: FrequencyKey) => void
  duration: number
  onDurationChange: (value: number) => void
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
  rangeLabel: string
}

function ChartControls({
  frequency,
  onFrequencyChange,
  duration,
  onDurationChange,
  onPrev,
  onNext,
  canPrev,
  canNext,
  rangeLabel,
}: ChartControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select value={frequency} onValueChange={(value) => onFrequencyChange(value as FrequencyKey)}>
        <SelectTrigger className="h-9 w-[170px] border-white/20 bg-black text-xs text-white">
          <SelectValue placeholder="Frequency" />
        </SelectTrigger>
        <SelectContent className="border-white/15 bg-black text-white">
          {FREQUENCY_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="focus:bg-white/10 focus:text-white"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={duration.toString()}
        onValueChange={(value) => onDurationChange(Number(value))}
      >
        <SelectTrigger className="h-9 w-[120px] border-white/20 bg-black text-xs text-white">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent className="border-white/15 bg-black text-white">
          {DURATION_OPTIONS.map((value) => (
            <SelectItem
              key={value}
              value={value.toString()}
              className="focus:bg-white/10 focus:text-white"
            >
              {value} periods
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="inline-flex overflow-hidden rounded-md border border-white/20">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="inline-flex h-9 w-9 items-center justify-center bg-white/5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous range"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex h-9 w-9 items-center justify-center border-l border-white/20 bg-white/5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next range"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <span className="text-xs font-medium text-white/70">{rangeLabel}</span>
    </div>
  )
}

export function TransactionsAnalytics({
  transactions,
  currencyCode,
  formatCurrency,
}: TransactionsAnalyticsProps) {
  const now = React.useMemo(() => new Date(), [])

  const [volumeFrequency, setVolumeFrequency] = React.useState<FrequencyKey>("monthly")
  const [volumeDuration, setVolumeDuration] = React.useState(8)
  const [volumePage, setVolumePage] = React.useState(0)

  const [barFrequency, setBarFrequency] = React.useState<FrequencyKey>("monthly")
  const [barDuration, setBarDuration] = React.useState(8)
  const [barPage, setBarPage] = React.useState(0)

  const volumePeriods = React.useMemo(
    () => buildSeriesPeriods(volumeFrequency, transactions, now),
    [now, transactions, volumeFrequency]
  )
  const barPeriods = React.useMemo(
    () => buildSeriesPeriods(barFrequency, transactions, now),
    [now, transactions, barFrequency]
  )

  React.useEffect(() => {
    const maxPage = getMaxPage(volumePeriods.length, volumeDuration)
    if (volumePage > maxPage) setVolumePage(maxPage)
  }, [volumeDuration, volumePage, volumePeriods.length])

  React.useEffect(() => {
    const maxPage = getMaxPage(barPeriods.length, barDuration)
    if (barPage > maxPage) setBarPage(maxPage)
  }, [barDuration, barPage, barPeriods.length])

  const volumeWindow = React.useMemo(
    () => getWindow(volumePeriods, volumeDuration, volumePage),
    [volumeDuration, volumePage, volumePeriods]
  )
  const barWindow = React.useMemo(
    () => getWindow(barPeriods, barDuration, barPage),
    [barDuration, barPage, barPeriods]
  )

  const volumeMaxPage = getMaxPage(volumePeriods.length, volumeDuration)
  const barMaxPage = getMaxPage(barPeriods.length, barDuration)

  const volumeMoneyIn = volumeWindow.reduce((sum, period) => sum + period.moneyIn, 0)
  const volumeMoneyOut = volumeWindow.reduce((sum, period) => sum + period.moneyOut, 0)
  const netCashflow = volumeMoneyIn - volumeMoneyOut

  const historyRows = React.useMemo(() => {
    return [...volumePeriods].reverse().slice(0, 10)
  }, [volumePeriods])

  const lineWidth = 760
  const lineHeight = 220
  const linePaddingX = 22
  const linePaddingY = 18
  const lineInnerWidth = lineWidth - linePaddingX * 2
  const lineInnerHeight = lineHeight - linePaddingY * 2
  const lineMaxValue = Math.max(
    1,
    ...volumeWindow.map((period) => Math.max(period.moneyIn, period.moneyOut))
  )
  const linePointCount = Math.max(1, volumeWindow.length - 1)

  const linePoints = volumeWindow.map((period, index) => {
    const x = linePaddingX + (index / linePointCount) * lineInnerWidth
    const yMoneyIn = lineHeight - linePaddingY - (period.moneyIn / lineMaxValue) * lineInnerHeight
    const yMoneyOut = lineHeight - linePaddingY - (period.moneyOut / lineMaxValue) * lineInnerHeight
    return { x, yMoneyIn, yMoneyOut, label: period.label }
  })

  const moneyInPath = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.yMoneyIn}`)
    .join(" ")
  const moneyOutPath = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.yMoneyOut}`)
    .join(" ")

  const lineGridStroke = "rgba(255,255,255,0.14)"

  const barMaxValue = Math.max(
    1,
    ...barWindow.map((period) => Math.max(period.moneyIn, period.moneyOut))
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-white/15 bg-black text-white shadow-[0_24px_65px_-35px_rgba(0,0,0,0.95)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Transactions</h2>
          <p className="text-sm text-white/65">Cashflow history from 2026 onward</p>
        </div>
        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          {currencyCode}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-white/60">Net Cashflow</p>
            <p className={cn("mt-2 text-2xl font-semibold", netCashflow < 0 ? "text-red-400" : "text-white")}>
              {formatCurrency(netCashflow)}
            </p>
          </div>
          <div className="rounded-xl border border-green-500/45 bg-green-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-green-300">Money In</p>
            <p className="mt-2 text-2xl font-semibold text-green-300">
              {formatCurrency(volumeMoneyIn)}
            </p>
          </div>
          <div className="rounded-xl border border-red-500/45 bg-red-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-red-300">Money Out</p>
            <p className="mt-2 text-2xl font-semibold text-red-300">
              {formatCurrency(volumeMoneyOut)}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-xl border border-white/15 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <p className="text-sm font-medium text-white/85">Volume Trend</p>
                <ChartControls
                  frequency={volumeFrequency}
                  onFrequencyChange={(value) => {
                    setVolumeFrequency(value)
                    setVolumePage(0)
                  }}
                  duration={volumeDuration}
                  onDurationChange={(value) => {
                    setVolumeDuration(value)
                    setVolumePage(0)
                  }}
                  onPrev={() => setVolumePage((prev) => Math.min(volumeMaxPage, prev + 1))}
                  onNext={() => setVolumePage((prev) => Math.max(0, prev - 1))}
                  canPrev={volumePage < volumeMaxPage}
                  canNext={volumePage > 0}
                  rangeLabel={formatRangeLabel(volumeWindow)}
                />
              </div>

              <div className="mt-4">
                <svg viewBox={`0 0 ${lineWidth} ${lineHeight}`} className="h-56 w-full">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const y = linePaddingY + (index / 4) * lineInnerHeight
                    return (
                      <line
                        key={`grid-${index}`}
                        x1={linePaddingX}
                        y1={y}
                        x2={lineWidth - linePaddingX}
                        y2={y}
                        stroke={lineGridStroke}
                        strokeWidth={1}
                      />
                    )
                  })}

                  {moneyInPath ? (
                    <path d={moneyInPath} fill="none" stroke="#22c55e" strokeWidth={3} strokeLinecap="round" />
                  ) : null}
                  {moneyOutPath ? (
                    <path d={moneyOutPath} fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
                  ) : null}

                  {linePoints.map((point) => (
                    <g key={`point-${point.label}`}>
                      <circle cx={point.x} cy={point.yMoneyIn} r={3} fill="#22c55e" />
                      <circle cx={point.x} cy={point.yMoneyOut} r={3} fill="#ef4444" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <p className="text-sm font-medium text-white/85">Money In vs Money Out (Bar Chart)</p>
                <ChartControls
                  frequency={barFrequency}
                  onFrequencyChange={(value) => {
                    setBarFrequency(value)
                    setBarPage(0)
                  }}
                  duration={barDuration}
                  onDurationChange={(value) => {
                    setBarDuration(value)
                    setBarPage(0)
                  }}
                  onPrev={() => setBarPage((prev) => Math.min(barMaxPage, prev + 1))}
                  onNext={() => setBarPage((prev) => Math.max(0, prev - 1))}
                  canPrev={barPage < barMaxPage}
                  canNext={barPage > 0}
                  rangeLabel={formatRangeLabel(barWindow)}
                />
              </div>

              <div className="mt-4 flex h-56 items-end gap-2 overflow-x-auto pb-2">
                {barWindow.map((period, index) => {
                  const moneyInHeight = Math.max(4, (period.moneyIn / barMaxValue) * 100)
                  const moneyOutHeight = Math.max(4, (period.moneyOut / barMaxValue) * 100)
                  return (
                    <div key={`${period.label}-${index}`} className="flex min-w-[38px] flex-col items-center gap-2">
                      <div className="flex h-full items-end gap-1.5">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${moneyInHeight}%` }}
                          transition={{ duration: 0.35, delay: index * 0.012, ease: "easeOut" }}
                          className="w-3 rounded-t bg-green-500"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${moneyOutHeight}%` }}
                          transition={{ duration: 0.35, delay: index * 0.012 + 0.04, ease: "easeOut" }}
                          className="w-3 rounded-t bg-red-500"
                        />
                      </div>
                      <span className="text-[0.63rem] text-white/55">{period.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
              History
            </h3>
            <div className="mt-4 space-y-2.5">
              {historyRows.map((period, index) => (
                <div
                  key={`${period.label}-history-${index}`}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{period.label}</p>
                    <p className={cn("text-sm font-semibold", period.netCashflow < 0 ? "text-red-400" : "text-white")}>
                      {formatCurrency(period.netCashflow)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-green-300">In: {formatCurrency(period.moneyIn)}</span>
                    <span className="text-red-300">Out: {formatCurrency(period.moneyOut)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
