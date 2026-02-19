const SUPABASE_ENV_ERROR =
  "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in Vercel Project Settings > Environment Variables, then redeploy."

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(SUPABASE_ENV_ERROR)
  }

  return { url, anonKey }
}
