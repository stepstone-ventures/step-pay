"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Edit, CheckCircle2, HelpCircle } from "lucide-react"
import Link from "next/link"
import { ComplianceAccessGuard } from "@/components/compliance/access-guard"

export default function ContactPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"form" | "review">("form")
  const [useGeneralEmail, setUseGeneralEmail] = useState(false)
  const [formData, setFormData] = useState({
    generalEmail: "",
    supportEmail: "",
    disputeEmail: "",
    phoneNumber: "",
    website: "",
    xHandle: "",
    instagramHandle: "",
    facebookUsername: "",
    country: "",
    stateOrRegion: "",
    streetAddress: "",
    gpsAddress: "",
    postcode: "",
    buildingOrComplex: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load signup data (simulated - in real app, get from auth context)
    const signupData = localStorage.getItem("signup_data")
    let email = ""
    let country = ""
    let state = ""
    let street = ""
    let gps = ""
    let postcode = ""

    if (signupData) {
      try {
        const data = JSON.parse(signupData)
        email = data.email || ""
        country = data.country || ""
      } catch (e) {
        console.error("Error loading signup data:", e)
      }
    } else {
      // Fallback: check if there's a stored email from other sources
      const storedEmail = localStorage.getItem("user_email")
      if (storedEmail) email = storedEmail
    }

    // Load saved contact data
    const saved = localStorage.getItem("compliance_contact")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFormData(data)
        setUseGeneralEmail(data.useGeneralEmail || false)
        setViewMode("review")
      } catch (e) {
        console.error("Error loading contact data:", e)
      }
    } else {
      // Pre-fill from signup
      setFormData((prev) => ({
        ...prev,
        generalEmail: email || prev.generalEmail,
        country: country || prev.country,
      }))
    }
  }, [])

  useEffect(() => {
    if (useGeneralEmail) {
      setFormData((prev) => ({
        ...prev,
        supportEmail: prev.generalEmail,
      }))
    }
  }, [useGeneralEmail, formData.generalEmail])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.generalEmail) {
      newErrors.generalEmail = "General email is required"
    } else if (!validateEmail(formData.generalEmail)) {
      newErrors.generalEmail = "Please enter a valid email address"
    }

    if (!useGeneralEmail) {
      if (!formData.supportEmail) {
        newErrors.supportEmail = "Support email is required"
      } else if (!validateEmail(formData.supportEmail)) {
        newErrors.supportEmail = "Please enter a valid email address"
      }
    }

    if (!formData.disputeEmail) {
      newErrors.disputeEmail = "Dispute email is required"
    } else if (!validateEmail(formData.disputeEmail)) {
      newErrors.disputeEmail = "Please enter a valid email address"
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    if (!formData.country) {
      newErrors.country = "Country is required"
    }

    if (!formData.stateOrRegion) {
      newErrors.stateOrRegion = "State or Region is required"
    }

    if (!formData.streetAddress) {
      newErrors.streetAddress = "Street address is required"
    }

    if (!formData.gpsAddress) {
      newErrors.gpsAddress = "GPS address is required"
    }

    if (!formData.postcode) {
      newErrors.postcode = "Postcode is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const dataToSave = { ...formData, useGeneralEmail }
      localStorage.setItem("compliance_contact", JSON.stringify(dataToSave))
      const steps = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
      if (!steps.includes("contact")) {
        steps.push("contact")
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
    router.push("/dashboard/compliance/owner")
  }

  if (viewMode === "review") {
    return (
      <ComplianceAccessGuard currentStep="contact">
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
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>All your contact details</CardDescription>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Email Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">General Email</Label>
                  <p className="mt-1 font-medium">{formData.generalEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Support Email</Label>
                  <p className="mt-1 font-medium">
                    {useGeneralEmail ? formData.generalEmail : formData.supportEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dispute Email</Label>
                  <p className="mt-1 font-medium">{formData.disputeEmail}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phone Number</Label>
                  <p className="mt-1 font-medium">{formData.phoneNumber}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Online Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.website && (
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="mt-1 font-medium">{formData.website}</p>
                  </div>
                )}
                {formData.xHandle && (
                  <div>
                    <Label className="text-muted-foreground">X Handle</Label>
                    <p className="mt-1 font-medium">{formData.xHandle}</p>
                  </div>
                )}
                {formData.instagramHandle && (
                  <div>
                    <Label className="text-muted-foreground">Instagram Handle</Label>
                    <p className="mt-1 font-medium">{formData.instagramHandle}</p>
                  </div>
                )}
                {formData.facebookUsername && (
                  <div>
                    <Label className="text-muted-foreground">Facebook Username</Label>
                    <p className="mt-1 font-medium">{formData.facebookUsername}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Office Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Country</Label>
                  <p className="mt-1 font-medium">{formData.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">State or Region</Label>
                  <p className="mt-1 font-medium">{formData.stateOrRegion}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Street Address</Label>
                  <p className="mt-1 font-medium">{formData.streetAddress}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">GPS Address</Label>
                  <p className="mt-1 font-medium">{formData.gpsAddress}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Postcode</Label>
                  <p className="mt-1 font-medium">{formData.postcode}</p>
                </div>
                {formData.buildingOrComplex && (
                  <div>
                    <Label className="text-muted-foreground">Building or Complex Number/Name</Label>
                    <p className="mt-1 font-medium">{formData.buildingOrComplex}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleNext}>
                Next: Owner
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
    <ComplianceAccessGuard currentStep="contact">
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
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>All fields are required except Building or Complex Number/Name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Email Addresses</h3>
              
              <div className="space-y-2">
                <Label htmlFor="generalEmail">General Email *</Label>
                <Input
                  id="generalEmail"
                  type="email"
                  placeholder="business@email.com"
                  value={formData.generalEmail}
                  onChange={(e) => handleChange("generalEmail", e.target.value)}
                  className={errors.generalEmail ? "border-destructive" : ""}
                />
                {errors.generalEmail && (
                  <p className="text-sm text-destructive">{errors.generalEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="supportEmail">Support Email *</Label>
                  <div title="This email is where customers can reach you for help">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="useGeneralEmail"
                    checked={useGeneralEmail}
                    onCheckedChange={(checked) => setUseGeneralEmail(checked as boolean)}
                  />
                  <Label htmlFor="useGeneralEmail" className="font-normal cursor-pointer">
                    Use General Email
                  </Label>
                </div>
                {!useGeneralEmail && (
                  <>
                    <Input
                      id="supportEmail"
                      type="email"
                      placeholder="support@email.com"
                      value={formData.supportEmail}
                      onChange={(e) => handleChange("supportEmail", e.target.value)}
                      className={errors.supportEmail ? "border-destructive" : ""}
                    />
                    {errors.supportEmail && (
                      <p className="text-sm text-destructive">{errors.supportEmail}</p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="disputeEmail">Dispute Email *</Label>
                  <div title="Disputes are time-sensitive. Use an actively-monitored email. We'll notify you once a dispute is raised.">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Input
                  id="disputeEmail"
                  type="email"
                  placeholder="disputes@email.com"
                  value={formData.disputeEmail}
                  onChange={(e) => handleChange("disputeEmail", e.target.value)}
                  className={errors.disputeEmail ? "border-destructive" : ""}
                />
                {errors.disputeEmail && (
                  <p className="text-sm text-destructive">{errors.disputeEmail}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Phone */}
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

            <Separator />

            {/* Online Presence */}
            <div className="space-y-4">
              <h3 className="font-semibold">Online Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xHandle">X Handle</Label>
                  <Input
                    id="xHandle"
                    type="text"
                    placeholder="@username"
                    value={formData.xHandle}
                    onChange={(e) => handleChange("xHandle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramHandle">Instagram Handle</Label>
                  <Input
                    id="instagramHandle"
                    type="text"
                    placeholder="@username"
                    value={formData.instagramHandle}
                    onChange={(e) => handleChange("instagramHandle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookUsername">Facebook Username</Label>
                  <Input
                    id="facebookUsername"
                    type="text"
                    placeholder="username"
                    value={formData.facebookUsername}
                    onChange={(e) => handleChange("facebookUsername", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Office Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Office Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Ghana"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className={errors.country ? "border-destructive" : ""}
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateOrRegion">State or Region *</Label>
                  <Input
                    id="stateOrRegion"
                    type="text"
                    placeholder="Greater Accra"
                    value={formData.stateOrRegion}
                    onChange={(e) => handleChange("stateOrRegion", e.target.value)}
                    className={errors.stateOrRegion ? "border-destructive" : ""}
                  />
                  {errors.stateOrRegion && (
                    <p className="text-sm text-destructive">{errors.stateOrRegion}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    type="text"
                    placeholder="123 Main Street"
                    value={formData.streetAddress}
                    onChange={(e) => handleChange("streetAddress", e.target.value)}
                    className={errors.streetAddress ? "border-destructive" : ""}
                  />
                  {errors.streetAddress && (
                    <p className="text-sm text-destructive">{errors.streetAddress}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpsAddress">GPS Address *</Label>
                  <Input
                    id="gpsAddress"
                    type="text"
                    placeholder="GC-123-4567"
                    value={formData.gpsAddress}
                    onChange={(e) => handleChange("gpsAddress", e.target.value)}
                    className={errors.gpsAddress ? "border-destructive" : ""}
                  />
                  {errors.gpsAddress && (
                    <p className="text-sm text-destructive">{errors.gpsAddress}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    type="text"
                    placeholder="GA123-4567"
                    value={formData.postcode}
                    onChange={(e) => handleChange("postcode", e.target.value)}
                    className={errors.postcode ? "border-destructive" : ""}
                  />
                  {errors.postcode && (
                    <p className="text-sm text-destructive">{errors.postcode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingOrComplex">Building or Complex Number/Name</Label>
                  <Input
                    id="buildingOrComplex"
                    type="text"
                    placeholder="Building A, Suite 101"
                    value={formData.buildingOrComplex}
                    onChange={(e) => handleChange("buildingOrComplex", e.target.value)}
                  />
                </div>
              </div>
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
