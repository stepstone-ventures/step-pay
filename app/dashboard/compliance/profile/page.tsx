"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Edit, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ComplianceAccessGuard } from "@/components/compliance/access-guard"

const industries = [
  "Retail",
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Food & Beverage",
  "Hospitality",
  "E-commerce",
  "Professional Services",
  "Manufacturing",
  "Real Estate",
  "Transportation",
  "Entertainment",
  "Other",
]

const categories = [
  "B2B",
  "B2C",
  "Marketplace",
  "SaaS",
  "Non-profit",
  "Other",
]

const businessTypes = [
  "Starter Business",
  "Registered Business",
]

export default function ProfilePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"form" | "review">("form")
  const [formData, setFormData] = useState({
    tradingName: "",
    description: "",
    staffSize: "",
    annualSalesVolume: "",
    industry: "",
    category: "",
    businessType: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem("compliance_profile")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFormData(data)
        setViewMode("review")
      } catch (e) {
        console.error("Error loading profile data:", e)
      }
    }
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.tradingName.trim()) {
      newErrors.tradingName = "Trading name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.trim().length < 120) {
      newErrors.description = "Description must be at least 120 characters"
    }

    if (!formData.staffSize) {
      newErrors.staffSize = "Staff size is required"
    }

    if (!formData.annualSalesVolume) {
      newErrors.annualSalesVolume = "Annual projected sales volume is required"
    } else if (isNaN(Number(formData.annualSalesVolume)) || Number(formData.annualSalesVolume) <= 0) {
      newErrors.annualSalesVolume = "Please enter a valid amount"
    }

    if (!formData.industry) {
      newErrors.industry = "Industry is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      localStorage.setItem("compliance_profile", JSON.stringify(formData))
      const steps = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
      if (!steps.includes("profile")) {
        steps.push("profile")
        localStorage.setItem("compliance_steps", JSON.stringify(steps))
      }
      window.dispatchEvent(new Event("dashboardNotificationsChanged"))
      setViewMode("review")
    }
  }

  const handleEdit = () => {
    setViewMode("form")
  }

  const handleNext = () => {
    router.push("/dashboard/compliance/contact")
  }

  if (viewMode === "review") {
    return (
      <ComplianceAccessGuard currentStep="profile">
        <div className="space-y-6">
        <div className="pt-6">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/compliance">
              <Button variant="ghost" size="sm" className="h-10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Compliance
              </Button>
            </Link>
          </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>All your profile details</CardDescription>
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
                <Label className="text-muted-foreground">Trading Name</Label>
                <p className="mt-1 font-medium">{formData.tradingName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Staff Size</Label>
                <p className="mt-1 font-medium">{formData.staffSize}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Annual Projected Sales Volume</Label>
                <p className="mt-1 font-medium">GHS {Number(formData.annualSalesVolume).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Industry</Label>
                <p className="mt-1 font-medium">{formData.industry}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="mt-1 font-medium">{formData.category}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Business Type</Label>
                <p className="mt-1 font-medium">{formData.businessType}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description of Business</Label>
              <p className="mt-1">{formData.description}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleNext}>
                Next: Contact
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
      </ComplianceAccessGuard>
    )
  }

  return (
    <ComplianceAccessGuard currentStep="profile">
      <div className="space-y-6 pt-6">
      <div className="flex items-center">
        <Link href="/dashboard/compliance">
          <Button variant="ghost" size="sm" className="h-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Compliance
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>All fields are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tradingName">Trading Name *</Label>
              <Input
                id="tradingName"
                placeholder="Your business trading name"
                value={formData.tradingName}
                onChange={(e) => handleChange("tradingName", e.target.value)}
                className={errors.tradingName ? "border-destructive" : ""}
              />
              {errors.tradingName && (
                <p className="text-sm text-destructive">{errors.tradingName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description of Business * (Minimum 120 characters)</Label>
              <Textarea
                id="description"
                placeholder="Describe your business in detail..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                className={errors.description ? "border-destructive" : ""}
              />
              <p className="text-sm text-muted-foreground">
                {formData.description.length}/120 characters minimum
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="staffSize">Staff Size *</Label>
                <Select
                  value={formData.staffSize}
                  onValueChange={(value) => handleChange("staffSize", value)}
                >
                  <SelectTrigger id="staffSize" className={errors.staffSize ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select staff size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2-5">2-5</SelectItem>
                    <SelectItem value="6-10">6-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-100">51-100</SelectItem>
                    <SelectItem value="100+">100+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.staffSize && (
                  <p className="text-sm text-destructive">{errors.staffSize}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualSalesVolume">Annual Projected Sales Volume (GHS) *</Label>
                <Input
                  id="annualSalesVolume"
                  type="number"
                  placeholder="0.00"
                  value={formData.annualSalesVolume}
                  onChange={(e) => handleChange("annualSalesVolume", e.target.value)}
                  className={errors.annualSalesVolume ? "border-destructive" : ""}
                />
                {errors.annualSalesVolume && (
                  <p className="text-sm text-destructive">{errors.annualSalesVolume}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleChange("industry", value)}
                >
                  <SelectTrigger id="industry" className={errors.industry ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => handleChange("businessType", value)}
              >
                <SelectTrigger id="businessType" className={errors.businessType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-sm text-destructive">{errors.businessType}</p>
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
    </ComplianceAccessGuard>
  )
}
