import { useState } from 'react'
import { Check, FolderKanban, Trash2, X } from 'lucide-react'

export function ProjectModal({ project, projects, onClose, onSave, onDelete }) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [stage, setStage] = useState(project?.stage || 'Idea')
  const [color, setColor] = useState(project?.color || '#e76f51')
  const [progress, setProgress] = useState(project?.progress ?? 0)
  const [next, setNext] = useState(project?.next || '')
  const [error, setError] = useState('')
  const activeCount = projects.filter((p) => p.stage === 'Active' && p.id !== project?.id).length
  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (stage === 'Active' && activeCount >= 3) { setError(`Active 專案最多維持 3 個（目前已有 ${activeCount} 個）。請先把其他專案調離 Active。`); return }
    onSave({ name: name.trim(), description: description.trim() || '還沒有寫描述。', stage, color, progress, next: next.trim() || '定義第一個可驗證成果' })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><FolderKanban size={14} />{project ? 'EDIT PROJECT' : 'NEW PROJECT'}</div><h2>{project ? '編輯專案' : '新增專案'}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>專案名稱<input autoFocus value={name} onChange={(e) => { setName(e.target.value); setError('') }} placeholder="例如：股流Radar" /></label>
        <label>描述<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="這個專案在做什麼？" rows={2} /></label>
        <div className="modal-row">
          <label>階段<select value={stage} onChange={(e) => { setStage(e.target.value); setError('') }}><option>Idea</option><option>Explore</option><option>MVP</option><option>Active</option></select></label>
          <label>顏色
            <div className="color-picker">
              {['#e76f51', '#6f8f78', '#7087a3', '#bb8b4d', '#9b5de5', '#00bbf9'].map((c) =>
                <button key={c} type="button" className={`color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
              )}
            </div>
          </label>
        </div>
        <label>下一步<input value={next} onChange={(e) => setNext(e.target.value)} placeholder="下一個具體可執行的動作" /></label>
        <label>目前進度 <span className="progress-label">{progress}%</span>
          <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="progress-range" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          {onDelete && <button type="button" className="outline-button danger" onClick={onDelete}><Trash2 size={15} />刪除</button>}
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!name.trim()}><Check size={16} />{project ? '儲存變更' : '建立專案'}</button>
        </div>
      </form>
    </div>
  </div>
}
