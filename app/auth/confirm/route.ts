// app/auth/confirm/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

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

  if (token_hash && type === 'signup') {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'signup',
    })

    if (error) {
      console.error('Verification error:', error.message)
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
    }

    const { user } = data

    if (user) {
      // Create merchants row
      const metadata = user.user_metadata || {}

      const { error: insertError } = await supabase
        .from('merchants')
        .insert({
          user_id: user.id,
          business_name: metadata.business_name,
          email: user.email,
          phone_number: metadata.phone_number,
          country: metadata.country,
        })

      if (insertError) {
        console.error('Merchants insert error:', insertError.message)
      }
    }

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?confirmed=true', request.url))
  }

  // Fallback for old flow or invalid
  return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
}