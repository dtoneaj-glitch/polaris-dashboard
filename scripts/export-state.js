#!/usr/bin/env node
/**
 * 從 src/main.jsx 的 seed 區塊匯出成乾淨 JSON，供 AI / ZCode 讀取「目前儀表板內容」。
 *
 * 用法：
 *   node scripts/export-state.js                 # 輸出到 data/dashboard-state.json
 *   node scripts/export-state.js some/path.json  # 自訂輸出路徑
 */
import fs from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../')
const SRC = resolve(ROOT, 'src/main.jsx')
const OUT = resolve(ROOT, process.argv[2] || 'data/dashboard-state.json')

const DAY = 86400000
const NOW = Date.now()
function todayStr(n = 0) {
  const d = new Date(NOW + n * DAY)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const map = {
  initialProjects: 'projects',
  initialIdeas: 'ideas',
  initialTasks: 'tasks',
  initialNotes: 'notes',
  initialTimelineEvents: 'timelineEvents',
  initialGoals: 'goals',
}

const src = fs.readFileSync(SRC, 'utf-8')
const state = {}
for (const [name, key] of Object.entries(map)) {
  const i = src.indexOf(`const ${name} = [`)
  if (i < 0) { state[key] = []; continue }
  const j = src.indexOf('\n]', i)
  const block = src.slice(i + `const ${name} = [`.length, j)
  try {
    state[key] = Function('todayStr', 'DAY', 'Date', 'Math', `return [${block}]`)(todayStr, DAY, Date, Math)
  } catch (e) {
    state[key] = []
    console.error(`⚠ ${name} 解析失敗：${e.message}`)
  }
}
state.exportedAt = new Date().toISOString()
state.schema = 'polaris-dashboard-state/v1'
state.note = '由 scripts/export-state.js 從 src/main.jsx seed 匯出；給 AI / ZCode 讀取的儀表板內容快照。'

fs.mkdirSync(dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(state, null, 2), 'utf-8')
console.log(`✅ 已匯出 ${OUT}`)
console.log(`   projects:${state.projects.length} ideas:${state.ideas.length} tasks:${state.tasks.length} notes:${state.notes.length} timeline:${state.timelineEvents.length} goals:${state.goals.length}`)
