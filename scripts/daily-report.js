#!/usr/bin/env node
/**
 * 北極星「每日大方向」→ 0 AI 自動更新
 *
 * 流程：
 *   daily-brief.txt（每專案一行，你或 AI 填）
 *     → worklog/YYYY-MM-DD.json（只含 projects）
 *     → node data/updater.js（寫進 src/main.jsx）
 *     → node scripts/export-state.js（更新 AI 讀取的快照）
 *     → npm run build
 *     → git add / commit / push
 *
 * 用法：
 *   node scripts/daily-report.js              # 完整流程（含 commit + push）
 *   node scripts/daily-report.js --dry        # 只印出會寫入的內容，不改任何檔
 *   node scripts/daily-report.js --no-push    # 更新 + build，但不 commit / push
 *
 * daily-brief.txt 每行格式：
 *   <專案id>: <進度%> | <方向摘要> | <下一步>
 *   - 「#」開頭或空行會忽略
 *   - 任一欄留空 = 沿用目前值（不會覆蓋）
 */
import fs from 'fs'
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../')
const BRIEF = resolve(ROOT, 'daily-brief.txt')
const STATE = resolve(ROOT, 'data/dashboard-state.json')
const WORKLOG_DIR = resolve(ROOT, 'worklog')

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const NO_PUSH = args.includes('--no-push')

const today = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return null } }

if (!fs.existsSync(BRIEF)) {
  console.error(`❌ 找不到 daily-brief.txt：${BRIEF}`)
  process.exit(1)
}

const state = readJson(STATE)
const byId = Object.fromEntries((state?.projects || []).map(p => [p.id, p]))

const lines = fs.readFileSync(BRIEF, 'utf-8').split(/\r?\n/)
const projects = []
for (const raw of lines) {
  const line = raw.trim()
  if (!line || line.startsWith('#')) continue
  const m = line.match(/^([\w-]+)\s*[:：]\s*(.*)$/)
  if (!m) { console.warn(`⚠ 略過無法解析的行：${line}`); continue }
  const id = m[1]
  const [progressRaw = '', note = '', next = ''] = m[2].split('|').map(s => s.trim())
  const cur = byId[id] || {}
  const entry = { id }
  if (cur.name) entry.name = cur.name
  if (cur.stage) entry.stage = cur.stage
  if (cur.color) entry.color = cur.color
  const prog = parseInt(String(progressRaw).replace(/[^\d]/g, ''), 10)
  if (!Number.isNaN(prog)) entry.progress = prog
  else if (cur.progress != null) entry.progress = cur.progress
  if (note) entry.description = note
  else if (cur.description) entry.description = cur.description
  if (next) entry.next = next
  else if (cur.next) entry.next = cur.next
  projects.push(entry)
}

if (!projects.length) {
  console.error('❌ daily-brief.txt 沒有任何有效專案行。')
  process.exit(1)
}

const worklogPath = resolve(WORKLOG_DIR, `${today}.json`)
const existing = readJson(worklogPath) || {}
const merged = new Map((existing.projects || []).map(p => [p.id, p]))
for (const p of projects) merged.set(p.id, { ...(merged.get(p.id) || {}), ...p })
const worklog = { ...existing, date: today, source: 'daily-brief', projects: [...merged.values()] }

if (DRY) {
  console.log('🔍 DRY RUN — 不會寫入任何檔案\n')
  console.log(`worklog 目標：${worklogPath}\n`)
  console.log(JSON.stringify(worklog, null, 2))
  process.exit(0)
}

fs.mkdirSync(WORKLOG_DIR, { recursive: true })
fs.writeFileSync(worklogPath, JSON.stringify(worklog, null, 2), 'utf-8')
console.log(`✅ 已寫入 ${worklogPath}（${worklog.projects.length} 個專案）`)

function run(cmdline) {
  const r = spawnSync(cmdline, { cwd: ROOT, stdio: 'inherit', shell: true })
  return r.status === 0
}

console.log('\n▶ node data/updater.js')
if (!run('node data/updater.js')) { console.error('❌ updater 失敗，中止。'); process.exit(1) }

console.log('\n▶ node scripts/export-state.js')
run('node scripts/export-state.js')

console.log('\n▶ npm run build')
if (!run('npm run build')) { console.error('❌ build 失敗，未提交。'); process.exit(1) }

if (NO_PUSH) { console.log('\nℹ 已更新且 build 成功；略過 commit/push（--no-push）。'); process.exit(0) }

console.log('\n▶ git add / commit / push')
run('git add -A')
if (!run(`git commit -m "chore: daily brief (${today})"`)) console.log('ℹ 沒有變更可提交。')
run('git push')
console.log('\n🎉 完成。')
