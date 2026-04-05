import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uikchwmbortfpncjnipk.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2Nod21ib3J0ZnBuY2puaXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzUxNDAsImV4cCI6MjA5MDA1MTE0MH0.4_-Ci9NkadZRV_wAKPbMwS0U2ipLui7Ztfwp8Ynpd1c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
