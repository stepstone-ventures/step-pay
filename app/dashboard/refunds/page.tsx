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
import { RefreshCw, Filter, X } from "lucide-react"

interface Refund {
  id: string
  transactionId: string
  amount: number
  status: "Processed" | "Processing" | "Failed" | "Pending" | "Retriable"
  date: string
  reason?: string
}

// Mock refunds data
const mockRefunds: Refund[] = []

const statusOptions = [
  "Show All",
  "Processed",
  "Processing",
  "Failed",
  "Pending",
  "Retriable",
]

const amountOperators = ["More Than", "Less Than", "Equal To", "Choose"]

export default function RefundsPage() {
  const [refunds] = useState<Refund[]>(mockRefunds)
  const [showFilters, setShowFilters] = useState(false)
  const [status, setStatus] = useState("Show All")
  const [amountOperator, setAmountOperator] = useState("Choose")
  const [amount, setAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredRefunds = useMemo(() => {
    let filtered = [...refunds]

    // Filter by status
    if (status !== "Show All") {
      filtered = filtered.filter((r) => r.status === status)
    }

    // Filter by amount
    if (amount && amountOperator !== "Choose") {
      const amountNum = parseFloat(amount)
      if (!isNaN(amountNum)) {
        filtered = filtered.filter((r) => {
          switch (amountOperator) {
            case "More Than":
              return r.amount > amountNum
            case "Less Than":
              return r.amount < amountNum
            case "Equal To":
              return Math.abs(r.amount - amountNum) < 0.01
            default:
              return true
          }
        })
      }
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((r) => {
        const refundDate = new Date(r.date)
        return refundDate >= start && refundDate <= end
      })
    }

    return filtered
  }, [refunds, status, amountOperator, amount, startDate, endDate])

  const handleReset = () => {
    setStatus("Show All")
    setAmountOperator("Choose")
    setAmount("")
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
      case "Processed":
        return <Badge variant="success">Processed</Badge>
      case "Processing":
        return <Badge variant="secondary">Processing</Badge>
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>
      case "Retriable":
        return <Badge variant="secondary">Retriable</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track refunds
        </p>
      </div>

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
                <Label>Refunded Amount</Label>
                <div className="flex gap-2">
                  <Select value={amountOperator} onValueChange={setAmountOperator}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {amountOperators.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {amountOperator !== "Choose" && (
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
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

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Refunds ({filteredRefunds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRefunds.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Refunds</h3>
              <p className="text-muted-foreground">
                There are no refunds yet for your account. Please try another query or clear your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">{refund.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {refund.transactionId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(refund.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(refund.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {refund.reason || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

