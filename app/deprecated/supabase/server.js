//depricated, supabase.ts does the same
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY //service role key for admins?

export const supabase = createClient(supabaseUrl, supabaseKey)