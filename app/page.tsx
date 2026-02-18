"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { LiquidButton } from "@/components/ui/liquid-button"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { HoleBackground } from "@/components/ui/hole-background"
import { GravityStarsBackground } from "@/components/ui/gravity-stars-background"
import { RollingText } from "@/components/animate-ui/primitives/texts/rolling"
import { RotatingText } from "@/components/animate-ui/primitives/texts/rotating"
import { MotionCarousel } from "@/components/animate-ui/components/community/motion-carousel"
import { ShareButton } from "@/components/animate-ui/components/community/share-button"
import { Tilt, TiltContent } from "@/components/animate-ui/primitives/effects/tilt"
import { MobileTopMenu } from "@/components/site/mobile-top-menu"
import {
  NfcFeatureIcon,
  PhoneCallFeatureIcon,
  ChartLineFeatureIcon,
  LayersFeatureIcon,
} from "@/components/ui/payment-feature-icons"

const CAROUSEL_ITEMS = [
  { src: "/c1.jpg", alt: "StepPay showcase image 1" },
  { src: "/c2.jpg", alt: "StepPay showcase image 2" },
  { src: "/c3.jpg", alt: "StepPay showcase image 3" },
  { src: "/c4.jpg", alt: "StepPay showcase image 4" },
  { src: "/c5.jpg", alt: "StepPay showcase image 5" },
  { src: "/c6.jpg", alt: "StepPay showcase image 6" },
  { src: "/c7.jpg", alt: "StepPay showcase image 7" },
  { src: "/c8.jpg", alt: "StepPay showcase image 8" },
  { src: "/c9.jpg", alt: "StepPay showcase image 9" },
  { src: "/c10.jpg", alt: "StepPay showcase image 10" },
  { src: "/c11.jpg", alt: "StepPay showcase image 11" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <GravityStarsBackground
        className="z-0 text-foreground pointer-events-none"
        starsSize={8.75}
        movementSpeed={0.000193}
        gravityStrength={3}
        mouseInfluence={35}
        glowIntensity={18}
        starsOpacity={0.1}
      />
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
            <ShareButton />
          </div>
          <MobileTopMenu className="sm:hidden" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative z-10">
        <h1 className="mb-6 tracking-tight flex justify-center">
          <span className="fx-shield">
            <RotatingText
              texts={["Go Global", "No Borders", "No Limits"]}
              className="text-5xl md:text-6xl font-bold"
            />
          </span>
        </h1>
        <p className="fx-shield-block text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Start taking payments from around the world with stepPay. We enables businesses in Africa to receive payments securely from clients anywhere in the world with and with ease across all borders.
        </p>
        <div className="flex justify-center">
          <Link href="/signup">
            <LiquidButton className="px-6 py-3 text-lg font-semibold border border-border/60 dark:border-border">
              Get Started
            </LiquidButton>
          </Link>
        </div>
      </section>

      {/* Motion Carousel Section */}
      <section className="container mx-auto px-4 pb-6 relative z-10">
        <MotionCarousel
          items={CAROUSEL_ITEMS}
          className="mx-auto max-w-6xl [&>div:first-child]:aspect-[16/15] md:[&>div:first-child]:aspect-[21/9]"
        />
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
              <AnimatedCard delay={0.1} className="hover:shadow-lg transition-all border-border/50">
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
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.2} className="hover:shadow-lg transition-all border-border/50">
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
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.3} className="hover:shadow-lg transition-all border-border/50">
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
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </AnimatedCard>
            </TiltContent>
          </Tilt>
          <Tilt className="w-full" maxTilt={9} perspective={900}>
            <TiltContent>
              <AnimatedCard delay={0.4} className="hover:shadow-lg transition-all border-border/50">
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
            <RollingText
              text="No matter your industry or size, we will enable you grow your revenue and scale your business"
              className="block text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center leading-tight text-foreground"
              delay={500}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              loop
              loopDelay={10}
              inView
              inViewOnce={false}
            />
          </div>
          <p className="fx-shield-block text-lg text-muted-foreground max-w-2xl mx-auto">
            Accept payments through multiple channels, utilize real-time analytics to manage the financial health of your business, and make data-driven smart inventory and scheduling to optimize your operations.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={0.1} className="hover:shadow-lg transition-all border-border/50 group">
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
          <AnimatedCard delay={0.2} className="hover:shadow-lg transition-all border-border/50 group">
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
          <AnimatedCard delay={0.3} className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ChartLineFeatureIcon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Enterprise Resource Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unify finance, operations, inventory, taxes and reporting into one intelligent platform powering scalable, secure, real time payment ecosystems.
              </p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard delay={0.4} className="hover:shadow-lg transition-all border-border/50 group">
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

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="relative">
          <Card className="relative overflow-hidden bg-background/35 backdrop-blur-md text-foreground border border-border/60 shadow-xl z-10">
            <HoleBackground
              className="absolute inset-0 z-0 rounded-3xl [&>canvas]:opacity-45 dark:[&>canvas]:opacity-55"
              strokeColor="hsl(var(--foreground))"
              particleRGBColor={[255, 255, 255]}
              numberOfDiscs={50}
              numberOfLines={40}
            />
            <div className="absolute inset-0 z-[1] bg-background/35 dark:bg-background/30" />
            <CardContent className="relative z-10 h-[24rem] sm:h-[36rem] pt-12 pb-12">
              <div className="h-full flex flex-col items-center justify-between">
                <div className="space-y-6 max-w-xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Become Part of the StepPay Family?</h2>
                  <p className="text-lg opacity-95 max-w-xl mx-auto">
                    Join thousands of businesses already using StepPay
                  </p>
                </div>
                <div className="flex justify-center">
                  <Link href="/signup">
                    <LiquidButton className="px-6 py-3 text-lg font-semibold border border-border/60">
                      Trust Us With Your Business
                    </LiquidButton>
                  </Link>
                </div>
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
