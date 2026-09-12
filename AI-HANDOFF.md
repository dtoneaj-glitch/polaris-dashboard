# Polaris / Nora Workspace — AI Handoff Guide

> 這是給其他 AI（或人類協作者）快速上手這套專案儀表版的完整文件。
> 所有程式碼在 `src/` 下；主要邏輯集中在 `main.jsx`（單一檔案 SPA）。

---

## 1. 快速概覽

| 項目 | 值 |
|------|-----|
| 框架 | React 19 + Vite |
| 入口 | `src/main.jsx`（**所有邏輯在一個檔案，共 1688 行**） |
| 樣式 | `src/styles.css`（dark/light 主題，CSS 自訂屬性） |
| 資料持久化 | **LocalStorage-first**，key = `nora_workspace_v1_demo_fresh` |
| 雲端同步 | 可選 Supabase（需手動設定 credentials） |
| 部署 | GitHub Pages（`.github/workflows/deploy.yml`） |
| 本地開發 | `npm run dev` → `http://127.0.0.1:8080` |

---

## 2. 檔案結構

```
nora-workspace/
├── src/
│   ├── main.jsx          ← 全部程式碼（唯一要讀的檔案）
│   ├── styles.css        ← 設計系統 + 所有樣式
│   └── lib/
│       ├── supabase.js   ← Supabase 客戶端與憑證管理
│       └── cloudSync.js  ← 雲端載入/儲存/訂閱
├── package.json
├── vite.config.js
├── .env.example
└── sql/schema.sql        ← Supabase 資料表結構（參考用）
```

---

## 3. 8 頁 SPA 導覽

| 頁路由 | 元件名稱 | 功能 |
|--------|---------|------|
| `/` 或 `home` | `HomePage` | 晨間簡報、任務列、焦點專案、靈感預覽 |
| `/projects` | `ProjectsPage` | 專案列表（pipeline 視圖） |
| `/ideas` | `IdeasPage` | 靈感池（篩選 + 搜尋） |
| `/notes` | `NotesPage` | 筆記本（標籤篩選） |
| `/timeline` | `TimelinePage` | 進展時間軸 |
| `/review` | `ReviewPage` | 週回顧（含趨勢圖） |
| `/goals` | `GoalsPage` | 目標星圖 |
| `/settings` | `SettingsPage` | 設定（主題、資料匯出/匯入、Supabase） |

---

## 4. 資料模型

### 主要資料 key
LocalStorage 只用一個 key：**`nora_workspace_v1_demo_fresh`**

```json
{
  "projects": [...],
  "tasks": [...],
  "ideas": [...],
  "notes": [...],
  "timelineEvents": [...],
  "goals": [...],
  "snapshots": [...],
  "reviews": [...],
  "userName": "...",
  "theme": "dark" | "light",
  "lastSnapshot": "2026-09-08",
  "currentWeekKey": "2026-09-08"
}
```

### 各資料結構

**Project**
```ts
{
  id: string           // 例如 "guru"
  name: string         // 例如 "股流Radar"
  description: string
  stage: "Idea" | "Explore" | "MVP" | "Active"
  color: string        // 例如 "#e76f51"
  progress: number     // 0-100
  next: string         // 下一步動作
  createdAt: number    // timestamp
  updatedAt: number
}
```

**Task**
```ts
{
  id: string           // 例如 "task-1"
  projectId: string    // 哪個專案（空 = 雜項）
  title: string
  due: string          // ISO date "2026-09-10" 或 legacy 文字
  done: boolean
  createdAt: number
  updatedAt: number
}
```

**Idea**
```ts
{
  id: string
  title: string
  note: string
  type: string         // 例如 "AI", "工具", "副業"
  score: number        // 值得探索分數
  ready: boolean       // 是否已升級為專案
  created: string      // ISO date
}
```

**Note**
```ts
{
  id: string
  title: string
  content: string
  tags: string[]       // 逗號分隔存入
  projectId: string    // 可選關聯專案
  createdAt: number
}
```

**TimelineEvent**
```ts
{
  id: string
  date: string         // ISO date
  title: string
  type: "milestone" | "note"
  projectId: string    // 可選
  color: string        // 與專案色或預設
  createdAt: number
}
```

**Goal**
```ts
{
  id: string
  title: string
  description: string
  targetDate: string   // ISO date
  progress: number     // 0-100
  createdAt: number
}
```

**Snapshot**（自動產生，不直接編輯）
```ts
{
  date: string         // ISO date "2026-09-08"
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalProjects: number
  activeProjects: number
  totalIdeas: number
  completedTasks: number
}
```

**Review**
```ts
{
  id: string
  weekKey: string      // ISO 週一日期
  wins: string
  challenges: string
  insights: string
  created: number
}
```

---

## 5. 初始資料（seed）

### 專案 (projects)
| id | 名稱 | stage | color | progress |
|----|------|-------|-------|----------|
| guru | 股流Radar | Active | #e76f51 | 45% |
| suno | SUNO Music | Explore | #7087a3 | 20% |
| poker | Poker Trainer | MVP | #6f8f78 | 35% |
| novel | 小說世界觀 | Idea | #bb8b4d | 10% |

### 目標 (goals)
| id | 標題 | 目標日期 |
|----|------|---------|
| goal-1 | 完成股流Radar MVP | 2026-10-01 |
| goal-2 | 建立穩定被動收入 | 2026-12-31 |

### 靈感 (ideas)
- "AI 自動生成 poker 教學" — 類型: AI, score: 7, ready: false
- "用 suno 做每日市場分析歌曲" — 類型: 創意, score: 6, ready: false

### 任務 (tasks)
- task-1: "設定 Supabase 連線" — done: true, projectId: guru
- task-g1: "設計股流Radar UI" — done: false, projectId: guru
- task-g2: "串接 Kline API" — done: false, projectId: guru

---

## 6. 核心演算法

### 6.1 晨間簡報 (buildBrief)

```
buildBrief(projects, tasks, ideas) → string

演算法：
1. 找出未完成的 Active 專案
2. 若有，第一個 Active 專案的 next 就是今日焦點
3. 否則找 Explore/MVP 階段有進度的專案
4. 若無專案，建議從 Ideas 挑一個開始評估
5. 若 Ideas 也空，建議"先清空任務再思考下一步"

回傳格式（一段話， Serif 字型）：
"今日聚焦：{project name}。{next step}。"
或
"今天沒有待辦。{建議}。"
```

### 6.2 自動產生時間軸事件 (makeEvent)

```
makeEvent(project, task, event) → TimelineEvent | null

觸發時機：
1. 任務完成 → milestone 事件（"完成任務：{title}"）
2. 專案建立 → milestone 事件（"專案建立：{name}"）
3. 專案進度更新到 >= 100% → milestone 事件（"專案到達 100%：{name}"）
4. 專案刪除 → 記錄刪除事件

回傳 null 代表不產生事件（任務未完成時）。
```

### 6.3 目標進度計算 (goalProgress)

```
goalProgress(goal, projects, tasks) → number

邏輯：
1. 找出與 goal 相關的專案（id 匹配或 title 包含）
2. 計算關聯專案的進度總和 ÷ 關聯數
3. 計算關聯專案已完成的任務比例
4. 取兩者的平均作為最終進度
```

### 6.4 日期遷移 (migrateDue / migrateTs)

```
legacy 格式 → ISO 格式轉換

migrateDue(val):
  - 若 val 是 ISO date "2026-09-10" → 回傳
  - 若 val 是文字 "2026/9/10" → 轉換為 "2026-09-10"
  - 若 val 是數字 1757721600000（timestamp）→ 轉換為 ISO

migrateTs(val):
  - 若 val 是數字 → 回傳
  - 若 val 是 ISO 字串 → 轉換為 timestamp
```

---

## 7. 主要函數（main.jsx）

### 狀態載入/儲存
```js
loadState()   → 從 localStorage 載入 + 遷移舊格式 + 合併初始資料
saveState()   → 寫入 localStorage
```

### 資料操作（hooks 內）
```js
// Projects
addProject(data)
updateProject(id, data)
deleteProject(id)

// Tasks
addTask(projectId, title, due)
toggleTask(id)
updateTask(id, data)
deleteTask(id)

// Ideas
addIdea(data)
promoteIdea(id)  // 升級為專案

// Notes
addNote(data)
updateNote(id, data)
deleteNote(id)

// Timeline
addTimelineEvent(data)
deleteTimelineEvent(id)

// Goals
addGoal(data)
updateGoal(id, data)
deleteGoal(id)

// Reviews
saveReview(weekKey, data)
deleteReview(id)

// Snapshots
ensureTodaySnapshot()  // 自動建立今日快照
```

### 通知系統
```js
notify(type, message)  // 顯示 toast
dismissNotification(id)
```

### 搜尋（⌘K）
```js
doSearch(q) → 在 projects/tasks/ideas/notes/timelineEvents/goals 中搜尋
```

---

## 8. CSS 設計系統

### 色彩變數
```css
/* Dark theme (default) */
--bg: #131110;
--side: #181514;
--card: #1e1a17;
--card2: #231f1b;
--coral: #ff6a4b;
--coral-ink: #fff8f6;
--coral-soft: rgba(255, 106, 77, .12);
--amber: #f5a623;
--amber-soft: rgba(245, 166, 35, .12);
--green: #7fc79a;
--green-soft: rgba(127, 199, 154, .12);
--ink: #f5f0e8;
--ink2: #9da4aa;
--faint: #6b7278;
--line: rgba(140, 146, 160, .18);
--line2: rgba(140, 146, 160, .12);
--backdrop: rgba(0, 0, 0, .6);
--grad-bar: linear-gradient(90deg, #ff6a4b, #f5a623);
--grad-focus: linear-gradient(135deg, rgba(255,106,77,.08), transparent);
--shadow-card: 0 2px 8px rgba(0,0,0,.25);
--shadow-pop: 0 16px 40px rgba(0,0,0,.45);
```

Light theme 透過 `data-theme="light"` 覆蓋以上變數。

### 字型
```css
--font-display: 'Space Grotesk', sans-serif;
--font-body: 'DM Sans', sans-serif;
--font-serif: 'Noto Serif TC', serif;    /* 中文襯線 */
--font-mono: 'JetBrains Mono', monospace;
```

### 響應式斷點
- `980px`: 側邊欄縮窄，idea grid 2欄，review summary 2欄
- `720px`: 側邊欄變為 overlay，單欄佈局

---

## 9. 快速操作指南（對 AI 協作者）

### 如果你想修改某頁面的 UI
1. 打開 `src/main.jsx`，找到對應的 Page 元件（例如 `ProjectsPage` 在第 837 行）
2. 找到 `styles.css` 中對應的 CSS class（例如 `.project-row` 在第 267 行）

### 如果你想新增一筆資料
1. 在 `initialProjects` / `initialTasks` 等常量中加入（第 184-260 行）
2. 或在 `SettingsPage` 用 JSON import 功能匯入

### 如果你想修改晨間簡報的文字
1. 找到 `buildBrief` 函數（main.jsx 約第 72-100 行）
2. 修改回傳的模板字串

### 如果你想加新頁面
1. 在 `App` 元件的 `pages` 物件中加路由
2. 在 `Sidebar` 中加導航項目
3. 在 `main.jsx` 底部加 Page 元件定義

### 如果你想改初始資料
1. 編輯 `src/main.jsx` 的 `initialProjects` / `initialTasks` / `initialIdeas` 等常量
2. 或執行 `patch-2026-09-06.js` 類型的 IIFE 腳本（會直接修改 localStorage 資料）

---

## 10. 已知限制與注意事项

1. **main.jsx 是單一檔案**（1688 行），所有元件都在裡面。搜尋時用 `function XXXPage` 定位。
2. **LocalStorage key 固定**為 `nora_workspace_v1_demo_fresh`，改這個 key 會讓所有舊資料消失。
3. **Supabase 是選配**，預設不連接。要連線需在設定頁填入 URL 和 Anon Key。
4. **日期格式混用**：新版用 ISO（`2026-09-10`），舊版用文字（`2026/9/10`），有自動遷移函數。
5. **Active 專案上限 3 個**，在 `ProjectModal` 的 `submit` 裡有驗證邏輯。
6. **patch 腳本**（`patch-2026-09-06.js`）是 IIFE，會在頁面載入時執行一次，直接修改 localStorage。

---

## 11. 常用 dev 命令

```bash
npm install           # 安裝依賴
npm run dev           # 啟動 dev server（http://127.0.0.1:8080）
npm run build         # 生產 builds
npm run preview       # 預覽 builds
```

---

*最後更新：2026-09-11*
*檔案主線：src/main.jsx (單檔案 SPA) + src/styles.css*
