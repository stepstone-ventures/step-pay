"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { BorderBeam } from "@/components/ui/border-beam"
import { LiquidButton } from "@/components/ui/liquid-button"
import { Spline } from "@/components/ui/spline"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { RotatingText } from "@/components/animate-ui/primitives/texts/rotating"
import { ShareButton } from "@/components/animate-ui/components/community/share-button"
import { Tilt, TiltContent } from "@/components/animate-ui/primitives/effects/tilt"
import { MobileTopMenu } from "@/components/site/mobile-top-menu"
import { FluidCursor } from "@/components/ui/fluid-cursor"
import {
  NfcFeatureIcon,
  PhoneCallFeatureIcon,
  ChartLineFeatureIcon,
  LayersFeatureIcon,
} from "@/components/ui/payment-feature-icons"

const MONO_LINK_COLUMNS = [
  {
    title: "Products",
    links: [
      "Data",
      "Payments",
      "Statements Pages",
      "Payment Pages",
      "Prove",
      "Lookup",
      "Portal",
      "Pricing",
      "Demo",
    ],
  },
  {
    title: "Use Cases",
    links: [
      "Customer Onboarding",
      "Credit Risk Assessment",
      "Payment Collection",
      "Personal Finance Insights",
    ],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Coverage", "Contact"],
  },
  {
    title: "Legal",
    links: [
      "End Users' Policy",
      "Developer Policy",
      "IMS Policy",
      "Terms of Use",
      "Disclaimer",
      "Cookies",
      "Security",
    ],
  },
  {
    title: "Developers",
    links: ["Documentation", "API Reference", "SDKs"],
  },
  {
    title: "Resources",
    links: ["Blog", "Partners' Stories", "Support", "Consumers"],
  },
]

const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <FluidCursor />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-1.5">
            <div className="relative h-10 w-14">
              <Image
                src="/steppay-logo.png"
                alt="StepPay logo"
                fill
                sizes="64px"
                className="object-contain dark:invert"
                priority
              />
            </div>
            <span className="font-semibold text-lg sm:text-xl tracking-tight">StepPay</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-4">
            <ThemeTogglerButton
              variant="secondary"
              size="default"
              className="border border-border/60"
            />
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
            <a href="mailto:steppayteam@gmail.com?subject=StepPay%20Contact%20Sales">
              <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                Contact Sales
              </LiquidButton>
            </a>
            <ShareButton />
          </div>
          <MobileTopMenu className="sm:hidden" contactSalesAsMenuRow />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-6 pb-24 text-center relative z-10">
        <div className="relative mx-auto mb-10 w-full max-w-5xl overflow-hidden rounded-lg bg-black/96">
          <div className="font-heading pointer-events-none absolute flex w-full flex-col items-center justify-center gap-2 p-8 text-center text-black dark:text-white">
            <span className="text-4xl md:text-5xl font-semibold text-black dark:text-white">
              <RotatingText
                texts={["Step Smart", "Step Secure", "Step Ahead"]}
                className="text-4xl md:text-5xl font-semibold"
              />
            </span>
            <span className="max-w-2xl font-sans font-light text-black dark:text-white">
              Step up your business with our secure digital payments. Make data-driven decisions with StepPay AI&apos;s prescriptive analytics.
            </span>
          </div>
          <div className="flex h-[420px] md:h-[520px]">
            <Spline scene={SPLINE_SCENE_URL} className="mt-32 sm:mt-24 size-full" />
          </div>
        </div>
        <div className="flex justify-center">
          <Link href="/signup">
            <LiquidButton className="px-6 py-3 text-lg font-semibold border border-border/60 dark:border-border">
              Get Started
            </LiquidButton>
          </Link>
        </div>
      </section>

      {/* 4 Simple Steps Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            <span className="fx-shield">4 Simple Steps</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.1} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50">
                <BorderBeam duration={15} />
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-center">Verify Business</h3>
                  <p className="text-muted-foreground leading-relaxed text-center text-sm">
                    Submit basic business details and documents. Get approved in minutes and unlock full access.
                  </p>
                  <div className="relative mt-4 w-full aspect-square sm:aspect-auto sm:h-56 overflow-hidden rounded-xl border border-border/50">
                    <Image
                      src="/f1.jpg"
                      alt="StepPay verification"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      quality={82}
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.2} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50">
                <BorderBeam duration={15} />
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-center">Set-up Financial Account</h3>
                  <p className="text-muted-foreground leading-relaxed text-center text-sm">
                    Securely link your bank account to receive payouts quickly and automatically.
                  </p>
                  <div className="relative mt-4 w-full aspect-square sm:aspect-auto sm:h-56 overflow-hidden rounded-xl border border-border/50">
                    <Image
                      src="/f2.jpg"
                      alt="StepPay financial setup"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      quality={82}
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.3} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50">
                <BorderBeam duration={15} />
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-center">Create Shop-Front</h3>
                  <p className="text-muted-foreground leading-relaxed text-center text-sm">
                    Build your branded payment page or online store in just a few clicks with 0 coding required.
                  </p>
                  <div className="relative mt-4 w-full aspect-square sm:aspect-auto sm:h-56 overflow-hidden rounded-xl border border-border/50">
                    <Image
                      src="/f3.jpg"
                      alt="StepPay shop front"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      quality={82}
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.4} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50">
                <BorderBeam duration={15} />
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-primary">4</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-center">Receive and Track Payments</h3>
                  <p className="text-muted-foreground leading-relaxed text-center text-sm">
                    Start accepting payments instantly and monitor every transaction in one clear dashboard.
                  </p>
                  <div className="relative mt-4 w-full aspect-square sm:aspect-auto sm:h-56 overflow-hidden rounded-xl border border-border/50">
                    <Image
                      src="/f4.jpg"
                      alt="StepPay payments dashboard"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      quality={82}
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="fx-shield-block block text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center leading-tight text-foreground">
              No matter your industry or size, we will enable you grow your revenue and scale your business
            </h2>
          </div>
          <p className="fx-shield-block text-lg text-muted-foreground max-w-2xl mx-auto">
            Accept payments through multiple channels, utilize real-time analytics to manage the financial health of your business, and make data-driven smart inventory and scheduling to optimize your operations.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={0.1} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50 group">
            <BorderBeam duration={15} />
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <NfcFeatureIcon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Online Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Take payments directly from your website or our shop-front via card, mobile money and digital banking methods.
              </p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={0.2} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50 group">
            <BorderBeam duration={15} />
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <PhoneCallFeatureIcon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Mobile Money</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive and make transactions across all networks via mobile money in West Africa.
              </p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={0.3} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50 group">
            <BorderBeam duration={15} />
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ChartLineFeatureIcon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Enterprise Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unify finance, operations, inventory, taxes and reporting into one intelligent platform powering scalable, secure, real time payment ecosystems.
              </p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={0.4} className="relative overflow-hidden hover:shadow-lg transition-all border-border/50 group">
            <BorderBeam duration={15} />
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <LayersFeatureIcon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Bulk Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Send money to multiple mobile wallets or bank accounts at once, locally or internationally.
              </p>
            </CardContent>
          </AnimatedCard>
        </div>
      </section>

      {/* Mono-Style Link Hub */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="relative max-w-7xl mx-auto">
          <Card className="relative overflow-hidden border border-border/70 bg-background/80 backdrop-blur-xl shadow-[0_30px_100px_-45px_hsl(var(--foreground)/0.35)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background/30" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
            <CardContent className="relative p-6 sm:p-8 md:p-10">
              <div className="mb-8 text-left">
                <span className="text-2xl font-semibold tracking-tight">StepPay</span>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {MONO_LINK_COLUMNS.map((column) => (
                  <div
                    key={column.title}
                    className="group/column rounded-xl border border-transparent bg-background/20 p-3 transition-all duration-500 hover:border-border/70 hover:bg-background/55 hover:shadow-[0_20px_45px_-30px_hsl(var(--foreground)/0.55)]"
                  >
                    <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase text-foreground/85 transition-colors duration-300 group-hover/column:text-foreground">
                      {column.title}
                    </h3>
                    <ul className="space-y-2.5">
                      {column.links.map((item) => (
                        <li key={`${column.title}-${item}`}>
                          <a
                            href="#"
                            className="group/link inline-flex items-center text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                          >
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary/70 opacity-0 transition-all duration-300 group-hover/link:opacity-100" />
                            <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
                              {item}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 relative z-20 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 StepPay Incorporated. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
