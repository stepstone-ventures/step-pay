import { NextResponse } from "next/server"
import { PRIVATE_API_CACHE_HEADERS, requireAuthenticatedApiUser } from "@/lib/security/route-auth"

export async function GET() {
  const { user, supabase, unauthorizedResponse } = await requireAuthenticatedApiUser()
  if (unauthorizedResponse) return unauthorizedResponse

  const { data: merchantRow, error } = await supabase
    .from("merchants")
    .select("business_name,email,step_tag")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Error loading merchant profile:", error.message)
    return NextResponse.json(
      { error: "Could not load merchant profile." },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const metadataBusinessName =
    typeof metadata.business_name === "string" && metadata.business_name.trim().length > 0
      ? metadata.business_name
      : null
  const metadataStepTag =
    typeof metadata.step_tag === "string" && metadata.step_tag.trim().length > 0
      ? metadata.step_tag
      : null

  return NextResponse.json(
    {
      userId: user.id,
      businessName: merchantRow?.business_name ?? metadataBusinessName,
      email: merchantRow?.email ?? user.email ?? null,
      stepTag: merchantRow?.step_tag ?? metadataStepTag,
    },
    { headers: PRIVATE_API_CACHE_HEADERS }
  )
}
