"use client"

import type { ComplianceStep } from "@/lib/compliance-utils"

interface ComplianceAccessGuardProps {
  currentStep: ComplianceStep
  children: React.ReactNode
}

// Currently this guard only exists to preserve a consistent interface around
// compliance pages. All steps are always accessible and fully editable, both
// before and after completion.
export function ComplianceAccessGuard({ children }: ComplianceAccessGuardProps) {
  return <>{children}</>
}
