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
  X,
} from 'lucide-react'
import './styles.css'

const STORAGE_KEY = 'nora_workspace_v1_demo'

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
  } catch {
    // Keep the seeded workspace when storage is unavailable or malformed.
  }
  return { projects: initialProjects, ideas: initialIdeas, tasks: initialTasks }
}

function App() {
  const [state, setState] = useState(loadState)
  const [page, setPage] = useState('home')
  const [mobileNav, setMobileNav] = useState(false)
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 2600)
    return () => clearTimeout(timer)
  }, [notice])

  const activeProjects = state.projects.filter((project) => project.stage === 'Active')
  const focusProject = state.projects.find((project) => project.id === 'aios')
  const openTasks = state.tasks.filter((task) => !task.done)

  function updateTask(taskId) {
    setState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) }))
    setNotice('任務狀態已更新')
  }

  function addIdea(idea) {
    setState((current) => ({ ...current, ideas: [{ ...idea, id: `idea-${Date.now()}`, created: '剛剛', ready: false }, ...current.ideas] }))
    setShowIdeaModal(false)
    setNotice('靈感已放入 Ideas')
  }

  function promoteIdea(ideaId) {
    if (activeProjects.length >= 3) {
      setNotice('目前已有 3 個 Active 專案，請先整理容量')
      return
    }
    const idea = state.ideas.find((item) => item.id === ideaId)
    if (!idea) return
    const project = { id: `project-${Date.now()}`, name: idea.title, description: idea.note, stage: 'MVP', color: '#b47d58', progress: 0, lastUpdate: '剛剛', next: '定義第一個可驗證成果', tasks: 0, completed: 0 }
    setState((current) => ({ ...current, projects: [project, ...current.projects], ideas: current.ideas.filter((item) => item.id !== ideaId) }))
    setPage('projects')
    setNotice(`${idea.title} 已升級為 MVP 專案`)
  }

  function changePage(nextPage) {
    setPage(nextPage)
    setMobileNav(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={16} /></div>
          <div>
            <div className="brand-name">Nora Workspace</div>
            <div className="brand-subtitle">Creator command center</div>
          </div>
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
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count ? <span className="nav-count">{count}</span> : null}
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
          <div className="sidebar-footer"><span className="sync-dot" /> Local-first workspace <span>v1.0</span></div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="開啟選單"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Nora Workspace</span><ChevronRight size={14} /><strong>{page === 'home' ? 'Home' : page[0].toUpperCase() + page.slice(1)}</strong></div>
          <div className="topbar-actions"><button className="topbar-search"><Search size={16} /><span>搜尋工作區</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="通知"><Bell size={17} /><i /></button><div className="top-avatar">C</div></div>
        </header>

        <div className="page-wrap">
          {page === 'home' && <HomePage projects={state.projects} tasks={state.tasks} focusProject={focusProject} activeProjects={activeProjects} onTaskToggle={updateTask} onPage={changePage} onAddIdea={() => setShowIdeaModal(true)} />}
          {page === 'projects' && <ProjectsPage projects={state.projects} tasks={state.tasks} onPage={changePage} />}
          {page === 'ideas' && <IdeasPage ideas={state.ideas} onAddIdea={() => setShowIdeaModal(true)} onPromote={promoteIdea} />}
          {['notes', 'timeline', 'review', 'goals', 'settings'].includes(page) && <EmptyPage page={page} onPage={changePage} />}
        </div>
      </main>

      {showIdeaModal && <IdeaModal onClose={() => setShowIdeaModal(false)} onSave={addIdea} />}
      {notice && <div className="toast"><Check size={15} />{notice}</div>}
    </div>
  )
}

function HomePage({ projects, tasks, focusProject, activeProjects, onTaskToggle, onPage, onAddIdea }) {
  const todayTasks = tasks.filter((task) => task.due === '今天')
  const completedToday = todayTasks.filter((task) => task.done).length
  const stalled = projects.find((project) => project.id === 'poker')
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
            <div className="brief-message"><span className="quote-mark">“</span><p>你的主線很清楚：把 AIOS 首頁推到可以被看見的程度。其他想法先記著，今天不要分心。</p></div>
            <div className="brief-divider" />
            <div className="brief-columns">
              <BriefList title="今天建議" icon={Compass} tone="coral" items={[{ title: '完成 AI 小工具 Landing Page', meta: 'AIOS · 高優先', done: false }, { title: 'SUNO 完成一首歌', meta: 'SUNO Music · 45 分鐘', done: false }, { title: '整理 AIOS 文件', meta: 'AIOS · 30 分鐘', done: false }]} onPage={onPage} />
              <BriefList title="最近完成" icon={Check} tone="green" items={[{ title: '登入流程確認', meta: '昨天完成', done: true }, { title: 'IG 第 5 篇發布', meta: '前天完成', done: true }]} />
            </div>
          </section>

          <section className="focus-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Target size={14} />TODAY FOCUS</div><h2>主線：{focusProject.name}</h2></div><button className="text-button" onClick={() => onPage('projects')}>查看專案 <ArrowUpRight size={15} /></button></div>
            <div className="focus-content"><div className="focus-project-mark" style={{ background: focusProject.color }}><Sparkles size={20} /></div><div className="focus-project-copy"><strong>{focusProject.next}</strong><span>{focusProject.description}</span><div className="focus-progress-line"><span style={{ width: `${focusProject.progress}%`, background: focusProject.color }} /></div><div className="progress-meta"><span>專案進度</span><b>{focusProject.progress}%</b></div></div><button className="outline-button" onClick={() => onPage('projects')}>開始工作 <ChevronRight size={15} /></button></div>
          </section>

          <section className="tasks-panel panel-rule">
            <div className="section-heading"><div><div className="section-kicker"><Timer size={14} />TODAY'S ACTIONS</div><h2>今天的行動</h2></div><span className="task-count">{completedToday}/{todayTasks.length} 完成</span></div>
            <div className="task-list">{todayTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onTaskToggle} />)}</div>
          </section>
        </div>

        <aside className="home-side-column">
          <section className="attention-panel side-panel"><div className="side-heading"><div><div className="section-kicker attention-kicker"><Bell size={14} />ATTENTION</div><h3>需要注意</h3></div><span className="attention-count">1</span></div><div className="attention-item"><div className="project-dot" style={{ background: stalled.color }} /><div className="attention-copy"><strong>{stalled.name}</strong><span>{stalled.lastUpdate}沒有更新</span><p>下一步還不夠小，可能需要重新定義 MVP。</p></div></div><button className="soft-button" onClick={() => onPage('projects')}>檢視並整理 <ArrowUpRight size={14} /></button></section>
          <section className="capacity-panel side-panel"><div className="side-heading"><div><div className="section-kicker"><Gauge size={14} />CAPACITY</div><h3>專案容量</h3></div><strong className="capacity-number">{activeProjects.length}<small>/3</small></strong></div><div className="capacity-track">{[0, 1, 2].map((slot) => <span key={slot} className={slot < activeProjects.length ? 'filled' : ''} />)}</div><p>Active 專案最多維持 3 個。現在還有空間給一個真正值得推進的想法。</p><button className="text-button" onClick={() => onPage('projects')}>管理專案 <ChevronRight size={14} /></button></section>
          <section className="ideas-panel side-panel"><div className="side-heading"><div><div className="section-kicker"><Inbox size={14} />IDEA INBOX</div><h3>最近的靈感</h3></div><button className="icon-button" onClick={onAddIdea} aria-label="新增靈感"><Plus size={16} /></button></div><div className="idea-preview-list"><IdeaPreview title="AI 教育遊戲" type="產品" score="82" /><IdeaPreview title="Roblox 短劇系列" type="內容" score="68" /><IdeaPreview title="創作者決策日記" type="系統" score="61" /></div><button className="text-button" onClick={() => onPage('ideas')}>檢視全部 <ChevronRight size={14} /></button></section>
        </aside>
      </div>
    </div>
  )
}

function BriefList({ title, icon: Icon, tone, items, onPage }) {
  return <div className={`brief-list ${tone}`}><div className="brief-list-title"><Icon size={15} /><strong>{title}</strong></div>{items.map((item) => <button className="brief-list-item" key={item.title} onClick={() => onPage?.('projects')}><span className={`status-icon ${item.done ? 'done' : ''}`}>{item.done ? <Check size={12} /> : <Circle size={8} />}</span><span><strong>{item.title}</strong><small>{item.meta}</small></span><ChevronRight size={14} /></button>)}</div>
}

function TaskRow({ task, onToggle }) {
  return <div className={`task-row ${task.done ? 'completed' : ''}`}><button className="checkbox-button" onClick={() => onToggle(task.id)} aria-label={`完成 ${task.title}`}>{task.done ? <Check size={13} /> : null}</button><div className="task-copy"><strong>{task.title}</strong><span>{task.projectId.toUpperCase()} · {task.priority}優先</span></div><span className={`task-due ${task.due === '今天' ? 'today' : ''}`}>{task.due}</span><button className="row-more" aria-label="更多選項">•••</button></div>
}

function ProjectsPage({ projects, tasks, onPage }) {
  const activeCount = projects.filter((project) => project.stage === 'Active').length
  return <div className="sub-page"><section className="sub-page-header"><div><p className="eyebrow">PROJECTS</p><h1>所有專案</h1><p>把想法變成有下一步的進度。</p></div><button className="primary-button" onClick={() => onPage('ideas')}><Plus size={16} />從靈感建立</button></section><div className="project-overview"><div><span>Active 專案</span><strong>{activeCount}<small>/ 3</small></strong></div><div><span>進行中任務</span><strong>{tasks.filter((task) => !task.done).length}</strong></div><div><span>本週完成</span><strong>6</strong></div></div><div className="project-section-title"><h2>Project pipeline</h2><span>{projects.length} 個專案</span></div><div className="project-list">{projects.map((project) => <ProjectRow key={project.id} project={project} />)}</div></div>
}

function ProjectRow({ project }) {
  return <article className="project-row"><div className="project-row-main"><div className="project-symbol" style={{ background: project.color }}><Sparkles size={17} /></div><div><h3>{project.name}</h3><p>{project.description}</p></div></div><div className="stage-label"><span className="stage-dot" style={{ background: project.color }} />{project.stage}</div><div className="project-progress"><div className="project-progress-bar"><span style={{ width: `${project.progress}%`, background: project.color }} /></div><small>{project.progress}%</small></div><div className="project-next"><span>下一步</span><strong>{project.next}</strong></div><button className="icon-button"><ArrowUpRight size={16} /></button></article>
}

function IdeasPage({ ideas, onAddIdea, onPromote }) {
  return <div className="sub-page"><section className="sub-page-header"><div><p className="eyebrow">IDEAS</p><h1>靈感池</h1><p>先收好，再決定什麼值得變成專案。</p></div><button className="primary-button" onClick={onAddIdea}><Plus size={16} />新增靈感</button></section><div className="ideas-toolbar"><div className="filter-button active">全部 <span>{ideas.length}</span></div><div className="filter-button">產品</div><div className="filter-button">內容</div><div className="filter-button">系統</div><div className="ideas-sort"><Search size={15} />搜尋靈感</div></div><div className="idea-grid">{ideas.map((idea) => <article className="idea-card" key={idea.id}><div className="idea-card-top"><span className="idea-type">{idea.type}</span><span className="idea-date">{idea.created}</span></div><div className="idea-icon"><Lightbulb size={19} /></div><h3>{idea.title}</h3><p>{idea.note}</p><div className="idea-card-bottom"><div className="idea-score"><span>值得探索</span><strong>{idea.score}</strong></div>{idea.ready ? <button className="small-primary" onClick={() => onPromote(idea.id)}>升級 Project <ArrowUpRight size={13} /></button> : <button className="small-outline" onClick={() => onPromote(idea.id)}>開始評估</button>}</div></article>)}</div></div>
}

function IdeaPreview({ title, type, score }) { return <div className="idea-preview"><div className="idea-preview-icon"><Lightbulb size={14} /></div><div><strong>{title}</strong><span>{type}</span></div><b>{score}</b></div> }

function EmptyPage({ page, onPage }) {
  const titles = { notes: ['Notes', '把重要的決定留下來。', FileText], timeline: ['Timeline', '看見每個專案怎麼走到現在。', CalendarDays], review: ['Review', '用每週回顧，找出真正的進展。', BookOpen], goals: ['Goals', '讓每個下一步都連回你想去的地方。', Goal], settings: ['Settings', 'Workspace 的基本設定。', Settings] }
  const [title, copy, Icon] = titles[page] || titles.settings
  return <div className="empty-page"><div className="empty-icon"><Icon size={26} /></div><p className="eyebrow">{title.toUpperCase()}</p><h1>{copy}</h1><p className="empty-copy">這個區域會在下一個版本展開。現在先回到 Home，看 Nora 幫你整理好的今日重點。</p><button className="primary-button" onClick={() => onPage('home')}>回到今日總覽 <ChevronRight size={15} /></button></div>
}

function IdeaModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [type, setType] = useState('產品')
  function submit(event) { event.preventDefault(); if (!title.trim()) return; onSave({ title: title.trim(), note: note.trim() || '還沒有補充說明。', type, score: 50 }) }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal"><div className="modal-header"><div><div className="section-kicker"><Lightbulb size={14} />NEW IDEA</div><h2>捕捉一個靈感</h2></div><button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button></div><form onSubmit={submit}><label>靈感名稱<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：AI 教育遊戲" /></label><label>先記下來<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="它解決什麼問題？為什麼現在想到？" rows="4" /></label><label>類型<select value={type} onChange={(event) => setType(event.target.value)}><option>產品</option><option>內容</option><option>系統</option><option>生活</option></select></label><div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>取消</button><button type="submit" className="primary-button" disabled={!title.trim()}><Plus size={16} />放入 Ideas</button></div></form></div></div>
}

createRoot(document.getElementById('root')).render(<App />)
