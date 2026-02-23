import { createClient } from '@supabase/supabase-js'

// 请替换为你的 Supabase 项目 URL 和 Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
