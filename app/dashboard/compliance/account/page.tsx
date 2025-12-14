"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Edit, CheckCircle2 } from "lucide-react"
import Link from "next/link"

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

const mobileMoneyProviders = ["MTN", "Telecel", "AirtelTigo"]

const accountTypes = ["Bank Account", "Mobile Money"]

export default function AccountPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"form" | "review">("form")
  const [formData, setFormData] = useState({
    accountType: "",
    bankName: "",
    bankAccountNumber: "",
    mobileMoneyProvider: "",
    mobileMoneyPhone: "",
    nameOnAccount: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem("compliance_account")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFormData(data)
        setViewMode("review")
      } catch (e) {
        console.error("Error loading account data:", e)
      }
    }
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?233\d{9}$|^0\d{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountType) {
      newErrors.accountType = "Account type is required"
    }

    if (formData.accountType === "Bank Account") {
      if (!formData.bankName) {
        newErrors.bankName = "Bank name is required"
      }
      if (!formData.bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = "Bank account number is required"
      }
    }

    if (formData.accountType === "Mobile Money") {
      if (!formData.mobileMoneyProvider) {
        newErrors.mobileMoneyProvider = "Mobile money provider is required"
      }
      if (!formData.mobileMoneyPhone.trim()) {
        newErrors.mobileMoneyPhone = "Phone number is required"
      } else if (!validatePhone(formData.mobileMoneyPhone)) {
        newErrors.mobileMoneyPhone = "Please enter a valid Ghana phone number (e.g., +233XXXXXXXXX or 0XXXXXXXXX)"
      }
    }

    if (!formData.nameOnAccount.trim()) {
      newErrors.nameOnAccount = "Name on account is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      localStorage.setItem("compliance_account", JSON.stringify(formData))
      const steps = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
      if (!steps.includes("account")) {
        steps.push("account")
        localStorage.setItem("compliance_steps", JSON.stringify(steps))
      }
      setViewMode("review")
    }
  }

  const handleEdit = () => {
    setViewMode("form")
  }

  const handleNext = () => {
    router.push("/dashboard/compliance/service-agreement")
  }

  if (viewMode === "review") {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/dashboard/compliance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Compliance
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Account - Review</h1>
          <p className="text-muted-foreground mt-1">Review your account information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Bank or mobile money account details</CardDescription>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Account Type</Label>
                <p className="mt-1 font-medium">{formData.accountType}</p>
              </div>
              {formData.accountType === "Bank Account" && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Bank Name</Label>
                    <p className="mt-1 font-medium">{formData.bankName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bank Account Number</Label>
                    <p className="mt-1 font-medium">{formData.bankAccountNumber}</p>
                  </div>
                </>
              )}
              {formData.accountType === "Mobile Money" && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Mobile Money Provider</Label>
                    <p className="mt-1 font-medium">{formData.mobileMoneyProvider}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone Number</Label>
                    <p className="mt-1 font-medium">{formData.mobileMoneyPhone}</p>
                  </div>
                </>
              )}
              <div>
                <Label className="text-muted-foreground">Name on Account</Label>
                <p className="mt-1 font-medium">{formData.nameOnAccount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleNext}>
                Next: Service Agreement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/compliance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Compliance
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Account</h1>
        <p className="text-muted-foreground mt-1">Step 4 of 5: Provide your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>All fields are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => handleChange("accountType", value)}
              >
                <SelectTrigger id="accountType" className={errors.accountType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-sm text-destructive">{errors.accountType}</p>
              )}
            </div>

            {formData.accountType === "Bank Account" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Select
                    value={formData.bankName}
                    onValueChange={(value) => handleChange("bankName", value)}
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
                  <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                    className={errors.bankAccountNumber ? "border-destructive" : ""}
                  />
                  {errors.bankAccountNumber && (
                    <p className="text-sm text-destructive">{errors.bankAccountNumber}</p>
                  )}
                </div>
              </>
            )}

            {formData.accountType === "Mobile Money" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyProvider">Mobile Money Provider *</Label>
                  <Select
                    value={formData.mobileMoneyProvider}
                    onValueChange={(value) => handleChange("mobileMoneyProvider", value)}
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
                  <Label htmlFor="mobileMoneyPhone">Phone Number *</Label>
                  <Input
                    id="mobileMoneyPhone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX or 0XX XXX XXXX"
                    value={formData.mobileMoneyPhone}
                    onChange={(e) => handleChange("mobileMoneyPhone", e.target.value)}
                    className={errors.mobileMoneyPhone ? "border-destructive" : ""}
                  />
                  {errors.mobileMoneyPhone && (
                    <p className="text-sm text-destructive">{errors.mobileMoneyPhone}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Format: +233XXXXXXXXX or 0XXXXXXXXX
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="nameOnAccount">Name on Account *</Label>
              <Input
                id="nameOnAccount"
                type="text"
                placeholder="Enter name as it appears on account"
                value={formData.nameOnAccount}
                onChange={(e) => handleChange("nameOnAccount", e.target.value)}
                className={errors.nameOnAccount ? "border-destructive" : ""}
              />
              {errors.nameOnAccount && (
                <p className="text-sm text-destructive">{errors.nameOnAccount}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg">
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

