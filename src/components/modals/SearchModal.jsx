import { useMemo, useState } from 'react'
import { CalendarDays, FileText, FolderKanban, Goal, Lightbulb, Search, Timer } from 'lucide-react'
import { dueLabel, formatDate } from '../../lib/dateUtils.js'

// ── Global Search (⌘K) ────────────────────────────────
export function SearchModal({ state, onClose, onGo }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const query = q.trim().toLowerCase()

  const results = useMemo(() => {
    if (!query) return []
    const out = []
    state.projects.forEach((p) => { if ((p.name + ' ' + p.description).toLowerCase().includes(query)) out.push({ type: '專案', title: p.name, sub: `${p.stage} · 進度 ${p.progress}%`, icon: FolderKanban, go: () => onGo.project(p.id) }) })
    state.tasks.forEach((t) => { if (t.title.toLowerCase().includes(query)) out.push({ type: '任務', title: t.title, sub: `${dueLabel(t.due).text}${t.done ? ' · 已完成' : ''}`, icon: Timer, go: () => onGo.task(t.id) }) })
    state.ideas.forEach((i) => { if ((i.title + ' ' + i.note).toLowerCase().includes(query)) out.push({ type: '靈感', title: i.title, sub: `${i.type} · 值得探索 ${i.score}`, icon: Lightbulb, go: () => onGo.page('ideas') }) })
    state.notes.forEach((n) => { if ((n.title + ' ' + n.content).toLowerCase().includes(query)) out.push({ type: '筆記', title: n.title, sub: formatDate(n.createdAt), icon: FileText, go: () => onGo.page('notes') }) })
    state.goals.forEach((g) => { if ((g.title + ' ' + g.description).toLowerCase().includes(query)) out.push({ type: '星圖', title: g.title, sub: `${g.progress}% · 截止 ${g.targetDate}`, icon: Goal, go: () => onGo.page('goals') }) })
    state.timelineEvents.forEach((e) => { if (e.title.toLowerCase().includes(query)) out.push({ type: '事件', title: e.title, sub: e.date, icon: CalendarDays, go: () => onGo.page('timeline') }) })
    return out.slice(0, 12)
  }, [query, state, onGo])

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[idx]) results[idx].go()
  }

  return (
    <div className="search-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-panel">
        <div className="search-input-row">
          <Search size={17} />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0) }} onKeyDown={onKeyDown} placeholder="搜尋專案、任務、靈感、筆記、目標…" />
          <kbd>esc</kbd>
        </div>
        <div className="search-results">
          {!query
            ? <div className="search-hint">輸入關鍵字搜尋整個工作區。↑↓ 選擇、Enter 前往。</div>
            : results.length === 0
              ? <div className="search-hint">沒有符合「{q}」的結果。</div>
              : results.map((r, i) => {
                  const Icon = r.icon
                  return <button key={i} className={`search-item ${i === idx ? 'sel' : ''}`} onClick={() => r.go()} onMouseEnter={() => setIdx(i)}>
                    <span className="search-item-icon"><Icon size={15} /></span>
                    <span className="search-item-copy"><strong>{r.title}</strong><span>{r.sub}</span></span>
                    <span className="search-item-type">{r.type}</span>
                  </button>
                })}
        </div>
      </div>
    </div>
  )
}
