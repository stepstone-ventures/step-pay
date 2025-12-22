"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CreditCard, Shield, Zap, Globe, Sun, Moon, Smartphone, Monitor, FileText, Code, Users, Building2, CheckCircle2, Clock, BarChart3, DollarSign, Headphones, ArrowRightLeft, Wallet, QrCode, Receipt, Store, TrendingUp, Star } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function Home() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">StepPay</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Accept Payments from Abroad and at Home
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          StepPay helps Ghanaian merchants receive payments from customers around the world and locally with ease and security.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/signup">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            No matter your size or industry, we can help grow your revenues
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accept payments through multiple channels, whether your customers are across the globe or right next door.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Mobile Money</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Accept payments across all networks via mobile money. Quick, easy, and works everywhere in Ghana.
              </p>
              <Link href="/signup" className="text-primary hover:underline text-sm font-medium inline-flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Monitor className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Online Checkout</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Take payments directly on your website via mobile money, card, and international payment methods.
              </p>
              <Link href="/signup" className="text-primary hover:underline text-sm font-medium inline-flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Invoicing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Generate and send customized invoices for customers to make payments via card or mobile money.
              </p>
              <Link href="/signup" className="text-primary hover:underline text-sm font-medium inline-flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Code className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Payment API</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Integrate APIs to send and receive payments from customers anywhere in the world.
              </p>
              <Link href="/signup" className="text-primary hover:underline text-sm font-medium inline-flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Bulk Payments</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Send money to multiple mobile wallets or bank accounts at once, locally or internationally.
              </p>
              <Link href="/signup" className="text-primary hover:underline text-sm font-medium inline-flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all border-border/50 group">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <QrCode className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">QR Code Payments</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Accept in-store payments via QR codes. Never miss a sale, whether by card or mobile money.
              </p>
              <Link href="/signup" className="text-primary hover:underline text-sm font-medium inline-flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Business Dashboard Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Take control of your business
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Become a merchant on StepPay and use the StepPay Merchant Dashboard at no extra cost.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Get insights into your business</h4>
                    <p className="text-sm text-muted-foreground">Real-time analytics and reporting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Handle bulk payments</h4>
                    <p className="text-sm text-muted-foreground">Process multiple transactions at once</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Confirm transactions and track sales</h4>
                    <p className="text-sm text-muted-foreground">Monitor all your payments in real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Manage multiple branches</h4>
                    <p className="text-sm text-muted-foreground">Centralized control for all locations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Create customized invoices</h4>
                    <p className="text-sm text-muted-foreground">Professional invoices for your customers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Access customer analytics</h4>
                    <p className="text-sm text-muted-foreground">Understand your customer behavior</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg">
                    Become a merchant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6">
                <BarChart3 className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold mb-1">Analytics</h4>
                <p className="text-sm text-muted-foreground">Track performance</p>
              </Card>
              <Card className="p-6">
                <Receipt className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold mb-1">Invoices</h4>
                <p className="text-sm text-muted-foreground">Create & send</p>
              </Card>
              <Card className="p-6">
                <Store className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold mb-1">Branches</h4>
                <p className="text-sm text-muted-foreground">Manage locations</p>
              </Card>
              <Card className="p-6">
                <TrendingUp className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold mb-1">Growth</h4>
                <p className="text-sm text-muted-foreground">Scale your business</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose StepPay Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Why choose StepPay
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Accept all payment types</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive money via mobile money, card payments, QR codes, and international payment methods.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Fast settlements</h3>
              <p className="text-muted-foreground leading-relaxed">
                Don't wait for days before you get settled. Get your money into your account quickly.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Transaction monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access your dashboard to get real-time visibility into your business and monitor transactions as they occur.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">No setup fees</h3>
              <p className="text-muted-foreground leading-relaxed">
                Getting started is free. No hidden charges. Pay only a small percentage per transaction as processing fee.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Headphones className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">24/7 Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Need help? Text, email or call our support team anytime for assistance.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <ArrowRightLeft className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Transfer funds at no cost</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pay no charges when transferring funds from your StepPay account to your bank account or mobile money wallet.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Simple & Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Pay only a small percentage per transaction and enjoy fast, secure, and reliable payments.
          </p>
          <Card className="max-w-2xl mx-auto border-2 border-primary/20">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-center mb-4">
                <Wallet className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Get started for free</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">No setup fees</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">No hidden charges</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Competitive transaction fees</span>
                </div>
              </div>
              <Link href="/signup">
                <Button size="lg">
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            See what businesses say about StepPay
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic leading-relaxed">
                "StepPay has always made us feel valued. Even if another company processed payments faster, we'd still choose StepPay for the genuine care they show their customers."
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Golden Crystal</p>
                  <p className="text-xs text-muted-foreground">Retail Business</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic leading-relaxed">
                "StepPay's payment system gave our patients payment flexibility. We were also able to receive payments quickly. It really did make everyone happy."
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Sazian Clinic</p>
                  <p className="text-xs text-muted-foreground">Healthcare</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic leading-relaxed">
                "I would say StepPay is a digital partner for businesses like us because the platform not only aggregates payments but also provides a dashboard that allows you to have visibility into who is buying from you."
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Nova Ghana</p>
                  <p className="text-xs text-muted-foreground">E-commerce</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-xl">
          <CardContent className="pt-16 pb-16">
            <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Globe className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ready to Get Started?</h2>
            <p className="text-lg mb-10 opacity-95 max-w-xl mx-auto">
              Join thousands of Ghanaian merchants already using StepPay
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 StepPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
