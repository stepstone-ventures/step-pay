"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import {
  AnimateTabs,
  AnimateTabsContent,
  AnimateTabsList,
  AnimateTabsTrigger,
} from "@/components/animate-ui/components/animate/tabs"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { APP_CURRENCIES } from "@/lib/currency-options"

const currencies = APP_CURRENCIES
const paymentMethods = ["Card", "Bank Transfer", "Mobile Money"]
const timezones = [
  "Africa/Accra (GMT+0)",
  "Africa/Lagos (GMT+1)",
  "Africa/Nairobi (GMT+3)",
  "America/New_York (GMT-5)",
  "Europe/London (GMT+0)",
]

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

const mockTeamMembers: TeamMember[] = []

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("preferences")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  // Preferences State
  const [preferences, setPreferences] = useState({
    defaultCurrency: "GHS",
    paymentMethods: ["Card", "Bank Transfer"],
    receiptRecipients: "customer",
    dailyIssueReports: false,
    webhookExpiringCards: false,
    completedSubscriptionAlerts: false,
    cancelledSubscriptionAlerts: false,
    expiringCardAlerts: false,
    pagination: "20",
    timezone: "Africa/Accra (GMT+0)",
  })

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [showAddTeamMember, setShowAddTeamMember] = useState(false)
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    role: "",
  })

  // API Keys State
  const [apiKeys, setApiKeys] = useState({
    testSecretKey: "sk_test_1234567890abcdef",
    testPublicKey: "pk_test_1234567890abcdef",
    ipWhitelist: "",
    testCallbackUrl: "",
    testWebhookUrl: "",
  })

  const getSupabaseClient = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }

  const persistSettingsMetadata = async (payload: Record<string, unknown>) => {
    const supabase = getSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) return

    const existing = user.user_metadata || {}
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...existing,
        ...payload,
      },
    })

    if (updateError) throw updateError
  }

  useEffect(() => {
    try {
      const storedPreferences = localStorage.getItem("settings_preferences")
      const storedTeamMembers = localStorage.getItem("settings_team_members")
      const storedApiKeys = localStorage.getItem("settings_api_keys")

      if (storedPreferences) {
        setPreferences((previous) => ({ ...previous, ...JSON.parse(storedPreferences) }))
      }

      if (storedTeamMembers) {
        const parsed = JSON.parse(storedTeamMembers)
        if (Array.isArray(parsed)) {
          setTeamMembers(parsed)
        }
      }

      if (storedApiKeys) {
        setApiKeys((previous) => ({ ...previous, ...JSON.parse(storedApiKeys) }))
      }
    } catch {
      // Use defaults when local data is invalid.
    }
  }, [])

  const handleSavePreferences = async () => {
    try {
      setStatusError(null)
      localStorage.setItem("settings_preferences", JSON.stringify(preferences))
      await persistSettingsMetadata({ settings_preferences: preferences })
      setStatusMessage("Preferences saved successfully.")
    } catch {
      setStatusError("Could not save preferences right now. Please try again.")
    }
  }

  const handleSaveApiKeys = async () => {
    try {
      setStatusError(null)
      localStorage.setItem("settings_api_keys", JSON.stringify(apiKeys))
      await persistSettingsMetadata({ settings_api_keys: apiKeys })
      setStatusMessage("API settings saved successfully.")
    } catch {
      setStatusError("Could not save API settings right now. Please try again.")
    }
  }

  const handleAddTeamMember = () => {
    if (newTeamMember.name && newTeamMember.email && newTeamMember.role) {
      const member: TeamMember = {
        id: editingMemberId || Date.now().toString(),
        name: newTeamMember.name,
        email: newTeamMember.email,
        role: newTeamMember.role,
        permissions: [],
      }
      const nextMembers = editingMemberId
        ? teamMembers.map((existing) => (existing.id === editingMemberId ? member : existing))
        : [...teamMembers, member]

      setTeamMembers(nextMembers)
      localStorage.setItem("settings_team_members", JSON.stringify(nextMembers))
      setNewTeamMember({ name: "", email: "", role: "" })
      setShowAddTeamMember(false)
      setEditingMemberId(null)
      setStatusMessage(editingMemberId ? "Team member updated." : "Team member added.")
    }
  }

  const handleRemoveTeamMember = (id: string) => {
    const nextMembers = teamMembers.filter((m) => m.id !== id)
    setTeamMembers(nextMembers)
    localStorage.setItem("settings_team_members", JSON.stringify(nextMembers))
    setStatusMessage("Team member removed.")
  }

  const handleEditTeamMember = (member: TeamMember) => {
    setNewTeamMember({
      name: member.name,
      email: member.email,
      role: member.role,
    })
    setEditingMemberId(member.id)
    setShowAddTeamMember(true)
  }

  const handleCopyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setStatusMessage("Copied to clipboard.")
    } catch {
      setStatusError("Clipboard copy failed. Please copy manually.")
    }
  }

  const tabs = [
    { id: "preferences", label: "Preferences" },
    { id: "api-keys", label: "API Keys & Webhooks" },
  ]

  return (
    <div className="space-y-6 pt-6">
      {statusMessage ? (
        <div className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}
      {statusError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {statusError}
        </div>
      ) : null}

      <AnimateTabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <AnimateTabsList className="grid-cols-2 w-full">
          {tabs.map((tab) => {
            return (
              <AnimateTabsTrigger key={tab.id} value={tab.id}>
                <span>{tab.label}</span>
              </AnimateTabsTrigger>
            )
          })}
        </AnimateTabsList>

        <AnimateTabsContent value="preferences" className="space-y-6">
          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Configure payment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select
                  value={preferences.defaultCurrency}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, defaultCurrency: value })
                  }
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
                <Label>Methods to Accept Payments</Label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Switch
                        checked={preferences.paymentMethods.includes(method)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences({
                              ...preferences,
                              paymentMethods: [...preferences.paymentMethods, method],
                            })
                          } else {
                            setPreferences({
                              ...preferences,
                              paymentMethods: preferences.paymentMethods.filter((m) => m !== method),
                            })
                          }
                        }}
                      />
                      <Label>{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Who to Send Transaction Receipts to</Label>
                <Select
                  value={preferences.receiptRecipients}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, receiptRecipients: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer Only</SelectItem>
                    <SelectItem value="merchant">Merchant Only</SelectItem>
                    <SelectItem value="both">Both Customer and Merchant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Manage subscription email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Issue Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily reports about subscription issues
                  </p>
                </div>
                <Switch
                  checked={preferences.dailyIssueReports}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, dailyIssueReports: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Webhook Events for Expiring Cards</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive webhook notifications for expiring cards
                  </p>
                </div>
                <Switch
                  checked={preferences.webhookExpiringCards}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, webhookExpiringCards: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Completed Subscription Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when subscriptions complete
                  </p>
                </div>
                <Switch
                  checked={preferences.completedSubscriptionAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, completedSubscriptionAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Cancelled Subscription Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when subscriptions are cancelled
                  </p>
                </div>
                <Switch
                  checked={preferences.cancelledSubscriptionAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, cancelledSubscriptionAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Expiring Card Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when customer cards are expiring
                  </p>
                </div>
                <Switch
                  checked={preferences.expiringCardAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, expiringCardAlerts: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Payouts and Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Payouts and Balances</CardTitle>
              <CardDescription>Configure payout and balance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Auto Payout</Label>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Automatically transfer funds to your account</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payout Schedule</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <Card>
            <CardHeader>
              <CardTitle>Pagination</CardTitle>
              <CardDescription>Set the number of items per page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Items Per Page</Label>
                <Select
                  value={preferences.pagination}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, pagination: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Timezone */}
          <Card>
            <CardHeader>
              <CardTitle>Timezone</CardTitle>
              <CardDescription>Set your local timezone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Upload your business logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended size: 200x200px. Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Teams</CardTitle>
                  <CardDescription>
                    Manage team members and their permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Team Members</h3>
                  <p className="text-muted-foreground mb-6">
                    Add team members to collaborate on your account
                  </p>
                  <Button onClick={() => setShowAddTeamMember(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team Member
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {member.permissions.length > 0
                            ? member.permissions.join(", ")
                            : "No permissions"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTeamMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTeamMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences}>
              <Save className="mr-2 h-4 w-4" />
              Save All Preferences
            </Button>
          </div>
        </AnimateTabsContent>

        <AnimateTabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test API Keys</CardTitle>
              <CardDescription>
                Use these keys for testing in your development environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={apiKeys.testSecretKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={() => handleCopyValue(apiKeys.testSecretKey)}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this key secret. Never share it publicly.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Test Public Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={apiKeys.testPublicKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={() => handleCopyValue(apiKeys.testPublicKey)}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This key can be safely exposed in client-side code.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IP Whitelist</CardTitle>
              <CardDescription>
                Restrict API access to specific IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allowed IP Addresses</Label>
                <Textarea
                  value={apiKeys.ipWhitelist}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, ipWhitelist: e.target.value })
                  }
                  placeholder="Enter IP addresses separated by commas"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow all IP addresses
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhook URLs for receiving event notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Callback URL</Label>
                <Input
                  value={apiKeys.testCallbackUrl}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, testCallbackUrl: e.target.value })
                  }
                  placeholder="https://your-domain.com/callback"
                />
              </div>

              <div className="space-y-2">
                <Label>Test Webhook URL</Label>
                <Input
                  value={apiKeys.testWebhookUrl}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, testWebhookUrl: e.target.value })
                  }
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveApiKeys}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </AnimateTabsContent>
      </AnimateTabs>

      {/* Add Team Member Dialog */}
      <Dialog open={showAddTeamMember} onOpenChange={setShowAddTeamMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMemberId ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            <DialogDescription>
              {editingMemberId ? "Update team member details" : "Add a new team member to your account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">Name</Label>
              <Input
                id="memberName"
                value={newTeamMember.name}
                onChange={(e) =>
                  setNewTeamMember({ ...newTeamMember, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberEmail">Email</Label>
              <Input
                id="memberEmail"
                type="email"
                value={newTeamMember.email}
                onChange={(e) =>
                  setNewTeamMember({ ...newTeamMember, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberRole">Role</Label>
              <Select
                value={newTeamMember.role}
                onValueChange={(value) =>
                  setNewTeamMember({ ...newTeamMember, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddTeamMember(false)
                setEditingMemberId(null)
                setNewTeamMember({ name: "", email: "", role: "" })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTeamMember}>
              {editingMemberId ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
