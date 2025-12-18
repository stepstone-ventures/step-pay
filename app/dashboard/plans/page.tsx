"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Filter, X } from "lucide-react"

interface Plan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: "hourly" | "daily" | "weekly" | "monthly" | "annually"
  subscribers: number
  totalRevenue: number
  status: "active" | "archived" | "deleted"
  createdAt: string
  maxPayments?: number
}

const mockPlans: Plan[] = []

const statusOptions = ["Show All", "Active", "Archived", "Deleted"]
const intervalOptions = ["Hourly", "Daily", "Weekly", "Monthly", "Annually"]
const currencies = ["GHS", "USD", "EUR", "NGN", "KES", "ZAR"]
const subscriptionCountOptions = ["Show All", "Enter Amount"]
const amountOptions = ["Show All", "Enter Amount"]
const revenueOptions = ["Show All", "Enter Revenue"]

export default function PlansPage() {
  const [plans] = useState<Plan[]>(mockPlans)
  const [showFilters, setShowFilters] = useState(false)
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        const filterButton = (event.target as HTMLElement).closest('button')
        if (!filterButton || !filterButton.textContent?.includes('Filters')) {
          setShowFilters(false)
        }
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])
  const [status, setStatus] = useState("Show All")
  const [interval, setInterval] = useState("")
  const [subscriptionCountMode, setSubscriptionCountMode] = useState("Show All")
  const [subscriptionCount, setSubscriptionCount] = useState("")
  const [amountMode, setAmountMode] = useState("Show All")
  const [amount, setAmount] = useState("")
  const [revenueMode, setRevenueMode] = useState("Show All")
  const [revenue, setRevenue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // New Plan Form State
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "GHS",
    interval: "",
    maxPayments: "",
    createSubscriptionPage: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    let result = [...plans]

    if (status !== "Show All") {
      result = result.filter((p) => p.status === status.toLowerCase())
    }

    if (interval) {
      result = result.filter((p) => p.interval === interval.toLowerCase())
    }

    if (subscriptionCountMode === "Enter Amount" && subscriptionCount) {
      const count = parseInt(subscriptionCount)
      if (!isNaN(count)) {
        result = result.filter((p) => p.subscribers === count)
      }
    }

    if (amountMode === "Enter Amount" && amount) {
      const amt = parseFloat(amount)
      if (!isNaN(amt)) {
        result = result.filter((p) => p.amount === amt)
      }
    }

    if (revenueMode === "Enter Revenue" && revenue) {
      const rev = parseFloat(revenue)
      if (!isNaN(rev)) {
        result = result.filter((p) => p.totalRevenue >= rev)
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((p) => {
        const created = new Date(p.createdAt)
        return created >= start && created <= end
      })
    }

    return result
  }, [plans, status, interval, subscriptionCountMode, subscriptionCount, amountMode, amount, revenueMode, revenue, startDate, endDate])

  const handleReset = () => {
    setStatus("Show All")
    setInterval("")
    setSubscriptionCountMode("Show All")
    setSubscriptionCount("")
    setAmountMode("Show All")
    setAmount("")
    setRevenueMode("Show All")
    setRevenue("")
    setStartDate("")
    setEndDate("")
  }

  const handleCreatePlan = () => {
    const newErrors: Record<string, string> = {}

    if (!newPlan.name.trim()) {
      newErrors.name = "Plan name is required"
    }
    if (!newPlan.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!newPlan.amount.trim()) {
      newErrors.amount = "Plan amount is required"
    } else if (isNaN(parseFloat(newPlan.amount)) || parseFloat(newPlan.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }
    if (!newPlan.interval) {
      newErrors.interval = "Interval is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Create plan logic here
    setNewPlan({
      name: "",
      description: "",
      amount: "",
      currency: "GHS",
      interval: "",
      maxPayments: "",
      createSubscriptionPage: false,
    })
    setErrors({})
    setShowNewPlanDialog(false)
  }

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Filters */}
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

        {/* Right side - Create Plan Button */}
        <Button onClick={() => setShowNewPlanDialog(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {showFilters && (
        <Card ref={filterRef}>
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
                <Label>Interval</Label>
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Intervals</SelectItem>
                    {intervalOptions.map((opt) => (
                      <SelectItem key={opt} value={opt.toLowerCase()}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Subscriptions</Label>
                <div className="flex gap-2">
                  <Select value={subscriptionCountMode} onValueChange={setSubscriptionCountMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionCountOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subscriptionCountMode === "Enter Amount" && (
                    <Input
                      type="number"
                      placeholder="Enter count"
                      value={subscriptionCount}
                      onChange={(e) => setSubscriptionCount(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
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
                <Label>Total Revenue</Label>
                <div className="flex gap-2">
                  <Select value={revenueMode} onValueChange={setRevenueMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {revenueMode === "Enter Revenue" && (
                    <Input
                      type="number"
                      placeholder="Enter revenue"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
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

      <Card>
        <CardHeader>
          <CardTitle>All Plans ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Set up schedules for collecting recurring payments from your Customers
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowNewPlanDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {plan.status === "active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : plan.status === "archived" ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : (
                        <Badge variant="destructive">Deleted</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-2xl font-bold">{formatCurrency(plan.amount, plan.currency)}</span>
                        <span className="text-muted-foreground"> / {plan.interval}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.subscribers} subscribers
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Plan Dialog */}
      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan for recurring payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                placeholder="Enter plan name"
                value={newPlan.name}
                onChange={(e) => {
                  setNewPlan({ ...newPlan, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: "" })
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter plan description"
                value={newPlan.description}
                onChange={(e) => {
                  setNewPlan({ ...newPlan, description: e.target.value })
                  if (errors.description) setErrors({ ...errors, description: "" })
                }}
                className={errors.description ? "border-destructive" : ""}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planAmount">Plan Amount *</Label>
              <div className="flex gap-2">
                <Select
                  value={newPlan.currency}
                  onValueChange={(value) => setNewPlan({ ...newPlan, currency: value })}
                >
                  <SelectTrigger className="w-[100px]">
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
                <Input
                  id="planAmount"
                  type="number"
                  placeholder="Enter cost"
                  value={newPlan.amount}
                  onChange={(e) => {
                    setNewPlan({ ...newPlan, amount: e.target.value })
                    if (errors.amount) setErrors({ ...errors, amount: "" })
                  }}
                  className={errors.amount ? "border-destructive flex-1" : "flex-1"}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Interval *</Label>
              <Select
                value={newPlan.interval}
                onValueChange={(value) => {
                  setNewPlan({ ...newPlan, interval: value })
                  if (errors.interval) setErrors({ ...errors, interval: "" })
                }}
              >
                <SelectTrigger id="interval" className={errors.interval ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {intervalOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toLowerCase()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.interval && (
                <p className="text-sm text-destructive">{errors.interval}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPayments">Max. Number of Payments (Optional)</Label>
              <Input
                id="maxPayments"
                type="number"
                placeholder="Set limit"
                value={newPlan.maxPayments}
                onChange={(e) => setNewPlan({ ...newPlan, maxPayments: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="createPage"
                checked={newPlan.createSubscriptionPage}
                onCheckedChange={(checked) =>
                  setNewPlan({ ...newPlan, createSubscriptionPage: checked as boolean })
                }
              />
              <Label htmlFor="createPage" className="font-normal cursor-pointer">
                Create a subscription page for this plan
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
