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
import { AlertCircle, Filter, X, Search } from "lucide-react"

interface Dispute {
  id: string
  transactionId: string
  amount: number
  status: "Awaiting Your Feedback" | "Resolved"
  date: string
  reason?: string
}

// Mock disputes data
const mockDisputes: Dispute[] = []

const statusOptions = [
  "Show All",
  "Awaiting Your Feedback",
  "Resolved",
]

export default function DisputesPage() {
  const [disputes] = useState<Dispute[]>(mockDisputes)
  const [showFilters, setShowFilters] = useState(false)
  const [status, setStatus] = useState("Show All")
  const [searchTransaction, setSearchTransaction] = useState("")
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

  const filteredDisputes = useMemo(() => {
    let filtered = [...disputes]

    // Filter by status
    if (status !== "Show All") {
      filtered = filtered.filter((d) => d.status === status)
    }

    // Filter by search transaction
    if (searchTransaction) {
      filtered = filtered.filter((d) =>
        d.transactionId.toLowerCase().includes(searchTransaction.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTransaction.toLowerCase())
      )
    }

    return filtered
  }, [disputes, status, searchTransaction])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Awaiting Your Feedback":
        return <Badge variant="secondary">Awaiting Your Feedback</Badge>
      case "Resolved":
        return <Badge variant="success">Resolved</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pt-6">

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 w-full sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search by transaction ID..."
            value={searchTransaction}
            onChange={(e) => setSearchTransaction(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
      </div>

      {/* Filter Panel */}
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
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Disputes Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Disputes ({filteredDisputes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDisputes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Disputes</h3>
                  <p className="text-muted-foreground">
                    There are no disputes yet for your account
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Dispute ID</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisputes.map((dispute, index) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{dispute.id}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {dispute.transactionId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(dispute.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(dispute.date)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {dispute.reason || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - YouTube Video */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Help & Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
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
                    <p className="text-sm font-medium">StepPay YouTube Channel</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Resolving Disputes on StepPay</h3>
                  <p className="text-sm text-muted-foreground">
                    A StepPay Disputes expert explains the process and answers questions about resolving transaction disputes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

