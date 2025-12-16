"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, Bell, User, ChevronDown, Building2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { isComplianceComplete } from "@/lib/compliance-utils"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function GlobalUI() {
  const [isLive, setIsLive] = useState(false)
  const [businessName, setBusinessName] = useState("Stepstone Ventures")
  const [accountNumber, setAccountNumber] = useState("1234567")

  useEffect(() => {
    setIsLive(isComplianceComplete())
    // Load business info from localStorage
    const signupData = localStorage.getItem("signup_data")
    if (signupData) {
      try {
        const data = JSON.parse(signupData)
        if (data.businessName) setBusinessName(data.businessName)
        // Generate account number if not exists
        if (!localStorage.getItem("account_number")) {
          const accNum = Math.floor(1000000 + Math.random() * 9000000).toString()
          localStorage.setItem("account_number", accNum)
          setAccountNumber(accNum)
        } else {
          setAccountNumber(localStorage.getItem("account_number") || "1234567")
        }
      } catch (e) {
        console.error("Error loading business data:", e)
      }
    }
  }, [])

  return (
    <>
      {/* Test Mode Indicator */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        {!isLive && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="cursor-help">
                  Test Mode
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your business is in Test Mode. Submit all compliance forms to activate Live Payments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                No new notifications
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 px-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>
                  {businessName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/add-business">Add a Business</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/permissions">Permissions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/preferences">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center space-x-2 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{businessName}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Account: {accountNumber}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="text-destructive">
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Support Button */}
      <Button
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg"
        size="icon"
        asChild
      >
        <Link href="/dashboard/support">
          <HelpCircle className="h-6 w-6" />
        </Link>
      </Button>
    </>
  )
}

