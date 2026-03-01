function toLowerSafe(value: string) {
  return value.trim().toLowerCase()
}

function normalizeHost(value: string | null | undefined) {
  if (!value) return null

  try {
    return new URL(value.includes("://") ? value : `http://${value}`).hostname.toLowerCase()
  } catch {
    return null
  }
}

function parseHostPatterns(rawValue: string | undefined) {
  if (!rawValue) return []
  return rawValue
    .split(",")
    .map((entry) => toLowerSafe(entry))
    .filter(Boolean)
}

function hostMatchesPattern(hostname: string, pattern: string) {
  const normalizedPattern = toLowerSafe(pattern)
  if (!normalizedPattern) return false

  if (normalizedPattern.startsWith("*.")) {
    const suffix = normalizedPattern.slice(2)
    return hostname === suffix || hostname.endsWith(`.${suffix}`)
  }

  return hostname === normalizedPattern
}

function isVercelHost(hostname: string) {
  return hostname.endsWith(".vercel.app")
}

function matchesVercelProjectHost(hostname: string, allowedPatterns: string[]) {
  if (!isVercelHost(hostname)) return false

  const allowedVercelHosts = allowedPatterns
    .filter((pattern) => !pattern.includes("*") && isVercelHost(pattern))

  return allowedVercelHosts.some((allowedHost) => {
    if (hostname === allowedHost) return true

    const projectSlug = allowedHost.split(".")[0]
    if (!projectSlug) return false

    // Allow Vercel preview domains for the same project slug:
    // e.g. project.vercel.app -> project-git-main-user.vercel.app
    return hostname.startsWith(`${projectSlug}-`)
  })
}

function collectAllowedHostPatterns() {
  const patterns = new Set<string>()

  parseHostPatterns(process.env.ALLOWED_APP_HOSTS).forEach((pattern) => patterns.add(pattern))
  parseHostPatterns(process.env.NEXT_PUBLIC_ALLOWED_APP_HOSTS).forEach((pattern) => patterns.add(pattern))

  const siteHost = normalizeHost(process.env.NEXT_PUBLIC_SITE_URL)
  if (siteHost) {
    patterns.add(siteHost)
  }

  return Array.from(patterns)
}

export function isRequestHostAllowed(hostHeader: string | null | undefined) {
  if (process.env.NODE_ENV !== "production") {
    return true
  }

  const allowedPatterns = collectAllowedHostPatterns()
  if (allowedPatterns.length === 0) {
    return true
  }

  const hostname = normalizeHost(hostHeader)
  if (!hostname) {
    return false
  }

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return true
  }

  if (allowedPatterns.some((pattern) => hostMatchesPattern(hostname, pattern))) {
    return true
  }

  if (matchesVercelProjectHost(hostname, allowedPatterns)) {
    return true
  }

  return false
}
