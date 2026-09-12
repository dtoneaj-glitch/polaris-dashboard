import { useEffect, useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { CLOUD_CREDS_KEY, getSupabase, resetCloudConnection, syncToCloud } from '../state/cloudBridge.js'

// ── Settings ──────────────────────────────────────────
export function SettingsPage({ state, onUpdateSettings, onExport, onImport, onReset }) {
  const s = state.settings || {}
  const stats = [
    { label: '專案', value: state.projects.length },
    { label: '靈感', value: state.ideas.length },
    { label: '任務', value: state.tasks.length },
    { label: '筆記', value: state.notes.length },
    { label: '事件', value: state.timelineEvents.length },
    { label: '目標', value: state.goals.length },
    { label: '回顧', value: (state.reviews || []).length },
  ]
  // 雲端狀態
  const [cloudConnected, setCloudConnected] = useState(false)
  const [cloudUrl, setCloudUrl] = useState(() => JSON.parse(localStorage.getItem(CLOUD_CREDS_KEY) || '{}').url || '')
  const [cloudKey, setCloudKey] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    const sb = getSupabase()
    setCloudConnected(!!sb)
  }, [])

  function connectCloud() {
    if (!cloudUrl || !cloudKey) return
    localStorage.setItem(CLOUD_CREDS_KEY, JSON.stringify({ url: cloudUrl, key: cloudKey }))
    resetCloudConnection() // 重設 cached client
    setCloudConnected(true)
    setSyncMsg('已連線，資料將自動同步')
    setTimeout(() => setSyncMsg(''), 3000)
  }

  function disconnectCloud() {
    localStorage.removeItem(CLOUD_CREDS_KEY)
    resetCloudConnection()
    setCloudConnected(false)
    setCloudUrl('')
    setCloudKey('')
    setSyncMsg('已斷開連線')
    setTimeout(() => setSyncMsg(''), 3000)
  }

  async function forceSync() {
    setSyncing(true)
    try {
      await syncToCloud(state)
      setSyncMsg('同步成功 ✓')
    } catch (e) {
      setSyncMsg('同步失敗，請檢查憑證')
    }
    setSyncing(false)
    setTimeout(() => setSyncMsg(''), 3000)
  }

  return (
    <div className="sub-page">
      <section className="sub-page-header">
        <div><p className="eyebrow">SETTINGS</p><h1>設定</h1><p>管理你的工作區與資料。</p></div>
      </section>
      <section className="settings-section">
        <h2>使用者</h2>
        <label>你的名字<input value={s.userName || ''} onChange={(e) => onUpdateSettings({ userName: e.target.value })} placeholder="例如：Chris" /></label>
        <p className="settings-hint">名字會顯示在每日問候與頭像，變更即時生效。工作區名稱固定為「北極星 Polaris」。</p>
      </section>
      <section className="settings-section">
        <h2>☁️ 雲端同步</h2>
        <p className="settings-hint">連接 Supabase 後，手機與電腦的資料會自動同步。先在 https://supabase.com/dashboard 建立專案，取得 URL 與 Anon Key。</p>
        <div className="cloud-config" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="settings-input" placeholder="Supabase URL（形如 https://xxx.supabase.co）" value={cloudUrl} onChange={(e) => setCloudUrl(e.target.value)} />
          <input className="settings-input" placeholder="Anon Public Key" value={cloudKey} onChange={(e) => setCloudKey(e.target.value)} type="password" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cloudConnected
              ? <><button className="primary-button" onClick={forceSync} disabled={syncing}>{syncing ? '同步中…' : '立即同步'}</button>
                <button className="outline-button danger" onClick={disconnectCloud}>斷開連線</button>
                <span style={{ color: 'var(--success)', fontSize: 13, alignSelf: 'center' }}>✓ 已連線</span></>
              : <button className="primary-button" onClick={connectCloud}>連線到雲端</button>}
          </div>
          {syncMsg && <p style={{ fontSize: 13, color: syncMsg.includes('✓') || syncMsg.includes('成功') ? 'var(--success)' : 'var(--error)', margin: 0 }}>{syncMsg}</p>}
        </div>
        <p className="settings-hint" style={{ marginTop: 10, fontSize: 12 }}>連線後每次儲存都會自動上傳；換裝置時先在「設定」輸入相同憑證即可載入資料。</p>
      </section>
      <section className="settings-section">
        <h2>資料</h2>
        <div className="settings-stats">{stats.map((st) => <div key={st.label} className="settings-stat"><strong>{st.value}</strong><span>{st.label}</span></div>)}</div>
        <p className="settings-hint">所有資料都存在這台電腦的瀏覽器裡（localStorage），不會上傳。建議定期匯出 JSON 備份。</p>
        <div className="settings-actions">
          <button className="primary-button" onClick={onExport}><FileText size={15} />匯出備份</button>
          <label className="settings-import">匯入備份<input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => onImport(e.target.files[0])} /></label>
          <button className="outline-button danger" onClick={onReset}><Trash2 size={15} />重置工作區</button>
        </div>
      </section>
      <section className="settings-section">
        <h2>關於</h2>
        <p className="settings-hint">北極星 Polaris v1.7 · Local-first creator command center · React + Vite + Supabase</p>
      </section>
    </div>
  )
}
