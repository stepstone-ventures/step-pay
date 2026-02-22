"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Filter, X, CreditCard, Repeat, Package, Upload, ChevronDown, ChevronUp } from "lucide-react"
import { APP_CURRENCIES } from "@/lib/currency-options"

interface PaymentPage {
  id: string
  name: string
  slug: string
  amount: number
  visits: number
  payments: number
  status: "active" | "inactive"
}

const mockPaymentPages: PaymentPage[] = []
const mockPlans = ["Plan A", "Plan B", "Plan C"]
const mockSplitGroups = ["Split Group 1", "Split Group 2"]
const mockSubaccounts = ["Subaccount 1", "Subaccount 2"]
const currencies = APP_CURRENCIES
const intervals = ["Hourly", "Daily", "Weekly", "Monthly", "Quarterly", "Biannually", "Annually"]

export default function PaymentPagesPage() {
  const [paymentPages] = useState<PaymentPage[]>(mockPaymentPages)
  const [showFilters, setShowFilters] = useState(false)
  const [status, setStatus] = useState("Show All")
  const [showNewPageDialog, setShowNewPageDialog] = useState(false)
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
  const [selectedPageType, setSelectedPageType] = useState<"one-time" | "subscription" | "product" | null>(null)
  const [subscriptionOption, setSubscriptionOption] = useState<"existing" | "new" | "customer" | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Form states for different page types
  const [formData, setFormData] = useState<any>({
    pageName: "",
    description: "",
    seoImage: null,
    collectPhone: false,
    fixedAmount: false,
    customLink: "",
    redirectUrl: "",
    successMessage: "",
    notificationEmail: "",
    splitType: "",
    splitValue: "",
    plan: "",
    planName: "",
    planAmount: "",
    currency: "GHS",
    interval: "",
    invoiceLimit: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    if (status === "Show All") return paymentPages
    return paymentPages.filter((p) => p.status === status.toLowerCase())
  }, [paymentPages, status])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFormData({ ...formData, seoImage: file })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setUploadedFile(file)
      setFormData({ ...formData, seoImage: file })
    }
  }

  const handleCreate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.pageName.trim()) {
      newErrors.pageName = "Page name is required"
    }

    if (selectedPageType === "subscription" && subscriptionOption === "existing" && !formData.plan) {
      newErrors.plan = "Plan is required"
    }

    if (selectedPageType === "subscription" && subscriptionOption === "new") {
      if (!formData.planName.trim()) {
        newErrors.planName = "Plan name is required"
      }
      if (!formData.planAmount.trim()) {
        newErrors.planAmount = "Plan amount is required"
      }
      if (!formData.interval) {
        newErrors.interval = "Interval is required"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Create payment page logic here
    console.log("Creating payment page:", { selectedPageType, subscriptionOption, formData })
    
    // Reset form
    setFormData({
      pageName: "",
      description: "",
      seoImage: null,
      collectPhone: false,
      fixedAmount: false,
      customLink: "",
      redirectUrl: "",
      successMessage: "",
      notificationEmail: "",
      splitType: "",
      splitValue: "",
      plan: "",
      planName: "",
      planAmount: "",
      currency: "GHS",
      interval: "",
      invoiceLimit: "",
    })
    setUploadedFile(null)
    setSelectedPageType(null)
    setSubscriptionOption(null)
    setShowAdvancedOptions(false)
    setErrors({})
    setShowNewPageDialog(false)
  }

  const handleReset = () => {
    setStatus("Show All")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount)
  }

  const renderPageTypeSelection = () => (
    <div className="space-y-4">
      <div
        className="border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setSelectedPageType("one-time")}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <CreditCard className="h-8 w-8 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">One-Time Payment</h3>
              <p className="text-sm text-muted-foreground">
                Create a simple page for your customers to pay you
              </p>
            </div>
          </div>
          <Button>Choose</Button>
        </div>
      </div>

      <div
        className="border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => {
          setSelectedPageType("subscription")
          setSubscriptionOption(null)
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Repeat className="h-8 w-8 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Subscription Payment</h3>
              <p className="text-sm text-muted-foreground">
                Create a page for recurring payments and subscriptions
              </p>
            </div>
          </div>
          <Button>Choose</Button>
        </div>
      </div>

      <div
        className="border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setSelectedPageType("product")}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Package className="h-8 w-8 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Product Payment</h3>
              <p className="text-sm text-muted-foreground">
                Create a page to sell one or more products from your inventory
              </p>
            </div>
          </div>
          <Button>Choose</Button>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionOptions = () => (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setSubscriptionOption("existing")}
      >
        Existing Plan
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setSubscriptionOption("new")}
      >
        Create New Plan
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setSubscriptionOption("customer")}
      >
        Let My Customers Create the Plan
      </Button>
    </div>
  )

  const renderAdvancedOptions = () => (
    <div className="space-y-4 pt-4 border-t">
      <div className="space-y-2">
        <Label>Use Your Custom Link</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">https://steppay.shop/pay/</span>
          <Input
            placeholder="custom-url"
            value={formData.customLink}
            onChange={(e) => setFormData({ ...formData, customLink: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Redirect After Payment</Label>
        <Input
          placeholder="https://example.com/success"
          value={formData.redirectUrl}
          onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Success Message</Label>
        <Textarea
          placeholder="Custom message to show after successful payment"
          value={formData.successMessage}
          onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Send Notifications To</Label>
        <p className="text-sm text-muted-foreground">
          If provided, this email address will get transaction notices
        </p>
        <Input
          type="email"
          placeholder="notifications@example.com"
          value={formData.notificationEmail}
          onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Split payment with a Subaccount or a Split Group</Label>
        <p className="text-sm text-muted-foreground">
          This allows you to split a portion of every payment with multiple bank accounts. Learn more about Transaction Splits and Subaccounts.
        </p>
        <div className="flex gap-2">
          <Select
            value={formData.splitType}
            onValueChange={(value) => setFormData({ ...formData, splitType: value, splitValue: "" })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split-group">Split Group</SelectItem>
              <SelectItem value="subaccount">Subaccount</SelectItem>
            </SelectContent>
          </Select>
          {formData.splitType && (
            <Select
              value={formData.splitValue}
              onValueChange={(value) => setFormData({ ...formData, splitValue: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${formData.splitType === "split-group" ? "Split Group" : "Subaccount"}`} />
              </SelectTrigger>
              <SelectContent>
                {(formData.splitType === "split-group" ? mockSplitGroups : mockSubaccounts).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )

  const renderFormContent = () => {
    // One-Time Payment Form
    if (selectedPageType === "one-time") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageName">Page Name *</Label>
            <Input
              id="pageName"
              value={formData.pageName}
              onChange={(e) => {
                setFormData({ ...formData, pageName: e.target.value })
                if (errors.pageName) setErrors({ ...errors, pageName: "" })
              }}
              className={errors.pageName ? "border-destructive" : ""}
            />
            {errors.pageName && <p className="text-sm text-destructive">{errors.pageName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>SEO Image (optional)</Label>
            <p className="text-sm text-muted-foreground">
              This image will show when the page is shared on social media. We recommend a 1024 x 512 pixel JPG or PNG, under 1 MB in size.
            </p>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploadedFile ? uploadedFile.name : "Drag files here or click to upload"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fixedAmount"
              checked={formData.fixedAmount}
              onCheckedChange={(checked) => setFormData({ ...formData, fixedAmount: checked as boolean })}
            />
            <Label htmlFor="fixedAmount" className="font-normal cursor-pointer">
              Prefer a fixed payment amount on this page
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="collectPhone"
              checked={formData.collectPhone}
              onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked as boolean })}
            />
            <Label htmlFor="collectPhone" className="font-normal cursor-pointer">
              Collect phone numbers on this page
            </Label>
          </div>

          <div>
            <Button
              variant="ghost"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full justify-between"
            >
              Show Advanced Options
              {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {showAdvancedOptions && renderAdvancedOptions()}
          </div>
        </div>
      )
    }

    // Subscription Payment Forms
    if (selectedPageType === "subscription") {
      if (!subscriptionOption) {
        return renderSubscriptionOptions()
      }

      if (subscriptionOption === "existing") {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan *</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => {
                  setFormData({ ...formData, plan: value })
                  if (errors.plan) setErrors({ ...errors, plan: "" })
                }}
              >
                <SelectTrigger className={errors.plan ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {mockPlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.plan && <p className="text-sm text-destructive">{errors.plan}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name *</Label>
              <Input
                id="pageName"
                value={formData.pageName}
                onChange={(e) => {
                  setFormData({ ...formData, pageName: e.target.value })
                  if (errors.pageName) setErrors({ ...errors, pageName: "" })
                }}
                className={errors.pageName ? "border-destructive" : ""}
              />
              {errors.pageName && <p className="text-sm text-destructive">{errors.pageName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>SEO Image (optional)</Label>
              <p className="text-sm text-muted-foreground">
                This image will show when the page is shared on social media. We recommend a 1024 x 512 pixel JPG or PNG, under 1 MB in size.
              </p>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploadedFile ? uploadedFile.name : "Drag files here or click to upload"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="collectPhone"
                checked={formData.collectPhone}
                onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked as boolean })}
              />
              <Label htmlFor="collectPhone" className="font-normal cursor-pointer">
                Collect phone numbers on this page
              </Label>
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full justify-between"
              >
                Show Advanced Options
                {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {showAdvancedOptions && renderAdvancedOptions()}
            </div>
          </div>
        )
      }

      if (subscriptionOption === "new") {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                value={formData.planName}
                onChange={(e) => {
                  setFormData({ ...formData, planName: e.target.value })
                  if (errors.planName) setErrors({ ...errors, planName: "" })
                }}
                className={errors.planName ? "border-destructive" : ""}
              />
              {errors.planName && <p className="text-sm text-destructive">{errors.planName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planAmount">Plan Amount *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
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
                  id="planAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.planAmount}
                  onChange={(e) => {
                    setFormData({ ...formData, planAmount: e.target.value })
                    if (errors.planAmount) setErrors({ ...errors, planAmount: "" })
                  }}
                  className={errors.planAmount ? "border-destructive flex-1" : "flex-1"}
                />
              </div>
              {errors.planAmount && <p className="text-sm text-destructive">{errors.planAmount}</p>}
            </div>

            <div className="space-y-2">
              <Label>Interval *</Label>
              <Select
                value={formData.interval}
                onValueChange={(value) => {
                  setFormData({ ...formData, interval: value })
                  if (errors.interval) setErrors({ ...errors, interval: "" })
                }}
              >
                <SelectTrigger className={errors.interval ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {intervals.map((int) => (
                    <SelectItem key={int} value={int.toLowerCase()}>
                      {int}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.interval && <p className="text-sm text-destructive">{errors.interval}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceLimit">Invoice Limit (optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const current = parseInt(formData.invoiceLimit) || 0
                    setFormData({ ...formData, invoiceLimit: Math.max(0, current - 1).toString() })
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Input
                  id="invoiceLimit"
                  type="number"
                  placeholder="0"
                  value={formData.invoiceLimit}
                  onChange={(e) => setFormData({ ...formData, invoiceLimit: e.target.value })}
                  className="flex-1 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const current = parseInt(formData.invoiceLimit) || 0
                    setFormData({ ...formData, invoiceLimit: (current + 1).toString() })
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>SEO Image (optional)</Label>
              <p className="text-sm text-muted-foreground">
                This image will show when the page is shared on social media. We recommend a 1024 x 512 pixel JPG or PNG, under 1 MB in size.
              </p>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploadedFile ? uploadedFile.name : "Drag files here or click to upload"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="collectPhone"
                checked={formData.collectPhone}
                onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked as boolean })}
              />
              <Label htmlFor="collectPhone" className="font-normal cursor-pointer">
                Collect phone numbers on this page
              </Label>
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full justify-between"
              >
                Show Advanced Options
                {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {showAdvancedOptions && renderAdvancedOptions()}
            </div>
          </div>
        )
      }

      if (subscriptionOption === "customer") {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name *</Label>
              <Input
                id="pageName"
                value={formData.pageName}
                onChange={(e) => {
                  setFormData({ ...formData, pageName: e.target.value })
                  if (errors.pageName) setErrors({ ...errors, pageName: "" })
                }}
                className={errors.pageName ? "border-destructive" : ""}
              />
              {errors.pageName && <p className="text-sm text-destructive">{errors.pageName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>SEO Image (optional)</Label>
              <p className="text-sm text-muted-foreground">
                This image will show when the page is shared on social media. We recommend a 1024 x 512 pixel JPG or PNG, under 1 MB in size.
              </p>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploadedFile ? uploadedFile.name : "Drag files here or click to upload"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="collectPhone"
                checked={formData.collectPhone}
                onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked as boolean })}
              />
              <Label htmlFor="collectPhone" className="font-normal cursor-pointer">
                Collect phone numbers on this page
              </Label>
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full justify-between"
              >
                Show Advanced Options
                {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {showAdvancedOptions && renderAdvancedOptions()}
            </div>
          </div>
        )
      }
    }

    // Product Payment Form
    if (selectedPageType === "product") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageName">Page Name *</Label>
            <Input
              id="pageName"
              value={formData.pageName}
              onChange={(e) => {
                setFormData({ ...formData, pageName: e.target.value })
                if (errors.pageName) setErrors({ ...errors, pageName: "" })
              }}
              className={errors.pageName ? "border-destructive" : ""}
            />
            {errors.pageName && <p className="text-sm text-destructive">{errors.pageName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>SEO Image (optional)</Label>
            <p className="text-sm text-muted-foreground">
              This image will show when the page is shared on social media. We recommend a 1024 x 512 pixel JPG or PNG, under 1 MB in size.
            </p>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploadedFile ? uploadedFile.name : "Drag files here or click to upload"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="collectPhone"
              checked={formData.collectPhone}
              onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked as boolean })}
            />
            <Label htmlFor="collectPhone" className="font-normal cursor-pointer">
              Collect phone numbers on this page
            </Label>
          </div>

          <div>
            <Button
              variant="ghost"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full justify-between"
            >
              Show Advanced Options
              {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {showAdvancedOptions && renderAdvancedOptions()}
          </div>
        </div>
      )
    }

    return renderPageTypeSelection()
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Filters */}
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

        {/* Right side - Create Payment Page Button */}
        <Button onClick={() => setShowNewPageDialog(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10">
          <Plus className="mr-2 h-4 w-4" />
          Create Payment Page
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Show All">Show All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
          <CardTitle>All Payment Pages ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                The easiest way to accept payments. Simply create a page, share the link to your customers and start accepting payments.
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowNewPageDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Payment Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{page.name}</CardTitle>
                      {page.status === "active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        /{page.slug}
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(page.amount)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{page.visits} visits</span>
                        <span className="text-muted-foreground">{page.payments} payments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Payment Page Dialog */}
      <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPageType === null
                ? "New Payment Page"
                : selectedPageType === "subscription" && !subscriptionOption
                  ? "Choose Subscription Option"
                  : "Create Payment Page"}
            </DialogTitle>
            <DialogDescription>
              {selectedPageType === null
                ? "Choose the type of payment page you want to create"
                : "Fill in the details to create your payment page"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderFormContent()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedPageType === "subscription" && subscriptionOption) {
                  setSubscriptionOption(null)
                } else if (selectedPageType) {
                  setSelectedPageType(null)
                } else {
                  setShowNewPageDialog(false)
                }
                setShowAdvancedOptions(false)
              }}
            >
              {selectedPageType === null ? "Cancel" : "Back"}
            </Button>
            {selectedPageType && (selectedPageType !== "subscription" || subscriptionOption) && (
              <Button onClick={handleCreate}>Create</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
