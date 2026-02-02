import { createClient } from '@supabase/supabase-js'

// Read from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: print to browser console to verify
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey)

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


