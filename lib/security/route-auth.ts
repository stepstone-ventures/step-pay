import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSupabasePublicEnv } from "@/lib/supabase/env"

export const PRIVATE_API_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
}

export function createRouteSupabaseClient() {
  const cookieStore = cookies()
  const { url, anonKey } = getSupabasePublicEnv()

  return createServerClient(
    url,
    anonKey,
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

export async function requireAuthenticatedApiUser() {
  const supabase = createRouteSupabaseClient()

  const {
    data: { user: fetchedUser },
    error: userError,
  } = await supabase.auth.getUser()

  let user = fetchedUser
  if (!user && userError) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    user = session?.user ?? null
  }

  if (!user || !user.email_confirmed_at) {
    return {
      user: null,
      supabase,
      unauthorizedResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: PRIVATE_API_CACHE_HEADERS }
      ),
    }
  }

  return { user, supabase, unauthorizedResponse: null }
}
