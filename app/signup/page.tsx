"use client"
import { Suspense, useEffect, useRef, useState, type SVGProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidButton } from "@/components/ui/liquid-button"
import { FluidCursor } from "@/components/ui/fluid-cursor"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/components/buttons/ripple"
import { ShareButton } from "@/components/animate-ui/components/community/share-button"
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar"
import { OtpVerificationDialog } from "@/components/auth/otp-verification-dialog"
import { MobileTopMenu } from "@/components/site/mobile-top-menu"
import { PageSkeletonOverlay } from "@/components/ui/page-skeleton-overlay"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { getAuthRedirectOrigin } from "@/lib/auth/get-auth-redirect-origin"
import { ChevronDown } from "lucide-react"

const RESEND_COOLDOWN_SECONDS = 120
const SIGNUP_COOLDOWN_UNTIL_KEY = "auth_signup_otp_cooldown_until"
const SIGNUP_COOLDOWN_EMAIL_KEY = "auth_signup_otp_cooldown_email"
const STEP_PAY_PRO_URL = "/step-pay-pro"

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M22 12.3c0-.8-.1-1.4-.2-2.1H12v4h5.6c-.1 1-.8 2.5-2.3 3.5l3.5 2.7c2.1-1.9 3.2-4.8 3.2-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.5-2.7c-.9.7-2.2 1.2-3.4 1.2-2.8 0-5.2-1.9-6.1-4.4l-3.6 2.8A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M5.9 13.6c-.2-.7-.3-1.1-.3-1.6s.1-1 .3-1.6l-3.6-2.8A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l2.8-2.1Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.9c1.7 0 3.2.6 4.3 1.7L19.1 5C17.2 3.2 14.8 2 12 2a10 10 0 0 0-8.8 5.6l3.6 2.8c.9-2.5 3.3-4.5 6.2-4.5Z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignupPageContent />
    </Suspense>
  )
}

function SignupPageContent() {
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otpEmail, setOtpEmail] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpChecking, setOtpChecking] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  const getSupabaseClient = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedEmail = window.localStorage.getItem(SIGNUP_COOLDOWN_EMAIL_KEY)
    if (storedEmail) {
      setOtpEmail(storedEmail)
      setEmail((current) => current || storedEmail)
    }

    const rawExpiresAt = window.localStorage.getItem(SIGNUP_COOLDOWN_UNTIL_KEY)
    if (!rawExpiresAt) return

    const parsedExpiresAt = Number(rawExpiresAt)
    if (!Number.isFinite(parsedExpiresAt) || parsedExpiresAt <= Date.now()) {
      window.localStorage.removeItem(SIGNUP_COOLDOWN_UNTIL_KEY)
      window.localStorage.removeItem(SIGNUP_COOLDOWN_EMAIL_KEY)
      return
    }

    setCooldownExpiresAt(parsedExpiresAt)
    setCooldownRemaining(Math.max(0, Math.ceil((parsedExpiresAt - Date.now()) / 1000)))
  }, [])

  useEffect(() => {
    if (cooldownExpiresAt === null) return

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((cooldownExpiresAt - Date.now()) / 1000))
      setCooldownRemaining(remaining)

      if (remaining <= 0) {
        setCooldownExpiresAt(null)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(SIGNUP_COOLDOWN_UNTIL_KEY)
          window.localStorage.removeItem(SIGNUP_COOLDOWN_EMAIL_KEY)
        }
      }
    }

    updateRemaining()
    const interval = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(interval)
  }, [cooldownExpiresAt])

  const startCooldownForEmail = (targetEmail: string) => {
    const expiresAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000
    setCooldownExpiresAt(expiresAt)
    setCooldownRemaining(RESEND_COOLDOWN_SECONDS)
    setOtpEmail(targetEmail)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIGNUP_COOLDOWN_UNTIL_KEY, String(expiresAt))
      window.localStorage.setItem(SIGNUP_COOLDOWN_EMAIL_KEY, targetEmail)
    }
  }

  useEffect(() => {
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    if (error === "verification_failed") {
      setErrors({
        general: errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
          : "Email verification failed. Please request another verification code.",
      })
      return
    }

    if (error === "invalid_link") {
      setErrors({ general: "This verification link is invalid or expired. Please request a new verification code." })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccessMessage(null)
    setOtpChecking(false)
    setOtpVerifying(false)
    setOtpError(null)

    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const resendLocked = cooldownRemaining > 0
    const securityCooldownMessage = `For security purposes, you can only request this after ${cooldownRemaining} seconds.`

    if (resendLocked) {
      setErrors({ general: securityCooldownMessage })
      setLoading(false)
      return
    }

    if (!normalizedEmail) {
      setErrors({ email: "Email is required" })
      setLoading(false)
      return
    }

    if (!emailRegex.test(normalizedEmail)) {
      setErrors({ email: "Please enter a valid email address" })
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        setErrors({ general: error.message || "Could not send verification code. Please try again." })
        setLoading(false)
        return
      }

      startCooldownForEmail(normalizedEmail)
      setOtpDialogOpen(true)
      setSuccessMessage(`We sent a 6-digit verification code to ${normalizedEmail}.`)
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpDialogOpenChange = (open: boolean) => {
    if (!open && (otpChecking || otpVerifying)) return
    setOtpDialogOpen(open)
    if (!open) {
      setOtpError(null)
      setOtpChecking(false)
      setOtpVerifying(false)
    }
  }

  const handleOtpComplete = async (code: string) => {
    if (!otpEmail) {
      setOtpError("Please request a new verification code.")
      return
    }

    setOtpChecking(true)
    setOtpVerifying(false)
    setOtpError(null)

    try {
      const confirmParams = new URLSearchParams()
      confirmParams.set("token", code)
      confirmParams.set("email", otpEmail)
      confirmParams.set("next", "/dashboard")
      confirmParams.set("error_redirect", "/signup")
      confirmParams.set("mode", "json")

      const response = await fetch(`/auth/confirm?${confirmParams.toString()}`, {
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setOtpError(
          typeof payload?.error_description === "string"
            ? payload.error_description
            : "Invalid verification code. Please try again."
        )
        setOtpChecking(false)
        return
      }

      const redirectTo = typeof payload?.redirectTo === "string" ? payload.redirectTo : "/dashboard"

      setOtpChecking(false)
      setOtpVerifying(true)
      try {
        window.sessionStorage.setItem("auth_dashboard_loader_pending", String(Date.now()))
      } catch {
        // Continue even if sessionStorage is unavailable.
      }
      window.location.assign(redirectTo)
    } catch {
      setOtpChecking(false)
      setOtpError("Could not verify code. Please try again.")
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setErrors({})
    setSuccessMessage(null)

    try {
      const supabase = getSupabaseClient()
      const redirectUrl = new URL("/auth/confirm", getAuthRedirectOrigin())
      redirectUrl.searchParams.set("next", "/dashboard")

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl.toString(),
        },
      })

      if (error) throw error

      if (data.url) {
        window.location.assign(data.url)
        return
      }

      throw new Error("Could not start Google sign up.")
    } catch (err: any) {
      setErrors({ general: err.message || "Could not start Google sign up." })
      setGoogleLoading(false)
    }
  }

  const handleEnterVerification = () => {
    const normalizedEmail = (otpEmail || email).trim().toLowerCase()
    if (!normalizedEmail) {
      setErrors({ email: "Email is required" })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      setErrors({ email: "Please enter a valid email address" })
      return
    }

    setOtpEmail(normalizedEmail)
    setOtpError(null)
    setOtpChecking(false)
    setOtpVerifying(false)
    setOtpDialogOpen(true)
  }

  const tabDescription = "Enter your email to receive a verification code."
  const isResendLocked = cooldownRemaining > 0
  const securityCooldownMessage = `For security purposes, you can only request this after ${cooldownRemaining} seconds.`
  const sendButtonLabel = loading
    ? "Sending Verification Code..."
    : isResendLocked
      ? `Send Verification Code (${cooldownRemaining}s)`
      : "Send Verification Code"
  const showAuthLoader = otpVerifying

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <FluidCursor className="hidden sm:block z-0" />
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-1.5">
            <div className="relative h-10 w-14">
              <Image
                src="/steppay-logo-liquid.png?v=3"
                alt="StepPay logo"
                fill
                sizes="64px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-lg sm:text-xl tracking-tight">StepPay</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-4">
            <ThemeTogglerButton variant="secondary" size="default" className="border border-border/60" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                  Receive Payments
                  <ChevronDown className="ml-2 h-4 w-4" />
                </LiquidButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-72 z-[120]">
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full cursor-pointer">
                    Request Money from Anyone Anywhere
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full cursor-pointer">
                    Charge Clients In-Shop
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full cursor-pointer">
                    Integrate Online Checkout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href={STEP_PAY_PRO_URL}>
              <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                StepPay Pro
              </LiquidButton>
            </a>
            <ShareButton />
          </div>
          <MobileTopMenu className="sm:hidden" contactSalesAsMenuRow />
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="relative mx-auto mb-5 h-16 aspect-[1597/1172]">
              <Image
                src="/steppay-logo-liquid.png?v=3"
                alt="StepPay logo"
                fill
                sizes="88px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="fx-shield">Create your account</span>
            </h1>
            <p className="text-muted-foreground">
              <span className="fx-shield">Start accepting payments in minutes</span>
            </p>
            <UserPresenceAvatar className="mt-4 mx-auto" />
          </div>

          <Card className="relative overflow-hidden border-border/50 shadow-lg">
            <BorderBeam duration={15} />
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <p className="text-sm text-muted-foreground">{tabDescription}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }))
                      }
                    }}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {successMessage && (
                  <p className="text-sm text-foreground text-center font-medium">
                    {successMessage}
                  </p>
                )}

                {errors.general && (
                  <p className="text-sm text-destructive text-center">
                    {errors.general}
                  </p>
                )}

                <LiquidButton type="submit" className="hidden w-full py-3 text-lg sm:inline-flex" disabled={loading || googleLoading || isResendLocked}>
                  {sendButtonLabel}
                </LiquidButton>
                <RippleButton type="submit" className="w-full py-3 text-lg sm:hidden" disabled={loading || googleLoading || isResendLocked}>
                  {sendButtonLabel}
                  <RippleButtonRipples />
                </RippleButton>
                {isResendLocked && !otpDialogOpen && (
                  <>
                    <p className="text-center text-xs text-muted-foreground">{securityCooldownMessage}</p>
                    <LiquidButton
                      type="button"
                      onClick={handleEnterVerification}
                      className="hidden w-full py-2 text-sm sm:inline-flex"
                      disabled={otpVerifying}
                    >
                      Enter Verification Code
                    </LiquidButton>
                    <RippleButton
                      type="button"
                      onClick={handleEnterVerification}
                      className="w-full py-2 text-sm sm:hidden"
                      disabled={otpVerifying}
                    >
                      Enter Verification Code
                      <RippleButtonRipples />
                    </RippleButton>
                  </>
                )}

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <LiquidButton
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="hidden w-full py-3 text-lg border border-border/60 sm:inline-flex"
                  disabled={loading || googleLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5 shrink-0" />
                  {googleLoading ? "Redirecting..." : "Sign up with Google"}
                </LiquidButton>
                <RippleButton
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  className="w-full py-3 text-lg border border-border/60 sm:hidden"
                  disabled={loading || googleLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5 shrink-0" />
                  {googleLoading ? "Redirecting..." : "Sign up with Google"}
                  <RippleButtonRipples />
                </RippleButton>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-8 relative z-20 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 StepPay Incorporated. All rights reserved.</p>
        </div>
      </footer>
      <PageSkeletonOverlay visible={showAuthLoader} variant="auth" durationMs={null} />
      <OtpVerificationDialog
        email={otpEmail}
        error={otpError}
        isVerifying={otpChecking || otpVerifying}
        onComplete={handleOtpComplete}
        onOpenChange={handleOtpDialogOpenChange}
        open={otpDialogOpen}
      />
    </div>
  )
}
