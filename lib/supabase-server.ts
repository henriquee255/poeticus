import { createClient } from '@supabase/supabase-js'

// Service role key bypasses RLS — use only in server-side API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey)
