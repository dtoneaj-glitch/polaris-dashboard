#!/usr/bin/env node
/**
 * 快速記靈感 → 北極星 Polaris「Ideas」（0 AI）
 *
 * 用法：
 *   node scripts/add-idea.js "標題"
 *   node scripts/add-idea.js "標題" --note "一句說明" --type 技能 --score 70
 *   node scripts/add-idea.js "標題" --dry        # 只印出會寫入什麼
 *
 * 流程：寫入 worklog/<today>.json 的 ideas → node data/updater.js
 *       → node scripts/export-state.js → npm run build → git push
 *
 * 型別建議：產品 / 系統 / 創作 / 個案 / 技能 / 營運 / 其他
 */
import fs from 'fs'
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../')
const STATE = resolve(ROOT, 'data/dashboard-state.json')
const WORKLOG_DIR = resolve(ROOT, 'worklog')

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
function opt(name, def = '') {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def
}
const OPTIONS = new Set(['--note', '--type', '--score'])
let title = ''
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (OPTIONS.has(a)) { i++; continue }
  if (a === '--dry' || a.startsWith('--')) continue
  title = a; break
}
const note = opt('--note', '')
const type = opt('--type', '其他')
const score = parseInt(opt('--score', '60'), 10) || 60

if (!title) {
  console.error('用法：node scripts/add-idea.js "標題" [--note "說明"] [--type 技能] [--score 70]')
  process.exit(1)
}

const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return null } }

// 去重：已存在同名靈感就略過
const state = readJson(STATE)
if ((state?.ideas || []).some(i => (i.title || '').trim() === title.trim())) {
  console.log(`ℹ 已存在同名靈感「${title}」，略過。`)
  process.exit(0)
}

const idea = { id: `idea-${Date.now()}`, title: title.trim(), note, type, score, created: today, ready: false }

const worklogPath = resolve(WORKLOG_DIR, `${today}.json`)
const worklog = readJson(worklogPath) || { date: today, source: 'idea-capture', projects: [] }
worklog.date = worklog.date || today
if (!Array.isArray(worklog.ideas)) worklog.ideas = []
worklog.ideas.push(idea)

if (DRY) {
  console.log('🔍 DRY RUN — 不會寫入\n')
  console.log(`worklog：${worklogPath}`)
  console.log(JSON.stringify(idea, null, 2))
  process.exit(0)
}

fs.mkdirSync(WORKLOG_DIR, { recursive: true })
fs.writeFileSync(worklogPath, JSON.stringify(worklog, null, 2), 'utf-8')
console.log(`✅ 已加入靈感：${idea.title}（${idea.type}／${idea.score}）`)

function run(cmdline) {
  const r = spawnSync(cmdline, { cwd: ROOT, stdio: 'inherit', shell: true })
  return r.status === 0
}

console.log('\n▶ node data/updater.js')
if (!run('node data/updater.js')) { console.error('❌ updater 失敗'); process.exit(1) }
console.log('\n▶ node scripts/export-state.js'); run('node scripts/export-state.js')
console.log('\n▶ npm run build')
if (!run('npm run build')) { console.error('❌ build 失敗，未提交'); process.exit(1) }
console.log('\n▶ git add / commit / push')
run('git add -A')
if (!run(`git commit -m "chore: idea capture (${today})"`)) console.log('ℹ 沒有變更可提交。')
run('git push')
console.log('\n🎉 完成。靈感已永久保存（重置工作區也不會消失）。')
