import { createClient } from '@supabase/supabase-js'

export const CLOUD_CREDS_KEY = 'polaris_supabase_creds'

// ── Supabase 雲端同步 ─────────────────────────────────
let _supabase = null
let _cloudEmail = null

export function getSupabase() {
  if (_supabase) return _supabase
  try {
    const creds = JSON.parse(localStorage.getItem(CLOUD_CREDS_KEY) || '{}')
    if (creds.url && creds.key) {
      _supabase = createClient(creds.url, creds.key)
      return _supabase
    }
  } catch {}
  return null
}

// 重設 cached client（例如變更/移除憑證後）
export function resetCloudConnection() {
  _supabase = null
  _cloudEmail = null
}

export async function loadFromCloud() {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const { data: authData } = await sb.auth.getUser()
    const user = authData?.user
    if (!user) return null
    _cloudEmail = user.email
    const result = {}
    for (const table of ['projects', 'tasks', 'ideas', 'notes', 'timeline_events', 'goals', 'snapshots', 'reviews']) {
      const { data, error } = await sb.from(table).select('*').eq('owner_email', _cloudEmail)
      if (!error && data?.length) result[table] = data
    }
    return result
  } catch (e) {
    console.warn('Cloud load error:', e)
    return null
  }
}

export async function syncToCloud(state) {
  const sb = getSupabase()
  if (!sb || !_cloudEmail) return
  try {
    await sb.from('profiles').upsert({ email: _cloudEmail, display_name: state.settings?.userName || '' }, { onConflict: 'email' })
    for (const table of ['projects', 'tasks', 'ideas', 'notes', 'timeline_events', 'goals', 'snapshots', 'reviews']) {
      const items = state[table] || []
      if (items.length) {
        const records = items.map(i => ({ ...i, owner_email: _cloudEmail }))
        await sb.from(table).upsert(records, { onConflict: 'id' })
      }
    }
  } catch (e) { console.warn('Cloud sync error:', e) }
}
