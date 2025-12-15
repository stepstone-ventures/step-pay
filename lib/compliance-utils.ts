// Utility functions for compliance flow

export const complianceSteps = [
  "profile",
  "contact",
  "owner",
  "account",
  "service-agreement",
] as const

export type ComplianceStep = typeof complianceSteps[number]

export function getCompletedSteps(): Set<string> {
  if (typeof window === "undefined") return new Set()
  const saved = localStorage.getItem("compliance_steps")
  if (saved) {
    try {
      return new Set(JSON.parse(saved))
    } catch (e) {
      return new Set()
    }
  }
  return new Set()
}

export function isStepCompleted(step: ComplianceStep): boolean {
  return getCompletedSteps().has(step)
}

export function getNextIncompleteStep(): ComplianceStep | null {
  const completed = getCompletedSteps()
  for (const step of complianceSteps) {
    if (!completed.has(step)) {
      return step
    }
  }
  return null
}

export function canAccessStep(step: ComplianceStep): boolean {
  const completed = getCompletedSteps()
  const stepIndex = complianceSteps.indexOf(step)
  
  // Can access if it's the first step
  if (stepIndex === 0) return true
  
  // Can access if previous step is completed
  const previousStep = complianceSteps[stepIndex - 1]
  return completed.has(previousStep)
}

export function isComplianceComplete(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("compliance_complete") === "true"
}

