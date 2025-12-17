"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { LineChart } from "@/components/dashboard/line-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, DollarSign, Activity, AlertTriangle, TrendingDown } from "lucide-react"
import type { Transaction, PaymentVolume } from "@/lib/mock-data"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your payment activity
        </p>
      </div>

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

      {/* Chart */}
      <LineChart data={paymentVolume} title="Payment Volume (Last 15 Days)" />
    </div>
  )
}
