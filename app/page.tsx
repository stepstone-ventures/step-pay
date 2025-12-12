import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CreditCard, Shield, Zap, Globe } from "lucide-react"

export default function Home() {
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
          Accept Payments from Abroad
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          StepPay helps Ghanaian merchants receive payments from customers around the world with ease and security.
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

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Easy Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Accept payments through multiple methods including cards, mobile money, and bank transfers.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Secure & Safe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bank-level encryption and security measures to protect your transactions and customer data.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">Fast Settlements</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get your money quickly with fast settlement times and real-time transaction updates.
              </p>
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
