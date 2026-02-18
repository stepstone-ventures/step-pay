"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type SVGProps } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Ghost, Instagram, Menu } from "lucide-react"
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
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { LiquidButton } from "@/components/ui/liquid-button"
import { cn } from "@/lib/utils"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const supabase = createSupabaseBrowserClient()

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transactions": "Transactions",
  "/dashboard/customers": "Customers",
  "/dashboard/refunds": "Refunds",
  "/dashboard/payouts": "Payouts",
  "/dashboard/disputes": "Disputes",
  "/dashboard/transaction-splits": "Transaction Splits",
  "/dashboard/subaccounts": "Subaccounts",
  "/dashboard/terminals": "Terminals",
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
  const [referMenuOpen, setReferMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      } = await supabase.auth.getUser()

      if (user?.email) {
        setUserEmail(user.email)
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
      await supabase.auth.signOut()
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
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>

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
