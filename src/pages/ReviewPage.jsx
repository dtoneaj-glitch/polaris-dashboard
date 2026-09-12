import { useState } from 'react'
import { Check, Circle, Lightbulb, Target } from 'lucide-react'
import { formatDate, parseDate, toISO, todayStr } from '../lib/dateUtils.js'
import { goalProgress } from '../lib/briefUtils.js'

// ── Review ────────────────────────────────────────────
export function weekKeyOf(d = new Date()) {
  const day = (d.getDay() + 6) % 7 // 週一 = 0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
  return toISO(monday)
}

export function ReviewPage({ goals, projects, tasks, reviews, snapshots, onSave }) {
  const [section, setSection] = useState('wins')
  const currentKey = weekKeyOf()
  const draft = reviews.find((r) => r.weekKey === currentKey)
  const [notes, setNotes] = useState(() => ({ wins: draft?.wins || '', learnings: draft?.learnings || '', block: draft?.block || '', next: draft?.next || '' }))

  const mondayTs = parseDate(currentKey).getTime()
  const doneCount = tasks.filter((t) => t.done && (t.completedAt ? t.completedAt >= mondayTs : true)).length
  const weekDoneList = tasks.filter((t) => t.done && t.completedAt && t.completedAt >= mondayTs).sort((a, b) => b.completedAt - a.completedAt)
  const inProgressGoals = goals.filter((g) => goalProgress(g, projects) > 0 && goalProgress(g, projects) < 100).length
  const completedGoals = goals.filter((g) => goalProgress(g, projects) >= 100).length
  const past = reviews.filter((r) => r.weekKey !== currentKey).sort((a, b) => b.weekKey.localeCompare(a.weekKey))

  // 14 天完成動能：每天完成的任務數
  const days14 = [...Array(14)].map((_, i) => todayStr(13 - i))
  const counts14 = days14.map((d) => tasks.filter((t) => t.done && t.completedAt && toISO(new Date(t.completedAt)) === d).length)
  const maxCount = Math.max(1, ...counts14)
  // 專案進度快照趨勢（每天自動記一次，累積中）
  const snaps = (snapshots || []).slice(-7)

  const placeholders = {
    wins: '這週做得好的三件事…',
    learnings: '有什麼發現或領悟…',
    block: '現在卡在哪裡？真正的阻礙是什麼？',
    next: '下週最重要的三件事…',
  }
  const fieldLabels = { wins: '本週收穫', learnings: '學到什麼', block: '卡在哪裡', next: '下週重點' }

  return <div className="sub-page review-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">REVIEW</p><h1>每週回顧</h1><p>用一週的距離，看清楚自己在往哪裡走。本週：{currentKey} 起。</p></div>
    </section>
    <div className="review-summary">
      <div className="summary-card"><span className="summary-label">本週完成任務</span><strong className="summary-value">{doneCount}</strong></div>
      <div className="summary-card"><span className="summary-label">進行中目標</span><strong className="summary-value">{inProgressGoals}</strong></div>
      <div className="summary-card"><span className="summary-label">已達成目標</span><strong className="summary-value">{completedGoals}</strong></div>
      <div className="summary-card"><span className="summary-label">本週專注專案</span><strong className="summary-value">{projects.filter((p) => p.stage === 'Active').length}/3</strong></div>
    </div>
    <div className="momentum">
      <div className="upcoming-head">近 14 天完成動能</div>
      <div className="momentum-bars">
        {counts14.map((n, i) => (
          <div key={i} className={`momentum-col ${n === 0 ? 'zero' : ''}`} title={`${days14[i]}：完成 ${n} 項`}>
            <span className="momentum-bar" style={{ height: `${Math.max(3, Math.round((n / maxCount) * 100))}%` }} />
          </div>
        ))}
      </div>
      <div className="momentum-axis"><span>{days14[0].slice(5).replace('-', '/')}</span><span>今天</span></div>
    </div>
    {snaps.length >= 2 && (
      <div className="momentum">
        <div className="upcoming-head">專案進度快照（每天自動記一次）</div>
        <div className="snap-table" style={{ gridTemplateColumns: `minmax(52px, auto) repeat(${projects.length}, 1fr)` }}>
          <div className="snap-row snap-head"><span className="snap-date">日期</span>{projects.map((p) => <span key={p.id} className="snap-cell">{p.name}</span>)}</div>
          {snaps.map((s) => (
            <div key={s.date} className="snap-row">
              <span className="snap-date">{s.date.slice(5)}</span>
              {projects.map((p) => <span key={p.id} className="snap-cell">{(s.projects || {})[p.id] ?? '—'}</span>)}
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="review-tabs">
      {[
        { id: 'wins', label: '本週收穫', icon: Check },
        { id: 'learnings', label: '學到什麼', icon: Lightbulb },
        { id: 'block', label: '卡在哪裡', icon: Circle },
        { id: 'next', label: '下週重點', icon: Target },
      ].map(({ id, label, icon: Icon }) => (
        <button key={id} className={`review-tab ${section === id ? 'active' : ''}`} onClick={() => setSection(id)}><Icon size={14} />{label}</button>
      ))}
    </div>
    <div className="review-editor">
      <textarea className="review-textarea" placeholder={placeholders[section] || ''} value={notes[section] || ''} onChange={(e) => setNotes({ ...notes, [section]: e.target.value })} rows={6} />
      <button className="primary-button" onClick={() => onSave(currentKey, notes)}><Check size={15} />儲存本週回顧</button>
    </div>
    <div className="upcoming-block">
      <div className="upcoming-head">本週已完成（自動帶入）</div>
      {weekDoneList.length === 0
        ? <p className="detail-empty">這週還沒有完成的任務 — 回去把今天的行動清一格，這裡就會自動長出來。</p>
        : weekDoneList.map((t) => (
          <div key={t.id} className="upcoming-row"><strong>{t.title}</strong><span>{new Date(t.completedAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} 完成</span></div>
        ))}
    </div>
    <div className="review-history">
      <h3>歷史回顧（{past.length}）</h3>
      {past.length === 0
        ? <p className="detail-empty">還沒有歷史回顧。儲存本週之後，下週它就會出現在這裡。</p>
        : <div className="review-history-grid">{past.map((r) => (
            <article key={r.weekKey} className="review-history-card">
              <header><strong>{r.weekKey} 那一週</strong><span>儲存於 {formatDate(r.savedAt)}</span></header>
              <div className="review-history-fields">
                {Object.keys(fieldLabels).map((k) => (
                  <div key={k}><b>{fieldLabels[k]}</b><p>{r[k] || '—'}</p></div>
                ))}
              </div>
            </article>
          ))}</div>}
    </div>
    <div className="review-goals">
      <h3>目標進度追蹤</h3>
      {goals.map((g) => <div className="review-goal-row" key={g.id}>
        <div className="review-goal-info">
          <span className="review-goal-color" style={{ background: g.color }} />
          <strong>{g.title}</strong><span>{g.description}</span>
        </div>
        <div className="review-goal-progress">
          <div className="goal-bar"><span style={{ width: `${goalProgress(g, projects)}%`, background: g.color }} /></div>
          <span>{goalProgress(g, projects)}%</span>
        </div>
      </div>)}
    </div>
  </div>
}
