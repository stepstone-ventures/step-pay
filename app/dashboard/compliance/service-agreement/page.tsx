"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Edit, CheckCircle2, Download } from "lucide-react"
import Link from "next/link"

export default function ServiceAgreementPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"form" | "review">("form")
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    jobTitle: "",
    accepted: false,
  })
  const [contractingEntityDetails, setContractingEntityDetails] = useState({
    companyAddress: "",
    website: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load data from previous steps to populate contracting entity details
    const profile = localStorage.getItem("compliance_profile")
    const contact = localStorage.getItem("compliance_contact")

    let companyName = ""
    let address = ""
    let website = ""

    if (profile) {
      try {
        const profileData = JSON.parse(profile)
        companyName = profileData.tradingName || ""
      } catch (e) {
        console.error("Error loading profile data:", e)
      }
    }

    if (contact) {
      try {
        const contactData = JSON.parse(contact)
        const parts = []
        if (contactData.streetAddress) parts.push(contactData.streetAddress)
        if (contactData.stateOrRegion) parts.push(contactData.stateOrRegion)
        if (contactData.country) parts.push(contactData.country)
        if (contactData.postcode) parts.push(contactData.postcode)
        address = parts.join(", ")
        website = contactData.website || ""
      } catch (e) {
        console.error("Error loading contact data:", e)
      }
    }

    setContractingEntityDetails({
      companyAddress: companyName && address ? `${companyName}, ${address}` : address || "",
      website: website || "",
    })

    // Load saved agreement data
    const saved = localStorage.getItem("compliance_service_agreement")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFormData(data)
        setViewMode("review")
      } catch (e) {
        console.error("Error loading service agreement data:", e)
      }
    }
  }, [])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    }

    if (!formData.emailAddress) {
      newErrors.emailAddress = "Email address is required"
    } else if (!validateEmail(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address"
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required"
    }

    if (!formData.accepted) {
      newErrors.accepted = "You must accept the Merchant Service Agreement"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      localStorage.setItem("compliance_service_agreement", JSON.stringify(formData))
      const steps = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
      if (!steps.includes("service-agreement")) {
        steps.push("service-agreement")
        localStorage.setItem("compliance_steps", JSON.stringify(steps))
      }
      
      // Mark compliance as complete
      localStorage.setItem("compliance_complete", "true")
      // Trigger custom event for sidebar update (same-tab)
      window.dispatchEvent(new Event("complianceStatusChanged"))
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new Event("storage"))
      
      setViewMode("review")
    }
  }

  const handleEdit = () => {
    setViewMode("form")
  }

  const handleDownload = () => {
    // Generate service agreement document
    const profile = localStorage.getItem("compliance_profile")
    const contact = localStorage.getItem("compliance_contact")
    const owner = localStorage.getItem("compliance_owner")
    const account = localStorage.getItem("compliance_account")

    let profileData: any = {}
    let contactData: any = {}
    let ownerData: any = {}
    let accountData: any = {}

    try {
      if (profile) profileData = JSON.parse(profile)
      if (contact) contactData = JSON.parse(contact)
      if (owner) ownerData = JSON.parse(owner)
      if (account) accountData = JSON.parse(account)
    } catch (e) {
      console.error("Error loading data for agreement:", e)
    }

    const agreementText = `
MERCHANT SERVICE AGREEMENT
StepPay Payment Processing Services

This Merchant Service Agreement ("Agreement") is entered into between:

Contracting Entity:
${contractingEntityDetails.companyAddress}
Website: ${contractingEntityDetails.website || "N/A"}

Representative:
Full Name: ${formData.fullName}
Email: ${formData.emailAddress}
Phone: ${formData.phoneNumber}
Job Title: ${formData.jobTitle}

Business Details:
Trading Name: ${profileData.tradingName || "N/A"}
Industry: ${profileData.industry || "N/A"}
Business Type: ${profileData.businessType || "N/A"}

Contact Information:
General Email: ${contactData.generalEmail || "N/A"}
Support Email: ${contactData.supportEmail || contactData.generalEmail || "N/A"}
Dispute Email: ${contactData.disputeEmail || "N/A"}
Phone: ${contactData.phoneNumber || "N/A"}

Owner Information:
Name: ${ownerData.firstName || "N/A"} ${ownerData.lastName || "N/A"}
Nationality: ${ownerData.nationality || "N/A"}

Account Information:
Account Type: ${accountData.accountType || "N/A"}
${accountData.accountType === "Bank Account" ? `Bank: ${accountData.bankName || "N/A"}\nAccount Number: ${accountData.bankAccountNumber || "N/A"}` : `Provider: ${accountData.mobileMoneyProvider || "N/A"}\nPhone: ${accountData.mobileMoneyPhone || "N/A"}`}
Name on Account: ${accountData.nameOnAccount || "N/A"}

TERMS AND CONDITIONS:

1. SERVICES
StepPay agrees to provide payment processing services to the Merchant in accordance with the terms of this Agreement.

2. FEES AND PAYMENTS
The Merchant agrees to pay StepPay the applicable fees as set forth in the fee schedule, which may be updated from time to time.

3. COMPLIANCE
The Merchant agrees to comply with all applicable laws, regulations, and industry standards related to payment processing.

4. DATA SECURITY
Both parties agree to maintain appropriate security measures to protect customer data and payment information.

5. TERMINATION
Either party may terminate this Agreement with 30 days written notice.

6. DISPUTE RESOLUTION
Any disputes arising from this Agreement shall be resolved through arbitration in accordance with Ghanaian law.

7. ACCEPTANCE
By signing this Agreement, the Merchant accepts all terms and conditions set forth herein.

Agreed and Accepted:
${formData.fullName}
${formData.jobTitle}
Date: ${new Date().toLocaleDateString()}

StepPay Payment Solutions
Date: ${new Date().toLocaleDateString()}
    `.trim()

    // Create blob and download
    const blob = new Blob([agreementText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `StepPay_Merchant_Service_Agreement_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <h1 className="text-3xl font-bold mt-4">Service Agreement - Review</h1>
          <p className="text-muted-foreground mt-1">Review and download your service agreement</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Agreement</CardTitle>
                <CardDescription>Merchant Service Agreement details</CardDescription>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Contracting Entity Details</h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">Company Address</Label>
                  <p className="mt-1 font-medium">{contractingEntityDetails.companyAddress || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <p className="mt-1 font-medium">{contractingEntityDetails.website || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Representative Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="mt-1 font-medium">{formData.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone Number</Label>
                  <p className="mt-1 font-medium">{formData.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email Address</Label>
                  <p className="mt-1 font-medium">{formData.emailAddress}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Job Title</Label>
                  <p className="mt-1 font-medium">{formData.jobTitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Merchant Service Agreement Accepted</span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Agreement
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
        <h1 className="text-3xl font-bold mt-4">Service Agreement</h1>
        <p className="text-muted-foreground mt-1">Step 5 of 5: Review and accept the service agreement</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merchant Service Agreement</CardTitle>
          <CardDescription>All fields are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Contracting Entity Details</h3>
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Company Address</Label>
                  <p className="mt-1 font-medium">{contractingEntityDetails.companyAddress || "N/A"}</p>
                  <p className="text-sm text-muted-foreground mt-1">Pre-filled from your profile (cannot be changed)</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <p className="mt-1 font-medium">{contractingEntityDetails.website || "N/A"}</p>
                  <p className="text-sm text-muted-foreground mt-1">Pre-filled from your contact information (cannot be changed)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Representative Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+233 24 123 4567"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className={errors.phoneNumber ? "border-destructive" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    placeholder="representative@email.com"
                    value={formData.emailAddress}
                    onChange={(e) => handleChange("emailAddress", e.target.value)}
                    className={errors.emailAddress ? "border-destructive" : ""}
                  />
                  {errors.emailAddress && (
                    <p className="text-sm text-destructive">{errors.emailAddress}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="CEO, Director, etc."
                    value={formData.jobTitle}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    className={errors.jobTitle ? "border-destructive" : ""}
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-destructive">{errors.jobTitle}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="accepted"
                  checked={formData.accepted}
                  onCheckedChange={(checked) => handleChange("accepted", checked as boolean)}
                  className={errors.accepted ? "border-destructive mt-1" : "mt-1"}
                />
                <Label htmlFor="accepted" className="font-normal cursor-pointer">
                  I accept the Merchant Service Agreement *
                </Label>
              </div>
              {errors.accepted && (
                <p className="text-sm text-destructive ml-6">{errors.accepted}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg">
                Save & Complete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

