import { useState } from 'react'
import { Check, Timer, Trash2, X } from 'lucide-react'
import { dueLabel, todayStr } from '../../lib/dateUtils.js'

export function TaskModal({ task, projects, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title || '')
  const [projectId, setProjectId] = useState(task?.projectId || projects[0]?.id || '')
  const [due, setDue] = useState(task?.due || todayStr())
  const [priority, setPriority] = useState(task?.priority || '中')
  const [done, setDone] = useState(task?.done || false)
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), projectId, due, priority, done, completedAt: done ? (task?.completedAt || Date.now()) : null })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><Timer size={14} />EDIT TASK</div><h2>編輯任務</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>任務名稱<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="要做什麼？" /></label>
        <div className="modal-row">
          <label>關聯專案<select value={projectId} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>優先級<select value={priority} onChange={(e) => setPriority(e.target.value)}>{['高', '中', '低'].map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
        </div>
        <label>到期日<input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        {due && <p className="settings-hint">這天：{dueLabel(due).text}</p>}
        <label className="task-modal-done"><input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />標記為已完成</label>
        <div className="modal-actions">
          <button type="button" className="outline-button danger" onClick={() => { if (confirm('刪除這個任務？')) onDelete() }}><Trash2 size={15} />刪除</button>
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!title.trim()}><Check size={16} />儲存任務</button>
        </div>
      </form>
    </div>
  </div>
}
