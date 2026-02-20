"use client"
import { Suspense, useState, useEffect, useRef, type SVGProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { LiquidButton } from "@/components/ui/liquid-button"
import { IconButton } from "@/components/ui/icon-button"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { FluidCursor } from "@/components/ui/fluid-cursor"
import { AnimateTabs, AnimateTabsContent, AnimateTabsList, AnimateTabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import { ShareButton } from "@/components/animate-ui/components/community/share-button"
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar"
import { MobileTopMenu } from "@/components/site/mobile-top-menu"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { getAuthRedirectOrigin } from "@/lib/auth/get-auth-redirect-origin"
import { ChevronDown, Eye, EyeOff } from "lucide-react"

const AUTH_COOKIE_SYNC_ATTEMPTS = 8
const AUTH_COOKIE_SYNC_DELAY_MS = 120

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [activeTab, setActiveTab] = useState("account")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  const getSupabaseClient = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }

  const waitForSessionPersistence = async (expectedUserId?: string) => {
    const supabase = getSupabaseClient()
    for (let attempt = 0; attempt < AUTH_COOKIE_SYNC_ATTEMPTS; attempt += 1) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user && (!expectedUserId || session.user.id === expectedUserId)) {
        return true
      }

      await new Promise((resolve) => setTimeout(resolve, AUTH_COOKIE_SYNC_DELAY_MS))
    }

    return false
  }

  useEffect(() => {
    const confirmed = searchParams.get("confirmed")
    const signup = searchParams.get("signup")
    const type = searchParams.get("type")
    const error = searchParams.get("error")
    const code = searchParams.get("code")
    const tokenHash = searchParams.get("token_hash")
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    const errorDescription = searchParams.get("error_description")

    if (code || tokenHash || (token && email)) {
      const params = new URLSearchParams()
      if (code) params.set("code", code)
      if (tokenHash) params.set("token_hash", tokenHash)
      if (token) params.set("token", token)
      if (email) params.set("email", email)
      if (type) params.set("type", type)
      router.replace(`/auth/confirm?${params.toString()}`)
      return
    }

    if (confirmed === "true" || signup === "success" || type === "signup") {
      setSuccessMessage(
        "Your account has been successfully verified! Please sign in with your credentials to continue."
      )
    }

    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const hashAccessToken = hashParams.get("access_token")
      const hashRefreshToken = hashParams.get("refresh_token")
      const hashType = hashParams.get("type")

      if (hashAccessToken && hashRefreshToken) {
        const params = new URLSearchParams()
        params.set("access_token", hashAccessToken)
        params.set("refresh_token", hashRefreshToken)
        if (hashType) params.set("type", hashType)
        router.replace(`/auth/confirm?${params.toString()}`)
        return
      }

      if (hashType === "signup" || hashParams.has("access_token")) {
        setSuccessMessage(
          "Your account has been successfully verified! Please sign in with your credentials to continue."
        )
      }
    }

    if (error === "verification_failed") {
      setErrors({
        general: errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
          : "Email verification failed. Please try signing up again or contact support.",
      })
    }

    if (error === "invalid_link") {
      setErrors({ general: "This verification link is invalid or expired. Please request a new verification email." })
    }

    if (error === "unconfirmed") {
      const emailParam = searchParams.get("email")
      setErrors({
        general: `Please confirm your email (${emailParam || "your email"}) before logging in.`,
      })
    }

    if (error === "unauthorized") {
      setErrors({ general: "Please sign in to continue." })
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccessMessage(null)

    if (!email || !password) {
      setActiveTab(!email ? "account" : "password")
      setErrors({ general: "Email and password are required" })
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrors({
            general: "Your email is not verified yet. Please click the confirmation link from your inbox first.",
          })
          setLoading(false)
          return
        }

        setErrors({ general: error.message })
        setLoading(false)
        return
      }

      if (!data.session) {
        setErrors({ general: "Sign-in session could not be created. Please try again." })
        setLoading(false)
        return
      }

      const sessionPersisted = await waitForSessionPersistence(data.user?.id)
      if (!sessionPersisted) {
        setErrors({ general: "Sign-in succeeded, but session sync is delayed. Please try again." })
        setLoading(false)
        return
      }

      // Successful login
      const complianceComplete = localStorage.getItem("compliance_complete") === "true"
      let complianceSteps: string[] = []
      try {
        const storedSteps = localStorage.getItem("compliance_steps")
        if (storedSteps) {
          const parsed = JSON.parse(storedSteps)
          if (Array.isArray(parsed)) {
            complianceSteps = parsed
          }
        }
      } catch {
        complianceSteps = []
      }

      const steps = ["profile", "contact", "owner", "account", "service-agreement"]
      const nextStep = steps.find((step) => !complianceSteps.includes(step))

      const targetRoute = !complianceComplete && nextStep
        ? `/dashboard/compliance/${nextStep}`
        : "/dashboard"

      // Force a full navigation so middleware reads the freshly written auth cookies.
      window.location.assign(targetRoute)
    } catch (err: any) {
      setErrors({ general: "An unexpected error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
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

      if (error) {
        throw error
      }

      if (data.url) {
        window.location.assign(data.url)
        return
      }

      throw new Error("Could not start Google sign in.")
    } catch (err: any) {
      setErrors({ general: err.message || "Could not start Google sign in." })
      setGoogleLoading(false)
    }
  }

  const tabDescription =
    activeTab === "account"
      ? "Fill in your business details to get started."
      : "Your password should be at least 8 characters, consisting of letters, at least one number and at least one special character."

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <FluidCursor className="z-0" />
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
            <a href="mailto:support@steppay.com?subject=StepPay%20Contact%20Sales">
              <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                Contact Sales
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
              <span className="fx-shield">Welcome back</span>
            </h1>
            <p className="text-muted-foreground">
              <span className="fx-shield">Sign in to your StepPay account</span>
            </p>
            <UserPresenceAvatar className="mt-4 mx-auto" />
          </div>

          <Card className="relative overflow-hidden border-border/50 shadow-lg">
            <BorderBeam duration={15} />
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <p className="text-sm text-muted-foreground">{tabDescription}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimateTabs value={activeTab} onValueChange={setActiveTab}>
                  <AnimateTabsList className="grid-cols-2 w-full">
                    <AnimateTabsTrigger value="account">Account</AnimateTabsTrigger>
                    <AnimateTabsTrigger value="password">Password</AnimateTabsTrigger>
                  </AnimateTabsList>

                  <AnimateTabsContent value="account" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </AnimateTabsContent>

                  <AnimateTabsContent value="password" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={errors.password ? "border-destructive pr-10" : "pr-10"}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          hoverScale={1}
                          tapScale={1}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 leading-none"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </span>
                        </IconButton>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked)}
                          />
                          <Label htmlFor="remember" className="font-normal cursor-pointer text-sm">
                            Remember me
                          </Label>
                        </div>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </AnimateTabsContent>
                </AnimateTabs>

                {successMessage && (
                  <p className="text-sm text-green-600 text-center font-medium">
                    {successMessage}
                  </p>
                )}

                {errors.general && (
                  <p className="text-sm text-destructive text-center">
                    {errors.general}
                  </p>
                )}

                <LiquidButton type="submit" className="w-full py-3 text-lg" disabled={loading || googleLoading}>
                  {loading ? "Signing in..." : "Sign In"}
                </LiquidButton>

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
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 text-lg border border-border/60"
                  disabled={loading || googleLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5 shrink-0" />
                  {googleLoading ? "Redirecting..." : "Sign in with Google"}
                </LiquidButton>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Sign up
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
    </div>
  )
}
