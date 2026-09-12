// ── Notifications ─────────────────────────────────────
export function NotificationPanel({ items, onClose }) {
  return <div className="notif-panel">
    <div className="notif-head">NEEDS ATTENTION · {items.length}</div>
    {items.length === 0
      ? <div className="notif-empty">目前沒有需要留意的事。</div>
      : items.map((n, i) => (
        <button key={i} className="notif-item" onClick={() => { n.go(); onClose() }}>
          <span className="notif-dot" style={{ background: n.kind === 'task' ? 'var(--coral)' : n.kind === 'stale' ? 'var(--yellow, #f5d879)' : 'var(--green)' }} />
          <span className="notif-item-copy"><strong>{n.text}</strong><span>{n.sub}</span></span>
        </button>
      ))}
  </div>
}
