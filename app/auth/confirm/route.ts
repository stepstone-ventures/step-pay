import { createServerClient } from "@supabase/ssr"
import type { EmailOtpType } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email",
  "email_change",
])

function normalizeOtpType(type: string | null) {
  if (!type) return null
  return OTP_TYPES.has(type as EmailOtpType) ? (type as EmailOtpType) : null
}

function createSupabaseRouteClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

async function ensureMerchantRow(supabase: ReturnType<typeof createSupabaseRouteClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: existingMerchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingMerchant) return

  const metadata = user.user_metadata || {}

  const { error } = await supabase.from("merchants").insert({
    user_id: user.id,
    business_name: metadata.business_name ?? null,
    email: user.email ?? null,
    phone_number: metadata.phone_number ?? null,
    country: metadata.country ?? null,
  })

  if (error) {
    console.error("Merchants insert error:", error.message)
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const accessToken = requestUrl.searchParams.get("access_token")
  const refreshToken = requestUrl.searchParams.get("refresh_token")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const token = requestUrl.searchParams.get("token")
  const email = requestUrl.searchParams.get("email")
  const code = requestUrl.searchParams.get("code")
  const type = normalizeOtpType(requestUrl.searchParams.get("type"))

  if (!accessToken && !refreshToken && !tokenHash && !code && !(token && email)) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url))
  }

  const supabase = createSupabaseRouteClient()
  const authErrors: string[] = []

  const trySetSession = async () => {
    if (!accessToken || !refreshToken) return false
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (error) {
      authErrors.push(error.message)
      return false
    }
    return true
  }

  const tryTokenHash = async () => {
    if (!tokenHash) return false

    if (type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      })
      if (error) {
        authErrors.push(error.message)
        return false
      }
      return true
    }

    const signupAttempt = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "signup",
    })
    if (!signupAttempt.error) return true

    authErrors.push(signupAttempt.error.message)
    const emailAttempt = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    })

    if (emailAttempt.error) {
      authErrors.push(emailAttempt.error.message)
      return false
    }

    return true
  }

  const tryTokenAndEmail = async () => {
    if (!(token && email)) return false

    if (type) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      })
      if (error) {
        authErrors.push(error.message)
        return false
      }
      return true
    }

    const signupAttempt = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    })
    if (!signupAttempt.error) return true

    authErrors.push(signupAttempt.error.message)
    const emailAttempt = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (emailAttempt.error) {
      authErrors.push(emailAttempt.error.message)
      return false
    }

    return true
  }

  const tryCode = async () => {
    if (!code) return false
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      authErrors.push(error.message)
      return false
    }
    return true
  }

  const confirmed =
    (await trySetSession()) ||
    (await tryTokenHash()) ||
    (await tryTokenAndEmail()) ||
    (await tryCode())

  if (!confirmed) {
    const authError = authErrors[authErrors.length - 1] ?? "Error confirming user"
    console.error("Verification error:", authErrors)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "verification_failed")
    loginUrl.searchParams.set("error_description", authError)
    return NextResponse.redirect(loginUrl)
  }

  await ensureMerchantRow(supabase)

  return NextResponse.redirect(new URL("/login?confirmed=true", request.url))
}
