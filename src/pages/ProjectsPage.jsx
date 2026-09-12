import { ArrowUpRight, Plus, Sparkles } from 'lucide-react'

// ── Projects ──────────────────────────────────────────
export function ProjectsPage({ projects, tasks, onPage, onOpenProject, onAddProject }) {
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

export function ProjectRow({ project, onOpen }) {
  return <article className="project-row clickable" onClick={() => onOpen?.(project.id)}>
    <div className="project-row-main"><div className="project-symbol" style={{ background: project.color }}><Sparkles size={17} /></div><div><h3>{project.name}</h3><p>{project.description}</p></div></div>
    <div className="stage-label"><span className="stage-dot" style={{ background: project.color }} />{project.stage}</div>
    <div className="project-progress"><div className="project-progress-bar"><span style={{ width: `${project.progress}%`, background: project.color }} /></div><small>{project.progress}%</small></div>
    <div className="project-next"><span>下一步</span><strong>{project.next}</strong></div>
    <button className="icon-button" aria-label="查看專案" onClick={(e) => { e.stopPropagation(); onOpen?.(project.id) }}><ArrowUpRight size={16} /></button>
  </article>
}
