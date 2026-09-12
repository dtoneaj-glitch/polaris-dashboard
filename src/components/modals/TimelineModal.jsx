import { useState } from 'react'
import { CalendarDays, Plus, X } from 'lucide-react'

export function TimelineModal({ projects, onClose, onAdd }) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('milestone')
  const [projectId, setProjectId] = useState('')
  function submit(e) {
    e.preventDefault()
    if (!date || !title.trim()) return
    const project = projects.find((p) => p.id === projectId)
    onAdd({ date, title: title.trim(), type, projectId, color: project?.color || '#e76f51' })
    onClose()
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><CalendarDays size={14} />NEW EVENT</div><h2>新增時間軸事件</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>日期<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
        <label>標題<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="發生了什麼事？" /></label>
        <label>類型<select value={type} onChange={(e) => setType(e.target.value)}><option value="milestone">里程碑</option><option value="note">筆記記錄</option></select></label>
        <label>關聯專案<select value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">不關聯</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!date || !title.trim()}><Plus size={16} />新增事件</button>
        </div>
      </form>
    </div>
  </div>
}
