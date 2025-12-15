"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Filter, X, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Payout {
  id: string
  amount: number
  status: "Successful" | "Failed" | "Pending"
  date: string
  transactions: number
}

// Mock payouts data
const mockPayouts: Payout[] = []

const statusOptions = ["Show All", "Successful", "Failed", "Pending"]

export default function PayoutsPage() {
  const [payouts] = useState<Payout[]>(mockPayouts)
  const [showFilters, setShowFilters] = useState(false)
  const [status, setStatus] = useState("Show All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredPayouts = useMemo(() => {
    let filtered = [...payouts]

    // Filter by status
    if (status !== "Show All") {
      filtered = filtered.filter((p) => p.status === status)
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((p) => {
        const payoutDate = new Date(p.date)
        return payoutDate >= start && payoutDate <= end
      })
    }

    return filtered
  }, [payouts, status, startDate, endDate])

  const pendingPayouts = useMemo(() => {
    return payouts.filter((p) => p.status === "Pending")
  }, [payouts])

  const handleReset = () => {
    setStatus("Show All")
    setStartDate("")
    setEndDate("")
  }

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
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Successful":
        return <Badge variant="success">Successful</Badge>
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payouts</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your payouts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>Filter</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Payouts ({filteredPayouts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Payouts yet</h3>
                  <p className="text-muted-foreground">
                    We haven't paid any money to this account. This is where you will be able to see your scheduled payouts and the transactions you were paid for
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.id}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>{payout.transactions}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(payout.date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Pending Payouts */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    There are no pending payouts for your business
                  </p>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline inline-flex items-center"
                  >
                    Learn More
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{payout.id}</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(payout.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payout.transactions} transactions
                      </div>
                    </div>
                  ))}
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline inline-flex items-center"
                  >
                    Learn More
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

