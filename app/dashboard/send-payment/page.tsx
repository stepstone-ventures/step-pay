"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type MerchantRecipient = {
  user_id: string
  business_name: string | null
  email: string | null
  step_tag: string
}

const STEP_TAG_PATTERN = /^@[a-z0-9_]{3,20}$/
const USED_REFERENCES_KEY = "send_payment_reference_history_v1"
const PROCESS_STEPS = [
  "Validating recipient StepTag",
  "Preparing transfer details",
  "Submitting payment",
  "Finalizing transaction",
]

function normalizeStepTag(rawValue: string) {
  const compact = rawValue.trim().toLowerCase().replace(/\s+/g, "")
  const withPrefix = compact.startsWith("@") ? compact : `@${compact}`
  return withPrefix.replace(/[^@a-z0-9_]/g, "")
}

function createTransferReference() {
  const now = new Date()
  const dateToken = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const timeToken = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`
  const randomToken = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `STP-${dateToken}-${timeToken}-${randomToken}`
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getUsedReferences() {
  if (typeof window === "undefined") return new Set<string>()
  try {
    const parsed = JSON.parse(localStorage.getItem(USED_REFERENCES_KEY) || "[]")
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((value) => typeof value === "string"))
  } catch {
    return new Set<string>()
  }
}

function persistUsedReferences(references: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(USED_REFERENCES_KEY, JSON.stringify(Array.from(references)))
}

function createUniqueReference() {
  const usedReferences = getUsedReferences()
  let reference = createTransferReference()

  while (usedReferences.has(reference)) {
    reference = createTransferReference()
  }

  return reference
}

export default function SendPaymentPage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)
  const mountedRef = useRef(true)

  const [recipientInput, setRecipientInput] = useState("")
  const [recipient, setRecipient] = useState<MerchantRecipient | null>(null)
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [recipientLoading, setRecipientLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [note, setNote] = useState("")
  const [reference] = useState(createUniqueReference)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loaderOpen, setLoaderOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const parsedAmount = useMemo(() => Number.parseFloat(amount), [amount])

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const verifyRecipient = async () => {
    const normalizedTag = normalizeStepTag(recipientInput)
    setRecipientInput(normalizedTag)
    setRecipient(null)
    setRecipientError(null)

    if (!STEP_TAG_PATTERN.test(normalizedTag)) {
      setRecipientError("Use a valid StepTag in the format @username.")
      return null
    }

    setRecipientLoading(true)
    try {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from("merchants")
        .select("user_id,business_name,email,step_tag")
        .eq("step_tag", normalizedTag)
        .maybeSingle()

      if (error) {
        if (error.code === "PGRST116") {
          setRecipientError("No StepPay business account found with this StepTag.")
          return null
        }
        setRecipientError("Could not verify StepTag right now. Please try again.")
        return null
      }

      if (!data) {
        setRecipientError("No StepPay business account found with this StepTag.")
        return null
      }

      if (user?.id && data.user_id === user.id) {
        setRecipientError("You cannot send payment to your own StepTag.")
        return null
      }

      setRecipient(data)
      return data
    } finally {
      if (mountedRef.current) {
        setRecipientLoading(false)
      }
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const resolvedRecipient = recipient ?? (await verifyRecipient())
    if (!resolvedRecipient) {
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter a valid amount greater than 0.")
      return
    }

    if (!reference.trim()) {
      setFormError("Reference is required.")
      return
    }

    setSubmitting(true)
    setLoaderOpen(true)
    setCurrentStep(0)

    try {
      for (let step = 0; step < PROCESS_STEPS.length; step++) {
        if (!mountedRef.current) {
          return
        }
        setCurrentStep(step)
        await wait(step === PROCESS_STEPS.length - 1 ? 650 : 850)
      }

      if (!mountedRef.current) {
        return
      }

      setLoaderOpen(false)
      const usedReferences = getUsedReferences()
      usedReferences.add(reference)
      persistUsedReferences(usedReferences)
      localStorage.setItem(
        "send_payment_last_transfer",
        JSON.stringify({
          recipientStepTag: resolvedRecipient.step_tag,
          amount: parsedAmount,
          currency,
          reference,
          note,
          createdAt: new Date().toISOString(),
        })
      )
      router.push("/dashboard/transactions")
    } catch {
      if (mountedRef.current) {
        setFormError("Could not complete this payment right now. Please try again.")
        setLoaderOpen(false)
      }
    } finally {
      if (mountedRef.current) {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="space-y-6 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Send Payment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send funds to another StepPay business account using StepTag only.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Recipient Method</Label>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium">
                StepTag (@username)
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient StepTag</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="recipient"
                  value={recipientInput}
                  onChange={(event) => {
                    setRecipientInput(normalizeStepTag(event.target.value))
                    setRecipient(null)
                    setRecipientError(null)
                  }}
                  placeholder="@business"
                  autoComplete="off"
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void verifyRecipient()
                  }}
                  disabled={recipientLoading}
                  className="h-10"
                >
                  {recipientLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              {recipientError ? (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {recipientError}
                </p>
              ) : null}
              {recipient ? (
                <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/5 px-3 py-2 text-xs">
                  <p className="flex items-center gap-1 font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recipient verified
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {recipient.business_name || recipient.email || recipient.step_tag} ({recipient.step_tag})
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="GHS">GHS</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="ZAR">ZAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={reference}
                readOnly
                aria-readonly="true"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated neo-bank reference. This value is fixed and cannot be edited.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Narration (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 160))}
                placeholder="Payment for invoice INV-001"
                className="min-h-[90px]"
              />
            </div>

            {formError ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <div className="flex items-center justify-end border-t pt-4">
              <Button type="submit" disabled={submitting} className="h-10 px-5">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <MultiStepLoader
        open={loaderOpen}
        title="Sending payment"
        description="Please keep this window open while we process your transfer."
        steps={PROCESS_STEPS}
        currentStep={currentStep}
      />
    </div>
  )
}
