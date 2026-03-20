import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ShareButton } from "@/components/animate-ui/components/community/share-button"
import { LiquidButton } from "@/components/ui/liquid-button"
import { MobileTopMenu } from "@/components/site/mobile-top-menu"

const STEP_PAY_PRO_ROUTE = "/step-pay-pro"

export default function StepPayProPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
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
            <Link href={STEP_PAY_PRO_ROUTE}>
              <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                StepPay Pro
              </LiquidButton>
            </Link>
            <ShareButton />
          </div>
          <MobileTopMenu className="sm:hidden" contactSalesAsMenuRow />
        </div>
      </header>

      <main className="relative z-10 mb-16">
        <div className="w-full h-[calc(100dvh-81px)] overflow-hidden sm:h-screen sm:min-h-[800px]">
          <iframe
            src="/framer-pro/index.html"
            title="StepPay Pro"
            className="h-full w-full border-0"
            scrolling="no"
          />
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
