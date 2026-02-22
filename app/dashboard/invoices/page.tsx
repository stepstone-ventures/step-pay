"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { Receipt, Filter, X, FileText, Download } from "lucide-react"
import { APP_CURRENCIES } from "@/lib/currency-options"

interface Invoice {
  id: string
  customerEmail: string
  amount: number
  status: "draft" | "paid" | "not-paid"
  type: "has-invoice" | "no-invoice"
  dueDate: string
  invoiceDate: string
}

const mockInvoices: Invoice[] = []

const statusOptions = ["Show All", "Draft", "Paid", "Not Paid"]
const typeOptions = ["Show All", "Has Invoice", "No Invoice"]
const currencies = APP_CURRENCIES

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [showFilters, setShowFilters] = useState(false)
  const [showRequestPayment, setShowRequestPayment] = useState(false)
  const [invoiceType, setInvoiceType] = useState<"professional" | "simple" | null>(null)
  const [status, setStatus] = useState("Show All")
  const [type, setType] = useState("Show All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [invoiceData, setInvoiceData] = useState({
    customerEmail: "",
    amount: "",
    currency: "GHS",
    note: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    let result = [...invoices]

    if (status !== "Show All") {
      const statusMap: Record<string, string> = {
        "Draft": "draft",
        "Paid": "paid",
        "Not Paid": "not-paid",
      }
      result = result.filter((i) => i.status === statusMap[status])
    }

    if (type !== "Show All") {
      const typeMap: Record<string, string> = {
        "Has Invoice": "has-invoice",
        "No Invoice": "no-invoice",
      }
      result = result.filter((i) => i.type === typeMap[type])
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((i) => {
        const created = new Date(i.invoiceDate)
        return created >= start && created <= end
      })
    }

    return result
  }, [invoices, status, type, startDate, endDate])

  const handleReset = () => {
    setStatus("Show All")
    setType("Show All")
    setStartDate("")
    setEndDate("")
  }

  const handleSendInvoice = () => {
    const newErrors: Record<string, string> = {}

    if (!invoiceData.customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address"
    }

    if (invoiceType === "simple") {
      if (!invoiceData.amount.trim()) {
        newErrors.amount = "Amount is required"
      } else if (isNaN(parseFloat(invoiceData.amount)) || parseFloat(invoiceData.amount) <= 0) {
        newErrors.amount = "Please enter a valid amount"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Send invoice logic
    setInvoiceData({ customerEmail: "", amount: "", currency: "GHS", note: "" })
    setInvoiceType(null)
    setErrors({})
    setShowRequestPayment(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount)
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
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
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
          <CardTitle>All Invoices ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invoices Sent</h3>
              <p className="text-muted-foreground mb-6">
                Use this feature to send bills to your customers easily or send professional invoices
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowRequestPayment(true)}
              >
                Request Payment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customerEmail}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      {invoice.status === "paid" ? (
                        <Badge variant="success">Paid</Badge>
                      ) : invoice.status === "draft" ? (
                        <Badge variant="secondary">Draft</Badge>
                      ) : (
                        <Badge variant="destructive">Not Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Payment Dialog */}
      <Dialog open={showRequestPayment} onOpenChange={setShowRequestPayment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {invoiceType === null
                ? "Request Payment"
                : invoiceType === "professional"
                  ? "Professional Invoice"
                  : "Simple Invoice"}
            </DialogTitle>
            <DialogDescription>
              {invoiceType === null
                ? "Choose the type of invoice you want to send"
                : invoiceType === "professional"
                  ? "Set line items, tax etc. and invoice a customer. PDF included."
                  : "Set line items, tax etc. and invoice a customer. PDF included."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {invoiceType === null ? (
              <div className="space-y-4">
                <div
                  className="border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setInvoiceType("professional")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <FileText className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Professional Invoice</h3>
                        <p className="text-sm text-muted-foreground">
                          Set line items, tax etc. and invoice a customer. PDF included.
                        </p>
                      </div>
                    </div>
                    <Button>Choose</Button>
                  </div>
                </div>

                <div
                  className="border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setInvoiceType("simple")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Receipt className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Simple Invoice</h3>
                        <p className="text-sm text-muted-foreground">
                          Set line items, tax etc. and invoice a customer. PDF included.
                        </p>
                      </div>
                    </div>
                    <Button>Choose</Button>
                  </div>
                </div>
              </div>
            ) : invoiceType === "professional" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    value={invoiceData.customerEmail}
                    onChange={(e) => {
                      setInvoiceData({ ...invoiceData, customerEmail: e.target.value })
                      if (errors.customerEmail) setErrors({ ...errors, customerEmail: "" })
                    }}
                    className={errors.customerEmail ? "border-destructive" : ""}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive">{errors.customerEmail}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    value={invoiceData.customerEmail}
                    onChange={(e) => {
                      setInvoiceData({ ...invoiceData, customerEmail: e.target.value })
                      if (errors.customerEmail) setErrors({ ...errors, customerEmail: "" })
                    }}
                    className={errors.customerEmail ? "border-destructive" : ""}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive">{errors.customerEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={invoiceData.currency}
                      onValueChange={(value) => setInvoiceData({ ...invoiceData, currency: value })}
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
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={invoiceData.amount}
                      onChange={(e) => {
                        setInvoiceData({ ...invoiceData, amount: e.target.value })
                        if (errors.amount) setErrors({ ...errors, amount: "" })
                      }}
                      className={errors.amount ? "border-destructive flex-1" : "flex-1"}
                    />
                  </div>
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    placeholder="Enter note"
                    value={invoiceData.note}
                    onChange={(e) => setInvoiceData({ ...invoiceData, note: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (invoiceType) {
                  setInvoiceType(null)
                } else {
                  setShowRequestPayment(false)
                }
              }}
            >
              Cancel
            </Button>
            {invoiceType && (
              <Button onClick={handleSendInvoice}>Send</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
