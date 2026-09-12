import { useState } from 'react'
import { Goal, Plus, X } from 'lucide-react'

export function GoalModal({ goal, projects, onClose, onSave }) {
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [targetDate, setTargetDate] = useState(goal?.targetDate || '')
  const [progress, setProgress] = useState(goal?.progress ?? 0)
  const [color, setColor] = useState(goal?.color || '#e76f51')
  const [projectId, setProjectId] = useState(goal?.projectId || '')

  function submit(e) {
    e.preventDefault()
    if (!title.trim() || !targetDate) return
    onSave({ title: title.trim(), description: description.trim(), targetDate, progress, color, projectId })
  }

  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><Goal size={14} />{goal ? 'EDIT GOAL' : 'NEW GOAL'}</div><h2>{goal ? '編輯目標' : '新增目標'}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>目標名稱<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：SUNO 頻道連續 4 週每週一首" /></label>
        <label>描述<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="為什麼這件重要？" rows={2} /></label>
        <div className="modal-row">
          <label>截止日期<input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required /></label>
          <label>顏色
            <div className="color-picker">
              {['#e76f51', '#6f8f78', '#7087a3', '#bb8b4d', '#9b5de5', '#00bbf9'].map((c) =>
                <button key={c} type="button" className={`color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
              )}
            </div>
          </label>
        </div>
        <label>連動專案（選填）
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">不連動（手動調整進度）</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {projectId
          ? <p className="settings-hint">進度將自動跟隨「{projects.find((p) => p.id === projectId)?.name}」的專案進度。</p>
          : <label>目前進度 <span className="progress-label">{progress}%</span>
              <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="progress-range" />
            </label>}
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!title.trim() || !targetDate}><Plus size={16} />{goal ? '儲存變更' : '新增目標'}</button>
        </div>
      </form>
    </div>
  </div>
}
