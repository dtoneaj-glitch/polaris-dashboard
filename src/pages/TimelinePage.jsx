import { useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { TimelineModal } from '../components/modals/TimelineModal.jsx'

// ── Timeline ──────────────────────────────────────────
export function TimelinePage({ events, projects, onAdd, onDelete, onPage }) {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter)

  return <div className="sub-page timeline-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">TIMELINE</p><h1>進展時間軸</h1><p>看見每個專案怎麼走到現在。</p></div>
      <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={16} />新增事件</button>
    </section>
    <div className="timeline-filters">
      <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部 <span>{events.length}</span></button>
      <button className={`filter-btn ${filter === 'milestone' ? 'active' : ''}`} onClick={() => setFilter('milestone')}>里程碑</button>
      <button className={`filter-btn ${filter === 'note' ? 'active' : ''}`} onClick={() => setFilter('note')}>筆記</button>
    </div>
    {filtered.length === 0
      ? <div className="empty-state"><CalendarDays size={32} /><p>還沒有事件。按下「新增事件」開始記錄進展。</p></div>
      : <div className="timeline">
          {filtered.map((ev, i) => {
            const project = projects.find((p) => p.id === ev.projectId)
            const isLast = i === filtered.length - 1
            return <div className="timeline-item" key={ev.id}>
              <div className="timeline-dot-row">
                <div className="timeline-dot" style={{ background: ev.color || project?.color || '#e76f51' }} />
                {!isLast && <div className="timeline-line" style={{ background: ev.color || project?.color || '#e76f51' }} />}
              </div>
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <span className="timeline-date">{ev.date}</span>
                  <span className={`timeline-type-badge ${ev.type}`}>{ev.type === 'milestone' ? '里程碑' : '筆記'}</span>
                  {project && <span className="timeline-project-tag" style={{ borderColor: project.color, color: project.color }}>{project.name}</span>}
                </div>
                <h3 className="timeline-title">{ev.title}</h3>
                <button className="text-button delete-event" onClick={() => { if (confirm('確定刪除？')) onDelete(ev.id) }}>刪除</button>
              </div>
            </div>
          })}
        </div>
    }
    {showModal && <TimelineModal projects={projects} onClose={() => setShowModal(false)} onAdd={onAdd} />}
  </div>
}
