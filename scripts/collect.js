#!/usr/bin/env node
/**
 * 北極星「自動收集器」— 0 AI、0 手動輸入
 * 把各專案的進度訊號（git commit、工作檔、當日異動檔案、目前儀表板狀態）
 * 彙整成一個檔：data/daily-input.md，給 AI（ZCode 或 AutoClaw）讀。
 *
 * 用法：
 *   node scripts/collect.js            # 預設看最近 3 天
 *   node scripts/collect.js --days 7
 */
import fs from 'fs'
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../')
const OUT = resolve(ROOT, 'data/daily-input.md')
const STATE = resolve(ROOT, 'data/dashboard-state.json')

const args = process.argv.slice(2)
const dArg = args.find(a => a.startsWith('--days'))
const DAYS = dArg ? (parseInt((dArg.split(/[= ]/)[1] || '3'), 10) || 3) : 3

// ── 來源設定（要加專案就改這裡）─────────────────────────
const REPOS = [
  { id: 'guru', name: '股流Radar', path: 'D:/個人台/股流Radar/guliu-radar-local' },
]
const DOCS = [
  { id: 'ig-car',    name: '中古車選品師 IG', path: 'D:/ZCODE/IG運營/中古車選品師IG.md' },
  { id: 'ig-travel', name: '旅遊選品師 IG',   path: 'D:/ZCODE/IG運營/旅遊選品師IG.md' },
  { id: 'ig-all',    name: 'IG 進度總覽',     path: 'D:/ZCODE/IG運營/進度總覽.md' },
  { id: 'yt-kids',   name: '神仙童萌會 YT',   path: 'C:/Users/amydo/OneDrive/桌面/內容自媒體/兒童神話動畫頻道運營企劃書.md' },
]
const SCAN_DIRS = [
  { label: 'workspace', path: 'C:/Users/amydo/.openclaw-autoclaw/workspace' },
  { label: 'D:/ZCODE/IG運營', path: 'D:/ZCODE/IG運營' },
  { label: 'D:/ZCODE/兒童YT頻道', path: 'D:/ZCODE/兒童YT頻道' },
]
const EXCLUDE = /node_modules|\\\.git\\|\.openclaw\\tmp|\.openclaw\\media|\\dist\\/

const NOW = Date.now()
const today0 = new Date(); today0.setHours(0, 0, 0, 0)
const sinceMs = NOW - DAYS * 86400000

function sh(cmdline) {
  const r = spawnSync(cmdline, { shell: true, encoding: 'utf-8', maxBuffer: 8 * 1024 * 1024 })
  return r.status === 0 ? (r.stdout || '').trim() : ''
}
function exists(p) { try { return fs.existsSync(p) } catch { return false } }
function mtime(p) { try { return fs.statSync(p).mtime } catch { return null } }
function fmt(d) { if (!d) return '?'; const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}` }

// 深度限制掃描
function walk(dir, maxDepth, depth = 0, out = []) {
  if (depth > maxDepth) return out
  let ents = []
  try { ents = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of ents) {
    const full = resolve(dir, e.name)
    if (EXCLUDE.test(full)) continue
    if (e.isDirectory()) walk(full, maxDepth, depth + 1, out)
    else out.push(full)
  }
  return out
}

const L = []
L.push(`# 北極星 自動收集輸入（給 AI 讀）`)
L.push(`> 產生時間：${fmt(new Date())}　範圍：最近 ${DAYS} 天`)
L.push(`> 用途：AI 讀完後，把各專案濃縮成「一行方向＋進度」，寫進 daily-brief.txt 或 worklog。`)
L.push('')

// 1) Git commits
L.push(`## 1. Git commit（自動）`)
let anyRepo = false
for (const r of REPOS) {
  if (!exists(r.path)) { L.push(`- ⚠ ${r.name}（${r.id}）找不到 repo：${r.path}`); continue }
  const since = new Date(sinceMs).toISOString().slice(0, 10)
  const log = sh(`git -C "${r.path}" log --since="${since}" --date=short --pretty=format:"%h | %ad | %s"`)
  L.push(`### ${r.name}（${r.id}）`)
  L.push(log ? '```\n' + log + '\n```' : '（近期無 commit）')
  anyRepo = true
}
if (!anyRepo) L.push('（無可讀 repo）')
L.push('')

// 2) 來源文件
L.push(`## 2. 來源工作檔／企劃（讀取重點）`)
for (const d of DOCS) {
  if (!exists(d.path)) { L.push(`- ⚠ ${d.name}（${d.id}）找不到：${d.path}`); continue }
  const mt = mtime(d.path)
  let head = ''
  try {
    const txt = fs.readFileSync(d.path, 'utf-8')
    const headings = txt.split(/\r?\n/).filter(l => /^#{1,4}\s/.test(l)).slice(0, 14)
    head = headings.join('\n')
  } catch {}
  L.push(`### ${d.name}（${d.id}）`)
  L.push(`- 檔案：\`${d.path}\``)
  L.push(`- 最後修改：${fmt(mt)}${mt && mt.getTime() >= sinceMs ? '　🟡 近期有動' : ''}`)
  if (head) L.push('- 章節：\n```\n' + head + '\n```')
  L.push('')
}

// 3) 當日異動檔案
L.push(`## 3. 今日（${fmt(today0).slice(0,10)} 起）有異動的檔案`)
for (const s of SCAN_DIRS) {
  if (!exists(s.path)) { L.push(`- ⚠ 找不到：${s.path}`); continue }
  const files = walk(s.path, 3).filter(f => { const m = mtime(f); return m && m.getTime() >= today0.getTime() })
  L.push(`### ${s.label}（${files.length} 個）`)
  if (files.length) L.push(files.slice(0, 40).map(f => `- ${f.replace(/\\/g, '/')}　(${fmt(mtime(f))})`).join('\n'))
  else L.push('（今日無異動）')
}
L.push('')

// 4) 目前儀表板狀態
L.push(`## 4. 目前儀表板狀態（更新前）`)
try {
  const st = JSON.parse(fs.readFileSync(STATE, 'utf-8'))
  for (const p of (st.projects || [])) {
    L.push(`- ${p.id}｜${p.name || ''}｜stage=${p.stage || '?'}｜progress=${p.progress ?? '?'}％｜next=${p.next || ''}`)
  }
  L.push(`- 其他：ideas=${(st.ideas||[]).length} tasks=${(st.tasks||[]).length} notes=${(st.notes||[]).length} goals=${(st.goals||[]).length} timeline=${(st.timelineEvents||[]).length}`)
} catch { L.push('（尚未產生 data/dashboard-state.json，先跑 node scripts/export-state.js）') }
L.push('')

fs.mkdirSync(dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, L.join('\n'), 'utf-8')
console.log(`✅ 已輸出 ${OUT}（${L.join('\n').length} bytes）`)
