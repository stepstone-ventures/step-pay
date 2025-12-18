"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Filter, X, Download, Plus } from "lucide-react"
import type { Customer } from "@/lib/mock-data"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [accountNumber, setAccountNumber] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch customers from API route
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers]

    // Filter by account number (using customer ID as proxy)
    if (accountNumber) {
      filtered = filtered.filter((c) =>
        c.id.toLowerCase().includes(accountNumber.toLowerCase())
      )
    }

    // Filter by email search
    if (searchEmail) {
      filtered = filtered.filter((c) =>
        c.email.toLowerCase().includes(searchEmail.toLowerCase())
      )
    }

    // Sort by date added (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.lastTransaction).getTime()
      const dateB = new Date(b.lastTransaction).getTime()
      return dateB - dateA
    })

    return filtered
  }, [customers, accountNumber, searchEmail])

  const handleAddCustomer = () => {
    const newErrors: Record<string, string> = {}

    if (!newCustomer.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!newCustomer.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!newCustomer.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!newCustomer.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Add customer (in real app, this would be an API call)
    const customer: Customer = {
      id: `CUST-${Date.now()}`,
      name: `${newCustomer.firstName} ${newCustomer.lastName}`,
      email: newCustomer.email,
      phone: newCustomer.phone,
      totalTransactions: 0,
      totalAmount: 0,
      lastTransaction: new Date().toISOString(),
      status: "active",
      currency: "GHS",
    }

    setCustomers([customer, ...customers])
    setNewCustomer({ firstName: "", lastName: "", email: "", phone: "" })
    setErrors({})
    setShowAddCustomer(false)
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Total Transactions", "Total Amount", "Last Transaction", "Status"]
    const rows = filteredCustomers.map((c) => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.totalTransactions.toString(),
      c.totalAmount.toString(),
      new Date(c.lastTransaction).toLocaleDateString(),
      c.status,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setAccountNumber("")
    setSearchEmail("")
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              Loading customers...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pt-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Filters Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 w-full sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          {/* Search Email */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowAddCustomer(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto h-10">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
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
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
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

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Enter the customer details to add them to your database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={newCustomer.firstName}
                  onChange={(e) => {
                    setNewCustomer({ ...newCustomer, firstName: e.target.value })
                    if (errors.firstName) setErrors({ ...errors, firstName: "" })
                  }}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={newCustomer.lastName}
                  onChange={(e) => {
                    setNewCustomer({ ...newCustomer, lastName: e.target.value })
                    if (errors.lastName) setErrors({ ...errors, lastName: "" })
                  }}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@email.com"
                value={newCustomer.email}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 24 123 4567"
                value={newCustomer.phone}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: "" })
                }}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Customers yet</h3>
              <p className="text-muted-foreground">
                There are no customers yet for your account. Please try another query or clear your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Transactions</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalTransactions}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.lastTransaction)}
                    </TableCell>
                    <TableCell>
                      {customer.status === "active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
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
