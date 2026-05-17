import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

export type DivinationLog = {
  id: string
  created_at: string
  question: string
  guardian_key: string
  hexagram_lines: number[]
  hexagram_index: number
  mansion_index: number
  ganzhi_day: string
  fortune_text: string
  verified_hash: string
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
