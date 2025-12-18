"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
import { Split, Filter, X, Search, Plus } from "lucide-react"

interface TransactionSplit {
  id: string
  name: string
  subaccount: string
  status: "Active" | "Disabled"
  splitType: "Flat" | "Percentage"
  category: "Static" | "Dynamic"
  amount?: number
  percentage?: number
}

// Mock subaccounts
const mockSubaccounts = ["Subaccount 1", "Subaccount 2"]

// Mock splits data
const mockSplits: TransactionSplit[] = []

const statusOptions = ["All", "Active", "Disabled"]
const splitTypeOptions = ["All", "Flat", "Percentage"]
const categoryOptions = ["All", "Static", "Dynamic"]

export default function TransactionSplitsPage() {
  const [splits] = useState<TransactionSplit[]>(mockSplits)
  const [showFilters, setShowFilters] = useState(false)
  const [subaccount, setSubaccount] = useState("All")
  const [status, setStatus] = useState("All")
  const [splitType, setSplitType] = useState("All")
  const [category, setCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const filterRef = useRef<HTMLDivElement>(null)

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        // Check if click is not on the filter button
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

  const filteredSplits = useMemo(() => {
    let filtered = [...splits]

    if (subaccount !== "All") {
      filtered = filtered.filter((s) => s.subaccount === subaccount)
    }

    if (status !== "All") {
      filtered = filtered.filter((s) => s.status === status)
    }

    if (splitType !== "All") {
      filtered = filtered.filter((s) => s.splitType === splitType)
    }

    if (category !== "All") {
      filtered = filtered.filter((s) => s.category === category)
    }

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [splits, subaccount, status, splitType, category, searchQuery])

  const handleReset = () => {
    setSubaccount("All")
    setStatus("All")
    setSplitType("All")
    setCategory("All")
    setSearchQuery("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>
      case "Disabled":
        return <Badge variant="secondary">Disabled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pt-6">
      {/* Filters - Above the horizontal line */}
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
              <Label>Subaccount</Label>
              <Select value={subaccount} onValueChange={setSubaccount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {mockSubaccounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
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
              <Label>Split Type</Label>
              <Select value={splitType} onValueChange={setSplitType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {splitTypeOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border pt-6">
        {/* Left Side */}
        <div className="space-y-6">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search splits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full"
              />
          </div>

          {/* Empty State or Content */}
          {filteredSplits.length === 0 && !showFilters ? (
            <div className="text-center py-12">
              <Split className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Transaction Splits</h3>
              <p className="text-muted-foreground mb-6">
                Split transaction payouts across multiple subaccounts
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Split Group
              </Button>
            </div>
          ) : filteredSplits.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Splits ({filteredSplits.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subaccount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSplits.map((split, index) => (
                      <TableRow key={split.id}>
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{split.name}</TableCell>
                        <TableCell>{split.subaccount}</TableCell>
                        <TableCell>
                          {split.splitType} {split.amount ? `GHS ${split.amount}` : `${split.percentage}%`}
                        </TableCell>
                        <TableCell>{getStatusBadge(split.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right Side - Empty for now */}
        <div className="hidden lg:block border-l border-border pl-6"></div>
      </div>
    </div>
  )
}

