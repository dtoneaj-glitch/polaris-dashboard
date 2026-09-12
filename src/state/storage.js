import { migrateDue, migrateTs } from '../lib/dateUtils.js'
import { syncToCloud } from './cloudBridge.js'
import {
  defaultSettings,
  initialProjects,
  initialIdeas,
  initialTasks,
  initialNotes,
  initialTimelineEvents,
  initialGoals,
} from './defaults.js'

export const STORAGE_KEY = 'nora_workspace_v1_demo_fresh'

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.projects && saved?.ideas && saved?.tasks) {
      return {
        settings: defaultSettings,
        ...saved,
        reviews: saved.reviews || [],
        snapshots: saved.snapshots || [],
        tasks: saved.tasks.map((t) => ({ ...t, due: migrateDue(t.due) })),
        projects: saved.projects.map((p) => ({ ...p, lastUpdated: migrateTs(p.lastUpdated ?? p.lastUpdate) })),
      }
    }
  } catch {}
  return { settings: defaultSettings, projects: initialProjects, ideas: initialIdeas, tasks: initialTasks, notes: initialNotes, timelineEvents: initialTimelineEvents, goals: initialGoals, reviews: [], snapshots: [] }
}

export function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); syncToCloud(s).catch(() => {}) }
