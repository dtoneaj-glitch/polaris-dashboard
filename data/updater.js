/**
 * Polaris Dashboard Auto-Updater
 *
 * Reads worklog files from worklog/*.json and applies updates to src/main.jsx.
 *
 * Worklog format (each .json file in worklog/):
 *   {
 *     date: "2026-09-13",
 *     tasks:      [ { id, title, projectId?, done?, due?, priority? } ],
 *     notes:      [ { id?, title, content?, tags?, projectId? } ],
 *     timelineEvents: [ { id?, date, title, type?, projectId?, color? } ],
 *     projects:   [ { id, progress?, stage?, next? } ],
 *     ideas:      [ { id?, title, note?, type?, score?, ready? } ],
 *     goals:      [ { id, progress? } ]
 *   }
 *
 * Usage:
 *   node data/updater.js           # process and write changes
 *   node data/updater.js --dry     # preview only
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../')
const MAIN_JSX = resolve(ROOT, 'src/main.jsx')
const WORKLOG_DIR = resolve(ROOT, 'worklog')

const DAY_MS = 86400000
const NOW = Date.now()

// ─── JS expression evaluator (handles todayStr(), Date.now() - N * DAY, etc.) ──

function evalRaw(raw) {
  raw = raw.trim()
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw === 'null' || raw === '') return null
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)

  // todayStr(N)
  const t = raw.match(/^todayStr\(([-\d]+)\)$/)
  if (t) {
    const n = parseInt(t[1])
    const d = new Date(NOW + n * DAY_MS)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  if (raw === 'todayStr()') {
    const d = new Date(NOW)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Date.now() - N * DAY / Date.now() + N * DAY
  const dn = raw.match(/^Date\.now\(\)\s*(-\+)\s*(\d+)\s*\*\s*DAY$/)
  if (dn) {
    const sign = dn[1] === '-' ? -1 : 1
    return NOW + sign * parseInt(dn[2]) * DAY_MS
  }
  if (raw === 'Date.now()') return NOW
  if (raw === 'Date.now() - 0 * DAY') return NOW

  // Array literal
  if (raw.startsWith('[') && raw.endsWith(']')) {
    const inner = raw.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map(s => evalRaw(s.trim())).filter(v => v !== null)
  }

  // String literal (single or double quotes)
  if ((raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }

  // Fallback: return raw string (e.g. unknown expressions)
  return raw
}

// ─── Extract objects from a JSX array block ──────────────────────
// Splits by top-level commas (depth 0), then parses each key:value pair

function extractObjects(content, varName) {
  const range = findBlock(content, varName)
  if (!range) return []
  const prefix = `const ${varName} = [`
  const inner = content.substring(range.start + prefix.length, range.end)
  const result = []
  let depth = 0, inStr = null, escaped = false, buf = ''
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (escaped) { escaped = false; buf += ch; continue }
    if (ch === '\\') { escaped = true; buf += ch; continue }
    if (inStr) { buf += ch; if (ch === inStr) inStr = null; continue }
    if (ch === '"' || ch === "'") { inStr = ch; buf += ch; continue }
    if (ch === '[' || ch === '{') { depth++; buf += ch; continue }
    if (ch === ']' || ch === '}') { depth--; buf += ch; continue }
    // Comma at depth 0 separates array items
    if (ch === ',' && depth === 0) {
      if (buf.trim()) result.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim() && !buf.trim().startsWith(']') && !buf.trim().startsWith('}')) {
    result.push(buf.trim())
  }
  // Parse each item into a key-value object
  return result.map(parseObj).filter(obj => Object.keys(obj).length > 0)
}

function parseObj(item) {
  // item: "{ id: 'task-1', title: '...', done: false }"
  const inner = item.slice(1, -1).trim()
  const obj = {}
  const pairs = []
  let depth = 0, inStr = null, escaped = false, buf = ''
  for (const ch of inner) {
    if (escaped) { escaped = false; buf += ch; continue }
    if (ch === '\\') { escaped = true; buf += ch; continue }
    if (inStr) { buf += ch; if (ch === inStr) inStr = null; continue }
    if (ch === '"' || ch === "'") { inStr = ch; buf += ch; continue }
    if (ch === '[' || ch === '{') { depth++; buf += ch; continue }
    if (ch === ']' || ch === '}') { depth--; buf += ch; continue }
    if (ch === ':' && depth === 0) { /* colon is part of syntax, don't reset */ }
    else if (ch === ',' && depth === 0) {
      if (buf.trim()) pairs.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim()) pairs.push(buf.trim())
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':')
    if (colonIdx <= 0) continue
    const key = pair.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '')
    const valRaw = pair.slice(colonIdx + 1).trim()
    obj[key] = valRaw ? evalRaw(valRaw) : undefined
  }
  return obj
}

// ─── Block find & replace ────────────────────────────────────────

function findBlock(content, varName) {
  const prefix = `const ${varName} = [`
  const idx = content.indexOf(prefix)
  if (idx === -1) return null
  let depth = 1 // prefix already includes [
  let inStr = null, escaped = false, i = idx + prefix.length
  while (i < content.length) {
    const ch = content[i]
    if (escaped) { escaped = false; i++; continue }
    if (ch === '\\') { escaped = true; i++; continue }
    if (inStr) { if (ch === inStr) inStr = null; i++; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; i++; continue }
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) {
        // Find next const declaration
        let j = i
        while (j < content.length && /\s/.test(content[j])) j++
        if (content.substring(j, j + 6) === 'const ') return { start: idx, end: j }
        // Fallback: scan to semicolon or next const
        while (j < content.length && content[j] !== ';' && content.substring(j, j + 6) !== 'const ') j++
        return { start: idx, end: j }
      }
    }
    i++
  }
  return null
}

// ─── Render a JS object back to JSX syntax ──────────────────────

function renderVal(v) {
  if (v === undefined || v === null) return 'undefined'
  if (typeof v === 'boolean') return String(v)
  if (typeof v === 'number') {
    if (v > 1700000000000 && v < 2000000000000) {
      const daysAgo = Math.round((NOW - v) / DAY_MS)
      if (daysAgo === 0) return 'Date.now()'
      if (daysAgo > 0) return `Date.now() - ${daysAgo} * DAY`
      return `Date.now() + ${Math.abs(daysAgo)} * DAY`
    }
    return String(v)
  }
  if (typeof v === 'string') {
    const match = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const target = new Date(v)
      const diffDays = Math.round((target - NOW) / DAY_MS)
      if (diffDays !== 0 && Math.abs(diffDays) <= 365) {
        return `todayStr(${diffDays})`
      }
    }
    return `'${v.replace(/'/g, "\\'")}'`
  }
  if (Array.isArray(v)) {
    return `[${v.map(renderVal).join(', ')}]`
  }
  return JSON.stringify(v)
}

function renderObj(obj) {
  const pairs = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${renderVal(v)}`)
  return `{ ${pairs.join(', ')} }`
}

function renderBlock(varName, data) {
  const items = data.map(renderObj).join(',\n  ')
  return `const ${varName} = [\n  ${items}\n]\n`
}

function replaceBlock(content, varName, newData) {
  const range = findBlock(content, varName)
  if (!range) return { content, changed: false }
  const oldText = content.substring(range.start, range.end)
  const newText = renderBlock(varName, newData)
  return { content: content.substring(0, range.start) + newText + content.substring(range.end), changed: oldText !== newText }
}

// ─── Apply updates ───────────────────────────────────────────────

function applyTasks(updates, current) {
  if (!updates?.tasks?.length) return current
  const result = current.map(t => {
    const u = updates.tasks.find(x => x.id === t.id)
    if (!u) return t
    return { ...t, ...u, completedAt: u.done !== undefined ? (u.done ? NOW : t.completedAt) : t.completedAt }
  })
  for (const t of updates.tasks) {
    if (!result.find(x => x.id === t.id) && t.title) {
      result.push({
        id: t.id, title: t.title, projectId: t.projectId || '',
        due: t.due || '', priority: t.priority || 'medium',
        done: t.done ?? false, createdAt: NOW, updatedAt: NOW,
        completedAt: t.done ? NOW : undefined,
      })
    }
  }
  return result
}

function applyNotes(updates, current) {
  if (!updates?.notes?.length) return current
  const newNotes = updates.notes.filter(n => n.title).map(n => ({
    id: n.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: n.title, content: n.content || '',
    tags: Array.isArray(n.tags) ? n.tags : (typeof n.tags === 'string' ? n.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
    projectId: n.projectId || '', createdAt: n.createdAt ?? NOW,
  }))
  return [...current, ...newNotes]
}

function applyTimelineEvents(updates, current) {
  if (!updates?.timelineEvents?.length) return current
  const added = updates.timelineEvents.filter(ev => ev.title).map(ev => ({
    id: ev.id || `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: ev.date, title: ev.title, type: ev.type || 'note',
    projectId: ev.projectId || '', color: ev.color || '#e76f51', createdAt: NOW,
  }))
  const merged = [...added, ...current].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return merged
}

function applyProjects(updates, current) {
  if (!updates?.projects?.length) return current
  return current.map(p => {
    const u = updates.projects.find(up => up.id === p.id)
    return u ? { ...p, ...u, lastUpdated: NOW } : p
  })
}

function applyGoals(updates, current) {
  if (!updates?.goals?.length) return current
  return current.map(g => {
    const u = updates.goals.find(ug => ug.id === g.id)
    return u ? { ...g, ...u } : g
  })
}

function applyIdeas(updates, current) {
  if (!updates?.ideas?.length) return current
  const result = [...current]
  for (const idea of updates.ideas) {
    if (!idea.title) continue
    const idx = result.findIndex(x => x.id === idea.id)
    const entry = {
      id: idea.id || `idea-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: idea.title, note: idea.note || '',
      type: idea.type || '其他', score: idea.score ?? 50,
      created: idea.created || new Date().toISOString().slice(0, 10),
      ready: idea.ready ?? false,
    }
    if (idx >= 0) result[idx] = { ...result[idx], ...entry }
    else result.push(entry)
  }
  return result
}

// ─── Main ────────────────────────────────────────────────────────

function main() {
  const dryRun = process.argv.includes('--dry')
  console.log(dryRun ? '🔍 DRY RUN — no files will be written\n' : '🔄 Polaris Auto-Updater starting...\n')

  const worklogFiles = []
  if (existsSync(WORKLOG_DIR)) {
    for (const f of readdirSync(WORKLOG_DIR).sort()) {
      if (f.endsWith('.json') && !f.startsWith('_') && !f.includes('_processed')) {
        worklogFiles.push(resolve(WORKLOG_DIR, f))
      }
    }
  }

  if (!worklogFiles.length) {
    console.log('No worklog files found. Nothing to update.')
    return
  }
  console.log(`Found ${worklogFiles.length} worklog file(s):\n`)

  let mainJsx = readFileSync(MAIN_JSX, 'utf-8')
  let anyChanged = false

  const blocks = [
    { name: 'initialTasks',    apply: applyTasks     },
    { name: 'initialNotes',    apply: applyNotes     },
    { name: 'initialTimelineEvents', apply: applyTimelineEvents },
    { name: 'initialProjects', apply: applyProjects  },
    { name: 'initialGoals',    apply: applyGoals     },
    { name: 'initialIdeas',    apply: applyIdeas     },
  ]

  for (const filePath of worklogFiles) {
    let worklog
    try { worklog = JSON.parse(readFileSync(filePath, 'utf-8')) } catch (e) {
      console.error(`  ✗ Skip ${filePath.split('/').pop()}: invalid JSON — ${e.message}`)
      continue
    }
    console.log(`📅 ${filePath.split('/').pop()} (${worklog.date})`)

    for (const block of blocks) {
      const range = findBlock(mainJsx, block.name)
      if (!range) { console.log(`  ⚠ ${block.name}: block not found`); continue }
      let currentData = []
      try { currentData = extractObjects(mainJsx, block.name) } catch (e) {
        console.log(`  ⚠ ${block.name}: parse error — ${e.message}`)
        continue
      }
      const newData = block.apply(worklog, currentData)
      if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
        const { content, changed } = replaceBlock(mainJsx, block.name, newData)
        if (changed) {
          mainJsx = content
          anyChanged = true
          console.log(`  ✓ ${block.name}: ${currentData.length} → ${newData.length}`)
        } else {
          console.log(`  - ${block.name}: no change`)
        }
      } else {
        console.log(`  - ${block.name}: unchanged`)
      }
    }
    console.log()
  }

  if (!anyChanged) {
    console.log('No changes detected. main.jsx is up to date.')
    return
  }

  if (dryRun) {
    console.log('✅ DRY RUN complete. Run without --dry to apply changes.')
    return
  }

  writeFileSync(MAIN_JSX, mainJsx, 'utf-8')
  console.log(`✅ main.jsx updated (${worklogFiles.length} worklog(s) processed)`)
  console.log(`   Run: npm run build  to verify, then git commit + push`)
}

main()
