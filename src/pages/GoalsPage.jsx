import { useState } from 'react'
import { Goal, Plus, Settings, Trash2 } from 'lucide-react'
import { goalProgress } from '../lib/briefUtils.js'
import { GoalModal } from '../components/modals/GoalModal.jsx'

// ── Goals ─────────────────────────────────────────────
export function GoalsPage({ goals, projects, onAdd, onUpdate, onDelete, onPage }) {
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const linkedName = (g) => projects.find((p) => p.id === g.projectId)?.name

  return <div className="sub-page goals-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">STAR CHART</p><h1>星圖</h1><p>每個目標都是一顆星，連回你想去的地方。</p></div>
      <button className="primary-button" onClick={() => { setEditingGoal(null); setShowModal(true) }}><Plus size={16} />新增目標</button>
    </section>
    {goals.length === 0
      ? <div className="empty-state"><Goal size={32} /><p>還沒有目標。按下「新增目標」開始追蹤。</p></div>
      : <div className="goals-grid">{goals.map((goal) => {
          const progress = goalProgress(goal, projects)
          const linked = !!goal.projectId
          return <article className="goal-card" key={goal.id}>
          <div className="goal-card-header"><div className="goal-color-bar" style={{ background: goal.color }} /><div className="goal-card-meta">
            <span className="goal-target-date">截止 {goal.targetDate}</span>
            <div className="goal-actions">
              <button className="icon-btn" onClick={() => { setEditingGoal(goal); setShowModal(true) }} aria-label="編輯"><Settings size={13} /></button>
              <button className="icon-btn delete" onClick={() => { if (confirm('確定刪除這個目標？')) onDelete(goal.id) }} aria-label="刪除"><Trash2 size={13} /></button>
            </div>
          </div></div>
          <h3 className="goal-title">{goal.title}{linked && <span className="goal-link-tag">連動 {linkedName(goal)}</span>}</h3>
          <p className="goal-desc">{goal.description}</p>
          <div className="goal-progress-section">
            <div className="goal-bar-large"><span style={{ width: `${progress}%`, background: goal.color }} /></div>
            {linked
              ? <p className="settings-hint">進度自動跟隨「{linkedName(goal)}」的專案進度。</p>
              : <div className="goal-controls">
                  <button className="goal-btn" onClick={() => onUpdate(goal.id, { progress: Math.max(0, goal.progress - 5) })}>-5%</button>
                  <span className="goal-percent">{goal.progress}%</span>
                  <button className="goal-btn" onClick={() => onUpdate(goal.id, { progress: Math.min(100, goal.progress + 5) })}>+5%</button>
                  <button className="goal-btn complete" onClick={() => onUpdate(goal.id, { progress: 100 })}>完成</button>
                </div>}
          </div>
        </article>
      })}</div>
    }
    {showModal && <GoalModal goal={editingGoal} projects={projects} onClose={() => { setShowModal(false); setEditingGoal(null) }} onSave={(data) => { if (editingGoal) onUpdate(editingGoal.id, data); else onAdd(data); setShowModal(false); setEditingGoal(null) }} />}
  </div>
}
