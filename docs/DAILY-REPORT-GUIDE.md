# 每日工作回報 — AI 處理指南

> 使用者會貼一份 Markdown 回報表給 AI，AI 負責轉換成 `worklog/YYYY-MM-DD.json` 並執行更新。

---

## 處理流程

1. **讀取回報內容** → 解析日期、任務、筆記、進度
2. **匹配現有任務** → 搜尋 `main.jsx` 中 title 相近的任務
   - 匹配成功 → 標記 `done: true`，保留原有 id
   - 未匹配 → 產生新 id：`task-{日期}-{title前10字}`
3. **產出 worklog JSON** → 寫入 `worklog/YYYY-MM-DD.json`
4. **執行更新** → `node data/updater.js`
5. **驗證 builds** → `npm run build`
6. ** commit & push**

---

## JSON 格式規範

```json
{
  "date": "2026-09-13",
  "tasks": [
    {
      "id": "task-20260913-PA研判邏輯",        // 已存在則用原有 id
      "title": "完成PA六段研判邏輯更新",
      "projectId": "guru",
      "priority": "高",                         // 高/中/低
      "done": true,                             // 已完成
      "completedAt": 1789284705915              // timestamp
    }
  ],
  "notes": [
    {
      "id": "note-20260913-策略確認",
      "title": "策略確認：走A方案",
      "content": "今天確認了PA六段的決策流程...",
      "tags": ["股流", "決策"],
      "projectId": "guru"
    }
  ],
  "timelineEvents": [
    {
      "id": "ev-20260913",
      "date": "2026-09-13",
      "title": "PA六段研判邏輯更新完成",
      "type": "milestone",
      "projectId": "guru",
      "color": "#e76f51"
    }
  ],
  "projects": [
    { "id": "guru", "progress": 85 }            // 只寫變動的
  ],
  "ideas": [],
  "goals": []
}
```

---

## 任務匹配規則

### 優先匹配（避免重複）
1. 檢查 worklog/ 中是否已有同日期檔案 → 有則合併，不覆蓋
2. 檢查 main.jsx `initialTasks` 中 title 包含關鍵字的現有任務 → 有則沿用 id
3. 以上都沒有 → 生成新 id：`task-{YYYYMMDD}-{title前10字}`

### 標題縮寫規則
- 去除停頓號、連接詞
- 取前 10 個字元
- 空白換成 `-`
- 示例：`「完成PA六段研判邏輯」` → `task-20260913-完成PA六段研判邏`

---

## 進度更新規則

若使用者報告「股流Radar 85% → 90%」：
- 搜尋 `initialProjects` 中 id=guru 的項目
- 更新 `progress: 90`
- 若有 `next` 欄位且使用者提供下一步，同步更新

---

## 常見專案 ID 對照

| 專案名稱 | id   | 顏色  |
|---------|------|-------|
| 股流Radar | guru | #e76f51 |
| SUNO Music | suno | #6f8f78 |
| Poker Trainer | poker | #7087a3 |
| 小說世界觀 | novel | #bb8b4d |

---

## 快速指令

```bash
# 產出 JSON 後執行更新
cd D:/ZCODE/專案儀錶版/polaris-dashboard
node data/updater.js
npm run build

# 如有變更則 commit & push
git add worklog/ src/main.jsx
git commit -m "chore: update dashboard — YYYY-MM-DD worklog"
git push
```
