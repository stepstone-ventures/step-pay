"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { complianceSteps, getNextIncompleteComplianceStep } from "@/lib/compliance-utils"
import type { ComplianceStep } from "@/lib/compliance-utils"

interface ComplianceAccessGuardProps {
  currentStep: ComplianceStep
  children: React.ReactNode
}

export function ComplianceAccessGuard({ currentStep, children }: ComplianceAccessGuardProps) {
  const router = useRouter()

  useEffect(() => {
    // Find the next incomplete step
    const nextStep = getNextIncompleteComplianceStep(complianceSteps, currentStep)

    // If the current step is not allowed (i.e., there's an earlier incomplete step), redirect
    if (nextStep && nextStep !== currentStep) {
      router.push(`/dashboard/compliance/${nextStep}`)
    }
  }, [currentStep, router])

  return <>{children}</>
}
