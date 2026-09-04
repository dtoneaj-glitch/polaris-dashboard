import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Archive,
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
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import './styles.css'

const STORAGE_KEY = 'nora_workspace_v1_demo'

// ── 初始資料 ──────────────────────────────────────────
const initialProjects = [
  { id: 'aios', name: 'AIOS', description: 'AI 工作流與個人作業系統', stage: 'Active', color: '#e76f51', progress: 68, lastUpdate: '今天', next: '完成首頁第一版', tasks: 5, completed: 3 },
  { id: 'suno', name: 'SUNO Music', description: '用音樂保存正在發生的生活', stage: 'Explore', color: '#6f8f78', progress: 32, lastUpdate: '昨天', next: '完成一首 demo', tasks: 4, completed: 1 },
  { id: 'poker', name: 'Poker Trainer', description: '讓決策練習變得有趣', stage: 'MVP', color: '#7087a3', progress: 18, lastUpdate: '15 天前', next: '確認第一個訓練循環', tasks: 6, completed: 1 },
  { id: 'novel', name: '小說世界觀', description: '長篇故事與角色資料庫', stage: 'Idea', color: '#bb8b4d', progress: 8, lastUpdate: '6 天前', next: '整理三個核心角色', tasks: 3, completed: 0 },
]

const initialIdeas = [
  { id: 'idea-1', title: 'AI 教育遊戲', note: '讓國中生用遊戲理解 AI 的基本概念。', type: '產品', score: 82, created: '今天', ready: true },
  { id: 'idea-2', title: 'Roblox 短劇系列', note: '把日常觀察寫成一分鐘的角色短劇。', type: '內容', score: 68, created: '昨天', ready: false },
  { id: 'idea-3', title: '創作者決策日記', note: '記錄每次選擇，累積成自己的判斷資料庫。', type: '系統', score: 61, created: '3 天前', ready: false },
]

const initialTasks = [
  { id: 'task-1', title: '完成首頁第一版', projectId: 'aios', due: '今天', priority: '高', done: false },
  { id: 'task-2', title: '整理 AIOS 文件', projectId: 'aios', due: '今天', priority: '中', done: false },
  { id: 'task-3', title: '完成一首 SUNO demo', projectId: 'suno', due: '週五', priority: '中', done: false },
  { id: 'task-4', title: '確認第一個訓練循環', projectId: 'poker', due: '下週一', priority: '低', done: false },
]

const initialNotes = [
  { id: 'note-1', title: 'SUNO 聽了二十首參考曲', content: '決定走深夜氛圍，人聲少一點，留空間給低頻。先鎖這個方向。', tags: ['靈感', '音樂'], projectId: 'suno', createdAt: Date.now() - 2 * 86400000 },
  { id: 'note-2', title: '短劇：錯電梯', content: '第一集：一個遲到的人走進錯的電梯，門打開是三年後。角色動機：他不是穿越，是拒絕面對當天的會議。', tags: ['腳本', '短劇'], projectId: 'novel', createdAt: Date.now() - 9 * 86400000 },
  { id: 'note-3', title: 'Poker Trainer 卡住的原因', content: '不是缺功能，是不敢收窄題目。先做最 MVP 的單次練習，不要想一次做完。', tags: ['障礙', '反思'], projectId: 'poker', createdAt: Date.now() - 15 * 86400000 },
]

const initialTimelineEvents = [
  { id: 'ev-1', date: '2026-08-15', type: 'milestone', title: 'AIOS 第一章完成', projectId: 'aios', color: '#6f8f78' },
  { id: 'ev-2', date: '2026-08-20', type: 'note', title: 'SUNO 確認深夜氛圍方向', projectId: 'suno', color: '#e76f51' },
  { id: 'ev-3', date: '2026-08-25', type: 'milestone', title: '第一首歌完成 demo', projectId: 'suno', color: '#6f8f78' },
  { id: 'ev-4', date: '2026-09-01', type: 'note', title: '短劇「錯電梯」大綱寫完', projectId: 'novel', color: '#e76f51' },
  { id: 'ev-5', date: '2026-09-03', type: 'milestone', title: 'AIOS 首頁上線', projectId: 'aios', color: '#6f8f78' },
]

const initialGoals = [
  { id: 'goal-1', title: 'SUNO 頻道連續 4 週每週一首', description: '先做出有辨識度的聲音，再談規模', targetDate: '2026-09-28', progress: 25, color: '#6f8f78' },
  { id: 'goal-2', title: 'AIOS 首頁完成第一版', description: '能被使用、能被展示的程度', targetDate: '2026-09-10', progress: 68, color: '#e76f51' },
  { id: 'goal-3', title: '寫完短劇第一集腳本', description: '90 秒，可實拍', targetDate: '2026-09-20', progress: 40, color: '#bb8b4d' },
  { id: 'goal-4', title: '找到第一個付費使用者', description: 'AI 小工具的痛點驗證', targetDate: '2026-10-15', progress: 10, color: '#7087a3' },
]

const navItems = [
  { id: 'home', label: 'Home', icon: Gauge },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, count: 3 },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
  { id: 'review', label: 'Review', icon: BookOpen },
  { id: 'goals', label: 'Goals', icon: Goal },
]

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.projects && saved?.ideas && saved?.tasks) return saved
  } catch {}
  return { projects: initialProjects, ideas: initialIdeas, tasks: initialTasks, notes: initialNotes, timelineEvents: initialTimelineEvents, goals: initialGoals }
}

function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }

// ── 主元件 ────────────────────────────────────────────
function App() {
  const [state, setState] = useState(loadState)
  const [page, setPage] = useState('home')
  const [mobileNav, setMobileNav] = useState(false)
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => { saveState(state) }, [state])
  useEffect(() => {
    if (!notice) return undefined
    const t = setTimeout(() => setNotice(''), 2600)
    return () => clearTimeout(t)
  }, [notice])

  const activeProjects = state.projects.filter((p) => p.stage === 'Active')
  const focusProject = state.projects.find((p) => p.id === 'aios') || state.projects[0]
  const openTasks = state.tasks.filter((t) => !t.done)

  function updateTask(taskId) {
    setState((c) => ({ ...c, tasks: c.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }))
    setNotice('任務狀態已更新')
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
    const project = { id: `project-${Date.now()}`, name: idea.title, description: idea.note, stage: 'MVP', color: '#b47d58', progress: 0, lastUpdate: '剛剛', next: '定義第一個可驗證成果', tasks: 0, completed: 0 }
    setState((c) => ({ ...c, projects: [project, ...c.projects], ideas: c.ideas.filter((i) => i.id !== ideaId) }))
    setPage('projects')
    setNotice(`${idea.title} 已升級為 MVP 專案`)
  }

  // Notes actions
  function addNote(note) { setState((c) => ({ ...c, notes: [{ ...note, id: `note-${Date.now()}`, createdAt: Date.now() }, ...c.notes] })); setNotice('筆記已新增') }
  function updateNote(id, patch) { setState((c) => ({ ...c, notes: c.notes.map((n) => n.id === id ? { ...n, ...patch } : n) })); setNotice('筆記已更新') }
  function deleteNote(id) { setState((c) => ({ ...c, notes: c.notes.filter((n) => n.id !== id) })); setNotice('筆記已刪除') }

  // Timeline actions
  function addTimelineEvent(ev) { setState((c) => ({ ...c, timelineEvents: [...c.timelineEvents, { ...ev, id: `ev-${Date.now()}` }].sort((a, b) => a.date.localeCompare(b.date)) })); setNotice('事件已加入時間軸') }
  function deleteTimelineEvent(id) { setState((c) => ({ ...c, timelineEvents: c.timelineEvents.filter((e) => e.id !== id) })); setNotice('事件已刪除') }

  // Goals actions
  function updateGoal(id, patch) { setState((c) => ({ ...c, goals: c.goals.map((g) => g.id === id ? { ...g, ...patch } : g) })) }
  function addGoal(goal) { setState((c) => ({ ...c, goals: [{ ...goal, id: `goal-${Date.now()}` }, ...c.goals] })); setNotice('目標已新增') }
  function deleteGoal(id) { setState((c) => ({ ...c, goals: c.goals.filter((g) => g.id !== id) })); setNotice('目標已刪除') }

  function changePage(next) { setPage(next); setMobileNav(false) }

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage projects={state.projects} tasks={state.tasks} focusProject={focusProject} activeProjects={activeProjects} onTaskToggle={updateTask} onPage={changePage} onAddIdea={() => setShowIdeaModal(true)} />
      case 'projects': return <ProjectsPage projects={state.projects} tasks={state.tasks} onPage={changePage} />
      case 'ideas': return <IdeasPage ideas={state.ideas} onAddIdea={() => setShowIdeaModal(true)} onPromote={promoteIdea} />
      case 'notes': return <NotesPage notes={state.notes} projects={state.projects} onAdd={addNote} onUpdate={updateNote} onDelete={deleteNote} onPage={changePage} />
      case 'timeline': return <TimelinePage events={state.timelineEvents} projects={state.projects} onAdd={addTimelineEvent} onDelete={deleteTimelineEvent} onPage={changePage} />
      case 'review': return <ReviewPage goals={state.goals} projects={state.projects} tasks={state.tasks} onPage={changePage} />
      case 'goals': return <GoalsPage goals={state.goals} onAdd={addGoal} onUpdate={updateGoal} onDelete={deleteGoal} onPage={changePage} />
      default: return <EmptyPage page={page} onPage={changePage} />
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={16} /></div>
          <div><div className="brand-name">Nora Workspace</div><div className="brand-subtitle">Creator command center</div></div>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="關閉選單"><X size={17} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="avatar">C</div>
          <div className="switcher-copy"><strong>Chris 的 Workspace</strong><span>個人工作區</span></div>
          <ChevronRight size={15} className="muted-icon" />
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
            <div className="focus-mini-head"><Target size={15} /><span>今日主線</span><span className="live-dot" /></div>
            <strong>{focusProject.name}</strong>
            <span>{focusProject.next}</span>
            <div className="mini-progress"><span style={{ width: `${focusProject.progress}%` }} /></div>
            <div className="mini-progress-label"><span>進度</span><b>{focusProject.progress}%</b></div>
          </div>
          <button className="nav-item settings-item" onClick={() => changePage('settings')}><Settings size={17} /><span>Settings</span></button>
          <div className="sidebar-footer"><span className="sync-dot" /> Local-first workspace <span>v1.1</span></div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="開啟選單"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Nora Workspace</span><ChevronRight size={14} /><strong>{navItems.find(n => n.id === page)?.label || page}</strong></div>
          <div className="topbar-actions">
            <button className="topbar-search"><Search size={16} /><span>搜尋工作區</span><kbd>⌘ K</kbd></button>
            <button className="icon-button notification-button" aria-label="通知"><Bell size={17} /><i /></button>
            <div className="top-avatar">C</div>
          </div>
        </header>

        <div className="page-wrap">{renderPage()}</div>
      </main>

      {showIdeaModal && <IdeaModal onClose={() => setShowIdeaModal(false)} onSave={addIdea} />}
      {notice && <div className="toast"><Check size={15} />{notice}</div>}
    </div>
  )
}

// ── Home ──────────────────────────────────────────────
function HomePage({ projects, tasks, focusProject, activeProjects, onTaskToggle, onPage, onAddIdea }) {
  const todayTasks = tasks.filter((t) => t.due === '今天')
  const completedToday = todayTasks.filter((t) => t.done).length
  const stalled = projects.find((p) => p.id === 'poker')
  return (
    <div className="home-page">
      <section className="welcome-row">
        <div><p className="eyebrow">THURSDAY, SEPTEMBER 4, 2026</p><h1>今天，先推進一件事。</h1><p className="welcome-copy">早安，Chris。Nora 已經替你整理好現在最值得注意的事。</p></div>
        <button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button>
      </section>
      <div className="home-grid">
        <div className="home-main-column">
          <section className="brief-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Sparkles size={14} />NORA DAILY BRIEF</div><h2>今日晨報</h2></div><span className="brief-time"><Clock3 size={14} />更新於 08:42</span></div>
            <div className="brief-message"><span className="quote-mark">"</span><p>你的主線很清楚：把 AIOS 首頁推到可以被看見的程度。其他想法先記著，今天不要分心。</p></div>
            <div className="brief-divider" />
            <div className="brief-columns">
              <BriefList title="今天建議" icon={Compass} tone="coral" items={[{ title: '完成 AI 小工具 Landing Page', meta: 'AIOS · 高優先', done: false }, { title: 'SUNO 完成一首歌', meta: 'SUNO Music · 45 分鐘', done: false }]} onPage={onPage} />
              <BriefList title="最近完成" icon={Check} tone="green" items={[{ title: '登入流程確認', meta: '昨天完成', done: true }, { title: 'IG 第 5 篇發布', meta: '前天完成', done: true }]} />
            </div>
          </section>
          <section className="focus-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Target size={14} />TODAY FOCUS</div><h2>主線：{focusProject.name}</h2></div><button className="text-button" onClick={() => onPage('projects')}>查看專案 <ArrowUpRight size={15} /></button></div>
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
            <div className="section-heading"><div><div className="section-kicker"><Timer size={14} />TODAY'S ACTIONS</div><h2>今天的行動</h2></div><span className="task-count">{completedToday}/{todayTasks.length} 完成</span></div>
            <div className="task-list">{todayTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onTaskToggle} />)}</div>
          </section>
        </div>
        <aside className="home-side-column">
          <section className="attention-panel side-panel">
            <div className="side-heading"><div><div className="section-kicker attention-kicker"><Bell size={14} />ATTENTION</div><h3>需要注意</h3></div><span className="attention-count">1</span></div>
            {stalled && <div className="attention-item"><div className="project-dot" style={{ background: stalled.color }} /><div className="attention-copy"><strong>{stalled.name}</strong><span>{stalled.lastUpdate} 沒有更新</span><p>下一步還不夠小，可能需要重新定義 MVP。</p></div></div>}
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
              <IdeaPreview title="AI 教育遊戲" type="產品" score="82" />
              <IdeaPreview title="Roblox 短劇系列" type="內容" score="68" />
              <IdeaPreview title="創作者決策日記" type="系統" score="61" />
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

function TaskRow({ task, onToggle }) {
  return <div className={`task-row ${task.done ? 'completed' : ''}`}>
    <button className="checkbox-button" onClick={() => onToggle(task.id)}>{task.done ? <Check size={13} /> : null}</button>
    <div className="task-copy"><strong>{task.title}</strong><span>{task.projectId.toUpperCase()} · {task.priority}優先</span></div>
    <span className={`task-due ${task.due === '今天' ? 'today' : ''}`}>{task.due}</span>
    <button className="row-more" aria-label="更多選項">•••</button>
  </div>
}

// ── Projects ──────────────────────────────────────────
function ProjectsPage({ projects, tasks, onPage }) {
  const activeCount = projects.filter((p) => p.stage === 'Active').length
  return <div className="sub-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">PROJECTS</p><h1>所有專案</h1><p>把想法變成有下一步的進度。</p></div>
      <button className="primary-button" onClick={() => onPage('ideas')}><Plus size={16} />從靈感建立</button>
    </section>
    <div className="project-overview">
      <div><span>Active 專案</span><strong>{activeCount}<small>/ 3</small></strong></div>
      <div><span>進行中任務</span><strong>{tasks.filter((t) => !t.done).length}</strong></div>
      <div><span>本週完成</span><strong>6</strong></div>
    </div>
    <div className="project-section-title"><h2>Project pipeline</h2><span>{projects.length} 個專案</span></div>
    <div className="project-list">{projects.map((p) => <ProjectRow key={p.id} project={p} />)}</div>
  </div>
}

function ProjectRow({ project }) {
  return <article className="project-row">
    <div className="project-row-main"><div className="project-symbol" style={{ background: project.color }}><Sparkles size={17} /></div><div><h3>{project.name}</h3><p>{project.description}</p></div></div>
    <div className="stage-label"><span className="stage-dot" style={{ background: project.color }} />{project.stage}</div>
    <div className="project-progress"><div className="project-progress-bar"><span style={{ width: `${project.progress}%`, background: project.color }} /></div><small>{project.progress}%</small></div>
    <div className="project-next"><span>下一步</span><strong>{project.next}</strong></div>
    <button className="icon-button"><ArrowUpRight size={16} /></button>
  </article>
}

// ── Ideas ─────────────────────────────────────────────
function IdeasPage({ ideas, onAddIdea, onPromote }) {
  return <div className="sub-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">IDEAS</p><h1>靈感池</h1><p>先收好，再決定什麼值得變成專案。</p></div>
      <button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button>
    </section>
    <div className="ideas-toolbar">
      <div className="filter-button active">全部 <span>{ideas.length}</span></div>
      <div className="filter-button">產品</div>
      <div className="filter-button">內容</div>
      <div className="ideas-sort"><Search size={15} />搜尋靈感</div>
    </div>
    <div className="idea-grid">
      {ideas.map((idea) => <article className="idea-card" key={idea.id}>
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
    </div>
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
function ReviewPage({ goals, projects, tasks, onPage }) {
  const [section, setSection] = useState('wins')
  const [notes, setNotes] = useState({ wins: '', learnings: '', block: '', next: '' })

  const weekTasks = tasks.filter((t) => t.done).length
  const inProgressGoals = goals.filter((g) => g.progress > 0 && g.progress < 100).length
  const completedGoals = goals.filter((g) => g.progress >= 100).length

  const placeholders = {
    wins: '這週做得好的三件事…',
    learnings: '有什麼發現或領悟…',
    block: '現在卡在哪裡？真正的阻礙是什麼？',
    next: '下週最重要的三件事…',
  }

  return <div className="sub-page review-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">REVIEW</p><h1>每週回顧</h1><p>用一週的距離，看清楚自己在往哪裡走。</p></div>
    </section>
    <div className="review-summary">
      <div className="summary-card"><span className="summary-label">本週完成任務</span><strong className="summary-value">{weekTasks}</strong></div>
      <div className="summary-card"><span className="summary-label">進行中目標</span><strong className="summary-value">{inProgressGoals}</strong></div>
      <div className="summary-card"><span className="summary-label">已達成目標</span><strong className="summary-value">{completedGoals}</strong></div>
      <div className="summary-card"><span className="summary-label">本週專注專案</span><strong className="summary-value">{projects.filter((p) => p.stage === 'Active').length}/3</strong></div>
    </div>
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
      <button className="primary-button" onClick={() => { setNotes({ ...notes }); alert('回顧已儲存（本地暫存）') }}>儲存本週回顧</button>
    </div>
    <div className="review-goals">
      <h3>目標進度追蹤</h3>
      {goals.map((g) => <div className="review-goal-row" key={g.id}>
        <div className="review-goal-info">
          <span className="review-goal-color" style={{ background: g.color }} />
          <strong>{g.title}</strong><span>{g.description}</span>
        </div>
        <div className="review-goal-progress">
          <div className="goal-bar"><span style={{ width: `${g.progress}%`, background: g.color }} /></div>
          <span>{g.progress}%</span>
        </div>
      </div>)}
    </div>
  </div>
}

// ── Goals ─────────────────────────────────────────────
function GoalsPage({ goals, onAdd, onUpdate, onDelete, onPage }) {
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  return <div className="sub-page goals-page">
    <section className="sub-page-header">
      <div><p className="eyebrow">GOALS</p><h1>目標追蹤</h1><p>讓每個下一步都連回你想去的地方。</p></div>
      <button className="primary-button" onClick={() => { setEditingGoal(null); setShowModal(true) }}><Plus size={16} />新增目標</button>
    </section>
    {goals.length === 0
      ? <div className="empty-state"><Goal size={32} /><p>還沒有目標。按下「新增目標」開始追蹤。</p></div>
      : <div className="goals-grid">{goals.map((goal) => <article className="goal-card" key={goal.id}>
          <div className="goal-card-header"><div className="goal-color-bar" style={{ background: goal.color }} /><div className="goal-card-meta">
            <span className="goal-target-date">截止 {goal.targetDate}</span>
            <div className="goal-actions">
              <button className="icon-btn" onClick={() => { setEditingGoal(goal); setShowModal(true) }} aria-label="編輯"><Settings size={13} /></button>
              <button className="icon-btn delete" onClick={() => { if (confirm('確定刪除這個目標？')) onDelete(goal.id) }} aria-label="刪除"><Trash2 size={13} /></button>
            </div>
          </div></div>
          <h3 className="goal-title">{goal.title}</h3>
          <p className="goal-desc">{goal.description}</p>
          <div className="goal-progress-section">
            <div className="goal-bar-large"><span style={{ width: `${goal.progress}%`, background: goal.color }} /></div>
            <div className="goal-controls">
              <button className="goal-btn" onClick={() => onUpdate(goal.id, { progress: Math.max(0, goal.progress - 5) })}>-5%</button>
              <span className="goal-percent">{goal.progress}%</span>
              <button className="goal-btn" onClick={() => onUpdate(goal.id, { progress: Math.min(100, goal.progress + 5) })}>+5%</button>
              <button className="goal-btn complete" onClick={() => onUpdate(goal.id, { progress: 100 })}>完成</button>
            </div>
          </div>
        </article>)}
      </div>
    }
    {showModal && <GoalModal goal={editingGoal} onClose={() => { setShowModal(false); setEditingGoal(null) }} onSave={(data) => { if (editingGoal) onUpdate(editingGoal.id, data); else onAdd(data); setShowModal(false); setEditingGoal(null) }} />}
  </div>
}

function GoalModal({ goal, onClose, onSave }) {
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [targetDate, setTargetDate] = useState(goal?.targetDate || '')
  const [progress, setProgress] = useState(goal?.progress ?? 0)
  const [color, setColor] = useState(goal?.color || '#e76f51')

  function submit(e) {
    e.preventDefault()
    if (!title.trim() || !targetDate) return
    onSave({ title: title.trim(), description: description.trim(), targetDate, progress, color })
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
        <label>目前進度 <span className="progress-label">{progress}%</span>
          <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="progress-range" />
        </label>
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
