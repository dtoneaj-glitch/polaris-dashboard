import { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  ChevronRight,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Star,
  Sun,
  X,
} from 'lucide-react'
import { DAY, dueLabel, migrateDue, migrateTs, relativeDays, todayStr } from './lib/dateUtils.js'
import { makeEvent } from './lib/briefUtils.js'
import {
  navItems,
  defaultSettings,
  initialProjects,
  initialIdeas,
  initialTasks,
  initialNotes,
  initialTimelineEvents,
  initialGoals,
} from './state/defaults.js'
import { loadState, saveState } from './state/storage.js'
import { getSupabase, loadFromCloud } from './state/cloudBridge.js'

import { HomePage } from './pages/HomePage.jsx'
import { ProjectsPage } from './pages/ProjectsPage.jsx'
import { IdeasPage } from './pages/IdeasPage.jsx'
import { NotesPage } from './pages/NotesPage.jsx'
import { TimelinePage } from './pages/TimelinePage.jsx'
import { ReviewPage } from './pages/ReviewPage.jsx'
import { GoalsPage } from './pages/GoalsPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { EmptyPage } from './pages/EmptyPage.jsx'

import { IdeaModal } from './components/modals/IdeaModal.jsx'
import { AnnotationModal } from './components/modals/AnnotationModal.jsx'
import { SearchModal } from './components/modals/SearchModal.jsx'
import { NotificationPanel } from './components/modals/NotificationPanel.jsx'
import { ProjectDetailModal } from './components/modals/ProjectDetailModal.jsx'
import { ProjectModal } from './components/modals/ProjectModal.jsx'
import { TaskModal } from './components/modals/TaskModal.jsx'

const THEME_KEY = 'polaris_theme'

// ── 主元件 ────────────────────────────────────────────
export function App() {
  const [state, setState] = useState(loadState)
  const [page, setPage] = useState('home')
  const [mobileNav, setMobileNav] = useState(false)
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [notice, setNotice] = useState('')
  const [showAnnotation, setShowAnnotation] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectEditor, setProjectEditor] = useState(null) // null | {mode:'add'} | {mode:'edit', id}
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // ⌘K / Ctrl+K 開關全域搜尋；Escape 關閉搜尋與通知
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setSearchOpen((v) => !v)
        setNotifOpen(false)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => { saveState(state) }, [state])
  // 載入雲端資料（若有設定）
  useEffect(() => {
    const init = async () => {
      const sb = getSupabase()
      if (!sb) return
      try {
        const { data: authData } = await sb.auth.signInAnonymously()
        if (!authData.user) return
        const cloud = await loadFromCloud()
        if (cloud && cloud.projects?.length) {
          const migrated = {
            settings: defaultSettings,
            ...cloud,
            reviews: cloud.reviews || [],
            snapshots: cloud.snapshots || [],
            tasks: (cloud.tasks || []).map((t) => ({ ...t, due: migrateDue(t.due) })),
            projects: (cloud.projects || []).map((p) => ({ ...p, lastUpdated: migrateTs(p.lastUpdated ?? p.lastUpdate) })),
          }
          setState(migrated)
          saveState(migrated)
        }
      } catch (e) { console.warn('Cloud init error:', e) }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // 每日快照：每天第一次開啟時記錄各專案進度與任務數，累積成趨勢資料
  useEffect(() => {
    setState((c) => {
      const t0 = todayStr()
      if ((c.snapshots || []).some((s) => s.date === t0)) return c
      return {
        ...c,
        snapshots: [...(c.snapshots || []), {
          date: t0,
          savedAt: Date.now(),
          projects: Object.fromEntries(c.projects.map((p) => [p.id, p.progress])),
          tasksDone: c.tasks.filter((t) => t.done).length,
          tasksOpen: c.tasks.filter((t) => !t.done).length,
        }],
      }
    })
  }, [])
  useEffect(() => {
    if (!notice) return undefined
    const t = setTimeout(() => setNotice(''), 2600)
    return () => clearTimeout(t)
  }, [notice])

  const activeProjects = state.projects.filter((p) => p.stage === 'Active')
  const focusProject = state.projects.find((p) => p.stage === 'Active') || state.projects[0]
  const openTasks = state.tasks.filter((t) => !t.done)

  // 任務（異動時自動更新所屬專案的 lastUpdated；完成時自動寫入時間軸）
  function updateTask(taskId) {
    const target = state.tasks.find((t) => t.id === taskId)
    const completing = target && !target.done
    setState((c) => {
      const cur = c.tasks.find((t) => t.id === taskId)
      return {
        ...c,
        tasks: c.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t),
        projects: cur ? c.projects.map((p) => p.id === cur.projectId ? { ...p, lastUpdated: Date.now() } : p) : c.projects,
        timelineEvents: cur && !cur.done ? [...c.timelineEvents, makeEvent(c, `完成任務：${cur.title}`, cur.projectId)] : c.timelineEvents,
      }
    })
    setNotice(completing ? '任務完成，已記入時間軸' : '任務狀態已更新')
  }
  function addTask(task) {
    setState((c) => ({
      ...c,
      tasks: [...c.tasks, { ...task, id: `task-${Date.now()}`, done: false }],
      projects: c.projects.map((p) => p.id === task.projectId ? { ...p, lastUpdated: Date.now() } : p),
    }))
    setNotice('任務已加入')
  }
  function editTask(taskId, patch) {
    setState((c) => {
      const old = c.tasks.find((t) => t.id === taskId)
      const touched = new Set(old ? [old.projectId, patch.projectId || old.projectId] : [])
      return {
        ...c,
        tasks: c.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
        projects: c.projects.map((p) => touched.has(p.id) ? { ...p, lastUpdated: Date.now() } : p),
      }
    })
    setNotice('任務已更新')
  }
  function deleteTask(taskId) {
    setState((c) => {
      const task = c.tasks.find((t) => t.id === taskId)
      return {
        ...c,
        tasks: c.tasks.filter((t) => t.id !== taskId),
        projects: task ? c.projects.map((p) => p.id === task.projectId ? { ...p, lastUpdated: Date.now() } : p) : c.projects,
      }
    })
    setNotice('任務已刪除')
  }
  // 專案 CRUD
  function addProject(data) {
    setState((c) => {
      const project = { ...data, id: `project-${Date.now()}`, lastUpdated: Date.now() }
      return {
        ...c,
        projects: [project, ...c.projects],
        timelineEvents: data.stage === 'Active' ? [...c.timelineEvents, { id: `ev-${Date.now()}`, date: todayStr(), type: 'milestone', title: `專案啟動：${project.name}`, projectId: project.id, color: project.color }] : c.timelineEvents,
      }
    })
    setNotice('專案已建立')
  }
  function updateProject(id, patch) {
    setState((c) => ({ ...c, projects: c.projects.map((p) => p.id === id ? { ...p, ...patch, lastUpdated: Date.now() } : p) }))
    setNotice('專案已更新')
  }
  function deleteProject(id) {
    if (!confirm('刪除這個專案？其任務、筆記、時間軸事件會一併刪除。')) return
    setState((c) => ({
      ...c,
      projects: c.projects.filter((p) => p.id !== id),
      tasks: c.tasks.filter((t) => t.projectId !== id),
      notes: c.notes.filter((n) => n.projectId !== id),
      timelineEvents: c.timelineEvents.filter((e) => e.projectId !== id),
    }))
    setSelectedProject(null)
    setProjectEditor(null)
    setNotice('專案已刪除')
  }
  function updateSettings(patch) {
    setState((c) => ({ ...c, settings: { ...c.settings, ...patch } }))
  }
  function resetWorkspace() {
    if (!confirm('確定要重置工作區？所有變更會回到初始示範資料。')) return
    setState({ settings: defaultSettings, projects: initialProjects, ideas: initialIdeas, tasks: initialTasks, notes: initialNotes, timelineEvents: initialTimelineEvents, goals: initialGoals })
    setNotice('工作區已重置')
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `polaris-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
    setNotice('已匯出備份')
  }
  function importData(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.projects || !data.tasks) { setNotice('檔案格式不正確'); return }
        setState({ settings: defaultSettings, ...data })
        setNotice('備份已匯入')
      } catch { setNotice('檔案格式不正確') }
    }
    reader.readAsText(file)
  }
  function addIdea(idea) {
    setState((c) => ({ ...c, ideas: [{ ...idea, id: `idea-${Date.now()}`, created: '剛剛', ready: false }, ...c.ideas] }))
    setShowIdeaModal(false)
    setNotice('靈感已放入 Ideas')
  }
  function promoteIdea(ideaId) {
    if (activeProjects.length >= 3) { setNotice('目前已有 3 個 Active 專案'); return }
    const idea = state.ideas.find((i) => i.id === ideaId)
    if (!idea) return
    const project = { id: `project-${Date.now()}`, name: idea.title, description: idea.note, stage: 'MVP', color: '#b47d58', progress: 0, lastUpdated: Date.now(), next: '定義第一個可驗證成果' }
    setState((c) => ({ ...c, projects: [project, ...c.projects], ideas: c.ideas.filter((i) => i.id !== ideaId), timelineEvents: [...c.timelineEvents, { id: `ev-${Date.now()}`, date: todayStr(), type: 'milestone', title: `靈感升級為專案：${idea.title}`, projectId: project.id, color: project.color }] }))
    setPage('projects')
    setNotice(`${idea.title} 已升級為 MVP 專案，已記入時間軸`)
  }

  // Notes actions
  function addNote(note) { setState((c) => ({ ...c, notes: [{ ...note, id: `note-${Date.now()}`, createdAt: Date.now() }, ...c.notes] })); setNotice('筆記已新增') }
  function updateNote(id, patch) { setState((c) => ({ ...c, notes: c.notes.map((n) => n.id === id ? { ...n, ...patch } : n) })); setNotice('筆記已更新') }
  function deleteNote(id) { setState((c) => ({ ...c, notes: c.notes.filter((n) => n.id !== id) })); setNotice('筆記已刪除') }

  // Timeline actions
  function addTimelineEvent(ev) { setState((c) => ({ ...c, timelineEvents: [...c.timelineEvents, { ...ev, id: `ev-${Date.now()}` }].sort((a, b) => a.date.localeCompare(b.date)) })); setNotice('事件已加入時間軸') }
  function deleteTimelineEvent(id) { setState((c) => ({ ...c, timelineEvents: c.timelineEvents.filter((e) => e.id !== id) })); setNotice('事件已刪除') }

  // Goals actions（達成 100% 時自動寫入時間軸里程碑）
  function updateGoal(id, patch) {
    setState((c) => {
      const goal = c.goals.find((g) => g.id === id)
      const reached = goal && goal.progress < 100 && patch.progress != null && patch.progress >= 100
      return {
        ...c,
        goals: c.goals.map((g) => g.id === id ? { ...g, ...patch } : g),
        timelineEvents: reached ? [...c.timelineEvents, makeEvent(c, `目標達成：${goal.title}`, '', 'milestone')] : c.timelineEvents,
      }
    })
  }
  function addGoal(goal) { setState((c) => ({ ...c, goals: [{ ...goal, id: `goal-${Date.now()}` }, ...c.goals] })); setNotice('目標已新增') }
  function deleteGoal(id) { setState((c) => ({ ...c, goals: c.goals.filter((g) => g.id !== id) })); setNotice('目標已刪除') }

  // Review actions（以週為單位持久化，weekKey = 該週週一的日期）
  function saveReview(weekKey, patch) {
    setState((c) => {
      const existing = c.reviews.find((r) => r.weekKey === weekKey)
      if (existing) return { ...c, reviews: c.reviews.map((r) => r.weekKey === weekKey ? { ...r, ...patch, savedAt: Date.now() } : r) }
      return { ...c, reviews: [...c.reviews, { weekKey, ...patch, savedAt: Date.now() }] }
    })
    setNotice('本週回顧已儲存')
  }

  // 通知：逾期任務 + 停滯專案 + 即將到期目標
  const t0 = todayStr()
  const notifications = [
    ...state.tasks.filter((t) => !t.done && t.due < t0).map((t) => ({ kind: 'task', text: `逾期任務：${t.title}`, sub: `原定 ${dueLabel(t.due).text}`, go: () => setEditingTaskId(t.id) })),
    ...state.projects.filter((p) => p.stage !== 'Idea' && p.lastUpdated && Date.now() - p.lastUpdated >= 3 * DAY).map((p) => ({ kind: 'stale', text: `${p.name} ${relativeDays(p.lastUpdated)}沒有更新`, sub: '考慮把下一步切小，或先放下', go: () => { setPage('projects'); setSelectedProject(p.id) } })),
    ...state.goals.filter((g) => g.targetDate && g.progress < 100 && g.targetDate >= t0 && g.targetDate <= todayStr(7)).map((g) => ({ kind: 'goal', text: `目標將到期：${g.title}`, sub: `截止 ${g.targetDate}，目前 ${g.progress}%`, go: () => changePage('goals') })),
  ]

  const searchGo = {
    project: (id) => { setSelectedProject(id); setSearchOpen(false) },
    task: (id) => { setEditingTaskId(id); setSearchOpen(false) },
    page: (p) => { changePage(p); setSearchOpen(false) },
  }

  function changePage(next) { setPage(next); setMobileNav(false) }

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage projects={state.projects} tasks={state.tasks} goals={state.goals} focusProject={focusProject} activeProjects={activeProjects} onTaskToggle={updateTask} onTaskAdd={addTask} onTaskDelete={deleteTask} onTaskEdit={setEditingTaskId} onPage={changePage} onAddIdea={() => setShowIdeaModal(true)} userName={state.settings?.userName || 'Chris'} />
      case 'projects': return <ProjectsPage projects={state.projects} tasks={state.tasks} onPage={changePage} onOpenProject={setSelectedProject} onAddProject={() => setProjectEditor({ mode: 'add' })} />
      case 'ideas': return <IdeasPage ideas={state.ideas} onAddIdea={() => setShowIdeaModal(true)} onPromote={promoteIdea} />
      case 'notes': return <NotesPage notes={state.notes} projects={state.projects} onAdd={addNote} onUpdate={updateNote} onDelete={deleteNote} onPage={changePage} />
      case 'timeline': return <TimelinePage events={state.timelineEvents} projects={state.projects} onAdd={addTimelineEvent} onDelete={deleteTimelineEvent} onPage={changePage} />
      case 'review': return <ReviewPage goals={state.goals} projects={state.projects} tasks={state.tasks} reviews={state.reviews} snapshots={state.snapshots} onSave={saveReview} onPage={changePage} />
      case 'goals': return <GoalsPage goals={state.goals} projects={state.projects} onAdd={addGoal} onUpdate={updateGoal} onDelete={deleteGoal} onPage={changePage} />
      case 'settings': return <SettingsPage state={state} onUpdateSettings={updateSettings} onExport={exportData} onImport={importData} onReset={resetWorkspace} />
      default: return <EmptyPage page={page} onPage={changePage} />
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Star size={16} /></div>
          <div><div className="brand-name">北極星</div><div className="brand-subtitle">POLARIS · 主線所在</div></div>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="關閉選單"><X size={17} /></button>
        </div>
        <div className="nav-section-label">WORKSPACE</div>
        <nav className="main-nav">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => changePage(id)}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {id === 'ideas' && count ? <span className="nav-count">{count}</span> : null}
              {id === 'notes' && state.notes?.length ? <span className="nav-count">{state.notes.length}</span> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-mini">
            <div className="focus-mini-head"><Star size={15} /><span>我的北極星</span><span className="live-dot" /></div>
            <strong>{focusProject.name}</strong>
            <span>{focusProject.next}</span>
            <div className="mini-progress"><span style={{ width: `${focusProject.progress}%` }} /></div>
            <div className="mini-progress-label"><span>進度</span><b>{focusProject.progress}%</b></div>
          </div>
          <button className="nav-item settings-item" onClick={() => changePage('settings')}><Settings size={17} /><span>Settings</span></button>
          <button className="nav-item theme-item" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} aria-label="切換主題">
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
            <span>{theme === 'dark' ? '日間模式' : '夜間模式'}</span>
          </button>
          <button className="nav-item annotation-item" onClick={() => setShowAnnotation(true)}><Plus size={17} strokeWidth={2.2} /><span>標註回饋</span></button>
          <div className="sidebar-footer"><span className="sync-dot" /> Local-first workspace <span>v1.7</span></div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="開啟選單"><Menu size={20} /></button>
          <div className="breadcrumb"><span>北極星</span><ChevronRight size={14} /><strong>{navItems.find(n => n.id === page)?.label || page}</strong></div>
          <div className="topbar-actions">
            <button className="topbar-search" onClick={() => setSearchOpen(true)}><Search size={16} /><span>搜尋工作區</span><kbd>⌘ K</kbd></button>
            <div className="notif-wrap">
              <button className="icon-button notification-button" aria-label="通知" onClick={() => setNotifOpen((v) => !v)}>
                <Bell size={17} />
                {notifications.length > 0 && <i className="notif-count">{notifications.length}</i>}
              </button>
              {notifOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onMouseDown={() => setNotifOpen(false)} />}
              {notifOpen && <NotificationPanel items={notifications} onClose={() => setNotifOpen(false)} />}
            </div>
            <div className="top-avatar">{(state.settings?.userName || 'C').charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="page-wrap">{renderPage()}</div>
      </main>

      {showIdeaModal && <IdeaModal onClose={() => setShowIdeaModal(false)} onSave={addIdea} />}
      {notice && <div className="toast"><Check size={15} />{notice}</div>}
      {showAnnotation && <AnnotationModal onClose={() => setShowAnnotation(false)} />}
      {searchOpen && <SearchModal state={state} onClose={() => setSearchOpen(false)} onGo={searchGo} />}
      {selectedProject && <ProjectDetailModal project={state.projects.find((p) => p.id === selectedProject)} tasks={state.tasks} notes={state.notes} events={state.timelineEvents} onClose={() => setSelectedProject(null)} onToggleTask={updateTask} onEdit={() => setProjectEditor({ mode: 'edit', id: selectedProject })} onDelete={() => deleteProject(selectedProject)} onUpdateProgress={(delta) => { const p = state.projects.find((x) => x.id === selectedProject); if (p) updateProject(p.id, { progress: Math.max(0, Math.min(100, p.progress + delta)) }) }} />}
      {projectEditor && <ProjectModal project={projectEditor.mode === 'edit' ? state.projects.find((p) => p.id === projectEditor.id) : null} projects={state.projects} onClose={() => setProjectEditor(null)} onSave={(data) => { if (projectEditor.mode === 'edit') updateProject(projectEditor.id, data); else addProject(data); setProjectEditor(null) }} onDelete={projectEditor.mode === 'edit' ? () => deleteProject(projectEditor.id) : null} />}
      {editingTaskId && (() => { const task = state.tasks.find((t) => t.id === editingTaskId); return task ? <TaskModal task={task} projects={state.projects} onClose={() => setEditingTaskId(null)} onSave={(patch) => { editTask(editingTaskId, patch); setEditingTaskId(null) }} onDelete={() => { deleteTask(editingTaskId); setEditingTaskId(null) }} /> : null })()}
    </div>
  )
}
