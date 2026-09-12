import { useState } from 'react'
import { ArrowUpRight, Lightbulb, Plus, Search } from 'lucide-react'

// ── Ideas ─────────────────────────────────────────────
export function IdeasPage({ ideas, onAddIdea, onPromote }) {
  const [typeFilter, setTypeFilter] = useState('全部')
  const [q, setQ] = useState('')
  const types = ['全部', ...new Set(ideas.map((i) => i.type))]
  const filtered = ideas.filter((i) => (typeFilter === '全部' || i.type === typeFilter) && (!q.trim() || (i.title + ' ' + i.note).toLowerCase().includes(q.trim().toLowerCase())))
  return <div className="sub-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">IDEAS</p><h1>靈感池</h1><p>先收好，再決定什麼值得變成專案。</p></div>
      <button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button>
    </section>
    <div className="ideas-toolbar">
      {types.map((t) => (
        <button key={t} className={`filter-button ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t} <span>{t === '全部' ? ideas.length : ideas.filter((i) => i.type === t).length}</span></button>
      ))}
      <div className="ideas-search"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋靈感…" /></div>
    </div>
    {filtered.length === 0
      ? <div className="empty-state"><Lightbulb size={32} /><p>{q || typeFilter !== '全部' ? '沒有符合的靈感。換個關鍵字或篩選試試。' : '靈感池是空的。按下「新增靈感」開始收集。'}</p></div>
      : <div className="idea-grid">
      {filtered.map((idea) => <article className="idea-card" key={idea.id}>
        <div className="idea-card-top"><span className="idea-type">{idea.type}</span><span className="idea-date">{idea.created}</span></div>
        <div className="idea-icon"><Lightbulb size={19} /></div>
        <h3>{idea.title}</h3><p>{idea.note}</p>
        <div className="idea-card-bottom">
          <div className="idea-score"><span>值得探索</span><strong>{idea.score}</strong></div>
          {idea.ready
            ? <button className="small-primary" onClick={() => onPromote(idea.id)}>升級 Project <ArrowUpRight size={13} /></button>
            : <button className="small-outline" onClick={() => onPromote(idea.id)}>開始評估</button>}
        </div>
      </article>)}
      </div>}
  </div>
}

export function IdeaPreview({ title, type, score }) {
  return <div className="idea-preview">
    <div className="idea-preview-icon"><Lightbulb size={14} /></div>
    <div><strong>{title}</strong><span>{type}</span></div><b>{score}</b>
  </div>
}
