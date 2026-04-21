import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ayrihokzrajufnthjndx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ooR40wIskwiE0Ii1sk5p_8Q_qeQa4s_E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)