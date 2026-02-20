"use client"

import { useState } from "react"
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
import { Highlight } from "@/components/animate-ui/primitives/effects/highlight"
import {
  User,
  Mail,
  CreditCard,
  Settings as SettingsIcon,
  Users,
  Key,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
} from "lucide-react"

const currencies = ["GHS", "USD", "EUR", "NGN", "KES", "ZAR"]
const paymentMethods = ["Card", "Mobile Money", "Bank Transfer", "USSD"]
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
  const [activeTab, setActiveTab] = useState("profile")

  // Profile State
  const [profileData, setProfileData] = useState({
    tradingName: "Stepstone Ventures",
    description: "",
    staffSize: "",
    industry: "",
    category: "",
    businessType: "Registered Business",
  })

  // Contact State
  const [contactData, setContactData] = useState({
    generalEmail: "",
    supportEmail: "",
    disputeEmail: "",
    useGeneralEmail: false,
  })

  // Preferences State
  const [preferences, setPreferences] = useState({
    defaultCurrency: "GHS",
    paymentMethods: ["Card", "Mobile Money"],
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

  const handleSaveProfile = () => {
    // Save profile logic
    console.log("Saving profile:", profileData)
  }

  const handleSaveContact = () => {
    // Save contact logic
    console.log("Saving contact:", contactData)
  }

  const handleSavePreferences = () => {
    // Save preferences logic
    console.log("Saving preferences:", preferences)
  }

  const handleAddTeamMember = () => {
    if (newTeamMember.name && newTeamMember.email && newTeamMember.role) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newTeamMember.name,
        email: newTeamMember.email,
        role: newTeamMember.role,
        permissions: [],
      }
      setTeamMembers([...teamMembers, member])
      setNewTeamMember({ name: "", email: "", role: "" })
      setShowAddTeamMember(false)
    }
  }

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id))
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "accounts", label: "Accounts", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
    { id: "team", label: "Team", icon: Users },
    { id: "api-keys", label: "API Keys & Webhooks", icon: Key },
  ]

  return (
    <div className="space-y-6 pt-6">

      {/* Tabs */}
      <div className="border-b">
        <Highlight
          value={activeTab}
          onValueChange={setActiveTab}
          mode="parent"
          containerClassName="flex flex-wrap gap-2 pb-4"
          className="rounded-lg bg-accent inset-0 border border-border/60"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                data-value={tab.id}
                className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm transition-colors text-muted-foreground data-[active=true]:text-foreground data-[active=true]:font-medium"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </Highlight>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your business profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tradingName">Trading Name</Label>
              <Input
                id="tradingName"
                value={profileData.tradingName}
                onChange={(e) =>
                  setProfileData({ ...profileData, tradingName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={profileData.description}
                onChange={(e) =>
                  setProfileData({ ...profileData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffSize">Staff Size</Label>
                <Input
                  id="staffSize"
                  type="number"
                  value={profileData.staffSize}
                  onChange={(e) =>
                    setProfileData({ ...profileData, staffSize: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={profileData.industry}
                  onChange={(e) =>
                    setProfileData({ ...profileData, industry: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={profileData.category}
                  onChange={(e) =>
                    setProfileData({ ...profileData, category: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={profileData.businessType}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, businessType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter Business">Starter Business</SelectItem>
                    <SelectItem value="Registered Business">Registered Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Manage your email addresses for different purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="generalEmail">General Email</Label>
              <Input
                id="generalEmail"
                type="email"
                value={contactData.generalEmail}
                onChange={(e) =>
                  setContactData({ ...contactData, generalEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="supportEmail">Support Email</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="useGeneralEmail"
                    checked={contactData.useGeneralEmail}
                    onCheckedChange={(checked) =>
                      setContactData({ ...contactData, useGeneralEmail: checked })
                    }
                  />
                  <Label htmlFor="useGeneralEmail" className="text-sm font-normal">
                    Use General Email
                  </Label>
                </div>
              </div>
              <Input
                id="supportEmail"
                type="email"
                value={contactData.supportEmail}
                onChange={(e) =>
                  setContactData({ ...contactData, supportEmail: e.target.value })
                }
                disabled={contactData.useGeneralEmail}
                placeholder={contactData.useGeneralEmail ? "Will use General Email" : ""}
              />
              <p className="text-xs text-muted-foreground">
                This email is where customers can reach you for help
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disputeEmail">Dispute Email</Label>
              <Input
                id="disputeEmail"
                type="email"
                value={contactData.disputeEmail}
                onChange={(e) =>
                  setContactData({ ...contactData, disputeEmail: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Disputes are time-sensitive. Use an actively-monitored email. We'll notify you once
                a dispute is raised.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSaveContact}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bank Accounts & Mobile Money</CardTitle>
                <CardDescription>
                  Manage your payout accounts and subaccounts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Accounts Added</h3>
              <p className="text-muted-foreground mb-6">
                Add a bank account or mobile money account to receive payouts
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
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

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences}>
              <Save className="mr-2 h-4 w-4" />
              Save All Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
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
                          <Button variant="ghost" size="icon">
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
      )}

      {/* API Keys & Webhooks Tab */}
      {activeTab === "api-keys" && (
        <div className="space-y-6">
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
                  <Button variant="outline">Copy</Button>
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
                  <Button variant="outline">Copy</Button>
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
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Add Team Member Dialog */}
      <Dialog open={showAddTeamMember} onOpenChange={setShowAddTeamMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your account
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
            <Button variant="outline" onClick={() => setShowAddTeamMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeamMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
