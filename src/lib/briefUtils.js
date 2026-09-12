import { DAY, todayStr, parseDate, relativeDays } from './dateUtils.js'

// 晨報自動生成：從目前資料算出今日星象（訊號優先序：逾期 > 停滯 > 目標到期 > 焦點提醒）
export function buildBrief({ projects, tasks, goals }) {
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
export function makeEvent(c, title, projectId, type = 'note') {
  const project = c.projects.find((p) => p.id === projectId)
  return { id: `ev-${Date.now()}-${Math.floor(Math.random() * 999)}`, date: todayStr(), type, title, projectId: projectId || '', color: project?.color || '#e76f51' }
}

// 目標連動：有關聯專案的目標，進度自動跟隨專案
export function goalProgress(g, projects) {
  if (!g.projectId) return g.progress
  const p = projects.find((x) => x.id === g.projectId)
  return p ? p.progress : g.progress
}
