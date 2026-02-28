import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabasePublicEnv } from "@/lib/supabase/env"
import { isRequestHostAllowed } from "@/lib/security/host-allowlist"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isRequestHostAllowed(request.headers.get("host"))) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (pathname.startsWith("/_next/static/") && pathname.endsWith(".map")) {
    return new NextResponse(null, { status: 404 })
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { url, anonKey } = getSupabasePublicEnv()
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

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

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(loginUrl)
    }

    if (!user.email_confirmed_at) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("error", "unconfirmed")
      if (user.email) {
        loginUrl.searchParams.set("email", user.email)
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/:path*"],
}
