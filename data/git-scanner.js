#!/usr/bin/env node
/**
 * Git Auto-Scanner for Polaris Dashboard
 *
 * Reads git commit history from tracked repos, extracts work items,
 * and writes worklog JSON files automatically.
 *
 * Usage:
 *   node data/git-scanner.js              # scan and generate worklog for today
 *   node data/git-scanner.js --days 7     # scan last N days (default 7)
 *   node data/git-scanner.js --dry        # show what would be generated
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../')
const WORKLOG_DIR = resolve(ROOT, 'worklog')
const MAIN_JSX = resolve(ROOT, 'src/main.jsx')

// ─── Repos to watch ───────────────────────────────────────────────
const WATCHED_REPOS = [
  {
    name: 'guliu-radar',
    path: 'D:/個人台/股流Radar/guliu-radar-local',
    projectId: 'guru',
    description: '股流Radar',
  },
  // Add more repos here as needed:
  // {
  //   name: 'suno-music',
  //   path: 'D:/個人台/SUNO/suno-app',
  //   projectId: 'suno',
  //   description: 'SUNO Music',
  // },
]

// ─── Parse a commit message into structured data ──────────────────

function parseCommitMessage(subject) {
  const tasks = []
  const notes = []
  const milestone = null

  // Handle Chinese semicolon-separated lists in subject
  const parts = subject.split(/[；;]/).map(s => s.trim()).filter(Boolean)

  for (const part of parts) {
    // Check for known patterns
    if (/^(研判|PA六段|九戰法|停損|停利|指標|戰法)/.test(part)) {
      tasks.push({
        title: part,
        projectId: 'guru',
        priority: '高',
      })
      notes.push({
        title: `股流更新：${part.slice(0, 30)}...`,
        content: `Commit 記錄：${subject}`,
        tags: ['股流', '更新'],
        projectId: 'guru',
      })
    } else if (/^(大盤|籌碼|儀表板|watchlist|水池)/.test(part)) {
      tasks.push({
        title: part,
        projectId: 'guru',
        priority: '中',
      })
      notes.push({
        title: `股流更新：${part.slice(0, 30)}...`,
        content: `Commit 記錄：${subject}`,
        tags: ['股流', '儀表板'],
        projectId: 'guru',
      })
    } else if (/^(Update|fix|feat|refactor)/i.test(part)) {
      tasks.push({
        title: part.replace(/^(update|fix|feat|refactor):\s*/i, ''),
        projectId: 'guru',
        priority: '中',
      })
    } else if (part.length > 10) {
      // Generic task extraction
      tasks.push({
        title: part,
        projectId: 'guru',
        priority: '中',
      })
    }
  }

  // If only one meaningful part, treat as milestone
  if (parts.length === 1 && parts[0].length > 5) {
    return {
      tasks,
      notes,
      milestone: {
        title: subject,
        projectId: 'guru',
        color: '#e76f51',
      },
    }
  }

  return { tasks, notes, milestone }
}

// ─── Get git log for a repo ───────────────────────────────────────

function getGitLog(repoPath, days) {
  try {
    // Compute ISO date from N days ago for reliable --since parsing
    const sinceDate = new Date(Date.now() - days * 86400000)
      .toISOString()
      .slice(0, 10)
    const output = spawnSync(
      'git',
      ['log', `--since=${sinceDate}`, '--format=%H|%ad|%s', '--date=short'],
      { encoding: 'utf-8', cwd: repoPath, stdio: ['ignore', 'pipe', 'pipe'] }
    )
    if (output.status !== 0 || !output.stdout) return []
    return output.stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const sepIdx = line.indexOf('|')
        const hash = line.slice(0, sepIdx)
        const rest = line.slice(sepIdx + 1)
        const dateSepIdx = rest.indexOf('|')
        const date = rest.slice(0, dateSepIdx)
        const subject = rest.slice(dateSepIdx + 1)
        return { hash: hash.trim(), date: date.trim(), subject: subject.trim() }
      })
  } catch (e) {
    console.error(`  ⚠ Failed to read git log from ${repoPath}: ${e.message}`)
    return []
  }
}

// ─── Check what worklogs already exist ────────────────────────────

function getExistingWorklogs() {
  const logs = {}
  if (!existsSync(WORKLOG_DIR)) return logs
  for (const f of readdirSync(WORKLOG_DIR).sort()) {
    if (f.endsWith('.json') && !f.startsWith('_') && !f.includes('_processed')) {
      try {
        const data = JSON.parse(readFileSync(resolve(WORKLOG_DIR, f), 'utf-8'))
        logs[data.date] = data
      } catch {}
    }
  }
  return logs
}

// ─── Main ─────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry')
  const daysMatch = args.find(a => a.startsWith('--days='))
  const days = daysMatch ? parseInt(daysMatch.split('=')[1]) : 7

  console.log(dryRun ? '🔍 DRY RUN — git scanner preview\n' : '🔍 Git Auto-Scanner starting...\n')
  console.log(`Scanning last ${days} days of commits\n`)

  const existingLogs = getExistingWorklogs()
  const dailyMap = {} // date → { tasks, notes, timelineEvents, projects, ideas, goals }

  for (const repo of WATCHED_REPOS) {
    if (!existsSync(repo.path)) {
      console.log(`  ⚠ Repo not found: ${repo.path}`)
      continue
    }

    console.log(`📂 ${repo.name} (${repo.description})`)
    const commits = getGitLog(repo.path, days)
    console.log(`  Found ${commits.length} commit(s)`)

    for (const commit of commits) {
      // Skip if worklog for this date already exists
      if (existingLogs[commit.date]) {
        console.log(`  ⏭ ${commit.date}: worklog already exists, skipping`)
        continue
      }

      const parsed = parseCommitMessage(commit.subject)
      const date = commit.date

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          tasks: [],
          notes: [],
          timelineEvents: [],
          projects: [],
          ideas: [],
          goals: [],
          _source: `${repo.name}`,
        }
      }

      const dayLog = dailyMap[date]

      // Add tasks
      for (const t of parsed.tasks) {
        dayLog.tasks.push({
          id: `task-${date.replace(/-/g, '')}-${t.title.slice(0, 10).replace(/\s/g, '-')}`,
          title: t.title,
          projectId: t.projectId || repo.projectId,
          priority: t.priority || '中',
          done: true,
          completedAt: Date.now(),
        })
      }

      // Add notes
      for (const n of parsed.notes) {
        dayLog.notes.push({
          id: `note-${date.replace(/-/g, '')}-${n.title.slice(0, 8)}`,
          ...n,
        })
      }

      // Add milestone event
      if (parsed.milestone) {
        dayLog.timelineEvents.push({
          id: `ev-${date.replace(/-/g, '')}`,
          date,
          title: parsed.milestone.title,
          type: 'milestone',
          projectId: repo.projectId,
          color: parsed.milestone.color || '#e76f51',
        })
      }

      console.log(`  ✓ ${date}: "${commit.subject.slice(0, 50)}..."`)
    }
  }

  // Generate output
  const dates = Object.keys(dailyMap).sort().reverse()
  if (dates.length === 0) {
    console.log('\nNo new commits found in the scanned period.')
    return
  }

  console.log(`\n📋 Would generate ${dates.length} worklog file(s):`)
  for (const date of dates) {
    const log = dailyMap[date]
    console.log(`\n  📅 ${date}:`)
    console.log(`     tasks:      ${log.tasks.length} item(s)`)
    console.log(`     notes:      ${log.notes.length} item(s)`)
    console.log(`     milestones: ${log.timelineEvents.length} event(s)`)
  }

  if (dryRun) {
    console.log('\n✅ DRY RUN complete. Run without --dry to write files.')
    return
  }

  // Write worklog files
  for (const date of dates) {
    const log = dailyMap[date]
    // Remove internal fields before saving
    const { _source, ...worklog } = log
    const filePath = resolve(WORKLOG_DIR, `${date}.json`)
    writeFileSync(filePath, JSON.stringify(worklog, null, 2), 'utf-8')
    console.log(`\n✅ Written: ${filePath}`)
  }

  console.log(`\n🔄 Next step: run node data/updater.js to apply to main.jsx`)
  console.log(`   Then: git commit && git push`)
}

main()
