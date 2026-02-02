// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'  // ← This import was missing
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const cookieStore = cookies()

  const supabase = createServerClient(
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (!session.user.email_confirmed_at) {
      return NextResponse.redirect(
        new URL(
          `/login?error=unconfirmed&email=${encodeURIComponent(session.user.email || '')}`,
          req.url
        )
      )
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}