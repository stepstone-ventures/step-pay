import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function ensureMerchantRow(
  supabase: ReturnType<typeof createSupabaseServerClient>
) {
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

  await supabase.from("merchants").insert({
    user_id: user.id,
    business_name: metadata.business_name ?? null,
    email: user.email ?? null,
    phone_number: metadata.phone_number ?? null,
    country: metadata.country ?? null,
  })
}

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string; error?: string }
}) {
  if (searchParams.error) {
    redirect("/login?error=verification_failed")
  }

  const supabase = createSupabaseServerClient()

  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code)
    if (error) {
      redirect("/login?error=verification_failed")
    }
  }

  await ensureMerchantRow(supabase)
  redirect("/login?confirmed=true")
}
