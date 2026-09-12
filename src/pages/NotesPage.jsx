import { useMemo, useState } from 'react'
import { FileText, Plus, Search, Settings, Trash2 } from 'lucide-react'
import { formatDate } from '../lib/dateUtils.js'
import { NoteModal } from '../components/modals/NoteModal.jsx'

// ── Notes ─────────────────────────────────────────────
export function NotesPage({ notes, projects, onAdd, onUpdate, onDelete, onPage }) {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const allTags = useMemo(() => {
    const set = new Set()
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)))
    return ['all', ...set]
  }, [notes])

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const s = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
      const t = tagFilter === 'all' || (n.tags || []).includes(tagFilter)
      return s && t
    }).sort((a, b) => b.createdAt - a.createdAt)
  }, [notes, search, tagFilter])

  function handleSave(data) {
    if (editingNote) onUpdate(editingNote.id, data)
    else onAdd(data)
    setShowModal(false)
    setEditingNote(null)
  }

  return <div className="sub-page notes-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">NOTES</p><h1>筆記本</h1><p>把重要的決定和想法留下來。</p></div>
      <button className="primary-button" onClick={() => { setEditingNote(null); setShowModal(true) }}><Plus size={16} />新增筆記</button>
    </section>
    <div className="notes-toolbar">
      <div className="notes-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋筆記…" /></div>
      <div className="notes-tags">{allTags.map((tag) => <button key={tag} className={`tag-btn ${tagFilter === tag ? 'active' : ''}`} onClick={() => setTagFilter(tag)}>{tag === 'all' ? '全部' : tag}</button>)}</div>
    </div>
    {filtered.length === 0
      ? <div className="empty-state"><FileText size={32} /><p>還沒有筆記。按下「新增筆記」開始記錄。</p></div>
      : <div className="notes-grid">{filtered.map((note) => <article className="note-card" key={note.id}>
          <div className="note-card-header">
            <span className="note-date">{formatDate(note.createdAt)}</span>
            <div className="note-actions">
              <button className="icon-btn" onClick={() => { setEditingNote(note); setShowModal(true) }} aria-label="編輯"><Settings size={13} /></button>
              <button className="icon-btn delete" onClick={() => { if (confirm('確定刪除這則筆記？')) onDelete(note.id) }} aria-label="刪除"><Trash2 size={13} /></button>
            </div>
          </div>
          <h3 className="note-title">{note.title}</h3>
          <p className="note-content">{note.content}</p>
          {note.tags?.length > 0 && <div className="note-tags">{note.tags.map((t) => <span key={t} className="note-tag">{t}</span>)}</div>}
          {note.projectId && <div className="note-project"><span className="note-project-dot" style={{ background: projects.find((p) => p.id === note.projectId)?.color || '#9da4aa' }} />{projects.find((p) => p.id === note.projectId)?.name || note.projectId}</div>}
        </article>)}</div>
    }
    {showModal && <NoteModal note={editingNote} projects={projects} onClose={() => { setShowModal(false); setEditingNote(null) }} onSave={handleSave} />}
  </div>
}
