import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { PRIVATE_API_CACHE_HEADERS, requireAuthenticatedApiUser } from "@/lib/security/route-auth"

const STEP_TAG_PATTERN = /^@[a-z0-9_]{3,20}$/

function normalizeStepTag(rawValue: string) {
  const compact = rawValue.trim().toLowerCase().replace(/\s+/g, "")
  const withPrefix = compact.startsWith("@") ? compact : `@${compact}`
  return withPrefix.replace(/[^@a-z0-9_]/g, "")
}

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

export async function POST(request: NextRequest) {
  const { user, supabase, unauthorizedResponse } = await requireAuthenticatedApiUser()
  if (unauthorizedResponse) return unauthorizedResponse

  let payload: { stepTag?: string } = {}
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const stepTag = normalizeStepTag(payload.stepTag ?? "")
  if (!STEP_TAG_PATTERN.test(stepTag)) {
    return NextResponse.json(
      { error: "Use format @username (3-20 chars, letters, numbers, underscore)." },
      { status: 400, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const metadataStepTag = asNonEmptyString(metadata.step_tag)?.trim() ?? null
  if (metadataStepTag && metadataStepTag !== stepTag) {
    return NextResponse.json(
      { error: "StepTag is already set and cannot be changed." },
      { status: 409, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const { data: currentMerchant, error: currentMerchantError } = await supabase
    .from("merchants")
    .select("step_tag")
    .eq("user_id", user.id)
    .maybeSingle()

  if (currentMerchantError && currentMerchantError.code !== "PGRST116") {
    console.error("StepTag current lookup error:", currentMerchantError.message)
    return NextResponse.json(
      { error: "Could not validate your current StepTag state." },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const existingStepTag = asNonEmptyString(currentMerchant?.step_tag)?.trim() ?? null
  if (existingStepTag && existingStepTag !== stepTag) {
    return NextResponse.json(
      { error: "StepTag is already set and cannot be changed." },
      { status: 409, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  if (existingStepTag === stepTag) {
    return NextResponse.json(
      { stepTag, alreadySet: true },
      { headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const { data: existingStepTagRow, error: existingStepTagError } = await supabase
    .from("merchants")
    .select("user_id")
    .eq("step_tag", stepTag)
    .maybeSingle()

  if (existingStepTagError && existingStepTagError.code !== "PGRST116") {
    console.error("StepTag uniqueness check error:", existingStepTagError.message)
    return NextResponse.json(
      { error: "Could not validate StepTag uniqueness right now." },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  if (existingStepTagRow && existingStepTagRow.user_id !== user.id) {
    return NextResponse.json(
      { error: "This StepTag is already taken. Try another one." },
      { status: 409, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  if (currentMerchant) {
    const { error: merchantUpdateError } = await supabase
      .from("merchants")
      .update({ step_tag: stepTag })
      .eq("user_id", user.id)

    if (merchantUpdateError) {
      const lowerMessage = merchantUpdateError.message.toLowerCase()
      const isDuplicate = merchantUpdateError.code === "23505" || lowerMessage.includes("duplicate")
      return NextResponse.json(
        { error: isDuplicate ? "This StepTag is already taken. Try another one." : "Could not save StepTag right now." },
        { status: isDuplicate ? 409 : 500, headers: PRIVATE_API_CACHE_HEADERS }
      )
    }
  } else {
    const { error: merchantInsertError } = await supabase.from("merchants").insert({
      user_id: user.id,
      business_name: asNonEmptyString(metadata.business_name) ?? asNonEmptyString(metadata.full_name) ?? asNonEmptyString(metadata.name),
      email: user.email ?? null,
      phone_number: asNonEmptyString(metadata.phone_number),
      country: asNonEmptyString(metadata.country),
      step_tag: stepTag,
    })

    if (merchantInsertError) {
      const lowerMessage = merchantInsertError.message.toLowerCase()
      const isDuplicate = merchantInsertError.code === "23505" || lowerMessage.includes("duplicate")
      return NextResponse.json(
        { error: isDuplicate ? "This StepTag is already taken. Try another one." : "Could not save StepTag right now." },
        { status: isDuplicate ? 409 : 500, headers: PRIVATE_API_CACHE_HEADERS }
      )
    }
  }

  const { error: metadataUpdateError } = await supabase.auth.updateUser({
    data: {
      ...metadata,
      step_tag: stepTag,
    },
  })

  if (metadataUpdateError) {
    console.error("Metadata update error after StepTag save:", metadataUpdateError.message)
  }

  return NextResponse.json(
    { stepTag, saved: true },
    { headers: PRIVATE_API_CACHE_HEADERS }
  )
}
