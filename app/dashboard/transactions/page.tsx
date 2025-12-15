"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Filter, X } from "lucide-react"
import type { Transaction } from "@/lib/mock-data"

const timeRanges = [
  "Today",
  "Last 7 Days",
  "This Month",
  "Last Month",
  "All Time",
  "Custom",
]

const statusOptions = [
  "Show All",
  "Successful",
  "Failed",
  "Abandoned",
  "Reversed",
  "Voided",
  "Canceled",
]

const channelOptions = [
  "Show All",
  "Card",
  "Mobile Money",
  "Dedicated Account",
  "Bank Transfer",
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [timeRange, setTimeRange] = useState("All Time")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [status, setStatus] = useState("Show All")
  const [channel, setChannel] = useState("Show All")
  const [amount, setAmount] = useState("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [customerIdOrEmail, setCustomerIdOrEmail] = useState("")
  const [paymentPageId, setPaymentPageId] = useState("")
  const [terminalId, setTerminalId] = useState("")
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [searchReference, setSearchReference] = useState("")

  // Fetch transactions from API route
  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Load default filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("transaction_filters")
    if (saved) {
      try {
        const filters = JSON.parse(saved)
        setStatus(filters.status || "Show All")
        setChannel(filters.channel || "Show All")
        setTimeRange(filters.timeRange || "All Time")
        setSaveAsDefault(true)
      } catch (e) {
        console.error("Error loading saved filters:", e)
      }
    }
  }, [])

  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (timeRange) {
      case "Today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case "Last 7 Days":
        return { start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case "This Month":
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 1) }
      case "Last Month":
        return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 1) }
      case "Custom":
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate) : null,
        }
      default:
        return { start: null, end: null }
    }
  }

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]
    const dateRange = getDateRange()

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.date)
        return txDate >= dateRange.start! && txDate < dateRange.end!
      })
    }

    // Filter by status
    if (status !== "Show All") {
      filtered = filtered.filter((t) => {
        const txStatus = t.status.toLowerCase()
        const filterStatus = status.toLowerCase()
        return txStatus === filterStatus || 
               (filterStatus === "successful" && txStatus === "success") ||
               (filterStatus === "failed" && txStatus === "fail")
      })
    }

    // Filter by channel/payment method
    if (channel !== "Show All") {
      filtered = filtered.filter((t) => {
        const method = t.paymentMethod.toLowerCase()
        const filterChannel = channel.toLowerCase()
        return method.includes(filterChannel) ||
               (filterChannel === "mobile money" && method.includes("mobile")) ||
               (filterChannel === "dedicated account" && method.includes("account"))
      })
    }

    // Filter by amount
    if (amount) {
      const amountNum = parseFloat(amount)
      if (!isNaN(amountNum)) {
        filtered = filtered.filter((t) => Math.abs(t.amount - amountNum) < 0.01)
      }
    }

    // Filter by receipt number (using transaction ID as proxy)
    if (receiptNumber) {
      filtered = filtered.filter((t) => 
        t.id.toLowerCase().includes(receiptNumber.toLowerCase())
      )
    }

    // Filter by customer ID or email
    if (customerIdOrEmail) {
      filtered = filtered.filter((t) =>
        t.email.toLowerCase().includes(customerIdOrEmail.toLowerCase()) ||
        t.customer.toLowerCase().includes(customerIdOrEmail.toLowerCase()) ||
        t.id.toLowerCase().includes(customerIdOrEmail.toLowerCase())
      )
    }

    // Filter by payment page ID (using transaction ID as proxy)
    if (paymentPageId) {
      filtered = filtered.filter((t) =>
        t.id.toLowerCase().includes(paymentPageId.toLowerCase())
      )
    }

    // Filter by terminal ID (using transaction ID as proxy)
    if (terminalId) {
      filtered = filtered.filter((t) =>
        t.id.toLowerCase().includes(terminalId.toLowerCase())
      )
    }

    // Filter by search reference
    if (searchReference) {
      filtered = filtered.filter((t) =>
        t.id.toLowerCase().includes(searchReference.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchReference.toLowerCase()) ||
        t.customer.toLowerCase().includes(searchReference.toLowerCase())
      )
    }

    return filtered
  }, [
    transactions,
    timeRange,
    customStartDate,
    customEndDate,
    status,
    channel,
    amount,
    receiptNumber,
    customerIdOrEmail,
    paymentPageId,
    terminalId,
    searchReference,
  ])

  const handleFilter = () => {
    if (saveAsDefault) {
      localStorage.setItem(
        "transaction_filters",
        JSON.stringify({
          status,
          channel,
          timeRange,
        })
      )
    }
    setShowFilters(false)
  }

  const handleReset = () => {
    setStatus("Show All")
    setChannel("Show All")
    setTimeRange("All Time")
    setAmount("")
    setReceiptNumber("")
    setCustomerIdOrEmail("")
    setPaymentPageId("")
    setTerminalId("")
    setCustomStartDate("")
    setCustomEndDate("")
    setSearchReference("")
    setSaveAsDefault(false)
    localStorage.removeItem("transaction_filters")
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
      case "success":
        return <Badge variant="success">Successful</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
      case "fail":
        return <Badge variant="destructive">Failed</Badge>
      case "abandoned":
        return <Badge variant="secondary">Abandoned</Badge>
      case "reversed":
        return <Badge variant="secondary">Reversed</Badge>
      case "voided":
        return <Badge variant="secondary">Voided</Badge>
      case "canceled":
      case "cancelled":
        return <Badge variant="secondary">Canceled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            View all your payment transactions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              Loading transactions...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          View all your payment transactions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Account and Time Range */}
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="space-y-2 min-w-[150px]">
            <Label>Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="main">Main Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 min-w-[150px]">
            <Label>Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {timeRange === "Custom" && (
            <>
              <div className="space-y-2 min-w-[150px]">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-[150px]">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Filter Button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter by Status
            </Button>
          </div>

          {/* Search Reference */}
          <div className="flex-1 space-y-2 min-w-[200px]">
            <Label>Search Reference</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference..."
                value={searchReference}
                onChange={(e) => setSearchReference(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter by Status</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label>Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Receipt Number</Label>
                <Input
                  placeholder="Enter receipt number"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Customer ID / Email</Label>
                <Input
                  placeholder="Enter ID or email"
                  value={customerIdOrEmail}
                  onChange={(e) => setCustomerIdOrEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Page ID</Label>
                <Input
                  placeholder="Enter payment page ID"
                  value={paymentPageId}
                  onChange={(e) => setPaymentPageId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Terminal ID</Label>
                <Input
                  placeholder="Enter terminal ID"
                  value={terminalId}
                  onChange={(e) => setTerminalId(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveDefault"
                checked={saveAsDefault}
                onCheckedChange={(checked) => setSaveAsDefault(checked as boolean)}
              />
              <Label htmlFor="saveDefault" className="font-normal cursor-pointer">
                Save as default filter
              </Label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleFilter}>Filter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
              <p className="text-muted-foreground">
                There are no transactions yet for you. Please try another query or clear your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.id}
                    </TableCell>
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
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(transaction.date)}
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
