import { supabase, loadSupabaseCredentials } from './supabase.js'

const LOCAL_KEY = 'nora_workspace_v1_demo_fresh'

// ─── 載入資料 ────────────────────────────────────────────────────
export async function loadStateFromCloud() {
  if (!supabase) return null
  
  try {
    const user = await getCurrentUser()
    if (!user) return null
    
    const email = user.email
    let merged = {}
    
    // 載入各表資料
    const tables = ['projects', 'tasks', 'ideas', 'notes', 'timeline_events', 'goals', 'snapshots', 'reviews']
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('owner_email', email)
      if (!error && data?.length) {
        merged[table] = data
      }
    }
    
    // 載入 profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    if (profileData) merged.profiles = [profileData]
    
    return merged
  } catch (e) {
    console.warn('Cloud load failed:', e)
    return null
  }
}

// ─── 儲存資料到雲端 ───────────────────────────────────────────────
export async function saveStateToCloud(state) {
  if (!supabase) return
  
  try {
    const user = await getCurrentUser()
    if (!user) return
    
    const email = user.email
    
    // Upsert profile
    await supabase.from('profiles').upsert(
      { email, display_name: state.userName || '' },
      { onConflict: 'email' }
    )
    
    // 存入各表
    for (const table of ['projects', 'tasks', 'ideas', 'notes', 'timeline_events', 'goals', 'snapshots', 'reviews']) {
      const items = state[table] || []
      if (items.length === 0) continue
      
      const records = items.map(item => ({ ...item, owner_email: email }))
      await supabase.from(table).upsert(records, { onConflict: 'id' })
    }
  } catch (e) {
    console.warn('Cloud save failed:', e)
  }
}

// ─── 取得目前登入使用者 ──────────────────────────────────────────
export async function getCurrentUser() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  return error ? null : data?.user ?? null
}

// ─── GitHub OAuth 登入 ───────────────────────────────────────────
export async function signInWithGitHub() {
  if (!supabase) return { error: 'Supabase not configured' }
  return await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin }
  })
}

// ─── 訂閱即時同步 ────────────────────────────────────────────────
export function subscribeToRealtime(callback) {
  if (!supabase) return () => {}
  
  const tables = ['projects', 'tasks', 'ideas', 'notes', 'timeline_events', 'goals', 'snapshots', 'reviews']
  const subscriptions = []
  
  for (const table of tables) {
    const sub = supabase
      .channel(`polaris:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        callback({ table, action: payload.eventType, record: payload.new })
      })
      .subscribe()
    subscriptions.push(sub)
  }
  
  return () => subscriptions.forEach(s => supabase.removeChannel(s))
}
