//NEED TO RENAME TO CLIENT, may not use much in future, anon key doesnt pass RLS, and this will run in broswer
import { createClient } from '@supabase/supabase-js'


// keys go in .env.local 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)