"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LiquidButton } from "@/components/ui/liquid-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Filter, X, Download, MoreVertical } from "lucide-react"

interface Order {
  id: string
  customerEmail: string
  amount: number
  status: "pending" | "delivered" | "cancelled" | "refunded"
  items: number
  createdAt: string
  products: string[]
}

const mockOrders: Order[] = []
const mockProducts = ["Product A", "Product B", "Product C"]

const statusOptions = ["All", "Pending", "Delivered", "Cancelled", "Refunded"]

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [productSearch, setProductSearch] = useState("")
  const [status, setStatus] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
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

  const filtered = useMemo(() => {
    let result = [...orders]

    if (productSearch) {
      result = result.filter((o) =>
        o.products.some((p) => p.toLowerCase().includes(productSearch.toLowerCase()))
      )
    }

    if (status !== "All") {
      result = result.filter((o) => o.status === status.toLowerCase())
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((o) => {
        const created = new Date(o.createdAt)
        return created >= start && created <= end
      })
    }

    return result
  }, [orders, productSearch, status, startDate, endDate])

  const selectedOrdersData = useMemo(() => {
    return orders.filter((o) => selectedOrders.has(o.id))
  }, [orders, selectedOrders])

  const totalRevenue = selectedOrdersData.reduce((sum, o) => sum + o.amount, 0)

  const handleReset = () => {
    setProductSearch("")
    setStatus("All")
    setStartDate("")
    setEndDate("")
  }

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer Email", "Amount", "Status", "Items", "Date"]
    const rows = filtered.map((o) => [
      o.id,
      o.customerEmail,
      o.amount.toString(),
      o.status,
      o.items.toString(),
      new Date(o.createdAt).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pt-6">

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 w-full sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
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
                <Label>Add Product</Label>
                <Input
                  placeholder="Search product name"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border pt-6">
        {/* Left Side */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <CardTitle>Orders</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <LiquidButton className="h-9 w-9 border border-border/60 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </LiquidButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    // Select all orders
                    setSelectedOrders(new Set(filtered.map((o) => o.id)))
                  }}>
                    Select multiple orders
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground">
                    This is where you will see and manage orders as they come in.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrders.size === filtered.length && filtered.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOrders(new Set(filtered.map((o) => o.id)))
                            } else {
                              setSelectedOrders(new Set())
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) => {
                              setSelectedOrders((prev) => {
                                const next = new Set(prev)
                                if (checked) {
                                  next.add(order.id)
                                } else {
                                  next.delete(order.id)
                                }
                                return next
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customerEmail}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                        <TableCell>
                          {order.status === "delivered" ? (
                            <Badge variant="success">Delivered</Badge>
                          ) : order.status === "pending" ? (
                            <Badge variant="secondary">Pending</Badge>
                          ) : order.status === "cancelled" ? (
                            <Badge variant="destructive">Cancelled</Badge>
                          ) : (
                            <Badge variant="secondary">Refunded</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Summary */}
        <div className="border-l border-border pl-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Number of Orders</div>
                <div className="text-2xl font-bold">{selectedOrders.size}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
