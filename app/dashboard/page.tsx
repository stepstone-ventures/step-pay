"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { LineChart } from "@/components/dashboard/line-chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, CreditCard, Activity } from "lucide-react"
import type { Transaction, PaymentVolume } from "@/lib/mock-data"

interface DashboardStats {
  totalRevenue: number
  pendingAmount: number
  totalTransactions: number
  successRate: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentVolume, setPaymentVolume] = useState<PaymentVolume[]>([])
  const [loading, setLoading] = useState(true)

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

  const recentTransactions = transactions.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "successful":
        return <Badge variant="success">Successful</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

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
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change="+12.5% from last month"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          change="3 transactions"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toString()}
          change="+8.2% from last month"
          icon={CreditCard}
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          change="Last 30 days"
          icon={Activity}
        />
      </div>

      {/* Chart */}
      <LineChart data={paymentVolume} title="Payment Volume (Last 15 Days)" />

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(transaction.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
