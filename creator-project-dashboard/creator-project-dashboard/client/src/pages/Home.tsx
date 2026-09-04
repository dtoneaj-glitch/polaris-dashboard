/* Design philosophy: paper editorial workbench — warm ivory surfaces, ink typography, vermilion action marks, and clear next-step states. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Download,
  FileText,
  FolderKanban,
  Lightbulb,
  ListChecks,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type ProjectStatus = "想法" | "研究中" | "準備中" | "進行中" | "暫停" | "完成" | "結束";
type ProjectRole = "主要專案" | "副專案" | "專案池";
type ActionStatus = "待開始" | "進行中" | "完成" | "卡住" | "取消";
type Priority = "P1" | "P2" | "P3";
type ViewKey = "overview" | "active" | "pool" | "actions" | "achievements" | "progress";

type Project = {
  id: string;
  name: string;
  type: string;
  status: ProjectStatus;
  role: ProjectRole;
  purpose: string;
  goal: string;
  stage: string;
  progress: number;
  milestone: string;
  nextStep: string;
  startDate: string;
  reviewDate: string;
  notes: string;
  updatedAt: string;
};

type Action = {
  id: string;
  title: string;
  projectId: string;
  priority: Priority;
  date: string;
  estimate: string;
  status: ActionStatus;
  definition: string;
  notes: string;
};

type ProgressLog = {
  id: string;
  date: string;
  projectId: string;
  completed: string;
  output: string;
  stage: string;
  change: string;
  blocker: string;
  solution: string;
  nextStep: string;
  time: string;
  notes: string;
};

type Achievement = {
  id: string;
  name: string;
  projectId: string;
  type: string;
  date: string;
  status: string;
  link: string;
  metric: string;
  learning: string;
  notes: string;
};

type Store = { projects: Project[]; actions: Action[]; progressLogs: ProgressLog[]; achievements: Achievement[] };

type ModalState = { type: "project" | "action" | "progress" | "achievement"; item?: Project | Action | ProgressLog | Achievement } | null;

const STORE_KEY = "creator-workbench-v1";
const today = new Date().toISOString().slice(0, 10);
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const starterStore: Store = {
  projects: [
    { id: "p-music", name: "SUNO YouTube 音樂頻道", type: "音樂內容", status: "進行中", role: "主要專案", purpose: "驗證是否能穩定產出 AI 音樂內容", goal: "30 天發布 5 支影片", stage: "製作", progress: 32, milestone: "完成並發布第一支影片", nextStep: "產出第一首 3 分鐘 Lo-fi 初版", startDate: today, reviewDate: "2026-09-25", notes: "先追求可發布版本，不在前期過度打磨品牌。", updatedAt: today },
    { id: "p-tool", name: "AI 小工具驗證", type: "AI 工具", status: "研究中", role: "副專案", purpose: "找出一個創作者願意付費解決的問題", goal: "完成 3 個使用情境與一個原型", stage: "研究", progress: 18, milestone: "整理出第一個可測試需求", nextStep: "列出 3 個重複出現的創作痛點", startDate: today, reviewDate: "2026-09-18", notes: "先從自己的工作流程找問題，不急著開發。", updatedAt: today },
    { id: "p-story", name: "短劇／小說創作實驗", type: "敘事創作", status: "準備中", role: "副專案", purpose: "測試短篇敘事與 AI 協作流程", goal: "完成一個 60 秒短劇腳本或小說樣章", stage: "定位", progress: 8, milestone: "選定一個故事題材", nextStep: "寫出三個故事 premise", startDate: today, reviewDate: "2026-09-30", notes: "短劇與小說先共用題材池，月底再決定主格式。", updatedAt: today },
    { id: "p-idea", name: "AI 自動分鏡工具", type: "AI 工具", status: "想法", role: "專案池", purpose: "降低短劇前期分鏡規劃時間", goal: "確認是否存在可重複的需求", stage: "想法", progress: 0, milestone: "完成需求初步評估", nextStep: "記錄 5 個分鏡規劃痛點", startDate: "", reviewDate: "2026-10-01", notes: "先保留構想，等待專案池檢視。", updatedAt: today },
  ],
  actions: [
    { id: "a-1", title: "完成頻道名稱與簡介草稿", projectId: "p-music", priority: "P1", date: today, estimate: "45 分鐘", status: "進行中", definition: "整理 5 個名稱候選並選出 1 個可用版本", notes: "避免先做完整品牌識別。" },
    { id: "a-2", title: "產出第一首 Lo-fi 初版", projectId: "p-music", priority: "P1", date: today, estimate: "90 分鐘", status: "待開始", definition: "完成一首歌曲與可用封面", notes: "先完成，不在今天反覆修改。" },
    { id: "a-3", title: "列出 3 個創作者常見痛點", projectId: "p-tool", priority: "P2", date: today, estimate: "30 分鐘", status: "待開始", definition: "每個痛點都寫出發生情境與目前替代方案", notes: "從自己的內容流程開始觀察。" },
    { id: "a-4", title: "寫出三個故事 premise", projectId: "p-story", priority: "P3", date: today, estimate: "45 分鐘", status: "待開始", definition: "每個 premise 包含角色、衝突與結局方向", notes: "不要先追求完整大綱。" },
  ],
  progressLogs: [
    { id: "l-1", date: today, projectId: "p-music", completed: "完成頻道定位草稿", output: "5 個名稱候選與 1 份定位文件", stage: "製作", change: "20% → 32%", blocker: "尚未決定視覺風格", solution: "先用黑白與朱砂色完成 MVP", nextStep: "產出第一首歌曲與封面", time: "90 分鐘", notes: "先追求發布，不追求完美。" },
  ],
  achievements: [],
};

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : starterStore;
  } catch {
    return starterStore;
  }
}

function formatDate(value: string) {
  if (!value) return "未設定";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("zh-TW", { month: "short", day: "numeric" }).format(date);
}

function projectName(projects: Project[], projectId: string) {
  return projects.find((project) => project.id === projectId)?.name ?? "未指定專案";
}

function statusClass(status: string) {
  return status.replaceAll("／", "-").replaceAll(" ", "-");
}

export default function Home() {
  const [store, setStore] = useState<Store>(loadStore);
  const [view, setView] = useState<ViewKey>("overview");
  const [modal, setModal] = useState<ModalState>(null);
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store]);

  const activeProjects = useMemo(() => store.projects.filter((project) => project.role !== "專案池" && project.status !== "完成" && project.status !== "結束"), [store.projects]);
  const poolProjects = useMemo(() => store.projects.filter((project) => project.role === "專案池" || project.status === "想法"), [store.projects]);
  const mainProject = activeProjects.find((project) => project.role === "主要專案") ?? activeProjects[0];
  const openActions = store.actions.filter((action) => action.status !== "完成" && action.status !== "取消");
  const completedActions = store.actions.filter((action) => action.status === "完成");
  const recentLogs = [...store.progressLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const filteredProjects = store.projects.filter((project) => `${project.name} ${project.type} ${project.status}`.toLowerCase().includes(search.toLowerCase()));

  const updateStore = (next: Store) => setStore(next);
  const deleteItem = (type: keyof Store, itemId: string) => {
    if (!window.confirm("確定要刪除這筆資料嗎？")) return;
    updateStore({ ...store, [type]: store[type].filter((item: any) => item.id !== itemId) } as Store);
    toast.success("資料已刪除");
  };
  const updateActionStatus = (actionId: string, status: ActionStatus) => {
    updateStore({ ...store, actions: store.actions.map((action) => action.id === actionId ? { ...action, status } : action) });
    toast.success(status === "完成" ? "已完成，記得留下成果紀錄" : "行動狀態已更新");
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `creator-workbench-${today}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("JSON 備份已下載");
  };
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(String(reader.result));
        if (!incoming.projects || !incoming.actions || !incoming.progressLogs || !incoming.achievements) throw new Error("格式錯誤");
        updateStore(incoming);
        toast.success("資料已還原");
      } catch {
        toast.error("無法匯入，請確認是本儀表板匯出的 JSON");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };
  const resetData = () => {
    if (!window.confirm("這會清除目前資料並回到初始範例，確定嗎？")) return;
    updateStore(starterStore);
    toast.success("已回到初始資料");
  };

  const navItems: { key: ViewKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "overview", label: "首頁總覽", icon: <BarChart3 size={17} /> },
    { key: "active", label: "進行中專案", icon: <FolderKanban size={17} />, count: activeProjects.length },
    { key: "pool", label: "專案池", icon: <Archive size={17} />, count: poolProjects.length },
    { key: "actions", label: "本週行動", icon: <ListChecks size={17} />, count: openActions.length },
    { key: "achievements", label: "成果紀錄", icon: <BookOpen size={17} />, count: store.achievements.length },
    { key: "progress", label: "進度追蹤", icon: <CircleDot size={17} />, count: store.progressLogs.length },
  ];

  const pageTitle = navItems.find((item) => item.key === view)?.label ?? "首頁總覽";
  const pageIntro: Record<ViewKey, string> = {
    overview: "把下一步寫小一點，讓今天能真正開始。",
    active: "目前正在投入時間的專案，都在這裡。",
    pool: "保存可能性，但不讓它們搶走今天的注意力。",
    actions: "本週只安排真正能完成的行動。",
    achievements: "留下做過的證據，讓進展變得可見。",
    progress: "每一次完成、決策與卡住，都值得被追蹤。",
  };

  function navigate(nextView: ViewKey) {
    setView(nextView);
    setMobileNav(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-label="Creator Workbench logo"><span></span><span></span><span></span></div>
          <div><div className="brand-name">Creator<br />Workbench</div><div className="brand-caption">個人創作作業台</div></div>
        </div>
        <div className="sidebar-section-label">工作區</div>
        <nav className="main-nav" aria-label="主要導覽">
          {navItems.map((item) => (
            <button key={item.key} className={`nav-item ${view === item.key ? "active" : ""}`} onClick={() => navigate(item.key)}>
              {item.icon}<span>{item.label}</span>{item.count !== undefined && <small>{item.count}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><Sparkles size={15} /><span>本週主題</span><strong>{mainProject ? mainProject.name : "選一個方向"}</strong></div>
          <button className="nav-item utility" onClick={exportData}><Download size={17} /><span>匯出備份</span></button>
          <button className="nav-item utility" onClick={() => fileInput.current?.click()}><Upload size={17} /><span>匯入資料</span></button>
          <input ref={fileInput} className="hidden-input" type="file" accept="application/json" onChange={importData} />
        </div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="關閉導覽" onClick={() => setMobileNav(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="開啟導覽" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Creator Workbench</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜尋專案…" aria-label="搜尋專案" /></label>
            <button className="icon-button" title="回到初始資料" onClick={resetData}><RotateCcw size={17} /></button>
            <button className="avatar" aria-label="個人工作台">CW</button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div><p className="eyebrow">{formatDate(today)} · 個人作業台</p><h1>{pageTitle}</h1><p className="page-intro">{pageIntro[view]}</p></div>
            <div className="heading-actions">
              {view === "overview" && <button className="button button-dark" onClick={() => setModal({ type: "action" })}><Plus size={16} /> 新增行動</button>}
              {view === "active" && <button className="button button-vermillion" onClick={() => setModal({ type: "project" })}><Plus size={16} /> 新增專案</button>}
              {view === "pool" && <button className="button button-vermillion" onClick={() => setModal({ type: "project" })}><Plus size={16} /> 收進新想法</button>}
              {view === "actions" && <button className="button button-vermillion" onClick={() => setModal({ type: "action" })}><Plus size={16} /> 新增行動</button>}
              {view === "achievements" && <button className="button button-vermillion" onClick={() => setModal({ type: "achievement" })}><Plus size={16} /> 記錄成果</button>}
              {view === "progress" && <button className="button button-vermillion" onClick={() => setModal({ type: "progress" })}><Plus size={16} /> 新增進度</button>}
            </div>
          </div>

          {view === "overview" && <Overview store={store} mainProject={mainProject} openActions={openActions} completedActions={completedActions} recentLogs={recentLogs} navigate={navigate} onActionStatus={updateActionStatus} onAdd={() => setModal({ type: "action" })} onProgress={() => setModal({ type: "progress" })} />}
          {view === "active" && <ProjectList projects={filteredProjects.filter((project) => project.role !== "專案池" && project.status !== "完成" && project.status !== "結束")} title="正在投入的專案" empty="目前沒有進行中的專案。" onEdit={(item) => setModal({ type: "project", item })} onDelete={(item) => deleteItem("projects", item.id)} onAdd={() => setModal({ type: "project" })} />}
          {view === "pool" && <ProjectList projects={filteredProjects.filter((project) => project.role === "專案池" || project.status === "想法")} title="等待評估的可能性" empty="專案池目前是空的。" onEdit={(item) => setModal({ type: "project", item })} onDelete={(item) => deleteItem("projects", item.id)} onAdd={() => setModal({ type: "project" })} />}
          {view === "actions" && <ActionList store={store} actions={openActions} onStatus={updateActionStatus} onEdit={(item) => setModal({ type: "action", item })} onDelete={(item) => deleteItem("actions", item.id)} onAdd={() => setModal({ type: "action" })} />}
          {view === "achievements" && <AchievementList store={store} onEdit={(item) => setModal({ type: "achievement", item })} onDelete={(item) => deleteItem("achievements", item.id)} onAdd={() => setModal({ type: "achievement" })} />}
          {view === "progress" && <ProgressList store={store} logs={store.progressLogs} onEdit={(item) => setModal({ type: "progress", item })} onDelete={(item) => deleteItem("progressLogs", item.id)} onAdd={() => setModal({ type: "progress" })} />}
        </div>
      </main>

      {modal && <EditorModal modal={modal} store={store} onClose={() => setModal(null)} onSave={(next) => { updateStore(next); setModal(null); toast.success("已儲存"); }} />}
    </div>
  );
}

function Overview({ store, mainProject, openActions, completedActions, recentLogs, navigate, onActionStatus, onAdd, onProgress }: { store: Store; mainProject?: Project; openActions: Action[]; completedActions: Action[]; recentLogs: ProgressLog[]; navigate: (view: ViewKey) => void; onActionStatus: (id: string, status: ActionStatus) => void; onAdd: () => void; onProgress: () => void }) {
  const attention = store.projects.filter((project) => project.status === "暫停" || project.role === "專案池").slice(0, 3);
  return <div className="overview-grid">
    <section className="hero-panel paper-panel">
      <div className="panel-kicker"><span className="red-rule"></span>本週聚焦</div>
      <div className="hero-copy"><div><p className="hero-label">主要專案</p><h2>{mainProject?.name ?? "先選定一個主要專案"}</h2><p>{mainProject?.purpose ?? "把一個方向寫成可執行的成果，從今天開始。"}</p></div><div className="hero-stamp"><Target size={22} /><span>{mainProject?.progress ?? 0}%</span><small>目前完成度</small></div></div>
      <div className="hero-progress"><div className="progress-track"><span style={{ width: `${mainProject?.progress ?? 0}%` }}></span></div><div className="progress-caption"><span>目前階段：{mainProject?.stage ?? "尚未設定"}</span><strong>下一個里程碑：{mainProject?.milestone ?? "尚未設定"}</strong></div></div>
      <div className="next-action-box"><div className="next-action-icon"><Zap size={18} /></div><div><span className="micro-label">下一步行動</span><strong>{mainProject?.nextStep ?? "新增第一個行動"}</strong></div><button className="arrow-button" onClick={onAdd} aria-label="新增行動"><ArrowUpRight size={18} /></button></div>
    </section>

    <section className="metric-rail">
      <Metric label="進行中專案" value={store.projects.filter((p) => p.role !== "專案池" && p.status === "進行中").length} note="保持一主兩副" icon={<FolderKanban size={18} />} tone="orange" />
      <Metric label="待完成行動" value={openActions.length} note="本週要處理" icon={<ListChecks size={18} />} tone="blue" />
      <Metric label="累積成果" value={store.achievements.length} note={`${completedActions.length} 項行動已完成`} icon={<BookOpen size={18} />} tone="green" />
    </section>

    <section className="section-panel actions-panel"><SectionHeader eyebrow="本週行動" title="先完成能被看見的事" action="查看全部" onClick={() => navigate("actions")} /><div className="action-table compact-table">{openActions.slice(0, 4).map((action) => <ActionRow key={action.id} action={action} store={store} onStatus={onActionStatus} />)}{openActions.length === 0 && <EmptyState icon={<CheckCircle2 />} title="本週行動已清空" description="把新的成果拆成下一個可執行動作。" button="新增行動" onClick={onAdd} />}</div></section>

    <section className="section-panel recent-panel"><SectionHeader eyebrow="進度紀錄" title="最近發生了什麼" action="查看時間軸" onClick={() => navigate("progress")} /><div className="timeline">{recentLogs.slice(0, 3).map((log) => <div className="timeline-item" key={log.id}><div className="timeline-date">{formatDate(log.date)}</div><div className="timeline-dot"></div><div className="timeline-content"><strong>{log.completed}</strong><span>{projectName(store.projects, log.projectId)} · {log.output}</span><small>下一步：{log.nextStep}</small></div></div>)}{recentLogs.length === 0 && <EmptyState icon={<CircleDot />} title="還沒有進度紀錄" description="完成第一個行動後，留下今天的進展。" button="新增進度" onClick={onProgress} />}</div></section>

    <section className="section-panel attention-panel"><SectionHeader eyebrow="需要留意" title="等待處理的事項" action="查看專案池" onClick={() => navigate("pool")} />{attention.length > 0 ? <div className="attention-list">{attention.map((project) => <div className="attention-item" key={project.id}><span className={`status-dot ${project.status === "暫停" ? "red" : "amber"}`}></span><div><strong>{project.name}</strong><span>{project.status === "暫停" ? "專案暫停中" : "留在專案池，暫不執行"}</span></div><ChevronRight size={16} /></div>)}</div> : <EmptyState icon={<Check />} title="目前沒有待決策事項" description="保持簡單，繼續推進目前的專案。" />}</section>
  </div>;
}

function Metric({ label, value, note, icon, tone }: { label: string; value: number; note: string; icon: React.ReactNode; tone: string }) { return <div className={`metric-card ${tone}`}><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>; }
function SectionHeader({ eyebrow, title, action, onClick }: { eyebrow: string; title: string; action?: string; onClick?: () => void }) { return <div className="section-header"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div>{action && <button className="text-button" onClick={onClick}>{action}<ArrowUpRight size={15} /></button>}</div>; }
function ProjectList({ projects, title, empty, onEdit, onDelete, onAdd }: { projects: Project[]; title: string; empty: string; onEdit: (item: Project) => void; onDelete: (item: Project) => void; onAdd: () => void }) { return <section className="list-view"><div className="list-toolbar"><div><span className="eyebrow">專案資料庫</span><h2>{title}</h2></div><button className="button button-vermillion" onClick={onAdd}><Plus size={16} /> 新增專案</button></div><div className="project-list">{projects.map((project) => <ProjectCard key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} />)}{projects.length === 0 && <EmptyState icon={<FolderKanban />} title={empty} description="建立一筆資料，讓下一步有地方落腳。" button="新增專案" onClick={onAdd} />}</div></section>; }
function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit: (item: Project) => void; onDelete: (item: Project) => void }) { return <article className="project-card paper-panel"><div className="project-card-top"><div><span className="project-type">{project.type}</span><h3>{project.name}</h3></div><div className="card-actions"><span className={`status-badge ${statusClass(project.status)}`}>{project.status}</span><button className="icon-button small" onClick={() => onEdit(project)} aria-label="編輯專案"><Pencil size={15} /></button><button className="icon-button small danger" onClick={() => onDelete(project)} aria-label="刪除專案"><Trash2 size={15} /></button></div></div><p className="project-purpose">{project.purpose}</p><div className="project-meta"><span><Target size={14} />{project.role}</span><span><CircleDot size={14} />{project.stage}</span><span><FileText size={14} />檢討 {formatDate(project.reviewDate)}</span></div><div className="card-progress"><div className="progress-track"><span style={{ width: `${project.progress}%` }}></span></div><strong>{project.progress}%</strong></div><div className="project-footer"><div><span className="micro-label">下一個里程碑</span><strong>{project.milestone}</strong></div><div className="project-next"><span>下一步</span><strong>{project.nextStep}</strong></div></div>{project.notes && <div className="card-note"><Pencil size={13} />{project.notes}</div>}</article>; }
function ActionList({ store, actions, onStatus, onEdit, onDelete, onAdd }: { store: Store; actions: Action[]; onStatus: (id: string, status: ActionStatus) => void; onEdit: (item: Action) => void; onDelete: (item: Action) => void; onAdd: () => void }) { return <section className="list-view"><div className="list-toolbar"><div><span className="eyebrow">行動清單</span><h2>本週要完成的事</h2></div><button className="button button-vermillion" onClick={onAdd}><Plus size={16} /> 新增行動</button></div><div className="action-board">{actions.map((action) => <ActionRow key={action.id} action={action} store={store} onStatus={onStatus} onEdit={onEdit} onDelete={onDelete} />)}{actions.length === 0 && <EmptyState icon={<CheckCircle2 />} title="本週行動已清空" description="把下一個成果拆成一個小行動。" button="新增行動" onClick={onAdd} />}</div></section>; }
function ActionRow({ action, store, onStatus, onEdit, onDelete }: { action: Action; store: Store; onStatus: (id: string, status: ActionStatus) => void; onEdit?: (item: Action) => void; onDelete?: (item: Action) => void }) { return <div className={`action-row ${action.status === "進行中" ? "is-current" : ""}`}><button className={`check-button ${action.status === "完成" ? "checked" : ""}`} onClick={() => onStatus(action.id, action.status === "完成" ? "待開始" : "完成")} aria-label={action.status === "完成" ? "標記為未完成" : "標記為完成"}>{action.status === "完成" && <Check size={15} />}</button><div className="action-main"><div className="action-title-line"><strong>{action.title}</strong><span className={`priority ${action.priority.toLowerCase()}`}>{action.priority}</span></div><div className="action-subline"><span>{projectName(store.projects, action.projectId)}</span><span>{formatDate(action.date)}</span><span>{action.estimate}</span>{action.status === "卡住" && <span className="blocked-label">卡住</span>}</div></div><div className="action-row-actions"><select value={action.status} onChange={(event) => onStatus(action.id, event.target.value as ActionStatus)} aria-label={`更新${action.title}狀態`}><option>待開始</option><option>進行中</option><option>完成</option><option>卡住</option><option>取消</option></select>{onEdit && <button className="icon-button small" onClick={() => onEdit(action)} aria-label="編輯行動"><Pencil size={15} /></button>}{onDelete && <button className="icon-button small danger" onClick={() => onDelete(action)} aria-label="刪除行動"><Trash2 size={15} /></button>}</div></div>; }
function AchievementList({ store, onEdit, onDelete, onAdd }: { store: Store; onEdit: (item: Achievement) => void; onDelete: (item: Achievement) => void; onAdd: () => void }) { return <section className="list-view"><div className="list-toolbar"><div><span className="eyebrow">成果檔案</span><h2>已完成與可展示的產出</h2></div><button className="button button-vermillion" onClick={onAdd}><Plus size={16} /> 記錄成果</button></div><div className="achievement-grid">{store.achievements.map((achievement) => <article className="achievement-card paper-panel" key={achievement.id}><div className="achievement-top"><span className="project-type">{achievement.type}</span><span className="status-badge completed">{achievement.status}</span></div><h3>{achievement.name}</h3><p>{projectName(store.projects, achievement.projectId)} · {formatDate(achievement.date)}</p>{achievement.metric && <div className="achievement-metric"><BarChart3 size={15} />{achievement.metric}</div>}{achievement.learning && <blockquote>{achievement.learning}</blockquote>}<div className="card-actions"><button className="text-button" onClick={() => onEdit(achievement)}><Pencil size={14} /> 編輯</button><button className="text-button danger-text" onClick={() => onDelete(achievement)}><Trash2 size={14} /> 刪除</button></div></article>)}{store.achievements.length === 0 && <EmptyState icon={<BookOpen />} title="還沒有成果紀錄" description="完成一項可查看、可展示或可重複使用的產出，就記錄下來。" button="記錄第一項成果" onClick={onAdd} />}</div></section>; }
function ProgressList({ store, logs, onEdit, onDelete, onAdd }: { store: Store; logs: ProgressLog[]; onEdit: (item: ProgressLog) => void; onDelete: (item: ProgressLog) => void; onAdd: () => void }) { return <section className="list-view"><div className="list-toolbar"><div><span className="eyebrow">時間軸</span><h2>每一次進展都有脈絡</h2></div><button className="button button-vermillion" onClick={onAdd}><Plus size={16} /> 新增進度</button></div><div className="progress-feed">{[...logs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => <article className="progress-entry paper-panel" key={log.id}><div className="progress-entry-date"><strong>{new Date(`${log.date}T00:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat("zh-TW", { month: "short" }).format(new Date(`${log.date}T00:00:00`))}</span></div><div className="progress-entry-body"><div className="entry-heading"><div><span className="project-type">{projectName(store.projects, log.projectId)} · {log.stage}</span><h3>{log.completed}</h3></div><div className="card-actions"><span className="change-badge">{log.change || "有更新"}</span><button className="icon-button small" onClick={() => onEdit(log)} aria-label="編輯進度"><Pencil size={15} /></button><button className="icon-button small danger" onClick={() => onDelete(log)} aria-label="刪除進度"><Trash2 size={15} /></button></div></div><p className="entry-output"><strong>實際產出：</strong>{log.output || "未填寫"}</p><div className="entry-grid"><div><span className="micro-label">遇到阻礙</span><p>{log.blocker || "沒有記錄"}</p></div><div><span className="micro-label">解決方式</span><p>{log.solution || "沒有記錄"}</p></div><div><span className="micro-label">下一步</span><p>{log.nextStep || "尚未設定"}</p></div></div>{log.notes && <div className="card-note"><Pencil size={13} />{log.notes}</div>}</div></article>)}{logs.length === 0 && <EmptyState icon={<CircleDot />} title="還沒有進度紀錄" description="每次完成、決策或卡住時，新增一筆紀錄。" button="新增進度" onClick={onAdd} />}</div></section>; }
function EmptyState({ icon, title, description, button, onClick }: { icon: React.ReactNode; title: string; description: string; button?: string; onClick?: () => void }) { return <div className="empty-state">{icon}<h3>{title}</h3><p>{description}</p>{button && <button className="button button-outline" onClick={onClick}>{button}</button>}</div>; }

function EditorModal({ modal, store, onClose, onSave }: { modal: NonNullable<ModalState>; store: Store; onClose: () => void; onSave: (next: Store) => void }) {
  const isEdit = Boolean(modal.item);
  const [type] = useState(modal.type);
  const item: any = modal.item ?? {};
  const [form, setForm] = useState<any>({
    name: item.name ?? "", type: item.type ?? "音樂內容", status: item.status ?? (type === "project" ? "想法" : "待開始"), role: item.role ?? "專案池", purpose: item.purpose ?? "", goal: item.goal ?? "", stage: item.stage ?? "定位", progress: item.progress ?? 0, milestone: item.milestone ?? "", nextStep: item.nextStep ?? "", startDate: item.startDate ?? today, reviewDate: item.reviewDate ?? "", notes: item.notes ?? "",
    title: item.title ?? "", projectId: item.projectId ?? store.projects.find((project) => project.role === "主要專案")?.id ?? store.projects[0]?.id ?? "", priority: item.priority ?? "P2", date: item.date ?? today, estimate: item.estimate ?? "60 分鐘", definition: item.definition ?? "", completed: item.completed ?? "", output: item.output ?? "", change: item.change ?? "", blocker: item.blocker ?? "", solution: item.solution ?? "", time: item.time ?? "", name2: item.name ?? "", link: item.link ?? "", metric: item.metric ?? "", learning: item.learning ?? "",
  });
  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const record = { ...form, id: item.id ?? id() };
    if (type === "project") onSave({ ...store, projects: isEdit ? store.projects.map((project) => project.id === item.id ? { ...project, ...record, updatedAt: today } : project) : [...store.projects, { ...record, updatedAt: today }] });
    if (type === "action") onSave({ ...store, actions: isEdit ? store.actions.map((action) => action.id === item.id ? { ...action, ...record } : action) : [...store.actions, record] });
    if (type === "progress") onSave({ ...store, progressLogs: isEdit ? store.progressLogs.map((log) => log.id === item.id ? { ...log, ...record } : log) : [...store.progressLogs, record] });
    if (type === "achievement") onSave({ ...store, achievements: isEdit ? store.achievements.map((achievement) => achievement.id === item.id ? { ...achievement, ...record } : achievement) : [...store.achievements, { ...record, status: form.status || "完成" }] });
  };
  const titles = { project: isEdit ? "編輯專案" : "建立新專案", action: isEdit ? "編輯行動" : "新增本週行動", progress: isEdit ? "編輯進度紀錄" : "新增進度紀錄", achievement: isEdit ? "編輯成果" : "記錄一項成果" };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><span className="eyebrow">資料編輯</span><h2 id="modal-title">{titles[type]}</h2></div><button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button></div><form onSubmit={submit}><div className="form-grid">{type === "project" && <><Field label="專案名稱" required><input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="例如：SUNO YouTube 音樂頻道" /></Field><Field label="類型"><select value={form.type} onChange={(e) => set("type", e.target.value)}><option>音樂內容</option><option>短劇</option><option>小說</option><option>AI 工具</option><option>其他</option></select></Field><Field label="專案狀態"><select value={form.status} onChange={(e) => set("status", e.target.value)}><option>想法</option><option>研究中</option><option>準備中</option><option>進行中</option><option>暫停</option><option>完成</option><option>結束</option></select></Field><Field label="專案角色"><select value={form.role} onChange={(e) => set("role", e.target.value)}><option>主要專案</option><option>副專案</option><option>專案池</option></select></Field><Field label="專案目的" wide><textarea value={form.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="這個專案想驗證或完成什麼？" /></Field><Field label="目標成果"><input value={form.goal} onChange={(e) => set("goal", e.target.value)} placeholder="例如：30 天發布 5 支影片" /></Field><Field label="目前階段"><input value={form.stage} onChange={(e) => set("stage", e.target.value)} placeholder="定位／製作／發布／觀察" /></Field><Field label="完成度"><input type="number" min="0" max="100" value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} /></Field><Field label="下一個里程碑"><input value={form.milestone} onChange={(e) => set("milestone", e.target.value)} /></Field><Field label="下一步行動" wide><input value={form.nextStep} onChange={(e) => set("nextStep", e.target.value)} placeholder="下一次打開專案時要做的事" /></Field><Field label="檢討日期"><input type="date" value={form.reviewDate} onChange={(e) => set("reviewDate", e.target.value)} /></Field><Field label="備註" wide><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="靈感、決策理由、待確認問題…" /></Field></>}
{type === "action" && <><Field label="行動名稱" required wide><input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="使用動詞開頭，例如：完成第一首歌曲" /></Field><Field label="所屬專案"><select value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>{store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field><Field label="優先級"><select value={form.priority} onChange={(e) => set("priority", e.target.value)}><option>P1</option><option>P2</option><option>P3</option></select></Field><Field label="預計日期"><input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field><Field label="預估時間"><select value={form.estimate} onChange={(e) => set("estimate", e.target.value)}><option>30 分鐘</option><option>45 分鐘</option><option>60 分鐘</option><option>90 分鐘</option><option>半天</option></select></Field><Field label="狀態"><select value={form.status} onChange={(e) => set("status", e.target.value)}><option>待開始</option><option>進行中</option><option>完成</option><option>卡住</option><option>取消</option></select></Field><Field label="完成定義" wide><textarea value={form.definition} onChange={(e) => set("definition", e.target.value)} placeholder="什麼情況才算完成？" /></Field><Field label="備註" wide><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field></>}
{type === "progress" && <><Field label="更新日期"><input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field><Field label="所屬專案"><select value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>{store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field><Field label="本次完成事項" wide><input value={form.completed} onChange={(e) => set("completed", e.target.value)} required placeholder="具體描述完成了什麼" /></Field><Field label="實際產出" wide><textarea value={form.output} onChange={(e) => set("output", e.target.value)} placeholder="文件、影片、歌曲、原型、決策或測試結果" /></Field><Field label="目前階段"><input value={form.stage} onChange={(e) => set("stage", e.target.value)} /></Field><Field label="進度變化"><input value={form.change} onChange={(e) => set("change", e.target.value)} placeholder="20% → 30%" /></Field><Field label="遇到阻礙"><textarea value={form.blocker} onChange={(e) => set("blocker", e.target.value)} /></Field><Field label="解決方式"><textarea value={form.solution} onChange={(e) => set("solution", e.target.value)} /></Field><Field label="下一步" wide><input value={form.nextStep} onChange={(e) => set("nextStep", e.target.value)} /></Field><Field label="投入時間"><input value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="90 分鐘" /></Field><Field label="備註" wide><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field></>}
{type === "achievement" && <><Field label="成果名稱" required wide><input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="例如：第一支 Lo-fi 音樂影片" /></Field><Field label="所屬專案"><select value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>{store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field><Field label="成果類型"><select value={form.type} onChange={(e) => set("type", e.target.value)}><option>影片</option><option>歌曲</option><option>章節</option><option>原型</option><option>研究</option><option>決策</option></select></Field><Field label="完成日期"><input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field><Field label="成果狀態"><select value={form.status} onChange={(e) => set("status", e.target.value)}><option>草稿</option><option>完成</option><option>已發布</option><option>已驗證</option></select></Field><Field label="連結或檔案" wide><input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://…" /></Field><Field label="關鍵數據" wide><input value={form.metric} onChange={(e) => set("metric", e.target.value)} placeholder="觀看數、使用次數、完成時間…" /></Field><Field label="學習心得" wide><textarea value={form.learning} onChange={(e) => set("learning", e.target.value)} /></Field><Field label="備註" wide><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field></>}</div><div className="modal-footer"><button type="button" className="button button-outline" onClick={onClose}>取消</button><button type="submit" className="button button-dark"><Check size={16} /> 儲存資料</button></div></form></section></div>;
}
function Field({ label, children, wide = false, required = false }: { label: string; children: React.ReactNode; wide?: boolean; required?: boolean }) { return <label className={`field ${wide ? "wide" : ""}`}><span>{label}{required && <em> *</em>}</span>{children}</label>; }
