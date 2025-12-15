"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Edit, CheckCircle2, Upload, FileText } from "lucide-react"
import Link from "next/link"
import { ComplianceAccessGuard } from "@/components/compliance/access-guard"

const idDocumentTypes = ["Passport", "Ghana Card"]

export default function OwnerPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewMode, setViewMode] = useState<"form" | "review">("form")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    idDocumentType: "",
    documentNumber: "",
    documentFile: null as File | null,
    documentFileName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem("compliance_owner")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFormData({
          ...data,
          documentFile: null, // File objects can't be stored in localStorage
        })
        if (data.documentFileName) {
          setDocumentPreview(data.documentFileName)
        }
        setViewMode("review")
      } catch (e) {
        console.error("Error loading owner data:", e)
      }
    }
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, documentFile: file, documentFileName: file.name })
      setDocumentPreview(file.name)
      if (errors.documentFile) {
        setErrors({ ...errors, documentFile: "" })
      }
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required"
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      if (dob >= today) {
        newErrors.dateOfBirth = "Date of birth must be in the past"
      }
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = "Nationality is required"
    }

    if (!formData.idDocumentType) {
      newErrors.idDocumentType = "Identification document type is required"
    }

    if (formData.idDocumentType && !formData.documentNumber.trim()) {
      newErrors.documentNumber = "Document number is required"
    }

    if (!formData.documentFile && !documentPreview) {
      newErrors.documentFile = "Please upload a digital copy of your identification document"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const dataToSave = {
        ...formData,
        documentFile: null, // Don't store file in localStorage
        documentFileName: formData.documentFileName,
      }
      localStorage.setItem("compliance_owner", JSON.stringify(dataToSave))
      const steps = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
      if (!steps.includes("owner")) {
        steps.push("owner")
        localStorage.setItem("compliance_steps", JSON.stringify(steps))
      }
      setViewMode("review")
    }
  }

  const handleEdit = () => {
    setViewMode("form")
  }

  const handleNext = () => {
    router.push("/dashboard/compliance/account")
  }

  if (viewMode === "review") {
    return (
      <ComplianceAccessGuard step="owner">
        <div className="space-y-6">
        <div>
          <Link href="/dashboard/compliance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Compliance
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Owner - Review</h1>
          <p className="text-muted-foreground mt-1">Review owner information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Owner Information</CardTitle>
                <CardDescription>Owner details and identification</CardDescription>
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
                <Label className="text-muted-foreground">First Name</Label>
                <p className="mt-1 font-medium">{formData.firstName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Name</Label>
                <p className="mt-1 font-medium">{formData.lastName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="mt-1 font-medium">
                  {new Date(formData.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Nationality</Label>
                <p className="mt-1 font-medium">{formData.nationality}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Identification Document Type</Label>
                <p className="mt-1 font-medium">{formData.idDocumentType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Document Number</Label>
                <p className="mt-1 font-medium">{formData.documentNumber}</p>
              </div>
              {documentPreview && (
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Uploaded Document</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">{documentPreview}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleNext}>
                Next: Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </ComplianceAccessGuard>
    )
  }

  return (
    <ComplianceAccessGuard step="owner">
      <div className="space-y-6">
      <div>
        <Link href="/dashboard/compliance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Compliance
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Owner</h1>
        <p className="text-muted-foreground mt-1">Step 3 of 5: Provide owner information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
          <CardDescription>All fields are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className={errors.dateOfBirth ? "border-destructive" : ""}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  placeholder="Ghanaian"
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className={errors.nationality ? "border-destructive" : ""}
                />
                {errors.nationality && (
                  <p className="text-sm text-destructive">{errors.nationality}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idDocumentType">Identification Document *</Label>
              <Select
                value={formData.idDocumentType}
                onValueChange={(value) => handleChange("idDocumentType", value)}
              >
                <SelectTrigger id="idDocumentType" className={errors.idDocumentType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {idDocumentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idDocumentType && (
                <p className="text-sm text-destructive">{errors.idDocumentType}</p>
              )}
            </div>

            {formData.idDocumentType && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">{formData.idDocumentType} Number *</Label>
                  <Input
                    id="documentNumber"
                    placeholder={`Enter your ${formData.idDocumentType} number`}
                    value={formData.documentNumber}
                    onChange={(e) => handleChange("documentNumber", e.target.value)}
                    className={errors.documentNumber ? "border-destructive" : ""}
                  />
                  {errors.documentNumber && (
                    <p className="text-sm text-destructive">{errors.documentNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentFile">Upload Digital Copy of {formData.idDocumentType} *</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      ref={fileInputRef}
                      id="documentFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className={errors.documentFile ? "border-destructive" : ""}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {documentPreview ? "Change File" : "Upload File"}
                    </Button>
                    {documentPreview && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        {documentPreview}
                      </span>
                    )}
                  </div>
                  {errors.documentFile && (
                    <p className="text-sm text-destructive">{errors.documentFile}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Accepted formats: PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>
              </>
            )}

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

