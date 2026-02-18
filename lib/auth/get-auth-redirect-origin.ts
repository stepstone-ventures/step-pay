export function getAuthRedirectOrigin() {
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location
    const safeHost = hostname === "0.0.0.0" ? "localhost" : hostname
    return `${protocol}//${safeHost}${port ? `:${port}` : ""}`
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "")
  }

  return "http://localhost:3000"
}
