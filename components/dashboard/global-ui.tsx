"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type SVGProps } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Ghost, Instagram, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { LiquidButton } from "@/components/ui/liquid-button"
import { cn } from "@/lib/utils"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transactions": "Transactions",
  "/dashboard/customers": "Customers",
  "/dashboard/send-payment": "Send Payment",
  "/dashboard/refunds": "Refunds",
  "/dashboard/payouts": "Pending",
  "/dashboard/subscribers": "Subscribers",
  "/dashboard/plans": "Plans",
  "/dashboard/subscriptions": "Subscriptions",
  "/dashboard/payment-pages": "Payment Pages",
  "/dashboard/notifications": "Notifications",
  "/dashboard/products": "Products",
  "/dashboard/storefronts": "Storefronts",
  "/dashboard/orders": "Orders",
  "/dashboard/invoices": "Invoices",
  "/dashboard/settings": "Settings",
  "/dashboard/payments": "Collect Payment",
  "/dashboard/compliance": "Compliance",
  "/dashboard/compliance/profile": "Compliance",
  "/dashboard/compliance/contact": "Compliance",
  "/dashboard/compliance/owner": "Compliance",
  "/dashboard/compliance/account": "Compliance",
  "/dashboard/compliance/service-agreement": "Compliance",
}

type SharePlatform = {
  id: "instagram" | "x" | "snapchat"
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

function XBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4h4l10 16h-4z" />
      <path d="M19 4h-4L5 20h4z" />
    </svg>
  )
}

const SHARE_ITEMS: SharePlatform[] = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com", icon: Instagram },
  { id: "x", label: "X", href: "https://x.com", icon: XBrandIcon },
  { id: "snapchat", label: "Snapchat", href: "https://www.snapchat.com", icon: Ghost },
]

const submenuTransition = { type: "spring", stiffness: 120, damping: 16, mass: 1 } as const
const STEP_TAG_PATTERN = /^@[a-z0-9_]{3,20}$/

function normalizeStepTag(rawValue: string) {
  const compact = rawValue.trim().toLowerCase().replace(/\s+/g, "")
  const withPrefix = compact.startsWith("@") ? compact : `@${compact}`
  return withPrefix.replace(/[^@a-z0-9_]/g, "")
}

export function GlobalUI({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const [businessName, setBusinessName] = useState("StepPay Merchant")
  const [userEmail, setUserEmail] = useState("merchant@example.com")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [pictureMenuOpen, setPictureMenuOpen] = useState(false)
  const [stepTagMenuOpen, setStepTagMenuOpen] = useState(false)
  const [referMenuOpen, setReferMenuOpen] = useState(false)
  const [stepTag, setStepTag] = useState<string>("")
  const [stepTagInput, setStepTagInput] = useState<string>("")
  const [stepTagSaving, setStepTagSaving] = useState(false)
  const [stepTagError, setStepTagError] = useState<string | null>(null)
  const [stepTagSuccess, setStepTagSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  const getSupabaseClient = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }

  const pageTitle = useMemo(() => {
    if (pageTitles[pathname]) return pageTitles[pathname]

    if (pathname?.startsWith("/dashboard/compliance")) {
      if (pathname === "/dashboard/compliance") return "Compliance"

      const stepMap: Record<string, string> = {
        "/dashboard/compliance/profile": "1. Profile",
        "/dashboard/compliance/contact": "2. Contact",
        "/dashboard/compliance/owner": "3. Owner",
        "/dashboard/compliance/account": "4. Account",
        "/dashboard/compliance/service-agreement": "5. Service Agreement",
      }

      return stepMap[pathname] || "Compliance"
    }

    return "Dashboard"
  }, [pathname])

  useEffect(() => {
    const loadUser = async () => {
      const storedProfileImage = localStorage.getItem("dashboard_profile_image")
      if (storedProfileImage) {
        setProfileImage(storedProfileImage)
      }

      const {
        data: { user },
      } = await getSupabaseClient().auth.getUser()

      if (user?.email) {
        setUserEmail(user.email)
      }

      let detectedStepTag: string | null = null
      const metadataStepTag = user?.user_metadata?.step_tag
      if (typeof metadataStepTag === "string" && metadataStepTag.trim().length > 0) {
        setStepTag(metadataStepTag)
        setStepTagInput(metadataStepTag)
        localStorage.setItem("dashboard_step_tag", metadataStepTag)
        localStorage.setItem("dashboard_step_tag_locked", "true")
        detectedStepTag = metadataStepTag
        window.dispatchEvent(new Event("dashboardNotificationsChanged"))
      }

      if (user?.id) {
        const { data: merchantRow } = await getSupabaseClient()
          .from("merchants")
          .select("step_tag")
          .eq("user_id", user.id)
          .maybeSingle()

        if (typeof merchantRow?.step_tag === "string" && merchantRow.step_tag.trim().length > 0) {
          setStepTag(merchantRow.step_tag)
          setStepTagInput(merchantRow.step_tag)
          localStorage.setItem("dashboard_step_tag", merchantRow.step_tag)
          localStorage.setItem("dashboard_step_tag_locked", "true")
          detectedStepTag = merchantRow.step_tag
          window.dispatchEvent(new Event("dashboardNotificationsChanged"))
        }
      }

      if (!detectedStepTag) {
        localStorage.removeItem("dashboard_step_tag")
        localStorage.removeItem("dashboard_step_tag_locked")
        window.dispatchEvent(new Event("dashboardNotificationsChanged"))
      }

      const metadataName = user?.user_metadata?.business_name
      if (typeof metadataName === "string" && metadataName.trim().length > 0) {
        setBusinessName(metadataName)
        return
      }

      const signupData = localStorage.getItem("signup_data")
      if (!signupData) return

      try {
        const parsed = JSON.parse(signupData)
        if (typeof parsed.businessName === "string" && parsed.businessName.trim().length > 0) {
          setBusinessName(parsed.businessName)
        }
      } catch {
        // Keep fallback label.
      }
    }

    void loadUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await getSupabaseClient().auth.signOut()
    } finally {
      window.location.assign("/login")
    }
  }

  const initials = businessName.slice(0, 2).toUpperCase()

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleProfileImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (!result) return

      setProfileImage(result)
      localStorage.setItem("dashboard_profile_image", result)
    }
    reader.readAsDataURL(file)
  }

  const removeProfileImage = () => {
    setProfileImage(null)
    localStorage.removeItem("dashboard_profile_image")
  }

  const saveStepTag = async () => {
    if (stepTag) {
      setStepTagError("StepTag is already set and cannot be changed.")
      setStepTagSuccess(null)
      return
    }

    const normalizedTag = normalizeStepTag(stepTagInput)
    if (!STEP_TAG_PATTERN.test(normalizedTag)) {
      setStepTagError("Use format @username (3-20 chars, letters, numbers, underscore).")
      setStepTagSuccess(null)
      return
    }

    setStepTagSaving(true)
    setStepTagError(null)
    setStepTagSuccess(null)

    try {
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be signed in to set a StepTag.")
      }

      const { data: currentMerchant, error: currentMerchantError } = await supabase
        .from("merchants")
        .select("step_tag")
        .eq("user_id", user.id)
        .maybeSingle()

      if (currentMerchantError && currentMerchantError.code !== "PGRST116") {
        throw new Error("Could not validate your current StepTag state.")
      }

      const existingStepTag = currentMerchant?.step_tag?.trim()
      if (existingStepTag && existingStepTag !== normalizedTag) {
        throw new Error("StepTag is already set and cannot be changed.")
      }

      if (existingStepTag === normalizedTag) {
        setStepTag(normalizedTag)
        setStepTagInput(normalizedTag)
        setStepTagSuccess("StepTag already saved.")
        localStorage.setItem("dashboard_step_tag", normalizedTag)
        localStorage.setItem("dashboard_step_tag_locked", "true")
        window.dispatchEvent(new Event("dashboardNotificationsChanged"))
        return
      }

      const { data: existingRow, error: existingError } = await supabase
        .from("merchants")
        .select("user_id")
        .eq("step_tag", normalizedTag)
        .maybeSingle()

      if (existingError && existingError.code !== "PGRST116") {
        throw new Error("Could not validate StepTag uniqueness right now.")
      }

      if (existingRow && existingRow.user_id !== user.id) {
        throw new Error("This StepTag is already taken. Try another one.")
      }

      const { error: merchantUpdateError } = await supabase
        .from("merchants")
        .update({ step_tag: normalizedTag })
        .eq("user_id", user.id)

      if (merchantUpdateError) {
        const message = merchantUpdateError.message.toLowerCase()
        if (merchantUpdateError.code === "23505" || message.includes("duplicate")) {
          throw new Error("This StepTag is already taken. Try another one.")
        }
        if (message.includes("column") && message.includes("step_tag")) {
          throw new Error("StepTag setup is not available yet. Please contact support.")
        }
        throw new Error("Could not save StepTag right now.")
      }

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: { step_tag: normalizedTag },
      })

      if (userUpdateError) {
        throw new Error("StepTag saved but account metadata sync failed. Refresh and try again.")
      }

      setStepTag(normalizedTag)
      setStepTagInput(normalizedTag)
      setStepTagSuccess("StepTag saved successfully.")
      localStorage.setItem("dashboard_step_tag", normalizedTag)
      localStorage.setItem("dashboard_step_tag_locked", "true")
      window.dispatchEvent(new Event("dashboardNotificationsChanged"))
    } catch (error: any) {
      setStepTagError(error.message || "Could not save StepTag.")
    } finally {
      setStepTagSaving(false)
    }
  }

  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm",
        "left-0 md:left-64"
      )}
    >
      <div className="flex h-[81px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {setMobileMenuOpen ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 shrink-0 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : null}
          <h1 className="text-lg font-bold sm:text-xl md:text-2xl">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeTogglerButton variant="secondary" size="default" className="border border-border/60" />

          <DropdownMenu
            open={accountMenuOpen}
            onOpenChange={(open) => {
              setAccountMenuOpen(open)
              if (!open) {
                setPictureMenuOpen(false)
                setStepTagMenuOpen(false)
                setReferMenuOpen(false)
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <LiquidButton className="h-10 gap-2 px-2.5 sm:px-3 border border-border/60 text-sm font-medium">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  {profileImage ? <AvatarImage src={profileImage} alt="Profile" className="object-cover" /> : null}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">{businessName}</span>
                <ChevronDown className="h-4 w-4" />
              </LiquidButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="grid gap-0.5">
                  <span className="truncate text-sm font-semibold">{businessName}</span>
                  <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="justify-between"
                onSelect={(event) => {
                  event.preventDefault()
                  setPictureMenuOpen((previous) => !previous)
                }}
              >
                <span>Picture</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", pictureMenuOpen ? "rotate-180" : "")} />
              </DropdownMenuItem>
              <AnimatePresence initial={false}>
                {pictureMenuOpen ? (
                  <motion.div
                    key="picture-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={submenuTransition}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pb-1 pl-3">
                      <DropdownMenuItem
                        className="h-8"
                        onSelect={(event) => {
                          event.preventDefault()
                          triggerImageUpload()
                        }}
                      >
                        Upload picture
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="h-8"
                        disabled={!profileImage}
                        onSelect={(event) => {
                          event.preventDefault()
                          removeProfileImage()
                        }}
                      >
                        Remove picture
                      </DropdownMenuItem>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <DropdownMenuItem
                className="justify-between"
                onSelect={(event) => {
                  event.preventDefault()
                  setStepTagMenuOpen((previous) => !previous)
                  setStepTagError(null)
                  setStepTagSuccess(null)
                }}
              >
                <span>StepTag</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", stepTagMenuOpen ? "rotate-180" : "")} />
              </DropdownMenuItem>
              <AnimatePresence initial={false}>
                {stepTagMenuOpen ? (
                  <motion.div
                    key="steptag-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={submenuTransition}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pb-2 pl-3 pr-2">
                      <p className="text-[11px] text-muted-foreground">
                        Add your unique StepTag once. Format: @username
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={stepTagInput}
                          onChange={(event) => setStepTagInput(normalizeStepTag(event.target.value))}
                          placeholder="@username"
                          disabled={Boolean(stepTag)}
                          className="h-8 text-xs"
                        />
                        <Button
                          type="button"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          disabled={Boolean(stepTag) || stepTagSaving}
                          onClick={() => {
                            void saveStepTag()
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                      {stepTag ? (
                        <p className="text-[11px] text-muted-foreground">
                          Saved as <span className="font-semibold">{stepTag}</span>. This value is locked.
                        </p>
                      ) : null}
                      {stepTagError ? <p className="text-[11px] text-destructive">{stepTagError}</p> : null}
                      {stepTagSuccess ? <p className="text-[11px] text-emerald-600">{stepTagSuccess}</p> : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <DropdownMenuItem
                className="justify-between"
                onSelect={(event) => {
                  event.preventDefault()
                  setReferMenuOpen((previous) => !previous)
                }}
              >
                <span>Refer</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", referMenuOpen ? "rotate-180" : "")} />
              </DropdownMenuItem>
              <AnimatePresence initial={false}>
                {referMenuOpen ? (
                  <motion.div
                    key="refer-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={submenuTransition}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pb-1 pl-3">
                      {SHARE_ITEMS.map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem key={item.id} asChild className="h-8">
                            <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </a>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/support">Support</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(event) => {
                event.preventDefault()
                void handleSignOut()
              }}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageUpload}
          />
        </div>
      </div>
    </div>
  )
}
