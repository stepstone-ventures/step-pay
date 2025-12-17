export const complianceSteps = [
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

export const getNextIncompleteComplianceStep = (): string | null => {
  if (typeof window === "undefined") return null

  const completedSteps = new Set(
    JSON.parse(localStorage.getItem("compliance_steps") || "[]")
  )

  for (const step of complianceSteps) {
    if (!completedSteps.has(step)) {
      return step
    }
  }
  return null
}

