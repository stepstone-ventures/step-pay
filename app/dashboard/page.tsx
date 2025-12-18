"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { BarChart } from "@/components/dashboard/bar-chart"
import { LineChart } from "@/components/dashboard/line-chart"
import { PieChart } from "@/components/dashboard/pie-chart"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { AreaChart } from "@/components/dashboard/area-chart"
import { ColumnChart } from "@/components/dashboard/column-chart"
import { StackedBarChart } from "@/components/dashboard/stacked-bar-chart"
import { ScatterChart } from "@/components/dashboard/scatter-chart"
import { CandlestickChart } from "@/components/dashboard/candlestick-chart"
import { WaterfallChart } from "@/components/dashboard/waterfall-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, DollarSign, Activity, AlertTriangle, TrendingDown } from "lucide-react"
import type { Transaction, PaymentVolume } from "@/lib/mock-data"

type ChartType = "bar" | "line" | "pie" | "donut" | "area" | "column" | "stacked-bar" | "scatter" | "candlestick" | "waterfall"

const chartTypes: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "donut", label: "Donut Chart" },
  { value: "area", label: "Area Chart" },
  { value: "column", label: "Column Chart" },
  { value: "stacked-bar", label: "Stacked Bar Chart" },
  { value: "scatter", label: "Scatter Chart" },
  { value: "candlestick", label: "Candlestick Chart" },
  { value: "waterfall", label: "Waterfall Chart" },
]

interface DashboardStats {
  totalRevenue: number
  pendingAmount: number
  totalTransactions: number
  successRate: number
}

const currencies = ["GHS", "USD", "EUR", "NGN", "KES", "ZAR"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentVolume, setPaymentVolume] = useState<PaymentVolume[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState("GHS")
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Fetch data from API routes
  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((res) => res.json()),
      fetch("/api/transactions").then((res) => res.json()),
      fetch("/api/payment-volume").then((res) => res.json()),
    ])
      .then(([statsData, transactionsData, volumeData]) => {
        setStats(statsData)
        setTransactions(transactionsData)
        setPaymentVolume(volumeData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: selectedCurrency,
    }).format(amount)
  }

  const successRate = stats ? stats.successRate : 0
  const failedTransactions = transactions.filter((t) => t.status === "failed").length
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length
  const paymentIssues = failedTransactions + pendingTransactions

  // Calculate sales prediction (simple linear trend)
  const calculateSalesPrediction = () => {
    if (paymentVolume.length < 2) return 0
    const recent = paymentVolume.slice(-7)
    const avgDaily = recent.reduce((sum, v) => sum + v.amount, 0) / recent.length
    return avgDaily * 30 // Projected monthly
  }

  const salesPrediction = calculateSalesPrediction()

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your payment activity
          </p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Loading dashboard data...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pt-6">

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue from successful transactions
            </p>
          </CardContent>
        </Card>

        <StatCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          change="Last 30 days"
          icon={Activity}
        />

        <StatCard
          title="Payment Issues"
          value={paymentIssues.toString()}
          change={`${failedTransactions} failed, ${pendingTransactions} pending`}
          icon={AlertTriangle}
        />

        <StatCard
          title="Sales Predictions"
          value={formatCurrency(salesPrediction)}
          change="Projected for next month"
          icon={TrendingUp}
        />
      </div>

      {/* Chart - Show 10 transactions with chart type selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transactions (Last 10)</h2>
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(() => {
          const chartData = transactions.slice(0, 10).map((t, index) => ({
            period: `T${index + 1}`,
            amount: t.amount
          }))

          switch (chartType) {
            case "bar":
              return <BarChart data={chartData} title="Transactions (Last 10)" />
            case "line":
              return <LineChart data={chartData} title="Transactions (Last 10)" />
            case "pie":
              return <PieChart data={chartData} title="Transactions (Last 10)" />
            case "donut":
              return <DonutChart data={chartData} title="Transactions (Last 10)" />
            case "area":
              return <AreaChart data={chartData} title="Transactions (Last 10)" />
            case "column":
              return <ColumnChart data={chartData} title="Transactions (Last 10)" />
            case "stacked-bar":
              return <StackedBarChart data={chartData} title="Transactions (Last 10)" />
            case "scatter":
              return <ScatterChart data={chartData} title="Transactions (Last 10)" />
            case "candlestick":
              return <CandlestickChart data={chartData} title="Transactions (Last 10)" />
            case "waterfall":
              return <WaterfallChart data={chartData} title="Transactions (Last 10)" />
            default:
              return <BarChart data={chartData} title="Transactions (Last 10)" />
          }
        })()}
      </div>
    </div>
  )
}
