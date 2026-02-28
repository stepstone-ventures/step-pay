import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { PRIVATE_API_CACHE_HEADERS, requireAuthenticatedApiUser } from "@/lib/security/route-auth"

const STEP_TAG_PATTERN = /^@[a-z0-9_]{3,20}$/

function normalizeStepTag(rawValue: string) {
  const compact = rawValue.trim().toLowerCase().replace(/\s+/g, "")
  const withPrefix = compact.startsWith("@") ? compact : `@${compact}`
  return withPrefix.replace(/[^@a-z0-9_]/g, "")
}

export async function GET(request: NextRequest) {
  const { user, supabase, unauthorizedResponse } = await requireAuthenticatedApiUser()
  if (unauthorizedResponse) return unauthorizedResponse

  const requestedTag =
    request.nextUrl.searchParams.get("step_tag") ??
    request.nextUrl.searchParams.get("stepTag") ??
    ""
  const stepTag = normalizeStepTag(requestedTag)

  if (!STEP_TAG_PATTERN.test(stepTag)) {
    return NextResponse.json(
      { error: "Invalid StepTag format." },
      { status: 400, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const { data: merchantRow, error } = await supabase
    .from("merchants")
    .select("user_id,business_name,email,step_tag")
    .eq("step_tag", stepTag)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("StepTag lookup error:", error.message)
    return NextResponse.json(
      { error: "Could not verify StepTag right now." },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  if (!merchantRow) {
    return NextResponse.json(
      { error: "No StepPay business account found with this StepTag." },
      { status: 404, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  if (merchantRow.user_id === user.id) {
    return NextResponse.json(
      { error: "You cannot send payment to your own StepTag." },
      { status: 400, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  return NextResponse.json(
    {
      user_id: merchantRow.user_id,
      business_name: merchantRow.business_name,
      email: merchantRow.email,
      step_tag: merchantRow.step_tag,
    },
    { headers: PRIVATE_API_CACHE_HEADERS }
  )
}
