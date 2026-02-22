"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Plus, Search } from "lucide-react"
import { APP_CURRENCIES } from "@/lib/currency-options"

interface Subaccount {
  id: string
  name: string
  accountNumber: string
  dateCreated: string
  status: "active" | "inactive"
}

// Mock subaccounts
const mockSubaccounts: Subaccount[] = []

const sortOptions = ["Date Created", "Name"]

const ghanaBanks = [
  "Access Bank Ghana",
  "ADB Bank",
  "Agricultural Development Bank",
  "Bank of Africa Ghana",
  "CalBank",
  "Consolidated Bank Ghana",
  "Ecobank Ghana",
  "Fidelity Bank Ghana",
  "First National Bank Ghana",
  "GCB Bank",
  "Guaranty Trust Bank (GTBank) Ghana",
  "National Investment Bank",
  "Republic Bank Ghana",
  "Stanbic Bank Ghana",
  "Standard Chartered Bank Ghana",
  "United Bank for Africa (UBA) Ghana",
  "Universal Merchant Bank (UMB)",
  "Zenith Bank Ghana",
]

const currencies = APP_CURRENCIES
const subaccountTypes = ["Bank", "Mobile Money"]
const mobileMoneyProviders = ["MTN Momo", "Telecel Cash", "AirtelTigo Money"]

export default function SubaccountsPage() {
  const [subaccounts] = useState<Subaccount[]>(mockSubaccounts)
  const [sortBy, setSortBy] = useState("Date Created")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSubaccount, setShowAddSubaccount] = useState(false)
  const [newSubaccount, setNewSubaccount] = useState({
    currency: "GHS",
    type: "Bank",
    bankName: "",
    accountNumber: "",
    mobileMoneyProvider: "",
    mobileMoneyNumber: "",
    name: "",
    yourShare: "",
    subaccountShare: "",
    keepWhenLive: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sortedAndFiltered = [...subaccounts]
    .filter((acc) =>
      searchQuery
        ? acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.accountNumber.includes(searchQuery)
        : true
    )
    .sort((a, b) => {
      if (sortBy === "Date Created") {
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      }
      return a.name.localeCompare(b.name)
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleCreateSubaccount = () => {
    const newErrors: Record<string, string> = {}

    if (!newSubaccount.currency) {
      newErrors.currency = "Currency is required"
    }
    if (!newSubaccount.type) {
      newErrors.type = "Type of subaccount is required"
    }
    if (newSubaccount.type === "Bank") {
      if (!newSubaccount.bankName) {
        newErrors.bankName = "Bank name is required"
      }
      if (!newSubaccount.accountNumber.trim()) {
        newErrors.accountNumber = "Account number is required"
      }
    } else if (newSubaccount.type === "Mobile Money") {
      if (!newSubaccount.mobileMoneyProvider) {
        newErrors.mobileMoneyProvider = "Mobile money provider is required"
      }
      if (!newSubaccount.mobileMoneyNumber.trim()) {
        newErrors.mobileMoneyNumber = "Mobile money number is required"
      }
    }
    if (!newSubaccount.name.trim()) {
      newErrors.name = "Name of subaccount is required"
    }
    if (!newSubaccount.yourShare.trim()) {
      newErrors.yourShare = "Your share percentage is required"
    } else {
      const yourShareNum = parseFloat(newSubaccount.yourShare)
      if (isNaN(yourShareNum) || yourShareNum < 0 || yourShareNum > 100) {
        newErrors.yourShare = "Please enter a valid percentage (0-100)"
      }
    }
    if (!newSubaccount.subaccountShare.trim()) {
      newErrors.subaccountShare = "Subaccount share percentage is required"
    } else {
      const subaccountShareNum = parseFloat(newSubaccount.subaccountShare)
      if (isNaN(subaccountShareNum) || subaccountShareNum < 0 || subaccountShareNum > 100) {
        newErrors.subaccountShare = "Please enter a valid percentage (0-100)"
      }
    }

    // Validate that percentages add up to 100
    if (!newErrors.yourShare && !newErrors.subaccountShare) {
      const yourShareNum = parseFloat(newSubaccount.yourShare)
      const subaccountShareNum = parseFloat(newSubaccount.subaccountShare)
      if (!isNaN(yourShareNum) && !isNaN(subaccountShareNum) && yourShareNum + subaccountShareNum !== 100) {
        newErrors.subaccountShare = "Percentages must add up to 100%"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Create subaccount logic here
    setNewSubaccount({
      currency: "GHS",
      type: "Bank",
      bankName: "",
      accountNumber: "",
      mobileMoneyProvider: "",
      mobileMoneyNumber: "",
      name: "",
      yourShare: "",
      subaccountShare: "",
      keepWhenLive: false,
    })
    setErrors({})
    setShowAddSubaccount(false)
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        {/* Left side - Sort and Search */}
        <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
          <div className="space-y-2 w-full md:w-[180px]">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2 min-w-[200px]">
            <Label>Search Subaccounts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or account number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>

        {/* Right side - Add Button - Aligned with input fields */}
        <div className="w-full md:w-auto flex items-end">
          <div className="w-full md:w-auto">
            <div className="h-[18px] md:h-0"></div>
            <Button 
              className="bg-green-600 hover:bg-green-700 w-full md:w-auto h-10"
              onClick={() => setShowAddSubaccount(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Subaccount
            </Button>
          </div>
        </div>
      </div>

      {/* Subaccounts Table or Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>All Subaccounts ({sortedAndFiltered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAndFiltered.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Subaccounts found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                The Split Payments feature on Paystack allows you to split money received from a transaction across multiple accounts. We call these accounts "subaccounts".
              </p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAddSubaccount(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Subaccount
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFiltered.map((account, index) => (
                  <TableRow key={account.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.accountNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(account.dateCreated)}
                    </TableCell>
                    <TableCell>
                      {account.status === "active" ? (
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

      {/* Add New Subaccount Dialog */}
      <Dialog open={showAddSubaccount} onOpenChange={setShowAddSubaccount}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Subaccount</DialogTitle>
            <DialogDescription>
              Create a new subaccount to receive split payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={newSubaccount.currency}
                onValueChange={(value) => {
                  setNewSubaccount({ ...newSubaccount, currency: value })
                  if (errors.currency) setErrors({ ...errors, currency: "" })
                }}
              >
                <SelectTrigger id="currency" className={errors.currency ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type of subaccount *</Label>
              <Select
                value={newSubaccount.type}
                onValueChange={(value) => {
                  setNewSubaccount({ 
                    ...newSubaccount, 
                    type: value,
                    bankName: "",
                    accountNumber: "",
                    mobileMoneyProvider: "",
                    mobileMoneyNumber: "",
                  })
                  if (errors.type) setErrors({ ...errors, type: "" })
                }}
              >
                <SelectTrigger id="type" className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {subaccountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>

            {newSubaccount.type === "Bank" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Select
                    value={newSubaccount.bankName}
                    onValueChange={(value) => {
                      setNewSubaccount({ ...newSubaccount, bankName: value })
                      if (errors.bankName) setErrors({ ...errors, bankName: "" })
                    }}
                  >
                    <SelectTrigger id="bankName" className={errors.bankName ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {ghanaBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankName && (
                    <p className="text-sm text-destructive">{errors.bankName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={newSubaccount.accountNumber}
                    onChange={(e) => {
                      setNewSubaccount({ ...newSubaccount, accountNumber: e.target.value })
                      if (errors.accountNumber) setErrors({ ...errors, accountNumber: "" })
                    }}
                    className={errors.accountNumber ? "border-destructive" : ""}
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-destructive">{errors.accountNumber}</p>
                  )}
                </div>
              </>
            )}

            {newSubaccount.type === "Mobile Money" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyProvider">Mobile Money Provider *</Label>
                  <Select
                    value={newSubaccount.mobileMoneyProvider}
                    onValueChange={(value) => {
                      setNewSubaccount({ ...newSubaccount, mobileMoneyProvider: value })
                      if (errors.mobileMoneyProvider) setErrors({ ...errors, mobileMoneyProvider: "" })
                    }}
                  >
                    <SelectTrigger id="mobileMoneyProvider" className={errors.mobileMoneyProvider ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileMoneyProviders.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mobileMoneyProvider && (
                    <p className="text-sm text-destructive">{errors.mobileMoneyProvider}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyNumber">Mobile Money Number *</Label>
                  <Input
                    id="mobileMoneyNumber"
                    placeholder="Enter mobile money number"
                    value={newSubaccount.mobileMoneyNumber}
                    onChange={(e) => {
                      setNewSubaccount({ ...newSubaccount, mobileMoneyNumber: e.target.value })
                      if (errors.mobileMoneyNumber) setErrors({ ...errors, mobileMoneyNumber: "" })
                    }}
                    className={errors.mobileMoneyNumber ? "border-destructive" : ""}
                  />
                  {errors.mobileMoneyNumber && (
                    <p className="text-sm text-destructive">{errors.mobileMoneyNumber}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name of Subaccount *</Label>
              <Input
                id="name"
                placeholder="Enter subaccount name"
                value={newSubaccount.name}
                onChange={(e) => {
                  setNewSubaccount({ ...newSubaccount, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: "" })
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label>Transaction Split *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yourShare">Your share of the percentage (%)</Label>
                  <Input
                    id="yourShare"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={newSubaccount.yourShare}
                    onChange={(e) => {
                      setNewSubaccount({ ...newSubaccount, yourShare: e.target.value })
                      if (errors.yourShare) setErrors({ ...errors, yourShare: "" })
                    }}
                    className={errors.yourShare ? "border-destructive" : ""}
                  />
                  {errors.yourShare && (
                    <p className="text-sm text-destructive">{errors.yourShare}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subaccountShare">Subaccount gets (%)</Label>
                  <Input
                    id="subaccountShare"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={newSubaccount.subaccountShare}
                    onChange={(e) => {
                      setNewSubaccount({ ...newSubaccount, subaccountShare: e.target.value })
                      if (errors.subaccountShare) setErrors({ ...errors, subaccountShare: "" })
                    }}
                    className={errors.subaccountShare ? "border-destructive" : ""}
                  />
                  {errors.subaccountShare && (
                    <p className="text-sm text-destructive">{errors.subaccountShare}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="keepWhenLive"
                checked={newSubaccount.keepWhenLive}
                onCheckedChange={(checked) => {
                  setNewSubaccount({ ...newSubaccount, keepWhenLive: checked as boolean })
                }}
              />
              <Label htmlFor="keepWhenLive" className="font-normal cursor-pointer">
                Keep this subaccount when my account goes live
              </Label>
            </div>
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowAddSubaccount(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubaccount}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
