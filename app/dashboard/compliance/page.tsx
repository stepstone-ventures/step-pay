"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: "profile", name: "Profile", href: "/dashboard/compliance/profile" },
  { id: "contact", name: "Contact", href: "/dashboard/compliance/contact" },
  { id: "owner", name: "Owner", href: "/dashboard/compliance/owner" },
  { id: "account", name: "Account", href: "/dashboard/compliance/account" },
  { id: "service-agreement", name: "Service Agreement", href: "/dashboard/compliance/service-agreement" },
]

export default function CompliancePage() {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateSteps = () => {
      const saved = localStorage.getItem("compliance_steps")
      if (saved) {
        try {
          setCompletedSteps(new Set(JSON.parse(saved)))
        } catch (e) {
          console.error("Error loading compliance steps:", e)
        }
      }
    }
    
    updateSteps()
    const interval = setInterval(updateSteps, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = () => {
    router.push("/dashboard/compliance/profile")
  }

  const allCompleted = steps.every((step) => completedSteps.has(step.id))

  return (
    <div className="space-y-6 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checklist</CardTitle>
          <CardDescription>
            Please complete all steps to become fully compliant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id)
              return (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium">
                        Step {index + 1}: {step.name}
                      </div>
                    </div>
                  </div>
                  <Link href={step.href}>
                    <Button variant={isCompleted ? "outline" : "default"}>
                      {isCompleted ? "Review" : "Start"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>

          {!allCompleted && (
            <div className="mt-6 pt-6 border-t border-border">
              <Button onClick={handleStart} className="w-full" size="lg">
                Start Compliance Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {allCompleted && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">All steps completed! Your account is compliant.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

