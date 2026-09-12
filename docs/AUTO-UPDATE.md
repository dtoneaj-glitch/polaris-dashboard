# Polaris 儀表版 — 自動化更新指南

> 這份文件說明如何讓儀表板自動更新，以及當你有新專案時怎麼加入架構。

---

## 🔄 自動化流程總覽

```
你（或 AI 夥伴）寫工作記錄
         ↓
  worklog/YYYY-MM-DD.json
         ↓
GitHub Actions 每日 22:00 自動執行（或手動觸發）
         ↓
  data/updater.js 讀取並更新 src/main.jsx
         ↓
  自動 commit + push → 觸發 GitHub Pages 部署
         ↓
  儀表板自動更新 ✅
```

---

## 📝 工作記錄格式（JSON）

在 `worklog/YYYY-MM-DD.json` 寫入今天的更新：

```json
{
  "date": "2026-09-13",
  "tasks": [
    {
      "id": "task-backtest",
      "title": "回測引擎初版",
      "projectId": "guru",
      "done": false,
      "due": "2026-09-16",
      "priority": "高"
    }
  ],
  "notes": [
    {
      "id": "note-new",
      "title": "今日學習：回測框架選型",
      "content": "比較了 backtrader 和自訂框架，決定用自訂因為...",
      "tags": ["股流", "研究"],
      "projectId": "guru"
    }
  ],
  "timelineEvents": [
    {
      "id": "ev-new",
      "date": "2026-09-13",
      "title": "啟動回測引擎開發",
      "type": "milestone",
      "projectId": "guru",
      "color": "#e76f51"
    }
  ],
  "projects": [
    {
      "id": "guru",
      "progress": 85,
      "next": "完成回測引擎初版"
    }
  ],
  "ideas": [
    {
      "id": "idea-new",
      "title": "AI 自動產生交易日誌",
      "note": "讓 AI 每天整理交易記錄",
      "type": "AI",
      "score": 75
    }
  ],
  "goals": [
    {
      "id": "goal-1",
      "progress": 85
    }
  ]
}
```

### 欄位說明

| 區塊 | 可用欄位 |
|------|----------|
| `tasks` | `id`, `title`, `projectId`, `done`, `due`, `priority` |
| `notes` | `id`, `title`, `content`, `tags`（陣列或逗號分隔字串）, `projectId` |
| `timelineEvents` | `id`, `date`, `title`, `type`（milestone/note）, `projectId`, `color` |
| `projects` | `id`, `progress`, `stage`, `next` |
| `ideas` | `id`, `title`, `note`, `type`, `score`, `ready` |
| `goals` | `id`, `progress` |

**不用的區塊留空陣列 `[]` 即可。**

---

## 🆕 新增專案的標準流程

當你有一個新的專案要加入儀表板：

### 1. 在 `worklog/` 建立專案初始化檔

```json
{
  "date": "2026-09-13",
  "projects": [
    {
      "id": "my-new-project",
      "name": "我的新專案",
      "description": "專案簡短描述",
      "stage": "Idea",
      "color": "#6f8f78",
      "progress": 5,
      "next": "第一步要做什麼"
    }
  ]
}
```

### 2. 執行更新

```bash
# 本地測試
node data/updater.js

# 或直接推到 GitHub，讓 Actions 自動執行
git add worklog/
git commit -m "chore: add new project initialization"
git push
```

---

## 🤖 AI 夥伴使用指南

每次對話中，如果你（AI）想要更新儀表板：

1. **讀取** `worklog/` 目錄看有没有待處理的記錄
2. **寫入**今天的 worklog JSON 檔案（`worklog/YYYY-MM-DD.json`）
3. **通知**用戶：可以手動觸發 GitHub Actions，或等每日 22:00 自動執行
4. **也可以**直接修改 `src/main.jsx` 的 seed data 常量（需要 build 後部署）

---

## ⚙️ GitHub Actions 設定

### 需要設定的 Secret

1. 去 GitHub → Settings → Secrets and variables → Actions
2. 新增 secret：`GH_PAT`
3. 值是你已有的 GitHub Token（格式：`gho_xxx...`，已內嵌在 remote URL 中）

### 觸發時機

- **排程**：每天台北時間 22:00 自動執行
- **手動**：在 GitHub Actions 頁面點擊 "Run workflow"

---

## 📂 檔案結構

```
nora-workspace/
├── .github/workflows/
│   ├── deploy.yml          # 原有的 Pages 部署
│   └── auto-update.yml     # ← 新增：資料自動更新
├── data/
│   └── updater.js          # ← 新增：更新腳本
├── worklog/                # ← 新增：工作記錄目錄
│   ├── 2026-09-13.json     # 範例
│   └── ...
├── src/
│   ├── main.jsx            # 主要程式碼（會被 updater.js 修改）
│   └── styles.css
└── AI-HANDOFF.md
```

---

*最後更新：2026-09-13*
