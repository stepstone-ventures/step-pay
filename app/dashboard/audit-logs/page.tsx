"use client"

import { useState, useMemo } from "react"
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
import { FileText, Filter, X } from "lucide-react"

interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
  ipAddress?: string
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    action: "Login",
    details: "User logged in successfully",
    timestamp: new Date().toISOString(),
    ipAddress: "192.168.1.1",
  },
  {
    id: "2",
    userId: "user1",
    userName: "John Doe",
    action: "Create Transaction",
    details: "Created a new transaction with ID: TXN-12345",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: "192.168.1.1",
  },
  {
    id: "3",
    userId: "user2",
    userName: "Jane Smith",
    action: "Update Settings",
    details: "Updated payment preferences",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ipAddress: "192.168.1.2",
  },
]

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState("All")
  const [selectedAction, setSelectedAction] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const users = useMemo(() => {
    const userSet = new Set(logs.map((log) => log.userName))
    return Array.from(userSet)
  }, [logs])

  const actions = useMemo(() => {
    const actionSet = new Set(logs.map((log) => log.action))
    return Array.from(actionSet)
  }, [logs])

  const filtered = useMemo(() => {
    let result = [...logs]

    if (selectedUser !== "All") {
      result = result.filter((log) => log.userName === selectedUser)
    }

    if (selectedAction !== "All") {
      result = result.filter((log) => log.action === selectedAction)
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate >= start && logDate <= end
      })
    }

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, selectedUser, selectedAction, startDate, endDate])

  const handleReset = () => {
    setSelectedUser("All")
    setSelectedAction("All")
    setStartDate("")
    setEndDate("")
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
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
                <Label>User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Actions</SelectItem>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
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
          <CardTitle>All Activities ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activities Found</h3>
              <p className="text-muted-foreground">
                No activities match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.ipAddress || "N/A"}
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

