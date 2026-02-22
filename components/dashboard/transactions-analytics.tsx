"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetCard } from "@/components/dashboard/budget-card"
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

type ChartPoint = {
  x: number
  y: number
}

type VolumePoint = {
  x: number
  yMoneyIn: number
  yMoneyOut: number
  label: string
  moneyIn: number
  moneyOut: number
}

type BarRect = {
  label: string
  centerX: number
  xMoneyIn: number
  xMoneyOut: number
  yMoneyIn: number
  yMoneyOut: number
  moneyInHeight: number
  moneyOutHeight: number
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

function toPathNumber(value: number) {
  return Number(value.toFixed(2))
}

function buildSmoothPath(points: ChartPoint[]) {
  if (points.length === 0) return ""
  if (points.length === 1) {
    return `M ${toPathNumber(points[0].x)} ${toPathNumber(points[0].y)}`
  }

  let path = `M ${toPathNumber(points[0].x)} ${toPathNumber(points[0].y)}`

  for (let index = 0; index < points.length - 1; index++) {
    const previous = points[index - 1] ?? points[index]
    const current = points[index]
    const next = points[index + 1]
    const afterNext = points[index + 2] ?? next

    const controlPoint1X = current.x + (next.x - previous.x) / 6
    const controlPoint1Y = current.y + (next.y - previous.y) / 6
    const controlPoint2X = next.x - (afterNext.x - current.x) / 6
    const controlPoint2Y = next.y - (afterNext.y - current.y) / 6

    path += ` C ${toPathNumber(controlPoint1X)} ${toPathNumber(controlPoint1Y)}, ${toPathNumber(controlPoint2X)} ${toPathNumber(controlPoint2Y)}, ${toPathNumber(next.x)} ${toPathNumber(next.y)}`
  }

  return path
}

function buildAreaPath(points: ChartPoint[], baselineY: number) {
  if (points.length === 0) return ""
  const linePath = buildSmoothPath(points)
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath} L ${toPathNumber(last.x)} ${toPathNumber(baselineY)} L ${toPathNumber(first.x)} ${toPathNumber(baselineY)} Z`
}

function findClosestPointIndex(points: ChartPoint[], targetX: number) {
  if (points.length === 0) return -1

  let closestIndex = 0
  let smallestDistance = Number.POSITIVE_INFINITY

  points.forEach((point, index) => {
    const distance = Math.abs(point.x - targetX)
    if (distance < smallestDistance) {
      smallestDistance = distance
      closestIndex = index
    }
  })

  return closestIndex
}

function buildAxisLabelIndices(length: number, slots = 5) {
  if (length === 0) return []
  if (length <= slots) return Array.from({ length }, (_, index) => index)

  const lastIndex = length - 1
  const indices = new Set<number>([0, lastIndex])

  for (let slot = 1; slot < slots - 1; slot++) {
    indices.add(Math.round((slot / (slots - 1)) * lastIndex))
  }

  return Array.from(indices).sort((a, b) => a - b)
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
        <SelectTrigger className="h-9 w-[170px] border border-[#E5E7EB] bg-white text-xs text-[#374151] dark:border-zinc-800 dark:bg-black dark:text-gray-200">
          <SelectValue placeholder="Frequency" />
        </SelectTrigger>
        <SelectContent className="border-[#E5E7EB] bg-white text-[#374151] dark:border-zinc-800 dark:bg-black dark:text-gray-200">
          {FREQUENCY_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="focus:bg-[#E5E7EB]/60 focus:text-[#374151] dark:focus:bg-zinc-800 dark:focus:text-gray-100"
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
        <SelectTrigger className="h-9 w-[120px] border border-[#E5E7EB] bg-white text-xs text-[#374151] dark:border-zinc-800 dark:bg-black dark:text-gray-200">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent className="border-[#E5E7EB] bg-white text-[#374151] dark:border-zinc-800 dark:bg-black dark:text-gray-200">
          {DURATION_OPTIONS.map((value) => (
            <SelectItem
              key={value}
              value={value.toString()}
              className="focus:bg-[#E5E7EB]/60 focus:text-[#374151] dark:focus:bg-zinc-800 dark:focus:text-gray-100"
            >
              {value} periods
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="inline-flex overflow-hidden rounded-md border border-[#E5E7EB] dark:border-zinc-800">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="inline-flex h-9 w-9 items-center justify-center bg-white text-[#374151] transition-colors hover:bg-[#E5E7EB]/60 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-800"
          aria-label="Previous range"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex h-9 w-9 items-center justify-center border-l border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#E5E7EB]/60 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-800"
          aria-label="Next range"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <span className="text-xs font-medium text-[#6B7280] dark:text-gray-400">{rangeLabel}</span>
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
  const [activeLineIndex, setActiveLineIndex] = React.useState<number | null>(null)

  const [barFrequency, setBarFrequency] = React.useState<FrequencyKey>("monthly")
  const [barDuration, setBarDuration] = React.useState(8)
  const [barPage, setBarPage] = React.useState(0)
  const [activeBarIndex, setActiveBarIndex] = React.useState<number | null>(null)

  const ids = React.useMemo(
    () => ({
      moneyInArea: `money-in-area-${Math.random().toString(36).slice(2, 9)}`,
      moneyOutArea: `money-out-area-${Math.random().toString(36).slice(2, 9)}`,
      barMoneyIn: `bar-money-in-${Math.random().toString(36).slice(2, 9)}`,
      barMoneyOut: `bar-money-out-${Math.random().toString(36).slice(2, 9)}`,
    }),
    []
  )

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
  const lineHeight = 250
  const linePadding = { top: 18, right: 20, bottom: 34, left: 24 }
  const lineInnerWidth = lineWidth - linePadding.left - linePadding.right
  const lineInnerHeight = lineHeight - linePadding.top - linePadding.bottom
  const lineBaselineY = lineHeight - linePadding.bottom
  const lineMaxValue = Math.max(
    1,
    ...volumeWindow.map((period) => Math.max(period.moneyIn, period.moneyOut))
  )
  const linePointCount = Math.max(1, volumeWindow.length - 1)

  const linePoints: VolumePoint[] = volumeWindow.map((period, index) => {
    const x =
      volumeWindow.length <= 1
        ? linePadding.left + lineInnerWidth / 2
        : linePadding.left + (index / linePointCount) * lineInnerWidth
    const yMoneyIn = lineBaselineY - (period.moneyIn / lineMaxValue) * lineInnerHeight
    const yMoneyOut = lineBaselineY - (period.moneyOut / lineMaxValue) * lineInnerHeight
    return { x, yMoneyIn, yMoneyOut, label: period.label, moneyIn: period.moneyIn, moneyOut: period.moneyOut }
  })

  const moneyInPoints: ChartPoint[] = linePoints.map((point) => ({ x: point.x, y: point.yMoneyIn }))
  const moneyOutPoints: ChartPoint[] = linePoints.map((point) => ({ x: point.x, y: point.yMoneyOut }))

  const moneyInPath = buildSmoothPath(moneyInPoints)
  const moneyOutPath = buildSmoothPath(moneyOutPoints)
  const moneyInAreaPath = buildAreaPath(moneyInPoints, lineBaselineY)
  const moneyOutAreaPath = buildAreaPath(moneyOutPoints, lineBaselineY)

  const lineLabelIndices = React.useMemo(() => buildAxisLabelIndices(linePoints.length), [linePoints.length])

  const lineGridStroke = "rgba(107,114,128,0.28)"
  const barGridStroke = "rgba(107,114,128,0.2)"

  const handleLineMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (linePoints.length === 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width <= 0) return
    const cursorX = ((event.clientX - bounds.left) / bounds.width) * lineWidth
    const nearestIndex = findClosestPointIndex(moneyInPoints, cursorX)
    setActiveLineIndex(nearestIndex >= 0 ? nearestIndex : null)
  }

  const handleLineMouseLeave = () => {
    setActiveLineIndex(null)
  }

  const activeLinePoint = activeLineIndex !== null ? linePoints[activeLineIndex] ?? null : null

  React.useEffect(() => {
    if (activeLineIndex !== null && activeLineIndex >= linePoints.length) {
      setActiveLineIndex(null)
    }
  }, [activeLineIndex, linePoints.length])

  const barWidth = 760
  const barHeight = 240
  const barPadding = { top: 16, right: 20, bottom: 34, left: 24 }
  const barInnerWidth = barWidth - barPadding.left - barPadding.right
  const barInnerHeight = barHeight - barPadding.top - barPadding.bottom
  const barBaselineY = barHeight - barPadding.bottom
  const barMaxValue = Math.max(
    1,
    ...barWindow.map((period) => Math.max(period.moneyIn, period.moneyOut))
  )
  const groupSlotWidth = barWindow.length > 0 ? barInnerWidth / barWindow.length : barInnerWidth
  const barsGap = Math.min(10, Math.max(4, groupSlotWidth * 0.14))
  const singleBarWidth = Math.min(18, Math.max(8, (groupSlotWidth - barsGap - 6) / 2))
  const barGroupWidth = singleBarWidth * 2 + barsGap

  const barRects: BarRect[] = barWindow.map((period, index) => {
    const centerX = barPadding.left + groupSlotWidth * index + groupSlotWidth / 2
    const moneyInHeight = Math.max(0, (period.moneyIn / barMaxValue) * barInnerHeight)
    const moneyOutHeight = Math.max(0, (period.moneyOut / barMaxValue) * barInnerHeight)
    const xMoneyIn = centerX - barGroupWidth / 2
    const xMoneyOut = xMoneyIn + singleBarWidth + barsGap

    return {
      label: period.label,
      centerX,
      xMoneyIn,
      xMoneyOut,
      yMoneyIn: barBaselineY - moneyInHeight,
      yMoneyOut: barBaselineY - moneyOutHeight,
      moneyInHeight,
      moneyOutHeight,
    }
  })

  const barLabelIndices = React.useMemo(() => buildAxisLabelIndices(barRects.length), [barRects.length])
  const barPoints: ChartPoint[] = barRects.map((rect) => ({ x: rect.centerX, y: barBaselineY }))

  const handleBarMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (barRects.length === 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width <= 0) return
    const cursorX = ((event.clientX - bounds.left) / bounds.width) * barWidth
    const nearestIndex = findClosestPointIndex(barPoints, cursorX)
    setActiveBarIndex(nearestIndex >= 0 ? nearestIndex : null)
  }

  const handleBarMouseLeave = () => {
    setActiveBarIndex(null)
  }

  React.useEffect(() => {
    if (activeBarIndex !== null && activeBarIndex >= barWindow.length) {
      setActiveBarIndex(null)
    }
  }, [activeBarIndex, barWindow.length])

  const activeBarPeriod = activeBarIndex !== null ? barWindow[activeBarIndex] ?? null : null
  const activeBarRect = activeBarIndex !== null ? barRects[activeBarIndex] ?? null : null

  return (
    <BudgetCard
      delay={0.1}
      className="border border-[#E5E7EB] dark:border-[#374151] text-[#0f172a] dark:text-gray-100"
    >
      <section className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#374151] dark:text-gray-100">Transactions</h2>
          <p className="text-sm text-[#6B7280] dark:text-gray-400">Cashflow history from 2026 onward</p>
        </div>
        <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#374151] dark:border-zinc-800 dark:bg-black dark:text-gray-200">
          {currencyCode}
        </span>
      </div>

      <div className="space-y-5 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-black">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-600 dark:text-gray-400">Net Cashflow</p>
            <p className={cn("mt-2 text-2xl font-semibold", netCashflow < 0 ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-gray-100")}>
              {formatCurrency(netCashflow)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-black">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-600 dark:text-gray-400">Money In</p>
            <p className="mt-2 text-2xl font-semibold text-green-700 dark:text-green-400">
              {formatCurrency(volumeMoneyIn)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-black">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-600 dark:text-gray-400">Money Out</p>
            <p className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-400">
              {formatCurrency(volumeMoneyOut)}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-black">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 dark:border-zinc-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Volume Trend</p>
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
                <div className="mb-3 flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green-500" />
                    Money In
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-500" />
                    Money Out
                  </span>
                </div>

                <div className="relative">
                  <svg
                    viewBox={`0 0 ${lineWidth} ${lineHeight}`}
                    className="h-64 w-full touch-none"
                    onMouseMove={handleLineMouseMove}
                    onMouseLeave={handleLineMouseLeave}
                    role="img"
                    aria-label="Volume trend chart"
                  >
                    <defs>
                      <linearGradient id={ids.moneyInArea} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34,197,94,0.26)" />
                        <stop offset="100%" stopColor="rgba(34,197,94,0.02)" />
                      </linearGradient>
                      <linearGradient id={ids.moneyOutArea} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(239,68,68,0.24)" />
                        <stop offset="100%" stopColor="rgba(239,68,68,0.02)" />
                      </linearGradient>
                    </defs>

                    {Array.from({ length: 5 }).map((_, index) => {
                      const y = linePadding.top + (index / 4) * lineInnerHeight
                      return (
                        <line
                          key={`line-grid-${index}`}
                          x1={linePadding.left}
                          y1={y}
                          x2={lineWidth - linePadding.right}
                          y2={y}
                          stroke={lineGridStroke}
                          strokeWidth={1}
                        />
                      )
                    })}

                    {lineLabelIndices.map((pointIndex) => {
                      const point = linePoints[pointIndex]
                      if (!point) return null
                      return (
                        <line
                          key={`line-vertical-${pointIndex}`}
                          x1={point.x}
                          y1={linePadding.top}
                          x2={point.x}
                          y2={lineBaselineY}
                          stroke={lineGridStroke}
                          strokeWidth={0.6}
                          strokeDasharray="3 5"
                        />
                      )
                    })}

                    {moneyOutAreaPath ? (
                      <motion.path
                        d={moneyOutAreaPath}
                        fill={`url(#${ids.moneyOutArea})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                    ) : null}
                    {moneyInAreaPath ? (
                      <motion.path
                        d={moneyInAreaPath}
                        fill={`url(#${ids.moneyInArea})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
                      />
                    ) : null}

                    {moneyOutPath ? (
                      <motion.path
                        d={moneyOutPath}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0.25 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                      />
                    ) : null}
                    {moneyInPath ? (
                      <motion.path
                        d={moneyInPath}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth={2.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0.25 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.65, ease: "easeOut", delay: 0.08 }}
                      />
                    ) : null}

                    {activeLinePoint ? (
                      <line
                        x1={activeLinePoint.x}
                        y1={linePadding.top}
                        x2={activeLinePoint.x}
                        y2={lineBaselineY}
                        stroke="rgba(71,85,105,0.5)"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                      />
                    ) : null}

                    {linePoints.map((point, index) => (
                      <g key={`line-point-${point.label}-${index}`}>
                        <motion.circle
                          cx={point.x}
                          cy={point.yMoneyIn}
                          r={activeLineIndex === index ? 5 : 3}
                          fill="#22c55e"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25, delay: index * 0.02 }}
                        />
                        <motion.circle
                          cx={point.x}
                          cy={point.yMoneyOut}
                          r={activeLineIndex === index ? 5 : 3}
                          fill="#ef4444"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25, delay: index * 0.02 + 0.04 }}
                        />
                      </g>
                    ))}

                    {lineLabelIndices.map((pointIndex) => {
                      const point = linePoints[pointIndex]
                      if (!point) return null
                      return (
                        <text
                          key={`line-label-${pointIndex}`}
                          x={point.x}
                          y={lineHeight - 10}
                          textAnchor="middle"
                          className="fill-gray-500 text-[10px] dark:fill-gray-400"
                        >
                          {point.label}
                        </text>
                      )
                    })}
                  </svg>

                  {activeLinePoint ? (
                    <div
                      className="pointer-events-none absolute left-0 top-2 z-20 -translate-x-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs shadow-sm dark:border-zinc-800 dark:bg-black"
                      style={{ left: `${(activeLinePoint.x / lineWidth) * 100}%` }}
                    >
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{activeLinePoint.label}</p>
                      <p className="mt-1 text-green-700 dark:text-green-400">In: {formatCurrency(activeLinePoint.moneyIn)}</p>
                      <p className="text-red-700 dark:text-red-400">Out: {formatCurrency(activeLinePoint.moneyOut)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-black">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 dark:border-zinc-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Money In vs Money Out (Bar Chart)</p>
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

              <div className="mt-4">
                <div className="mb-3 flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green-500" />
                    Money In
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-500" />
                    Money Out
                  </span>
                </div>

                <div className="relative">
                  <svg
                    viewBox={`0 0 ${barWidth} ${barHeight}`}
                    className="h-64 w-full touch-none"
                    onMouseMove={handleBarMouseMove}
                    onMouseLeave={handleBarMouseLeave}
                    role="img"
                    aria-label="Money in vs money out bar chart"
                  >
                    <defs>
                      <linearGradient id={ids.barMoneyIn} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                      <linearGradient id={ids.barMoneyOut} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>

                    {Array.from({ length: 5 }).map((_, index) => {
                      const y = barPadding.top + (index / 4) * barInnerHeight
                      return (
                        <line
                          key={`bar-grid-${index}`}
                          x1={barPadding.left}
                          y1={y}
                          x2={barWidth - barPadding.right}
                          y2={y}
                          stroke={barGridStroke}
                          strokeWidth={1}
                        />
                      )
                    })}

                    {activeBarRect ? (
                      <rect
                        x={activeBarRect.centerX - groupSlotWidth / 2 + 3}
                        y={barPadding.top}
                        width={Math.max(0, groupSlotWidth - 6)}
                        height={barInnerHeight}
                        rx={8}
                        fill="rgba(148,163,184,0.18)"
                      />
                    ) : null}

                    {barRects.map((rect, index) => (
                      <g key={`bars-${rect.label}-${index}`}>
                        <motion.rect
                          x={rect.xMoneyIn}
                          width={singleBarWidth}
                          rx={singleBarWidth / 2}
                          initial={{ y: barBaselineY, height: 0 }}
                          animate={{ y: rect.yMoneyIn, height: rect.moneyInHeight }}
                          transition={{ duration: 0.42, ease: "easeOut", delay: index * 0.025 }}
                          fill={`url(#${ids.barMoneyIn})`}
                          opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.45}
                        />
                        <motion.rect
                          x={rect.xMoneyOut}
                          width={singleBarWidth}
                          rx={singleBarWidth / 2}
                          initial={{ y: barBaselineY, height: 0 }}
                          animate={{ y: rect.yMoneyOut, height: rect.moneyOutHeight }}
                          transition={{ duration: 0.42, ease: "easeOut", delay: index * 0.025 + 0.07 }}
                          fill={`url(#${ids.barMoneyOut})`}
                          opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.45}
                        />
                      </g>
                    ))}

                    {barLabelIndices.map((rectIndex) => {
                      const rect = barRects[rectIndex]
                      if (!rect) return null
                      return (
                        <text
                          key={`bar-label-${rectIndex}`}
                          x={rect.centerX}
                          y={barHeight - 10}
                          textAnchor="middle"
                          className="fill-gray-500 text-[10px] dark:fill-gray-400"
                        >
                          {rect.label}
                        </text>
                      )
                    })}
                  </svg>

                  {activeBarRect && activeBarPeriod ? (
                    <div
                      className="pointer-events-none absolute left-0 top-2 z-20 -translate-x-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs shadow-sm dark:border-zinc-800 dark:bg-black"
                      style={{ left: `${(activeBarRect.centerX / barWidth) * 100}%` }}
                    >
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{activeBarRect.label}</p>
                      <p className="mt-1 text-green-700 dark:text-green-400">In: {formatCurrency(activeBarPeriod.moneyIn)}</p>
                      <p className="text-red-700 dark:text-red-400">Out: {formatCurrency(activeBarPeriod.moneyOut)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-black">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-400">
              History
            </h3>
            <div className="mt-4 space-y-2.5">
              {historyRows.map((period, index) => (
                <div
                  key={`${period.label}-history-${index}`}
                  className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 dark:border-zinc-800 dark:bg-black"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{period.label}</p>
                    <p className={cn("text-sm font-semibold", period.netCashflow < 0 ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-gray-100")}>
                      {formatCurrency(period.netCashflow)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-green-700 dark:text-green-400">In: {formatCurrency(period.moneyIn)}</span>
                    <span className="text-red-700 dark:text-red-400">Out: {formatCurrency(period.moneyOut)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>
    </BudgetCard>
  )
}
