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
import { Users, Filter, X } from "lucide-react"

interface Subscriber {
  id: string
  customerCode: string
  email: string
  firstName: string
  lastName: string
  phone: string
  plan: string
  planCode: string
  status: "active" | "cancelled"
  createdAt: string
  lifetimeValue: number
  subscriptionCount: number
}

const mockSubscribers: Subscriber[] = []
const mockPlans = ["Plan A", "Plan B", "Plan C"]

const subscriptionCountOptions = ["Show All", "Enter Count"]
const lifetimeValueOptions = ["Show All", "Enter Amount"]

export default function SubscribersPage() {
  const router = useRouter()
  const [subscribers] = useState<Subscriber[]>(mockSubscribers)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [subscriptionCountMode, setSubscriptionCountMode] = useState("Show All")
  const [subscriptionCount, setSubscriptionCount] = useState("")
  const [lifetimeValueMode, setLifetimeValueMode] = useState("Show All")
  const [lifetimeValue, setLifetimeValue] = useState("")

  const filtered = useMemo(() => {
    let result = [...subscribers]

    if (selectedPlan) {
      result = result.filter((s) => s.plan === selectedPlan || s.planCode === selectedPlan)
    }

    if (subscriptionCountMode === "Enter Count" && subscriptionCount) {
      const count = parseInt(subscriptionCount)
      if (!isNaN(count)) {
        result = result.filter((s) => s.subscriptionCount === count)
      }
    }

    if (lifetimeValueMode === "Enter Amount" && lifetimeValue) {
      const value = parseFloat(lifetimeValue)
      if (!isNaN(value)) {
        result = result.filter((s) => s.lifetimeValue >= value)
      }
    }

    return result
  }, [subscribers, selectedPlan, subscriptionCountMode, subscriptionCount, lifetimeValueMode, lifetimeValue])

  const handleReset = () => {
    setSelectedPlan("")
    setSubscriptionCountMode("Show All")
    setSubscriptionCount("")
    setLifetimeValueMode("Show All")
    setLifetimeValue("")
  }

  return (
    <div className="space-y-6 pt-6">

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
                {subscriptionCountMode === "Enter Count" && (
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
              <Label>Lifetime Value</Label>
              <div className="flex gap-2">
                <Select value={lifetimeValueMode} onValueChange={setLifetimeValueMode}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lifetimeValueOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lifetimeValueMode === "Enter Amount" && (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={lifetimeValue}
                    onChange={(e) => setLifetimeValue(e.target.value)}
                    className="flex-1"
                  />
                )}
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
          <CardTitle>All Subscribers ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Subscribers</h3>
              <p className="text-muted-foreground mb-6">
                Create a Plan, and then subscribe customers to that Plan.
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
                  <TableHead>Customer Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.customerCode}</TableCell>
                    <TableCell>{sub.firstName} {sub.lastName}</TableCell>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      {sub.status === "active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Cancelled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString()}
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
