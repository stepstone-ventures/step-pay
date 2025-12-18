export type ComplianceStep = "profile" | "contact" | "owner" | "account" | "service-agreement"

export const complianceSteps: ComplianceStep[] = [
  "profile",
  "contact",
  "owner",
  "account",
  "service-agreement",
]

export const isComplianceComplete = (): boolean => {
  if (typeof window === "undefined") return false
  const completed = localStorage.getItem("compliance_complete")
  return completed === "true"
}

export const getNextIncompleteComplianceStep = (steps: ComplianceStep[], currentStep: ComplianceStep): ComplianceStep | null => {
  if (typeof window === "undefined") return null

  const completedSteps = new Set<ComplianceStep>(
    JSON.parse(localStorage.getItem("compliance_steps") || "[]")
  )

  for (const step of steps) {
    if (!completedSteps.has(step)) {
      return step
    }
  }
  return null
}

