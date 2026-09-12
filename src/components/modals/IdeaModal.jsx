import { useState } from 'react'
import { Lightbulb, Plus, X } from 'lucide-react'

// ── Idea Modal ────────────────────────────────────────
export function IdeaModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [type, setType] = useState('產品')
  function submit(event) { event.preventDefault(); if (!title.trim()) return; onSave({ title: title.trim(), note: note.trim() || '還沒有補充說明。', type, score: 50 }) }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><Lightbulb size={14} />NEW IDEA</div><h2>捕捉一個靈感</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>靈感名稱<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：AI 教育遊戲" /></label>
        <label>先記下來<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="它解決什麼問題？為什麼現在想到？" rows="4" /></label>
        <label>類型<select value={type} onChange={(event) => setType(event.target.value)}><option>產品</option><option>內容</option><option>系統</option><option>生活</option></select></label>
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!title.trim()}><Plus size={16} />放入 Ideas</button>
        </div>
      </form>
    </div>
  </div>
}
