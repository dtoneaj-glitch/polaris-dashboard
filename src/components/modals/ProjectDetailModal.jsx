import { Check, Settings, Trash2, X } from 'lucide-react'
import { dueLabel, formatDate, relativeDays } from '../../lib/dateUtils.js'

// ── Project Detail Modal ──────────────────────────────
export function ProjectDetailModal({ project, tasks, notes, events, onClose, onToggleTask, onEdit, onDelete, onUpdateProgress }) {
  if (!project) return null
  const projectTasks = tasks.filter((t) => t.projectId === project.id).sort((a, b) => (a.done - b.done) || a.due.localeCompare(b.due))
  const projectNotes = notes.filter((n) => n.projectId === project.id)
  const projectEvents = events.filter((e) => e.projectId === project.id).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 760, width: 'min(100%, 760px)' }}>
        <div className="modal-header">
          <div>
            <div className="section-kicker"><span className="stage-dot" style={{ background: project.color, display: 'inline-block', marginRight: 6 }} />{project.stage} · PROJECT</div>
            <h2>{project.name}</h2>
          </div>
          <div className="detail-actions">
            <button className="outline-button" onClick={onEdit}><Settings size={14} />編輯</button>
            {onDelete && <button className="icon-btn delete" onClick={onDelete} aria-label="刪除專案"><Trash2 size={14} /></button>}
            <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
          </div>
        </div>
        <p className="detail-desc">{project.description}</p>
        <div className="detail-progress">
          <div className="project-progress-bar"><span style={{ width: `${project.progress}%`, background: project.color }} /></div>
          <div className="progress-meta"><span>專案進度</span><b>{project.progress}%</b></div>
          <div className="progress-quick">
            <button className="goal-btn" onClick={() => onUpdateProgress(-5)}>-5%</button>
            <button className="goal-btn" onClick={() => onUpdateProgress(5)}>+5%</button>
            <span className="detail-updated-inline">最後更新 {relativeDays(project.lastUpdated)}</span>
          </div>
        </div>
        <div className="detail-next"><span>下一步</span><strong>{project.next}</strong></div>
        <div className="detail-columns">
          <div className="detail-block">
            <h3>任務（{projectTasks.filter((t) => !t.done).length} 進行中 / {projectTasks.length}）</h3>
            {projectTasks.length === 0 ? <p className="detail-empty">還沒有任務。</p> : projectTasks.map((t) => (
              <div key={t.id} className={`detail-task ${t.done ? 'completed' : ''}`}>
                <button className="checkbox-button" onClick={() => onToggleTask(t.id)}>{t.done ? <Check size={13} /> : null}</button>
                <span className="detail-task-title">{t.title}</span>
                <span className="detail-task-meta">{t.priority}優先 · {dueLabel(t.due).text}</span>
              </div>
            ))}
          </div>
          <div className="detail-block">
            <h3>筆記（{projectNotes.length}）</h3>
            {projectNotes.length === 0 ? <p className="detail-empty">還沒有筆記。</p> : projectNotes.map((n) => (
              <div key={n.id} className="detail-note"><strong>{n.title}</strong><span>{formatDate(n.createdAt)}</span></div>
            ))}
            <h3 style={{ marginTop: 14 }}>時間軸（{projectEvents.length}）</h3>
            {projectEvents.length === 0 ? <p className="detail-empty">還沒有事件。</p> : projectEvents.map((ev) => (
              <div key={ev.id} className="detail-event"><span className="detail-event-dot" style={{ background: ev.color || project.color }} /><strong>{ev.title}</strong><span>{ev.date}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
