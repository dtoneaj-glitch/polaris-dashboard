import { ChevronRight, Settings } from 'lucide-react'

// ── Empty placeholder ─────────────────────────────────
export function EmptyPage({ page, onPage }) {
  return <div className="empty-page">
    <div className="empty-icon"><Settings size={26} /></div>
    <p className="eyebrow">{page.toUpperCase()}</p>
    <h1>這個頁面還在規劃中。</h1>
    <p className="empty-copy">先回到 Home，看 Nora 幫你整理好的今日重點。</p>
    <button className="primary-button" onClick={() => onPage('home')}>回到今日總覽 <ChevronRight size={15} /></button>
  </div>
}
