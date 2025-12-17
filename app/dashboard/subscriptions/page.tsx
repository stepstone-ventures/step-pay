"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { Repeat, Filter, X } from "lucide-react"

interface Subscription {
  id: string
  customerCode: string
  customerEmail: string
  planCode: string
  planName: string
  amount: number
  status: "active" | "active-renewing" | "active-non-renewing" | "completed" | "cancelled" | "attention"
  nextPaymentDate: string
  createdAt: string
}

const mockSubscriptions: Subscription[] = []
const mockPlans = ["Plan A", "Plan B", "Plan C"]

const statusOptions = [
  "All",
  "Active",
  "Active - Renewing",
  "Active - Non-Renewing",
  "Completed",
  "Cancelled",
  "Attention",
]

const amountOptions = ["Show All", "Enter Amount"]
const expiringCardsOptions = ["All Time", "This Month", "Specific Month", "Custom Period"]

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [status, setStatus] = useState("All")
  const [amountMode, setAmountMode] = useState("Show All")
  const [amount, setAmount] = useState("")
  const [expiringCards, setExpiringCards] = useState("All Time")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filtered = useMemo(() => {
    let result = [...subscriptions]

    if (selectedPlan) {
      result = result.filter((s) => s.planName === selectedPlan || s.planCode === selectedPlan)
    }

    if (status !== "All") {
      const statusMap: Record<string, string> = {
        "Active": "active",
        "Active - Renewing": "active-renewing",
        "Active - Non-Renewing": "active-non-renewing",
        "Completed": "completed",
        "Cancelled": "cancelled",
        "Attention": "attention",
      }
      result = result.filter((s) => s.status === statusMap[status])
    }

    if (amountMode === "Enter Amount" && amount) {
      const amt = parseFloat(amount)
      if (!isNaN(amt)) {
        result = result.filter((s) => s.amount === amt)
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((s) => {
        const created = new Date(s.createdAt)
        return created >= start && created <= end
      })
    }

    return result
  }, [subscriptions, selectedPlan, status, amountMode, amount, startDate, endDate])

  const handleReset = () => {
    setSelectedPlan("")
    setStatus("All")
    setAmountMode("Show All")
    setAmount("")
    setExpiringCards("All Time")
    setStartDate("")
    setEndDate("")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "active-renewing":
        return <Badge variant="success">Active</Badge>
      case "active-non-renewing":
        return <Badge variant="secondary">Active - Non-Renewing</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      case "attention":
        return <Badge variant="destructive">Attention</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Manage active subscriptions
        </p>
      </div>

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

      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Plans</SelectItem>
                    {mockPlans.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <Select value={amountMode} onValueChange={setAmountMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {amountOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {amountMode === "Enter Amount" && (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expiring Cards</Label>
                <Select value={expiringCards} onValueChange={setExpiringCards}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiringCardsOptions.map((opt) => (
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

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Repeat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
              <p className="text-muted-foreground mb-6">
                Create a Plan, and then subscribe customers to that Plan
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push("/dashboard/plans")}
              >
                Go To Plans
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.id}</TableCell>
                    <TableCell>
                      <div>{sub.customerEmail}</div>
                      <div className="text-sm text-muted-foreground">{sub.customerCode}</div>
                    </TableCell>
                    <TableCell>{sub.planName}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(sub.amount)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sub.nextPaymentDate).toLocaleDateString()}
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
