"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Edit, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ComplianceAccessGuard } from "@/components/compliance/access-guard"

type AccountType = "Card" | "Bank Account" | "Mobile Money"

type BankRule = {
  name: string
  prefixes: string[]
}

type BankDirectory = {
  countryAliases: string[]
  accountNumberRegex: RegExp
  accountNumberHint: string
  banks: BankRule[]
  mobileMoneyProviders: string[]
}

const accountTypes: AccountType[] = ["Card", "Bank Account", "Mobile Money"]

const BANK_DIRECTORIES: BankDirectory[] = [
  {
    countryAliases: ["ghana"],
    accountNumberRegex: /^\d{10}$/,
    accountNumberHint: "10 digits",
    banks: [
      { name: "GCB Bank", prefixes: ["001", "002"] },
      { name: "Ecobank Ghana", prefixes: ["003", "004"] },
      { name: "CalBank", prefixes: ["005"] },
      { name: "Fidelity Bank Ghana", prefixes: ["006"] },
      { name: "Stanbic Bank Ghana", prefixes: ["007"] },
      { name: "Zenith Bank Ghana", prefixes: ["008"] },
    ],
    mobileMoneyProviders: ["MTN", "Telecel", "AirtelTigo"],
  },
  {
    countryAliases: ["nigeria"],
    accountNumberRegex: /^\d{10}$/,
    accountNumberHint: "10 digits",
    banks: [
      { name: "First Bank of Nigeria", prefixes: ["011"] },
      { name: "United Bank for Africa (UBA)", prefixes: ["033"] },
      { name: "Access Bank", prefixes: ["044"] },
      { name: "Guaranty Trust Bank (GTBank)", prefixes: ["058"] },
      { name: "Zenith Bank", prefixes: ["057"] },
    ],
    mobileMoneyProviders: ["MTN MoMo", "Airtel Money", "PalmPay"],
  },
  {
    countryAliases: ["kenya"],
    accountNumberRegex: /^\d{10,12}$/,
    accountNumberHint: "10 to 12 digits",
    banks: [
      { name: "KCB Bank Kenya", prefixes: ["01"] },
      { name: "Equity Bank Kenya", prefixes: ["03"] },
      { name: "Co-operative Bank of Kenya", prefixes: ["06"] },
      { name: "NCBA Bank Kenya", prefixes: ["11"] },
    ],
    mobileMoneyProviders: ["M-Pesa", "Airtel Money"],
  },
]

const DEFAULT_BANK_DIRECTORY: BankDirectory = {
  countryAliases: [],
  accountNumberRegex: /^\d{6,18}$/,
  accountNumberHint: "6 to 18 digits",
  banks: [],
  mobileMoneyProviders: ["MTN", "Airtel Money", "Telecel"],
}

const normalizeCountry = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")

const getBankDirectoryForCountry = (country: string): BankDirectory => {
  const normalized = normalizeCountry(country)
  if (!normalized) return DEFAULT_BANK_DIRECTORY

  return (
    BANK_DIRECTORIES.find((directory) =>
      directory.countryAliases.some((alias) => normalized.includes(alias))
    ) ?? DEFAULT_BANK_DIRECTORY
  )
}

const detectBankByAccountNumber = (accountNumber: string, banks: BankRule[]) => {
  const digits = accountNumber.replace(/\D/g, "")
  if (!digits) return null

  return (
    banks.find((bank) => bank.prefixes.some((prefix) => digits.startsWith(prefix)))?.name ?? null
  )
}

const detectCardBrand = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, "")
  if (digits.startsWith("4")) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "American Express"
  if (/^6/.test(digits)) return "Discover"
  return "Card"
}

const isValidLuhn = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, "")
  let sum = 0
  let shouldDouble = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits[i] || "0", 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }

  return digits.length >= 12 && digits.length <= 19 && sum % 10 === 0
}

const isValidCardExpiry = (expiry: string) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return false
  const [month, year] = expiry.split("/")
  const mm = Number.parseInt(month || "0", 10)
  const yy = Number.parseInt(year || "0", 10)
  if (!mm || Number.isNaN(yy)) return false

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear() % 100

  if (yy < currentYear) return false
  if (yy === currentYear && mm < currentMonth) return false
  return true
}

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim()

const maskCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "")
  if (!digits) return "N/A"
  const lastFour = digits.slice(-4)
  return `**** **** **** ${lastFour}`
}

export default function AccountPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"form" | "review">("form")
  const [countryFromContact, setCountryFromContact] = useState("")
  const [formData, setFormData] = useState({
    accountType: "",
    bankName: "",
    bankAccountNumber: "",
    mobileMoneyProvider: "",
    mobileMoneyPhone: "",
    cardNumber: "",
    cardExpiry: "",
    nameOnAccount: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const bankDirectory = useMemo(
    () => getBankDirectoryForCountry(countryFromContact),
    [countryFromContact]
  )

  const matchedBankName = useMemo(() => {
    if (formData.accountType !== "Bank Account") return null
    if (bankDirectory.banks.length === 0) return null
    return detectBankByAccountNumber(formData.bankAccountNumber, bankDirectory.banks)
  }, [bankDirectory.banks, formData.accountType, formData.bankAccountNumber])

  const cardBrand = useMemo(() => detectCardBrand(formData.cardNumber), [formData.cardNumber])

  useEffect(() => {
    let detectedCountry = ""

    try {
      const contactSaved = localStorage.getItem("compliance_contact")
      if (contactSaved) {
        const parsedContact = JSON.parse(contactSaved)
        if (typeof parsedContact?.country === "string") {
          detectedCountry = parsedContact.country
        }
      }
    } catch {
      // Keep fallback below.
    }

    if (!detectedCountry) {
      try {
        const signupSaved = localStorage.getItem("signup_data")
        if (signupSaved) {
          const parsedSignup = JSON.parse(signupSaved)
          if (typeof parsedSignup?.country === "string") {
            detectedCountry = parsedSignup.country
          }
        }
      } catch {
        // Keep empty fallback.
      }
    }

    setCountryFromContact(detectedCountry)

    const saved = localStorage.getItem("compliance_account")
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      setFormData((previous) => ({
        ...previous,
        ...parsed,
      }))
      setViewMode("review")
    } catch {
      // Ignore invalid saved payload.
    }
  }, [])

  useEffect(() => {
    if (formData.accountType !== "Bank Account") return
    if (bankDirectory.banks.length === 0) return

    const nextBankName = matchedBankName ?? ""
    setFormData((previous) => {
      if (previous.bankName === nextBankName) return previous
      return { ...previous, bankName: nextBankName }
    })
  }, [bankDirectory.banks.length, formData.accountType, matchedBankName])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: "" }))
    }
  }

  const handleAccountTypeChange = (value: string) => {
    const normalizedType = accountTypes.includes(value as AccountType) ? (value as AccountType) : ""
    setFormData((previous) => ({
      ...previous,
      accountType: normalizedType,
      bankName: "",
      bankAccountNumber: "",
      mobileMoneyProvider: "",
      mobileMoneyPhone: "",
      cardNumber: "",
      cardExpiry: "",
    }))
    setErrors({})
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{7,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountType) {
      newErrors.accountType = "Account type is required"
    }

    if (formData.accountType === "Bank Account") {
      if (!countryFromContact.trim()) {
        newErrors.accountType = "Set your country in Compliance Contact before adding a bank account."
      }

      const bankAccountDigits = formData.bankAccountNumber.replace(/\D/g, "")
      if (!bankAccountDigits) {
        newErrors.bankAccountNumber = "Bank account number is required"
      } else if (!bankDirectory.accountNumberRegex.test(bankAccountDigits)) {
        newErrors.bankAccountNumber = `Use a valid account number format for ${countryFromContact || "the selected country"} (${bankDirectory.accountNumberHint}).`
      } else if (bankDirectory.banks.length > 0 && !matchedBankName) {
        newErrors.bankAccountNumber = "We could not match this account number to a supported bank for your country."
      }

      if (bankDirectory.banks.length === 0 && !formData.bankName.trim()) {
        newErrors.bankName = "Bank name is required"
      }
    }

    if (formData.accountType === "Mobile Money") {
      if (!formData.mobileMoneyProvider) {
        newErrors.mobileMoneyProvider = "Mobile money provider is required"
      }
      if (!formData.mobileMoneyPhone.trim()) {
        newErrors.mobileMoneyPhone = "Phone number is required"
      } else if (!validatePhone(formData.mobileMoneyPhone)) {
        newErrors.mobileMoneyPhone = "Please enter a valid phone number in international format."
      }
    }

    if (formData.accountType === "Card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required"
      } else if (!isValidLuhn(formData.cardNumber)) {
        newErrors.cardNumber = "Enter a valid card number."
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = "Card expiry is required"
      } else if (!isValidCardExpiry(formData.cardExpiry)) {
        newErrors.cardExpiry = "Enter a valid expiry in MM/YY format."
      }
    }

    if (!formData.nameOnAccount.trim()) {
      newErrors.nameOnAccount = "Name on account is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    localStorage.setItem("compliance_account", JSON.stringify(formData))
    const steps = JSON.parse(localStorage.getItem("compliance_steps") || "[]")
    if (!steps.includes("account")) {
      steps.push("account")
      localStorage.setItem("compliance_steps", JSON.stringify(steps))
    }
    window.dispatchEvent(new Event("dashboardNotificationsChanged"))
    setViewMode("review")
  }

  const handleEdit = () => setViewMode("form")
  const handleNext = () => router.push("/dashboard/compliance/service-agreement")

  if (viewMode === "review") {
    return (
      <ComplianceAccessGuard currentStep="account">
        <div className="space-y-6">
          <div className="pt-6">
            <div className="mb-6 flex items-center">
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
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Card, bank, or mobile money account details</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Account Type</Label>
                    <p className="mt-1 font-medium">{formData.accountType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payout Country</Label>
                    <p className="mt-1 font-medium">{countryFromContact || "Not set"}</p>
                  </div>

                  {formData.accountType === "Card" ? (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Card Type</Label>
                        <p className="mt-1 font-medium">{cardBrand}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Card Number</Label>
                        <p className="mt-1 font-medium">{maskCardNumber(formData.cardNumber)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Card Expiry</Label>
                        <p className="mt-1 font-medium">{formData.cardExpiry}</p>
                      </div>
                    </>
                  ) : null}

                  {formData.accountType === "Bank Account" ? (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Bank Name</Label>
                        <p className="mt-1 font-medium">{formData.bankName || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Bank Account Number</Label>
                        <p className="mt-1 font-medium">{formData.bankAccountNumber}</p>
                      </div>
                    </>
                  ) : null}

                  {formData.accountType === "Mobile Money" ? (
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
                  ) : null}

                  <div>
                    <Label className="text-muted-foreground">Name on Account</Label>
                    <p className="mt-1 font-medium">{formData.nameOnAccount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
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
        </div>
      </ComplianceAccessGuard>
    )
  }

  return (
    <ComplianceAccessGuard currentStep="account">
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
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Select Card, Bank Account, or Mobile Money. Bank matching uses your country from Compliance Contact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select value={formData.accountType} onValueChange={handleAccountTypeChange}>
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
                {errors.accountType ? <p className="text-sm text-destructive">{errors.accountType}</p> : null}
              </div>

              {formData.accountType === "Card" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(event) => handleChange("cardNumber", formatCardNumber(event.target.value))}
                      className={errors.cardNumber ? "border-destructive" : ""}
                    />
                    {formData.cardNumber ? (
                      <p className="text-sm text-muted-foreground">Detected card type: {cardBrand}</p>
                    ) : null}
                    {errors.cardNumber ? <p className="text-sm text-destructive">{errors.cardNumber}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Card Expiry (MM/YY) *</Label>
                    <Input
                      id="cardExpiry"
                      type="text"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={(event) => handleChange("cardExpiry", event.target.value.replace(/[^\d/]/g, "").slice(0, 5))}
                      className={errors.cardExpiry ? "border-destructive" : ""}
                    />
                    {errors.cardExpiry ? <p className="text-sm text-destructive">{errors.cardExpiry}</p> : null}
                  </div>
                </>
              ) : null}

              {formData.accountType === "Bank Account" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="country">Payout Country</Label>
                    <Input id="country" value={countryFromContact || "Not set"} readOnly />
                    <p className="text-sm text-muted-foreground">
                      This is synced from Compliance Contact and drives account format + bank matching.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
                    <Input
                      id="bankAccountNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder={`Enter account number (${bankDirectory.accountNumberHint})`}
                      value={formData.bankAccountNumber}
                      onChange={(event) =>
                        handleChange("bankAccountNumber", event.target.value.replace(/\D/g, "").slice(0, 18))
                      }
                      className={errors.bankAccountNumber ? "border-destructive" : ""}
                    />
                    {errors.bankAccountNumber ? (
                      <p className="text-sm text-destructive">{errors.bankAccountNumber}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Neobank matching validates the account number against your selected country format.
                      </p>
                    )}
                  </div>

                  {bankDirectory.banks.length > 0 ? (
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Matched Bank</Label>
                      <Input id="bankName" value={matchedBankName || "No match yet"} readOnly />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        type="text"
                        placeholder="Enter bank name"
                        value={formData.bankName}
                        onChange={(event) => handleChange("bankName", event.target.value)}
                        className={errors.bankName ? "border-destructive" : ""}
                      />
                      {errors.bankName ? <p className="text-sm text-destructive">{errors.bankName}</p> : null}
                    </div>
                  )}
                </>
              ) : null}

              {formData.accountType === "Mobile Money" ? (
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
                        {bankDirectory.mobileMoneyProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mobileMoneyProvider ? (
                      <p className="text-sm text-destructive">{errors.mobileMoneyProvider}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileMoneyPhone">Phone Number *</Label>
                    <Input
                      id="mobileMoneyPhone"
                      type="tel"
                      placeholder="Enter phone number in international format"
                      value={formData.mobileMoneyPhone}
                      onChange={(event) => handleChange("mobileMoneyPhone", event.target.value)}
                      className={errors.mobileMoneyPhone ? "border-destructive" : ""}
                    />
                    {errors.mobileMoneyPhone ? (
                      <p className="text-sm text-destructive">{errors.mobileMoneyPhone}</p>
                    ) : null}
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="nameOnAccount">Name on Account *</Label>
                <Input
                  id="nameOnAccount"
                  type="text"
                  placeholder="Enter name as it appears on the account"
                  value={formData.nameOnAccount}
                  onChange={(event) => handleChange("nameOnAccount", event.target.value)}
                  className={errors.nameOnAccount ? "border-destructive" : ""}
                />
                {errors.nameOnAccount ? <p className="text-sm text-destructive">{errors.nameOnAccount}</p> : null}
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
