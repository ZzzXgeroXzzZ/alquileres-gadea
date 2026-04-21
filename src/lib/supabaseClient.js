import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ayrihokzrajufnthjndx.supabase.co'
const supabaseAnonKey = 'sb_publishable_ooR40wIskwiEOI1sk5p_8Q_qeQa4s_E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)