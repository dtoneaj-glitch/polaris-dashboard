import { BookOpen, CalendarDays, FileText, FolderKanban, Gauge, Goal, Lightbulb } from 'lucide-react'
import { DAY, todayStr } from '../lib/dateUtils.js'

// ── 初始資料 ──────────────────────────────────────────
export const initialProjects = [
  { id: 'guru', name: '股流Radar', description: '台股交易工作台 PWA：v2散戶版上線（Dashboard/StockDetail 全真實資料 TWSE+TPEx+FinMind+Yahoo+TAIFEX+Pantlas）。B0-B5 全部完成：歷史存檔、熱區雷達、PA事實層、盤中輪詢、LINE推播、狀態機。籌碼卡（五契約 diverging bar）、籌碼分歧引擎、PA六段研判、四戰法、會員認證皆已完成。待做：回測引擎、SQLite遷移、實時報價', stage: 'Active', color: '#e76f51', progress: 82, lastUpdated: Date.now(), next: '實作回測引擎' },
  { id: 'suno', name: 'SUNO Music', description: '用音樂保存正在發生的生活', stage: 'Explore', color: '#6f8f78', progress: 32, lastUpdated: Date.now() - 1 * DAY, next: '完成一首 demo' },
  { id: 'poker', name: 'Poker Trainer', description: '讓決策練習變得有趣', stage: 'MVP', color: '#7087a3', progress: 18, lastUpdated: Date.now() - 15 * DAY, next: '確認第一個訓練循環' },
  { id: 'novel', name: '小說世界觀', description: '長篇故事與角色資料庫', stage: 'Idea', color: '#bb8b4d', progress: 8, lastUpdated: Date.now() - 6 * DAY, next: '整理三個核心角色' },
]

export const initialIdeas = [
  { id: 'idea-2', title: '法人買賣超追蹤', note: '整合外資、投信、自營商的進出場訊號，建立權責歸屬圖。', type: '系統', score: 85, created: '昨天', ready: true },
]

export const initialTasks = [
  { id: 'task-1', title: '完成第一版監控面板', projectId: 'guru', due: todayStr(-5), priority: '高', done: true, completedAt: Date.now() - 5 * DAY },
  { id: 'task-2', title: '定義股流指標參數', projectId: 'guru', due: todayStr(-4), priority: '中', done: true, completedAt: Date.now() - 4 * DAY },
  { id: 'task-3', title: '完成一首 SUNO demo', projectId: 'suno', due: todayStr(3), priority: '中', done: false },
  { id: 'task-4', title: '確認第一個訓練循環', projectId: 'poker', due: todayStr(5), priority: '低', done: false },
  { id: 'task-g1', title: '盤點主流/蓄勢/乘流/靜流指標', projectId: 'guru', due: todayStr(-3), priority: '中', done: true, completedAt: Date.now() - 3 * DAY },
  { id: 'task-g2', title: '建立股流歷史模式庫', projectId: 'guru', due: todayStr(-2), priority: '低', done: true, completedAt: Date.now() - 2 * DAY },
  { id: 'task-a1', title: '整理股流 Radar 整體架構規格書（Architecture + 系統規格v1.0）', projectId: 'guru', due: '2026-09-07', priority: '高', done: true, completedAt: Date.now() - 6 * DAY },
  { id: 'task-a2', title: '完成 v2 四套指標型戰法規格（回湧/破堤/鯨躍/洋流）', projectId: 'guru', due: '2026-09-07', priority: '高', done: true, completedAt: Date.now() - 6 * DAY },
  { id: 'task-a3', title: '產出 UI/UX 優化建議書並同步到儀表板', projectId: 'guru', due: '2026-09-08', priority: '中', done: true, completedAt: Date.now() - 5 * DAY },
  { id: 'task-b0', title: '實作 B0 歷史存檔管線（JSON 每日快照）', projectId: 'guru', due: '2026-09-08', priority: '高', done: true, completedAt: Date.now() - 5 * DAY },
  { id: 'task-dash', title: '完成 v2 散戶版主頁 Dashboard（市場情緒 + 四大法人 + 熱門話題）', projectId: 'guru', due: '2026-09-08', priority: '高', done: true, completedAt: Date.now() - 5 * DAY },
  { id: 'task-stock', title: '完成 StockDetail 個股頁（PA視覺化 + 四戰法 + 法人動向）', projectId: 'guru', due: '2026-09-08', priority: '高', done: true, completedAt: Date.now() - 5 * DAY },
  { id: 'task-line', title: 'LINE Push 推播系統上線', projectId: 'guru', due: '2026-09-09', priority: '高', done: true, completedAt: Date.now() - 4 * DAY },
  { id: 'task-b5', title: 'B5 狀態機 + 策略觸發通知', projectId: 'guru', due: '2026-09-09', priority: '高', done: true, completedAt: Date.now() - 4 * DAY },
  { id: 'task-chipcard', title: '籌碼卡頁面（五契約 diverging bar）', projectId: 'guru', due: '2026-09-10', priority: '高', done: true, completedAt: Date.now() - 3 * DAY },
  { id: 'task-divergence', title: '籌碼分歧規則引擎 + 敘事產生', projectId: 'guru', due: '2026-09-10', priority: '中', done: true, completedAt: Date.now() - 3 * DAY },
  { id: 'task-pa-v2', title: 'PA六段對齊分數把關 + 九戰法統一', projectId: 'guru', due: '2026-09-12', priority: '高', done: true, completedAt: Date.now() - 1 * DAY },
  { id: 'task-backtest', title: '回測引擎初版', projectId: 'guru', due: todayStr(3), priority: '高', done: false },
  { id: 'task-realtime', title: '盤中即時報價（WebSocket/Ticker）', projectId: 'guru', due: todayStr(10), priority: '中', done: false },
  { id: 'task-sqlite', title: 'SQLite 遷移（取代 JSON 檔案存檔）', projectId: 'guru', due: todayStr(14), priority: '中', done: false },
]

export const initialNotes = [
  { id: 'note-1', title: '股流Radar 核心概念', content: '加入群組的主流、蓄勢、乘流、靜流，整個產品語彙統一在水流宇宙，使用者學一次就懂。', tags: ['股流', '概念'], projectId: 'guru', createdAt: Date.now() - 1 * 86400000 },
  { id: 'note-2', title: 'B0-B5 完成摘要', content: '09-09 完成：B0歷史存檔、B1熱區雷達、B2 PA事實層、B4盤中輪詢、B5狀態機、LINE Push推播。09-10：籌碼卡＋籌碼分歧引擎。09-11：Dashboard大盤整合（TWSE OpenAPI+TPEx真實資料）。09-12：PA六段對齊分數、九戰法統一、移動停利。', tags: ['股流', '摘要'], projectId: 'guru', createdAt: Date.now() },
  { id: 'note-3', title: 'SUNO 聽了二十首參考曲', content: '決定走深夜氛圍，人聲少一點，留空間給低頻。先鎖這個方向。', tags: ['靈感', '音樂'], projectId: 'suno', createdAt: Date.now() - 7 * 86400000 },
  { id: 'note-a1', title: '股流 Radar 整體架構', content: '資料源(TWSE/TPEx/FinMind)→供應商抽象層→PA Facts Layer(純函式算swing/結構/關鍵位/形態/量價)→g研判引擎(六段框架+策略層)→PWA呈現。熱度四成分=資金流向35%+價格強度25%+成交量異常20%+上漲廣度20%，熱區分四層：聚焦/升溫/分歧/退潮。三約束：資料可替換、事實先於AI、單向依賴。Phase1唯一策略pa_default；v2四戰法：回湧(volume-refill)、破堤(ma21-break)、鯨躍(deep-reversal)、洋流(ma200-current)。', tags: ['股流', '架構'], projectId: 'guru', createdAt: Date.now() - 3 * 86400000 },
  { id: 'note-chip', title: '籌碼分歧引擎已知問題', content: 'taifex.ts 的 fetchRetailFuturesPosition() 算出的散戶多方佔比語意未驗證，用真實數字回推發現可能算法錯誤（多空比有三種常見算法）。部署後第一件事：對照凱基期貨快訊的多空比數字確認公式。', tags: ['股流', 'bug'], projectId: 'guru', createdAt: Date.now() - 2 * 86400000 },
]

export const initialTimelineEvents = [
  { id: 'ev-1', date: '2026-08-10', type: 'milestone', title: '股流 Radar 概念成型', projectId: 'guru', color: '#6f8f78' },
  { id: 'ev-2', date: '2026-08-20', type: 'note', title: '確定「主流／蓄勢／乘流／靜流」四階段語彙', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-3', date: '2026-09-01', type: 'milestone', title: '完成第一版原型介面', projectId: 'guru', color: '#6f8f78' },
  { id: 'ev-4', date: '2026-09-03', type: 'note', title: '股流 Radar 監控面板上線準備', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-5', date: '2026-09-05', type: 'milestone', title: 'SUNO 第一首歌完成 demo', projectId: 'suno', color: '#6f8f78' },
  { id: 'ev-6', date: '2026-09-07', type: 'milestone', title: '股流 Radar 整體架構規格書完成（Architecture v1.0 + 系統規格 + 策略 v2）', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-7', date: '2026-09-08', type: 'milestone', title: 'v2 散戶版主頁 + 個股頁上線，全真實資料源整合（TWSE/TPEx/FinMind/Yahoo/Pantlas）', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-8', date: '2026-09-09', type: 'milestone', title: 'B0-B5 全部完成：歷史存檔、熱區雷達、PA事實層、盤中輪詢、LINE推播、狀態機', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-9', date: '2026-09-10', type: 'milestone', title: '籌碼卡頁面 + 籌碼分歧規則引擎上線（7 個測試全過）', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-10', date: '2026-09-11', type: 'milestone', title: 'Dashboard 大盤儀表板全面整合（TWSE OpenAPI+TPEx 真實資料）', projectId: 'guru', color: '#e76f51' },
  { id: 'ev-11', date: '2026-09-12', type: 'milestone', title: 'PA六段對齊分數把關、九戰法統一、移動停利功能完成', projectId: 'guru', color: '#e76f51' },
]

export const initialGoals = [
  { id: 'goal-1', title: '股流 Radar 第一版上線', description: 'v2散戶版已上線（Dashboard/StockDetail 全真實資料），B0-B5 全部完成，進入 Phase 3 回測+即時化階段', targetDate: '2026-09-15', progress: 82, color: '#e76f51', projectId: 'guru' },
  { id: 'goal-2', title: '收齊 20 則股流決策筆記', description: '累積成判斷資料庫', targetDate: '2026-10-01', progress: 30, color: '#6f8f78', projectId: 'guru' },
  { id: 'goal-3', title: 'SUNO 頻道連續 4 週每週一首', description: '先做出有辨識度的聲音，再談規模', targetDate: '2026-09-28', progress: 25, color: '#6f8f78' },
  { id: 'goal-4', title: '找到第一個付費使用者', description: '股流 Radar 痛點驗證', targetDate: '2026-10-15', progress: 5, color: '#7087a3', projectId: 'guru' },
]

export const navItems = [
  { id: 'home', label: 'Home', icon: Gauge },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, count: 1 },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
  { id: 'review', label: 'Review', icon: BookOpen },
  { id: 'goals', label: 'Goals', icon: Goal },
]

export const defaultSettings = { userName: 'Chris' }
