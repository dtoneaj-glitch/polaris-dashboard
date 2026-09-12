import { useState } from 'react'
import { FileText, Plus, X } from 'lucide-react'

export function NoteModal({ note, projects, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [tags, setTags] = useState(note?.tags?.join(', ') || '')
  const [projectId, setProjectId] = useState(note?.projectId || '')
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), content: content.trim() || '還沒有補充內容。', tags: tags.split(',').map((t) => t.trim()).filter(Boolean), projectId })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><FileText size={14} />{note ? 'EDIT NOTE' : 'NEW NOTE'}</div><h2>{note ? '編輯筆記' : '寫一則筆記'}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>標題<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="給這則筆記取個名字" /></label>
        <label>內容<textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="記錄想法、決定、或任何值得留下的東西…" rows={5} /></label>
        <label>標籤（逗號分隔）<input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例如：靈感, 反思, 腳本" /></label>
        <label>關聯專案<select value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">不關聯</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!title.trim()}><Plus size={16} />{note ? '儲存變更' : '新增筆記'}</button>
        </div>
      </form>
    </div>
  </div>
}
