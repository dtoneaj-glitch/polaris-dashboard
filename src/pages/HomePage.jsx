import { useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Compass,
  Gauge,
  Inbox,
  Plus,
  Sparkles,
  Star,
  Timer,
} from 'lucide-react'
import { DAY, dueLabel, relativeDays, todayStr } from '../lib/dateUtils.js'
import { buildBrief } from '../lib/briefUtils.js'
import { IdeaPreview } from './IdeasPage.jsx'

// ── Home ──────────────────────────────────────────────
export function HomePage({ projects, tasks, goals, focusProject, activeProjects, onTaskToggle, onTaskAdd, onTaskDelete, onTaskEdit, onPage, onAddIdea, userName }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安'
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
  const briefTime = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
  const brief = buildBrief({ projects, tasks, goals })
  const t0 = todayStr()
  const todayOpen = tasks.filter((t) => !t.done && t.due <= t0).sort((a, b) => a.due.localeCompare(b.due))
  const todayDone = tasks.filter((t) => t.done && (t.due === t0 || (t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString())))
  const todayTasks = [...todayOpen, ...todayDone]
  const completedToday = todayDone.length
  const overdueCount = todayOpen.filter((t) => t.due < t0).length
  const upcoming = tasks.filter((t) => !t.done && t.due > t0 && t.due <= todayStr(7)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5)
  const stale = projects.filter((p) => p.stage !== 'Idea' && p.lastUpdated).sort((a, b) => a.lastUpdated - b.lastUpdated).find((p) => Date.now() - p.lastUpdated >= 3 * DAY)
  return (
    <div className="home-page">
      <section className="welcome-row">
        <div><p className="eyebrow">{dateLabel}</p><h1>今天，先推進一件事。</h1><p className="welcome-copy">{greeting}，{userName}。Nora 已經替你校準好今天的方向。</p></div>
        <button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button>
      </section>
      <div className="home-grid">
        <div className="home-main-column">
          <section className="brief-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Star size={14} />POLARIS DAILY</div><h2>今日星象</h2></div><span className="brief-time"><Clock3 size={14} />更新於 {briefTime}</span></div>
            <div className="brief-message"><span className="quote-mark">"</span><p>{brief.message}</p></div>
            <div className="brief-divider" />
            <div className="brief-columns">
              <BriefList title="今天建議" icon={Compass} tone="coral" items={brief.suggestions} onPage={onPage} />
              {brief.recent.length
                ? <BriefList title="最近完成" icon={Check} tone="green" items={brief.recent} />
                : <BriefList title="最近完成" icon={Check} tone="green" items={[{ title: '還沒有完成紀錄', meta: '完成任務後會自動出現在這裡', done: true }]} />}
            </div>
          </section>
          <section className="focus-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Star size={14} />NORTH STAR</div><h2>北極星：{focusProject.name}</h2></div><button className="text-button" onClick={() => onPage('projects')}>查看專案 <ArrowUpRight size={15} /></button></div>
            <div className="focus-content">
              <div className="focus-project-mark" style={{ background: focusProject.color }}><Sparkles size={20} /></div>
              <div className="focus-project-copy">
                <strong>{focusProject.next}</strong><span>{focusProject.description}</span>
                <div className="focus-progress-line"><span style={{ width: `${focusProject.progress}%`, background: focusProject.color }} /></div>
                <div className="progress-meta"><span>專案進度</span><b>{focusProject.progress}%</b></div>
              </div>
              <button className="outline-button" onClick={() => onPage('projects')}>開始工作 <ChevronRight size={15} /></button>
            </div>
          </section>
          <section className="tasks-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Timer size={14} />TODAY'S ACTIONS</div><h2>今天的行動{overdueCount > 0 ? <span className="overdue-badge">{overdueCount} 項逾期</span> : null}</h2></div><span className="task-count">{completedToday}/{todayOpen.length + completedToday} 完成</span></div>
            {todayTasks.length === 0
              ? <div className="empty-state"><Check size={26} /><p>今天沒有排程任務。從下面加入一個，或到專案裡安排。</p></div>
              : <div className="task-list">{todayTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onTaskToggle} onDelete={onTaskDelete} onEdit={onTaskEdit} projects={projects} />)}</div>}
            <TaskComposer projects={projects} onAdd={onTaskAdd} />
            <div className="upcoming-block">
              <div className="upcoming-head">接下來 7 天</div>
              {upcoming.length === 0
                ? <p className="detail-empty">沒有排程中的任務。</p>
                : upcoming.map((task) => {
                    const d = dueLabel(task.due)
                    const proj = projects.find((p) => p.id === task.projectId)
                    return <div key={task.id} className="upcoming-row" onClick={() => onTaskEdit(task.id)}>
                      <strong>{task.title}</strong>
                      <span>{proj?.name || ''} · {d.text}</span>
                    </div>
                  })}
            </div>
          </section>
        </div>
        <aside className="home-side-column">
          <section className="attention-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker attention-kicker"><Bell size={14} />ATTENTION</div><h3>需要注意</h3></div><span className="attention-count">{stale ? 1 : 0}</span></div>
            {stale
              ? <div className="attention-item"><div className="project-dot" style={{ background: stale.color }} /><div className="attention-copy"><strong>{stale.name}</strong><span>{relativeDays(stale.lastUpdated)}沒有更新</span><p>下一步可能太大，把它切小一點，或先放下。</p></div></div>
              : <div className="attention-item"><div className="project-dot" style={{ background: 'var(--green)' }} /><div className="attention-copy"><strong>動能不錯</strong><span>所有專案近期都有更新</span><p>維持節奏，把今天的北極星推進一格。</p></div></div>}
            <button className="soft-button" onClick={() => onPage('projects')}>檢視並整理 <ArrowUpRight size={14} /></button>
          </section>
          <section className="capacity-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker"><Gauge size={14} />CAPACITY</div><h3>專案容量</h3></div><strong className="capacity-number">{activeProjects.length}<small>/3</small></strong></div>
            <div className="capacity-track">{[0,1,2].map((s) => <span key={s} className={s < activeProjects.length ? 'filled' : ''} />)}</div>
            <p>Active 專案最多維持 3 個。現在還有空間給一個真正值得推進的想法。</p>
            <button className="text-button" onClick={() => onPage('projects')}>管理專案 <ChevronRight size={14} /></button>
          </section>
          <section className="ideas-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker"><Inbox size={14} />IDEA INBOX</div><h3>最近的靈感</h3></div><button className="icon-button" onClick={() => onPage('ideas')}><ArrowUpRight size={14} /></button></div>
            <div className="idea-preview-list">
              <IdeaPreview title="台股板塊輪動儀表板" type="產品" score="91" />
              <IdeaPreview title="法人買賣超追蹤" type="系統" score="85" />
              <IdeaPreview title="股流歷史模式庫" type="產品" score="73" />
            </div>
            <button className="text-button" onClick={() => onPage('ideas')}>檢視全部 <ChevronRight size={14} /></button>
          </section>
        </aside>
      </div>
    </div>
  )
}

export function BriefList({ title, icon: Icon, tone, items, onPage }) {
  return <div className={`brief-list ${tone}`}>
    <div className="brief-list-title"><Icon size={15} /><strong>{title}</strong></div>
    {items.map((item) => <button className="brief-list-item" key={item.title} onClick={() => onPage?.('projects')}>
      <span className={`status-icon ${item.done ? 'done' : ''}`}>{item.done ? <Check size={12} /> : <Circle size={8} />}</span>
      <span><strong>{item.title}</strong><small>{item.meta}</small></span><ChevronRight size={14} />
    </button>)}
  </div>
}

export function TaskRow({ task, onToggle, onDelete, onEdit, projects }) {
  const proj = projects?.find((p) => p.id === task.projectId)
  const d = dueLabel(task.due)
  return <div className={`task-row ${task.done ? 'completed' : ''}`}>
    <button className="checkbox-button" onClick={() => onToggle(task.id)}>{task.done ? <Check size={13} /> : null}</button>
    <div className="task-copy" onClick={() => onEdit(task.id)}><strong>{task.title}</strong><span>{proj?.name || task.projectId} · {task.priority}優先</span></div>
    <span className={`task-due ${d.tone}`}>{d.text}</span>
    <button className="row-more" aria-label="刪除任務" onClick={() => { if (confirm('刪除這個任務？')) onDelete(task.id) }}>•••</button>
  </div>
}

export function TaskComposer({ projects, onAdd }) {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [due, setDue] = useState(todayStr())
  const [priority, setPriority] = useState('中')
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), projectId, due, priority })
    setTitle('')
    setDue(todayStr())
  }
  return (
    <form className="task-composer" onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="加入任務…" />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        {['高', '中', '低'].map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <button type="submit" className="primary-button" disabled={!title.trim()}><Plus size={14} />加入</button>
    </form>
  )
}
