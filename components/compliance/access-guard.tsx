"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { canAccessStep, getNextIncompleteStep } from "@/lib/compliance-utils"
import type { ComplianceStep } from "@/lib/compliance-utils"

export function ComplianceAccessGuard({
  step,
  children,
}: {
  step: ComplianceStep
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!canAccessStep(step)) {
      // Redirect to the next incomplete step or profile
      const nextStep = getNextIncompleteStep()
      if (nextStep) {
        router.push(`/dashboard/compliance/${nextStep}`)
      } else {
        router.push("/dashboard/compliance/profile")
      }
    }
  }, [step, router])

  if (!canAccessStep(step)) {
    return null // Don't render content while redirecting
  }

  return <>{children}</>
}

