"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Store, Plus, Filter, X } from "lucide-react"
import { APP_CURRENCIES } from "@/lib/currency-options"

interface Storefront {
  id: string
  name: string
  domain: string
  currency: string
  products: number
  orders: number
  revenue: number
  status: "active" | "inactive"
}

const mockStorefronts: Storefront[] = []

const statusOptions = ["Active", "Inactive"]
const ordersOptions = ["Show All", "Enter Amount"]
const revenueOptions = ["Show All", "Enter Amount"]
const currencies = APP_CURRENCIES

export default function StorefrontsPage() {
  const [storefronts] = useState<Storefront[]>(mockStorefronts)
  const [showFilters, setShowFilters] = useState(false)
  const [showAddStorefront, setShowAddStorefront] = useState(false)
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
  const [status, setStatus] = useState("Active")
  const [ordersMode, setOrdersMode] = useState("Show All")
  const [orders, setOrders] = useState("")
  const [revenueMode, setRevenueMode] = useState("Show All")
  const [revenue, setRevenue] = useState("")

  const [storefrontData, setStorefrontData] = useState({
    name: "",
    currency: "GHS",
    storeLink: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    let result = [...storefronts]

    if (status) {
      result = result.filter((s) => s.status === status.toLowerCase())
    }

    if (ordersMode === "Enter Amount" && orders) {
      const ord = parseInt(orders)
      if (!isNaN(ord)) {
        result = result.filter((s) => s.orders === ord)
      }
    }

    if (revenueMode === "Enter Amount" && revenue) {
      const rev = parseFloat(revenue)
      if (!isNaN(rev)) {
        result = result.filter((s) => s.revenue >= rev)
      }
    }

    return result
  }, [storefronts, status, ordersMode, orders, revenueMode, revenue])

  const handleReset = () => {
    setStatus("Active")
    setOrdersMode("Show All")
    setOrders("")
    setRevenueMode("Show All")
    setRevenue("")
  }

  const handleCreateStorefront = () => {
    const newErrors: Record<string, string> = {}

    if (!storefrontData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!storefrontData.storeLink.trim()) {
      newErrors.storeLink = "Store link is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Create storefront logic
    setStorefrontData({ name: "", currency: "GHS", storeLink: "" })
    setErrors({})
    setShowAddStorefront(false)
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

        {/* Right side - Create Storefront Button */}
        <Button onClick={() => setShowAddStorefront(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10">
          <Plus className="mr-2 h-4 w-4" />
          Create Storefront
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
                <Label>Orders</Label>
                <div className="flex gap-2">
                  <Select value={ordersMode} onValueChange={setOrdersMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ordersOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ordersMode === "Enter Amount" && (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={orders}
                      onChange={(e) => setOrders(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Revenue</Label>
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
                  {revenueMode === "Enter Amount" && (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
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
          <CardTitle>All Storefronts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Welcome to Storefronts</h3>
              <p className="text-muted-foreground mb-6">
                Set up schedules for collecting recurring payments from your Customers
              </p>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6 max-w-md mx-auto">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-destructive"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">How to Create a Storefront</p>
                  <p className="text-xs text-muted-foreground mt-1">StepPay YouTube Channel</p>
                </div>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAddStorefront(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Storefront
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((store) => (
                <Card key={store.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{store.name}</CardTitle>
                      {store.status === "active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {store.domain}
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(store.revenue, store.currency)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{store.products} products</span>
                        <span className="text-muted-foreground">{store.orders} orders</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Storefront Dialog */}
      <Dialog open={showAddStorefront} onOpenChange={setShowAddStorefront}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Storefront</DialogTitle>
            <DialogDescription>
              Create a new storefront for your products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={storefrontData.name}
                onChange={(e) => {
                  setStorefrontData({ ...storefrontData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: "" })
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Currency *</Label>
              <Select
                value={storefrontData.currency}
                onValueChange={(value) => setStorefrontData({ ...storefrontData, currency: value })}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeLink">Store Link *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">https://steppay.shop/</span>
                <Input
                  id="storeLink"
                  placeholder="custom-url"
                  value={storefrontData.storeLink}
                  onChange={(e) => {
                    setStorefrontData({ ...storefrontData, storeLink: e.target.value })
                    if (errors.storeLink) setErrors({ ...errors, storeLink: "" })
                  }}
                  className={errors.storeLink ? "border-destructive flex-1" : "flex-1"}
                />
              </div>
              {errors.storeLink && <p className="text-sm text-destructive">{errors.storeLink}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStorefront(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStorefront}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
