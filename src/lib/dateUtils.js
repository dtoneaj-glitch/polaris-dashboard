// ── 日期工具（任務真日期 v1.3）────────────────────────
export const DAY = 86400000

export function toISO(d) { const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` }
export function todayStr(offset = 0) { return toISO(new Date(Date.now() + offset * DAY)) }
export function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12) }
export function dueLabel(s) {
  if (!s) return { text: '無日期', tone: '' }
  const t = todayStr()
  if (s === t) return { text: '今天', tone: 'today' }
  if (s === todayStr(1)) return { text: '明天', tone: 'soon' }
  const diff = Math.round((parseDate(s) - parseDate(t)) / DAY)
  if (diff < 0) return { text: `逾期 ${-diff} 天`, tone: 'overdue' }
  if (diff < 7) return { text: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][parseDate(s).getDay()], tone: 'soon' }
  const d = parseDate(s)
  return { text: `${d.getMonth() + 1}/${d.getDate()}`, tone: 'soon' }
}
// 舊資料的文字日期（今天／週五／下週一…）遷移成真日期
export function migrateDue(due) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(due || '')) return due
  const t = due || ''
  if (t === '今天') return todayStr()
  if (t === '明天') return todayStr(1)
  if (t === '後天') return todayStr(2)
  if (t === '週五') return todayStr((5 - new Date().getDay() + 7) % 7)
  if (t === '下週一') return todayStr(((1 - new Date().getDay()) + 7) % 7 || 7)
  const m = t.match(/(\d+)\s*天/)
  if (m) return todayStr(Number(m[1]))
  return todayStr(7)
}
// 舊資料的文字時間（今天／15 天前…）遷移成時間戳
export function migrateTs(v) {
  if (typeof v === 'number') return v
  if (v === '今天' || v === '剛剛') return Date.now()
  if (v === '昨天') return Date.now() - DAY
  const m = String(v || '').match(/(\d+)\s*天前/)
  if (m) return Date.now() - Number(m[1]) * DAY
  return Date.now()
}
export function relativeDays(ts) {
  const diff = Math.floor((Date.now() - (ts || 0)) / DAY)
  if (diff <= 0) return '今天'
  if (diff === 1) return '昨天'
  return `${diff} 天前`
}

export function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff} 天前`
  return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}
