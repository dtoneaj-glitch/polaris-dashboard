import { createClient } from '@supabase/supabase-js'

// Supabase 配置（用戶需自行填入）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// 從 localStorage 讀取 credentials
export function loadSupabaseCredentials() {
  try {
    const stored = localStorage.getItem('polaris_supabase_creds')
    if (stored) {
      const { url, anonKey } = JSON.parse(stored)
      if (url && anonKey) {
        return { url, anonKey }
      }
    }
  } catch {}
  return null
}

export function saveSupabaseCredentials(url, anonKey) {
  localStorage.setItem('polaris_supabase_creds', JSON.stringify({ url, anonKey }))
}

export function clearSupabaseCredentials() {
  localStorage.removeItem('polaris_supabase_creds')
}

// 檢查是否已連線
export function isSupabaseConnected() {
  return supabase !== null && SUPABASE_URL !== ''
}
