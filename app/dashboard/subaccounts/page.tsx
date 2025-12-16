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
import { Building2, Plus, Search } from "lucide-react"

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

export default function SubaccountsPage() {
  const [subaccounts] = useState<Subaccount[]>(mockSubaccounts)
  const [sortBy, setSortBy] = useState("Date Created")
  const [searchQuery, setSearchQuery] = useState("")

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subaccounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subaccounts for split payments
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Subaccount
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="space-y-2 w-full md:w-[180px]">
          <Label>Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
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
              className="pl-9"
            />
          </div>
        </div>

        <div className="md:ml-auto">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Subaccount
          </Button>
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
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Subaccount
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFiltered.map((account) => (
                  <TableRow key={account.id}>
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
    </div>
  )
}

