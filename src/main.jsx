import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Compass,
  FileText,
  FolderKanban,
  Gauge,
  Goal,
  Inbox,
  Lightbulb,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Target,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import './styles.css'

const STORAGE_KEY = 'nora_workspace_v1_demo_fresh'
const THEME_KEY = 'polaris_theme'
document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || 'dark'

// ── 日期工具（任務真日期 v1.3）────────────────────────
const DAY = 86400000
function toISO(d) { const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` }
function todayStr(offset = 0) { return toISO(new Date(Date.now() + offset * DAY)) }
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12) }
function dueLabel(s) {
  if (!s) return { text: '無日期', tone: '' }
  const t = todayStr()
  if (s === t) return { text: '今天', tone: 'today' }
  if (s === todayStr(1)) return { text: '明天', tone: 'soon' }
  const diff = Math.round((parseDate(s) - parseDate(t)) / DAY)
  if (diff < 0) return { text: `逾期 ${-diff} 天`, tone: 'overdue' }
  if (diff < 7) return { text: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][parseDate(s).getDay()], tone: 'soon' }
  const d = parseDate(s)
  return { text: `${d.getMonth() + 1}/${d.getDate()}`, tone: 'soon' }
}
// 舊資料的文字日期（今天／週五／下週一…）遷移成真日期
function migrateDue(due) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(due || '')) return due
  const t = due || ''
  if (t === '今天') return todayStr()
  if (t === '明天') return todayStr(1)
  if (t === '後天') return todayStr(2)
  if (t === '週五') return todayStr((5 - new Date().getDay() + 7) % 7)
  if (t === '下週一') return todayStr(((1 - new Date().getDay()) + 7) % 7 || 7)
  const m = t.match(/(\d+)\s*天/)
  if (m) return todayStr(Number(m[1]))
  return todayStr(7)
}
// 舊資料的文字時間（今天／15 天前…）遷移成時間戳
function migrateTs(v) {
  if (typeof v === 'number') return v
  if (v === '今天' || v === '剛剛') return Date.now()
  if (v === '昨天') return Date.now() - DAY
  const m = String(v || '').match(/(\d+)\s*天前/)
  if (m) return Date.now() - Number(m[1]) * DAY
  return Date.now()
}
function relativeDays(ts) {
  const diff = Math.floor((Date.now() - (ts || 0)) / DAY)
  if (diff <= 0) return '今天'
  if (diff === 1) return '昨天'
  return `${diff} 天前`
}

// 晨報自動生成：從目前資料算出今日星象（訊號優先序：逾期 > 停滯 > 目標到期 > 焦點提醒）
function buildBrief({ projects, tasks, goals }) {
  const t0 = todayStr()
  const focus = projects.find((p) => p.stage === 'Active') || projects[0]
  const overdue = tasks.filter((t) => !t.done && t.due < t0)
  const todayOpen = tasks.filter((t) => !t.done && t.due === t0)
  const stale = projects.filter((p) => p.stage !== 'Idea' && p.lastUpdated && Date.now() - p.lastUpdated >= 3 * DAY).sort((a, b) => a.lastUpdated - b.lastUpdated)
  const dueSoonGoal = goals.filter((g) => g.progress < 100 && g.targetDate && g.targetDate >= t0 && g.targetDate <= todayStr(7)).sort((a, b) => a.targetDate.localeCompare(b.targetDate))[0]
  const doneRecently = tasks.filter((t) => t.done && t.completedAt && Date.now() - t.completedAt <= 3 * DAY).sort((a, b) => b.completedAt - a.completedAt).slice(0, 3)

  let message
  if (overdue.length) {
    message = `今日星象有干擾：${overdue.length} 項任務逾期。先把它們清掉，再回到北極星「${focus?.name || '主線'}」。`
  } else if (stale.length) {
    message = `今日星象清晰，但 ${stale[0].name} 已經 ${relativeDays(stale[0].lastUpdated)}沒有更新。主線不變：${focus?.next || '推進北極星'}。`
  } else if (dueSoonGoal) {
    const days = Math.round((parseDate(dueSoonGoal.targetDate) - parseDate(t0)) / DAY)
    message = `今日星象清晰。目標「${dueSoonGoal.title}」還有 ${days} 天到期（目前 ${dueSoonGoal.progress}%），今天為它推進一格。`
  } else if (focus) {
    message = `今日星象清晰：北極星是「${focus.name}」。今天專注「${focus.next}」，其他先放下。`
  } else {
    message = '今天沒有排程的星象。從一個小任務開始。'
  }

  const suggestions = []
  if (focus?.next) suggestions.push({ title: focus.next, meta: `北極星：${focus.name}` })
  ;[...overdue, ...todayOpen].forEach((t) => {
    if (suggestions.length >= 3) return
    if (suggestions.some((s) => s.title === t.title)) return
    const isOverdue = t.due < t0
    suggestions.push({ title: t.title, meta: isOverdue ? `逾期 ${Math.abs(Math.round((parseDate(t.due) - parseDate(t0)) / DAY))} 天` : `${projects.find((p) => p.id === t.projectId)?.name || ''} · ${t.priority}優先` })
  })

  return {
    message,
    suggestions,
    recent: doneRecently.map((t) => ({ title: t.title, meta: `${relativeDays(t.completedAt)}完成`, done: true })),
  }
}

// 自動時間軸事件：狀態異動時寫入，時間軸自己長出故事
function makeEvent(c, title, projectId, type = 'note') {
  const project = c.projects.find((p) => p.id === projectId)
  return { id: `ev-${Date.now()}-${Math.floor(Math.random() * 999)}`, date: todayStr(), type, title, projectId: projectId || '', color: project?.color || '#e76f51' }
}

// 目標連動：有關聯專案的目標，進度自動跟隨專案
function goalProgress(g, projects) {
  if (!g.projectId) return g.progress
  const p = projects.find((x) => x.id === g.projectId)
  return p ? p.progress : g.progress
}

// ── 初始資料 ──────────────────────────────────────────
const initialProjects = [
  { id: 'guru', name: '股流Radar', description: '台股市場脈動即時監控系統，掌握股流方向與資金輪動', stage: 'Active', color: '#e76f51', progress: 45, lastUpdated: Date.now(), next: '收齊20則決策筆記' },
  { id: 'suno', name: 'SUNO Music', description: '用音樂保存正在發生的生活', stage: 'Explore', color: '#6f8f78', progress: 32, lastUpdated: Date.now() - 1 * DAY, next: '完成一首 demo' },
  { id: 'poker', name: 'Poker Trainer', description: '讓決策練習變得有趣', stage: 'MVP', color: '#7087a3', progress: 18, lastUpdated: Date.now() - 15 * DAY, next: '確認第一個訓練循環' },
  { id: 'novel', name: '小說世界觀', description: '長篇故事與角色資料庫', stage: 'Idea', color: '#bb8b4d', progress: 8, lastUpdated: Date.now() - 6 * DAY, next: '整理三個核心角色' },
]

const initialIdeas = [
  { id: 'idea-2', title: '法人買賣超追蹤', note: '整合外資、投信、自營商的進出場訊號，建立權責歸屬圖。', type: '系統', score: 85, created: '昨天', ready: true },
]

const initialTasks = [
  { id: 'task-1', title: '完成第一版監控面板', projectId: 'guru', due: todayStr(), priority: '高', done: true, completedAt: Date.now() },
  { id: 'task-2', title: '定義股流指標參數', projectId: 'guru', due: todayStr(), priority: '中', done: false },
  { id: 'task-3', title: '完成一首 SUNO demo', projectId: 'suno', due: todayStr(3), priority: '中', done: false },
  { id: 'task-4', title: '確認第一個訓練循環', projectId: 'poker', due: todayStr(5), priority: '低', done: false },
  { id: 'task-g1', title: '盤點主流/蓄勢/乘流/靜流指標', projectId: 'guru', due: todayStr(), priority: '中', done: false },
  { id: 'task-g2', title: '建立股流歷史模式庫', projectId: 'guru', due: todayStr(), priority: '低', done: false },
]

const initialNotes = [
  { id: 'note-1', title: '股流Radar 核心概念', content: '加入群組的主流、蓄勢、乘流、靜流，整個產品語彙統一在水流宇宙，使用者學一次就懂。', tags: ['股流', '概念'], projectId: 'guru', createdAt: Date.now() - 1 * 86400000 },
  { id: 'note-2', title: '策略走 A 還是 B', content: '等回覆：①策略走 A 還是 B；②上一輪 B0 歷史管線的三個決策點（執行模式／回補深度／先解鎖哪個畫面）還沒收到。', tags: ['股流', '決策'], projectId: 'guru', createdAt: Date.now() - 3 * 86400000 },
  { id: 'note-3', title: 'SUNO 聽了二十首參考曲', content: '決定走深夜氛圍，人聲少一點，留空間給低頻。先鎖這個方向。', tags: ['靈感', '音樂'], projectId: 'suno', createdAt: Date.now() - 7 * 86400000 },
]

const initialTimelineEvents = [
  { id: 'ev-1', date: '2026-08-10', type: 'milestone', title: '股流 Radar 概念成型', projectId: 'guru', color: '#6f8f78' },
  { id: 'ev-2', date: '2026-08-20', type: 'note', title: '確定「主流／蓄勢／乘流／靜流」四階段語彙', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-3', date: '2026-09-01', type: 'milestone', title: '完成第一版原型介面', projectId: 'guru', color: '#6f8f78' },
  { id: 'ev-4', date: '2026-09-03', type: 'note', title: '股流 Radar 監控面板上線準備', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-5', date: '2026-09-05', type: 'milestone', title: 'SUNO 第一首歌完成 demo', projectId: 'suno', color: '#6f8f78' },
]

const initialGoals = [
  { id: 'goal-1', title: '股流 Radar 第一版上線', description: '能被實際使用的監控面板程度', targetDate: '2026-09-15', progress: 45, color: '#e76f51', projectId: 'guru' },
  { id: 'goal-2', title: '收齊 20 則股流決策筆記', description: '累積成判斷資料庫', targetDate: '2026-10-01', progress: 30, color: '#6f8f78', projectId: 'guru' },
  { id: 'goal-3', title: 'SUNO 頻道連續 4 週每週一首', description: '先做出有辨識度的聲音，再談規模', targetDate: '2026-09-28', progress: 25, color: '#6f8f78' },
  { id: 'goal-4', title: '找到第一個付費使用者', description: '股流 Radar 痛點驗證', targetDate: '2026-10-15', progress: 5, color: '#7087a3', projectId: 'guru' },
]

const navItems = [
  { id: 'home', label: 'Home', icon: Gauge },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, count: 1 },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
  { id: 'review', label: 'Review', icon: BookOpen },
  { id: 'goals', label: 'Goals', icon: Goal },
]

const defaultSettings = { userName: 'Chris' }

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.projects && saved?.ideas && saved?.tasks) {
      return {
        settings: defaultSettings,
        ...saved,
        reviews: saved.reviews || [],
        snapshots: saved.snapshots || [],
        tasks: saved.tasks.map((t) => ({ ...t, due: migrateDue(t.due) })),
        projects: saved.projects.map((p) => ({ ...p, lastUpdated: migrateTs(p.lastUpdated ?? p.lastUpdate) })),
      }
    }
  } catch {}
  return { settings: defaultSettings, projects: initialProjects, ideas: initialIdeas, tasks: initialTasks, notes: initialNotes, timelineEvents: initialTimelineEvents, goals: initialGoals, reviews: [], snapshots: [] }
}

function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }

// ── 主元件 ────────────────────────────────────────────
function App() {
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
          <div className="sidebar-footer"><span className="sync-dot" /> Local-first workspace <span>v1.6</span></div>
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

// ── Home ──────────────────────────────────────────────
function HomePage({ projects, tasks, goals, focusProject, activeProjects, onTaskToggle, onTaskAdd, onTaskDelete, onTaskEdit, onPage, onAddIdea, userName }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安'
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
  const briefTime = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
  const brief = buildBrief({ projects, tasks, goals })
  const t0 = todayStr()
  const todayOpen = tasks.filter((t) => !t.done && t.due <= t0).sort((a, b) => a.due.localeCompare(b.due))
  const todayDone = tasks.filter((t) => t.done && (t.due === t0 || (t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString())))
  const todayTasks = [...todayOpen, ...todayDone]
  const completedToday = todayDone.length
  const overdueCount = todayOpen.filter((t) => t.due < t0).length
  const upcoming = tasks.filter((t) => !t.done && t.due > t0 && t.due <= todayStr(7)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5)
  const stale = projects.filter((p) => p.stage !== 'Idea' && p.lastUpdated).sort((a, b) => a.lastUpdated - b.lastUpdated).find((p) => Date.now() - p.lastUpdated >= 3 * DAY)
  return (
    <div className="home-page">
      <section className="welcome-row">
        <div><p className="eyebrow">{dateLabel}</p><h1>今天，先推進一件事。</h1><p className="welcome-copy">{greeting}，{userName}。Nora 已經替你校準好今天的方向。</p></div>
        <button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button>
      </section>
      <div className="home-grid">
        <div className="home-main-column">
          <section className="brief-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Star size={14} />POLARIS DAILY</div><h2>今日星象</h2></div><span className="brief-time"><Clock3 size={14} />更新於 {briefTime}</span></div>
            <div className="brief-message"><span className="quote-mark">"</span><p>{brief.message}</p></div>
            <div className="brief-divider" />
            <div className="brief-columns">
              <BriefList title="今天建議" icon={Compass} tone="coral" items={brief.suggestions} onPage={onPage} />
              {brief.recent.length
                ? <BriefList title="最近完成" icon={Check} tone="green" items={brief.recent} />
                : <BriefList title="最近完成" icon={Check} tone="green" items={[{ title: '還沒有完成紀錄', meta: '完成任務後會自動出現在這裡', done: true }]} />}
            </div>
          </section>
          <section className="focus-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Star size={14} />NORTH STAR</div><h2>北極星：{focusProject.name}</h2></div><button className="text-button" onClick={() => onPage('projects')}>查看專案 <ArrowUpRight size={15} /></button></div>
            <div className="focus-content">
              <div className="focus-project-mark" style={{ background: focusProject.color }}><Sparkles size={20} /></div>
              <div className="focus-project-copy">
                <strong>{focusProject.next}</strong><span>{focusProject.description}</span>
                <div className="focus-progress-line"><span style={{ width: `${focusProject.progress}%`, background: focusProject.color }} /></div>
                <div className="progress-meta"><span>專案進度</span><b>{focusProject.progress}%</b></div>
              </div>
              <button className="outline-button" onClick={() => onPage('projects')}>開始工作 <ChevronRight size={15} /></button>
            </div>
          </section>
          <section className="tasks-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Timer size={14} />TODAY'S ACTIONS</div><h2>今天的行動{overdueCount > 0 ? <span className="overdue-badge">{overdueCount} 項逾期</span> : null}</h2></div><span className="task-count">{completedToday}/{todayOpen.length + completedToday} 完成</span></div>
            {todayTasks.length === 0
              ? <div className="empty-state"><Check size={26} /><p>今天沒有排程任務。從下面加入一個，或到專案裡安排。</p></div>
              : <div className="task-list">{todayTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onTaskToggle} onDelete={onTaskDelete} onEdit={onTaskEdit} projects={projects} />)}</div>}
            <TaskComposer projects={projects} onAdd={onTaskAdd} />
            <div className="upcoming-block">
              <div className="upcoming-head">接下來 7 天</div>
              {upcoming.length === 0
                ? <p className="detail-empty">沒有排程中的任務。</p>
                : upcoming.map((task) => {
                    const d = dueLabel(task.due)
                    const proj = projects.find((p) => p.id === task.projectId)
                    return <div key={task.id} className="upcoming-row" onClick={() => onTaskEdit(task.id)}>
                      <strong>{task.title}</strong>
                      <span>{proj?.name || ''} · {d.text}</span>
                    </div>
                  })}
            </div>
          </section>
        </div>
        <aside className="home-side-column">
          <section className="attention-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker attention-kicker"><Bell size={14} />ATTENTION</div><h3>需要注意</h3></div><span className="attention-count">{stale ? 1 : 0}</span></div>
            {stale
              ? <div className="attention-item"><div className="project-dot" style={{ background: stale.color }} /><div className="attention-copy"><strong>{stale.name}</strong><span>{relativeDays(stale.lastUpdated)}沒有更新</span><p>下一步可能太大，把它切小一點，或先放下。</p></div></div>
              : <div className="attention-item"><div className="project-dot" style={{ background: 'var(--green)' }} /><div className="attention-copy"><strong>動能不錯</strong><span>所有專案近期都有更新</span><p>維持節奏，把今天的北極星推進一格。</p></div></div>}
            <button className="soft-button" onClick={() => onPage('projects')}>檢視並整理 <ArrowUpRight size={14} /></button>
          </section>
          <section className="capacity-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker"><Gauge size={14} />CAPACITY</div><h3>專案容量</h3></div><strong className="capacity-number">{activeProjects.length}<small>/3</small></strong></div>
            <div className="capacity-track">{[0,1,2].map((s) => <span key={s} className={s < activeProjects.length ? 'filled' : ''} />)}</div>
            <p>Active 專案最多維持 3 個。現在還有空間給一個真正值得推進的想法。</p>
            <button className="text-button" onClick={() => onPage('projects')}>管理專案 <ChevronRight size={14} /></button>
          </section>
          <section className="ideas-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker"><Inbox size={14} />IDEA INBOX</div><h3>最近的靈感</h3></div><button className="icon-button" onClick={() => onPage('ideas')}><ArrowUpRight size={14} /></button></div>
            <div className="idea-preview-list">
              <IdeaPreview title="台股板塊輪動儀表板" type="產品" score="91" />
              <IdeaPreview title="法人買賣超追蹤" type="系統" score="85" />
              <IdeaPreview title="股流歷史模式庫" type="產品" score="73" />
            </div>
            <button className="text-button" onClick={() => onPage('ideas')}>檢視全部 <ChevronRight size={14} /></button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function BriefList({ title, icon: Icon, tone, items, onPage }) {
  return <div className={`brief-list ${tone}`}>
    <div className="brief-list-title"><Icon size={15} /><strong>{title}</strong></div>
    {items.map((item) => <button className="brief-list-item" key={item.title} onClick={() => onPage?.('projects')}>
      <span className={`status-icon ${item.done ? 'done' : ''}`}>{item.done ? <Check size={12} /> : <Circle size={8} />}</span>
      <span><strong>{item.title}</strong><small>{item.meta}</small></span><ChevronRight size={14} />
    </button>)}
  </div>
}

function TaskRow({ task, onToggle, onDelete, onEdit, projects }) {
  const proj = projects?.find((p) => p.id === task.projectId)
  const d = dueLabel(task.due)
  return <div className={`task-row ${task.done ? 'completed' : ''}`}>
    <button className="checkbox-button" onClick={() => onToggle(task.id)}>{task.done ? <Check size={13} /> : null}</button>
    <div className="task-copy" onClick={() => onEdit(task.id)}><strong>{task.title}</strong><span>{proj?.name || task.projectId} · {task.priority}優先</span></div>
    <span className={`task-due ${d.tone}`}>{d.text}</span>
    <button className="row-more" aria-label="刪除任務" onClick={() => { if (confirm('刪除這個任務？')) onDelete(task.id) }}>•••</button>
  </div>
}

function TaskComposer({ projects, onAdd }) {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [due, setDue] = useState(todayStr())
  const [priority, setPriority] = useState('中')
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), projectId, due, priority })
    setTitle('')
    setDue(todayStr())
  }
  return (
    <form className="task-composer" onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="加入任務…" />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        {['高', '中', '低'].map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <button type="submit" className="primary-button" disabled={!title.trim()}><Plus size={14} />加入</button>
    </form>
  )
}

function TaskModal({ task, projects, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title || '')
  const [projectId, setProjectId] = useState(task?.projectId || projects[0]?.id || '')
  const [due, setDue] = useState(task?.due || todayStr())
  const [priority, setPriority] = useState(task?.priority || '中')
  const [done, setDone] = useState(task?.done || false)
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), projectId, due, priority, done, completedAt: done ? (task?.completedAt || Date.now()) : null })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div><div className="section-kicker"><Timer size={14} />EDIT TASK</div><h2>編輯任務</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
      </div>
      <form onSubmit={submit}>
        <label>任務名稱<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="要做什麼？" /></label>
        <div className="modal-row">
          <label>關聯專案<select value={projectId} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>優先級<select value={priority} onChange={(e) => setPriority(e.target.value)}>{['高', '中', '低'].map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
        </div>
        <label>到期日<input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        {due && <p className="settings-hint">這天：{dueLabel(due).text}</p>}
        <label className="task-modal-done"><input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />標記為已完成</label>
        <div className="modal-actions">
          <button type="button" className="outline-button danger" onClick={() => { if (confirm('刪除這個任務？')) onDelete() }}><Trash2 size={15} />刪除</button>
          <button type="button" className="outline-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button" disabled={!title.trim()}><Check size={16} />儲存任務</button>
        </div>
      </form>
    </div>
  </div>
}

function ProjectModal({ project, projects, onClose, onSave, onDelete }) {
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

// ── Projects ──────────────────────────────────────────
function ProjectsPage({ projects, tasks, onPage, onOpenProject, onAddProject }) {
  const activeCount = projects.filter((p) => p.stage === 'Active').length
  return <div className="sub-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">PROJECTS</p><h1>所有專案</h1><p>把想法變成有下一步的進度。</p></div>
      <div className="header-actions">
        <button className="outline-button" onClick={() => onPage('ideas')}>從靈感建立 <ArrowUpRight size={14} /></button>
        <button className="primary-button" onClick={onAddProject}><Plus size={16} />新增專案</button>
      </div>
    </section>
    <div className="project-overview">
      <div><span>Active 專案</span><strong>{activeCount}<small>/ 3</small></strong></div>
      <div><span>進行中任務</span><strong>{tasks.filter((t) => !t.done).length}</strong></div>
      <div><span>已完成任務</span><strong>{tasks.filter((t) => t.done).length}</strong></div>
    </div>
    <div className="project-section-title"><h2>Project pipeline</h2><span>{projects.length} 個專案</span></div>
    <div className="project-list">{projects.map((p) => <ProjectRow key={p.id} project={p} onOpen={onOpenProject} />)}</div>
  </div>
}

function ProjectRow({ project, onOpen }) {
  return <article className="project-row clickable" onClick={() => onOpen?.(project.id)}>
    <div className="project-row-main"><div className="project-symbol" style={{ background: project.color }}><Sparkles size={17} /></div><div><h3>{project.name}</h3><p>{project.description}</p></div></div>
    <div className="stage-label"><span className="stage-dot" style={{ background: project.color }} />{project.stage}</div>
    <div className="project-progress"><div className="project-progress-bar"><span style={{ width: `${project.progress}%`, background: project.color }} /></div><small>{project.progress}%</small></div>
    <div className="project-next"><span>下一步</span><strong>{project.next}</strong></div>
    <button className="icon-button" aria-label="查看專案" onClick={(e) => { e.stopPropagation(); onOpen?.(project.id) }}><ArrowUpRight size={16} /></button>
  </article>
}

// ── Ideas ─────────────────────────────────────────────
function IdeasPage({ ideas, onAddIdea, onPromote }) {
  const [typeFilter, setTypeFilter] = useState('全部')
  const [q, setQ] = useState('')
  const types = ['全部', ...new Set(ideas.map((i) => i.type))]
  const filtered = ideas.filter((i) => (typeFilter === '全部' || i.type === typeFilter) && (!q.trim() || (i.title + ' ' + i.note).toLowerCase().includes(q.trim().toLowerCase())))
  return <div className="sub-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">IDEAS</p><h1>靈感池</h1><p>先收好，再決定什麼值得變成專案。</p></div>
      <button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button>
    </section>
    <div className="ideas-toolbar">
      {types.map((t) => (
        <button key={t} className={`filter-button ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t} <span>{t === '全部' ? ideas.length : ideas.filter((i) => i.type === t).length}</span></button>
      ))}
      <div className="ideas-search"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋靈感…" /></div>
    </div>
    {filtered.length === 0
      ? <div className="empty-state"><Lightbulb size={32} /><p>{q || typeFilter !== '全部' ? '沒有符合的靈感。換個關鍵字或篩選試試。' : '靈感池是空的。按下「新增靈感」開始收集。'}</p></div>
      : <div className="idea-grid">
      {filtered.map((idea) => <article className="idea-card" key={idea.id}>
        <div className="idea-card-top"><span className="idea-type">{idea.type}</span><span className="idea-date">{idea.created}</span></div>
        <div className="idea-icon"><Lightbulb size={19} /></div>
        <h3>{idea.title}</h3><p>{idea.note}</p>
        <div className="idea-card-bottom">
          <div className="idea-score"><span>值得探索</span><strong>{idea.score}</strong></div>
          {idea.ready
            ? <button className="small-primary" onClick={() => onPromote(idea.id)}>升級 Project <ArrowUpRight size={13} /></button>
            : <button className="small-outline" onClick={() => onPromote(idea.id)}>開始評估</button>}
        </div>
      </article>)}
      </div>}
  </div>
}

function IdeaPreview({ title, type, score }) {
  return <div className="idea-preview">
    <div className="idea-preview-icon"><Lightbulb size={14} /></div>
    <div><strong>{title}</strong><span>{type}</span></div><b>{score}</b>
  </div>
}

// ── Notes ─────────────────────────────────────────────
function NotesPage({ notes, projects, onAdd, onUpdate, onDelete, onPage }) {
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

function NoteModal({ note, projects, onClose, onSave }) {
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

// ── Timeline ──────────────────────────────────────────
function TimelinePage({ events, projects, onAdd, onDelete, onPage }) {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter)

  return <div className="sub-page timeline-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">TIMELINE</p><h1>進展時間軸</h1><p>看見每個專案怎麼走到現在。</p></div>
      <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={16} />新增事件</button>
    </section>
    <div className="timeline-filters">
      <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部 <span>{events.length}</span></button>
      <button className={`filter-btn ${filter === 'milestone' ? 'active' : ''}`} onClick={() => setFilter('milestone')}>里程碑</button>
      <button className={`filter-btn ${filter === 'note' ? 'active' : ''}`} onClick={() => setFilter('note')}>筆記</button>
    </div>
    {filtered.length === 0
      ? <div className="empty-state"><CalendarDays size={32} /><p>還沒有事件。按下「新增事件」開始記錄進展。</p></div>
      : <div className="timeline">
          {filtered.map((ev, i) => {
            const project = projects.find((p) => p.id === ev.projectId)
            const isLast = i === filtered.length - 1
            return <div className="timeline-item" key={ev.id}>
              <div className="timeline-dot-row">
                <div className="timeline-dot" style={{ background: ev.color || project?.color || '#e76f51' }} />
                {!isLast && <div className="timeline-line" style={{ background: ev.color || project?.color || '#e76f51' }} />}
              </div>
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <span className="timeline-date">{ev.date}</span>
                  <span className={`timeline-type-badge ${ev.type}`}>{ev.type === 'milestone' ? '里程碑' : '筆記'}</span>
                  {project && <span className="timeline-project-tag" style={{ borderColor: project.color, color: project.color }}>{project.name}</span>}
                </div>
                <h3 className="timeline-title">{ev.title}</h3>
                <button className="text-button delete-event" onClick={() => { if (confirm('確定刪除？')) onDelete(ev.id) }}>刪除</button>
              </div>
            </div>
          })}
        </div>
    }
    {showModal && <TimelineModal projects={projects} onClose={() => setShowModal(false)} onAdd={onAdd} />}
  </div>
}

function TimelineModal({ projects, onClose, onAdd }) {
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

// ── Review ────────────────────────────────────────────
function weekKeyOf(d = new Date()) {
  const day = (d.getDay() + 6) % 7 // 週一 = 0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
  return toISO(monday)
}

function ReviewPage({ goals, projects, tasks, reviews, snapshots, onSave }) {
  const [section, setSection] = useState('wins')
  const currentKey = weekKeyOf()
  const draft = reviews.find((r) => r.weekKey === currentKey)
  const [notes, setNotes] = useState(() => ({ wins: draft?.wins || '', learnings: draft?.learnings || '', block: draft?.block || '', next: draft?.next || '' }))

  const mondayTs = parseDate(currentKey).getTime()
  const doneCount = tasks.filter((t) => t.done && (t.completedAt ? t.completedAt >= mondayTs : true)).length
  const weekDoneList = tasks.filter((t) => t.done && t.completedAt && t.completedAt >= mondayTs).sort((a, b) => b.completedAt - a.completedAt)
  const inProgressGoals = goals.filter((g) => goalProgress(g, projects) > 0 && goalProgress(g, projects) < 100).length
  const completedGoals = goals.filter((g) => goalProgress(g, projects) >= 100).length
  const past = reviews.filter((r) => r.weekKey !== currentKey).sort((a, b) => b.weekKey.localeCompare(a.weekKey))

  // 14 天完成動能：每天完成的任務數
  const days14 = [...Array(14)].map((_, i) => todayStr(13 - i))
  const counts14 = days14.map((d) => tasks.filter((t) => t.done && t.completedAt && toISO(new Date(t.completedAt)) === d).length)
  const maxCount = Math.max(1, ...counts14)
  // 專案進度快照趨勢（每天自動記一次，累積中）
  const snaps = (snapshots || []).slice(-7)

  const placeholders = {
    wins: '這週做得好的三件事…',
    learnings: '有什麼發現或領悟…',
    block: '現在卡在哪裡？真正的阻礙是什麼？',
    next: '下週最重要的三件事…',
  }
  const fieldLabels = { wins: '本週收穫', learnings: '學到什麼', block: '卡在哪裡', next: '下週重點' }

  return <div className="sub-page review-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">REVIEW</p><h1>每週回顧</h1><p>用一週的距離，看清楚自己在往哪裡走。本週：{currentKey} 起。</p></div>
    </section>
    <div className="review-summary">
      <div className="summary-card"><span className="summary-label">本週完成任務</span><strong className="summary-value">{doneCount}</strong></div>
      <div className="summary-card"><span className="summary-label">進行中目標</span><strong className="summary-value">{inProgressGoals}</strong></div>
      <div className="summary-card"><span className="summary-label">已達成目標</span><strong className="summary-value">{completedGoals}</strong></div>
      <div className="summary-card"><span className="summary-label">本週專注專案</span><strong className="summary-value">{projects.filter((p) => p.stage === 'Active').length}/3</strong></div>
    </div>
    <div className="momentum">
      <div className="upcoming-head">近 14 天完成動能</div>
      <div className="momentum-bars">
        {counts14.map((n, i) => (
          <div key={i} className={`momentum-col ${n === 0 ? 'zero' : ''}`} title={`${days14[i]}：完成 ${n} 項`}>
            <span className="momentum-bar" style={{ height: `${Math.max(3, Math.round((n / maxCount) * 100))}%` }} />
          </div>
        ))}
      </div>
      <div className="momentum-axis"><span>{days14[0].slice(5).replace('-', '/')}</span><span>今天</span></div>
    </div>
    {snaps.length >= 2 && (
      <div className="momentum">
        <div className="upcoming-head">專案進度快照（每天自動記一次）</div>
        <div className="snap-table" style={{ gridTemplateColumns: `minmax(52px, auto) repeat(${projects.length}, 1fr)` }}>
          <div className="snap-row snap-head"><span className="snap-date">日期</span>{projects.map((p) => <span key={p.id} className="snap-cell">{p.name}</span>)}</div>
          {snaps.map((s) => (
            <div key={s.date} className="snap-row">
              <span className="snap-date">{s.date.slice(5)}</span>
              {projects.map((p) => <span key={p.id} className="snap-cell">{(s.projects || {})[p.id] ?? '—'}</span>)}
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="review-tabs">
      {[
        { id: 'wins', label: '本週收穫', icon: Check },
        { id: 'learnings', label: '學到什麼', icon: Lightbulb },
        { id: 'block', label: '卡在哪裡', icon: Circle },
        { id: 'next', label: '下週重點', icon: Target },
      ].map(({ id, label, icon: Icon }) => (
        <button key={id} className={`review-tab ${section === id ? 'active' : ''}`} onClick={() => setSection(id)}><Icon size={14} />{label}</button>
      ))}
    </div>
    <div className="review-editor">
      <textarea className="review-textarea" placeholder={placeholders[section] || ''} value={notes[section] || ''} onChange={(e) => setNotes({ ...notes, [section]: e.target.value })} rows={6} />
      <button className="primary-button" onClick={() => onSave(currentKey, notes)}><Check size={15} />儲存本週回顧</button>
    </div>
    <div className="upcoming-block">
      <div className="upcoming-head">本週已完成（自動帶入）</div>
      {weekDoneList.length === 0
        ? <p className="detail-empty">這週還沒有完成的任務 — 回去把今天的行動清一格，這裡就會自動長出來。</p>
        : weekDoneList.map((t) => (
          <div key={t.id} className="upcoming-row"><strong>{t.title}</strong><span>{new Date(t.completedAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} 完成</span></div>
        ))}
    </div>
    <div className="review-history">
      <h3>歷史回顧（{past.length}）</h3>
      {past.length === 0
        ? <p className="detail-empty">還沒有歷史回顧。儲存本週之後，下週它就會出現在這裡。</p>
        : <div className="review-history-grid">{past.map((r) => (
            <article key={r.weekKey} className="review-history-card">
              <header><strong>{r.weekKey} 那一週</strong><span>儲存於 {formatDate(r.savedAt)}</span></header>
              <div className="review-history-fields">
                {Object.keys(fieldLabels).map((k) => (
                  <div key={k}><b>{fieldLabels[k]}</b><p>{r[k] || '—'}</p></div>
                ))}
              </div>
            </article>
          ))}</div>}
    </div>
    <div className="review-goals">
      <h3>目標進度追蹤</h3>
      {goals.map((g) => <div className="review-goal-row" key={g.id}>
        <div className="review-goal-info">
          <span className="review-goal-color" style={{ background: g.color }} />
          <strong>{g.title}</strong><span>{g.description}</span>
        </div>
        <div className="review-goal-progress">
          <div className="goal-bar"><span style={{ width: `${goalProgress(g, projects)}%`, background: g.color }} /></div>
          <span>{goalProgress(g, projects)}%</span>
        </div>
      </div>)}
    </div>
  </div>
}

// ── Goals ─────────────────────────────────────────────
function GoalsPage({ goals, projects, onAdd, onUpdate, onDelete, onPage }) {
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

function GoalModal({ goal, projects, onClose, onSave }) {
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

// ── Empty placeholder ─────────────────────────────────
function EmptyPage({ page, onPage }) {
  return <div className="empty-page">
    <div className="empty-icon"><Settings size={26} /></div>
    <p className="eyebrow">{page.toUpperCase()}</p>
    <h1>這個頁面還在規劃中。</h1>
    <p className="empty-copy">先回到 Home，看 Nora 幫你整理好的今日重點。</p>
    <button className="primary-button" onClick={() => onPage('home')}>回到今日總覽 <ChevronRight size={15} /></button>
  </div>
}

// ── Annotation Modal (Custom Canvas Drawing) ───────────
function AnnotationModal({ onClose }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [tool, setTool] = useState('pen')
  const [strokeColor, setStrokeColor] = useState('#e76f51')
  const [dpr, setDpr] = useState(window.devicePixelRatio || 1)

  useLayoutEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Sync canvas pixel dimensions to its rendered size
  useLayoutEffect(() => {
    const sync = () => {
      const c = canvasRef.current; if (!c) return
      const rect = c.getBoundingClientRect()
      const w = Math.floor(rect.width)
      const h = Math.floor(rect.height)
      if (w === 0 || h === 0) return
      const ratio = dpr
      if (c.width !== w * ratio || c.height !== h * ratio) {
        c.width = w * ratio
        c.height = h * ratio
        const ctx = c.getContext('2d')
        ctx.scale(ratio, ratio)
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
      }
    }
    sync()
    const ro = new ResizeObserver(sync)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [dpr])

  const getCanvas = () => canvasRef.current
  const getCtx = () => getCanvas()?.getContext('2d')

  const startDraw = (e) => {
    const c = getCanvas(); if (!c) return
    const rect = c.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const ctx = getCtx()
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }
  const draw = (e) => {
    if (!drawing) return
    const c = getCanvas(); if (!c) return
    const rect = c.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const ctx = getCtx()
    ctx.lineWidth = tool === 'eraser' ? 20 : 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : strokeColor
    ctx.globalCompositeOperation = tool === 'eraser' ? 'source-over' : 'source-over'
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const stopDraw = () => { setDrawing(false); getCtx()?.closePath() }

  const clearCanvas = () => {
    const c = getCanvas(); if (!c) return
    const w = c.getBoundingClientRect().width
    const h = c.getBoundingClientRect().height
    const ctx = c.getContext('2d')
    ctx.scale(c.width / w, c.height / h)
    ctx.clearRect(0, 0, w, h)
    ctx.scale(w / c.width, h / c.height)
  }

  const exportCanvas = () => {
    const c = getCanvas(); if (!c) return
    const dataUrl = c.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl; a.download = `nora-annotation-${Date.now()}.png`
    a.click()
  }

  const colors = ['#e76f51', '#6f8f78', '#7087a3', '#bb8b4d', '#9b5de5', '#1a1a2e']

  return (
    <div className="modal-backdrop" style={{ zIndex: 100 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-excalidraw" style={{ width: 'min(100%, 960px)', height: 'min(90vh, 700px)', padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 0, flexShrink: 0 }}>
          <div>
            <div className="section-kicker"><span style={{ color: 'var(--coral)' }}>✏️</span> ANNOTATION</div>
            <h2>標註回饋</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {['pen', 'eraser'].map(t => (
            <button key={t} className={`outline-button ${tool === t ? 'active-tool' : ''}`}
              style={{ padding: '5px 12px', fontSize: 11, background: tool === t ? 'var(--coral-soft)' : 'white', borderColor: tool === t ? 'var(--coral)' : undefined }}
              onClick={() => setTool(t)}>{t === 'pen' ? '筆' : '橡皮擦'}</button>
          ))}
          <div style={{ display: 'flex', gap: 5, marginLeft: 8, alignItems: 'center' }}>
            {colors.map(c => <button key={c} onClick={() => setStrokeColor(c)}
              style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: strokeColor === c ? '2px solid white' : '2px solid transparent', boxShadow: strokeColor === c ? '0 0 0 1px ' + c : 'none', cursor: 'pointer' }} />)}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="outline-button" style={{ padding: '5px 12px', fontSize: 11 }} onClick={clearCanvas}>清除</button>
            <button className="primary-button" style={{ padding: '5px 12px', fontSize: 11 }} onClick={exportCanvas}>匯出 PNG</button>
          </div>
        </div>
        <div ref={containerRef} style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <canvas ref={canvasRef}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Project Detail Modal ──────────────────────────────
function ProjectDetailModal({ project, tasks, notes, events, onClose, onToggleTask, onEdit, onDelete, onUpdateProgress }) {
  if (!project) return null
  const projectTasks = tasks.filter((t) => t.projectId === project.id).sort((a, b) => (a.done - b.done) || a.due.localeCompare(b.due))
  const projectNotes = notes.filter((n) => n.projectId === project.id)
  const projectEvents = events.filter((e) => e.projectId === project.id).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 760, width: 'min(100%, 760px)' }}>
        <div className="modal-header">
          <div>
            <div className="section-kicker"><span className="stage-dot" style={{ background: project.color, display: 'inline-block', marginRight: 6 }} />{project.stage} · PROJECT</div>
            <h2>{project.name}</h2>
          </div>
          <div className="detail-actions">
            <button className="outline-button" onClick={onEdit}><Settings size={14} />編輯</button>
            {onDelete && <button className="icon-btn delete" onClick={onDelete} aria-label="刪除專案"><Trash2 size={14} /></button>}
            <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
          </div>
        </div>
        <p className="detail-desc">{project.description}</p>
        <div className="detail-progress">
          <div className="project-progress-bar"><span style={{ width: `${project.progress}%`, background: project.color }} /></div>
          <div className="progress-meta"><span>專案進度</span><b>{project.progress}%</b></div>
          <div className="progress-quick">
            <button className="goal-btn" onClick={() => onUpdateProgress(-5)}>-5%</button>
            <button className="goal-btn" onClick={() => onUpdateProgress(5)}>+5%</button>
            <span className="detail-updated-inline">最後更新 {relativeDays(project.lastUpdated)}</span>
          </div>
        </div>
        <div className="detail-next"><span>下一步</span><strong>{project.next}</strong></div>
        <div className="detail-columns">
          <div className="detail-block">
            <h3>任務（{projectTasks.filter((t) => !t.done).length} 進行中 / {projectTasks.length}）</h3>
            {projectTasks.length === 0 ? <p className="detail-empty">還沒有任務。</p> : projectTasks.map((t) => (
              <div key={t.id} className={`detail-task ${t.done ? 'completed' : ''}`}>
                <button className="checkbox-button" onClick={() => onToggleTask(t.id)}>{t.done ? <Check size={13} /> : null}</button>
                <span className="detail-task-title">{t.title}</span>
                <span className="detail-task-meta">{t.priority}優先 · {dueLabel(t.due).text}</span>
              </div>
            ))}
          </div>
          <div className="detail-block">
            <h3>筆記（{projectNotes.length}）</h3>
            {projectNotes.length === 0 ? <p className="detail-empty">還沒有筆記。</p> : projectNotes.map((n) => (
              <div key={n.id} className="detail-note"><strong>{n.title}</strong><span>{formatDate(n.createdAt)}</span></div>
            ))}
            <h3 style={{ marginTop: 14 }}>時間軸（{projectEvents.length}）</h3>
            {projectEvents.length === 0 ? <p className="detail-empty">還沒有事件。</p> : projectEvents.map((ev) => (
              <div key={ev.id} className="detail-event"><span className="detail-event-dot" style={{ background: ev.color || project.color }} /><strong>{ev.title}</strong><span>{ev.date}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Global Search (⌘K) ────────────────────────────────
function SearchModal({ state, onClose, onGo }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const query = q.trim().toLowerCase()

  const results = useMemo(() => {
    if (!query) return []
    const out = []
    state.projects.forEach((p) => { if ((p.name + ' ' + p.description).toLowerCase().includes(query)) out.push({ type: '專案', title: p.name, sub: `${p.stage} · 進度 ${p.progress}%`, icon: FolderKanban, go: () => onGo.project(p.id) }) })
    state.tasks.forEach((t) => { if (t.title.toLowerCase().includes(query)) out.push({ type: '任務', title: t.title, sub: `${dueLabel(t.due).text}${t.done ? ' · 已完成' : ''}`, icon: Timer, go: () => onGo.task(t.id) }) })
    state.ideas.forEach((i) => { if ((i.title + ' ' + i.note).toLowerCase().includes(query)) out.push({ type: '靈感', title: i.title, sub: `${i.type} · 值得探索 ${i.score}`, icon: Lightbulb, go: () => onGo.page('ideas') }) })
    state.notes.forEach((n) => { if ((n.title + ' ' + n.content).toLowerCase().includes(query)) out.push({ type: '筆記', title: n.title, sub: formatDate(n.createdAt), icon: FileText, go: () => onGo.page('notes') }) })
    state.goals.forEach((g) => { if ((g.title + ' ' + g.description).toLowerCase().includes(query)) out.push({ type: '星圖', title: g.title, sub: `${g.progress}% · 截止 ${g.targetDate}`, icon: Goal, go: () => onGo.page('goals') }) })
    state.timelineEvents.forEach((e) => { if (e.title.toLowerCase().includes(query)) out.push({ type: '事件', title: e.title, sub: e.date, icon: CalendarDays, go: () => onGo.page('timeline') }) })
    return out.slice(0, 12)
  }, [query, state, onGo])

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[idx]) results[idx].go()
  }

  return (
    <div className="search-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-panel">
        <div className="search-input-row">
          <Search size={17} />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0) }} onKeyDown={onKeyDown} placeholder="搜尋專案、任務、靈感、筆記、目標…" />
          <kbd>esc</kbd>
        </div>
        <div className="search-results">
          {!query
            ? <div className="search-hint">輸入關鍵字搜尋整個工作區。↑↓ 選擇、Enter 前往。</div>
            : results.length === 0
              ? <div className="search-hint">沒有符合「{q}」的結果。</div>
              : results.map((r, i) => {
                  const Icon = r.icon
                  return <button key={i} className={`search-item ${i === idx ? 'sel' : ''}`} onClick={() => r.go()} onMouseEnter={() => setIdx(i)}>
                    <span className="search-item-icon"><Icon size={15} /></span>
                    <span className="search-item-copy"><strong>{r.title}</strong><span>{r.sub}</span></span>
                    <span className="search-item-type">{r.type}</span>
                  </button>
                })}
        </div>
      </div>
    </div>
  )
}

// ── Notifications ─────────────────────────────────────
function NotificationPanel({ items, onClose }) {
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

// ── Settings ──────────────────────────────────────────
function SettingsPage({ state, onUpdateSettings, onExport, onImport, onReset }) {
  const s = state.settings || {}
  const stats = [
    { label: '專案', value: state.projects.length },
    { label: '靈感', value: state.ideas.length },
    { label: '任務', value: state.tasks.length },
    { label: '筆記', value: state.notes.length },
    { label: '事件', value: state.timelineEvents.length },
    { label: '目標', value: state.goals.length },
    { label: '回顧', value: (state.reviews || []).length },
  ]
  return (
    <div className="sub-page">
      <section className="sub-page-header">
        <div><p className="eyebrow">SETTINGS</p><h1>設定</h1><p>管理你的工作區與資料。</p></div>
      </section>
      <section className="settings-section">
        <h2>使用者</h2>
        <label>你的名字<input value={s.userName || ''} onChange={(e) => onUpdateSettings({ userName: e.target.value })} placeholder="例如：Chris" /></label>
        <p className="settings-hint">名字會顯示在每日問候與頭像，變更即時生效。工作區名稱固定為「北極星 Polaris」。</p>
      </section>
      <section className="settings-section">
        <h2>資料</h2>
        <div className="settings-stats">{stats.map((st) => <div key={st.label} className="settings-stat"><strong>{st.value}</strong><span>{st.label}</span></div>)}</div>
        <p className="settings-hint">所有資料都存在這台電腦的瀏覽器裡（localStorage），不會上傳。建議定期匯出 JSON 備份。</p>
        <div className="settings-actions">
          <button className="primary-button" onClick={onExport}><FileText size={15} />匯出備份</button>
          <label className="settings-import">匯入備份<input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => onImport(e.target.files[0])} /></label>
          <button className="outline-button danger" onClick={onReset}><Trash2 size={15} />重置工作區</button>
        </div>
      </section>
      <section className="settings-section">
        <h2>關於</h2>
        <p className="settings-hint">北極星 Polaris v1.6 · Local-first creator command center · React + Vite</p>
      </section>
    </div>
  )
}

// ── Idea Modal ────────────────────────────────────────
function IdeaModal({ onClose, onSave }) {
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

// ── 工具函式 ──────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff} 天前`
  return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

// ── 啟動 ──────────────────────────────────────────────
createRoot(document.getElementById('root')).render(<App />)
