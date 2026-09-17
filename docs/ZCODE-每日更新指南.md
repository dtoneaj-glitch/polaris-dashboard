# 北極星 每日更新 — ZCode 操作指南（0 AI 路線）

> 目的：讓 **ZCode（免費額度）** 負責「讀儀表板 → 總結每日方向 → 填表 → 觸發更新」，
> 機械性工作（改 seed、build、push）由**本機腳本**完成，**不耗 AI token**。

---

## 一、整體流程

```
① 讀「目前儀表板內容」      data/dashboard-state.json   ← 乾淨 JSON 快照
② AI 總結今天各專案方向      （ZCode / 任何模型）
③ 寫入輸入表              daily-brief.txt（每專案一行）
④ 執行一行指令             node scripts/daily-report.js
      └ worklog/YYYY-MM-DD.json → src/main.jsx → build → git push
⑤ 儀表板更新               本機 dev 看 http://127.0.0.1:8080（Settings→重置工作區）
```

**重點分工**：AI 只做「濃縮與判斷」；`daily-report.js` 做全部機械動作（0 token）。

---

## 二、ZCode 要讀哪些檔（「最新的儀表板內容」給他看什麼）

| 檔案 | 用途 | 說明 |
|---|---|---|
| **`data/dashboard-state.json`** | ✅ **最新儀表板內容（首選）** | 由 `scripts/export-state.js` 從 `src/main.jsx` 匯出的乾淨 JSON：projects / ideas / tasks / notes / timelineEvents / goals。**每次更新後自動重新產生。** |
| `daily-brief.txt` | 輸入表 | 你要填的每專案一行；AI 依 dashboard-state.json 幫你填也可 |
| `src/main.jsx`（`initial*` 區塊） | 原始 seed（備援） | 儀表板的真正資料來源；dashboard-state.json 就是它的 JSON 版 |
| `docs/DAILY-REPORT-GUIDE.md` | 舊版完整日報格式 | 若要記 tasks/notes 細節時參考（精簡版不需要） |
| 專案背景 | 內容上下文 | `D:\ZCODE\IG運營\*`（兩 IG）、`OneDrive\桌面\內容自媒體\兒童神話動畫頻道運營企劃書.md`（童萌會 YT） |

> ⚠ 儀表板的**即時資料存在瀏覽器 localStorage**（key `nora_workspace_v1_demo_fresh`），ZCode 讀不到。
> 所以「最新儀表板內容」一律以 repo 內的 **`data/dashboard-state.json`** 為準。

---

## 三、每天怎麼跑（ZCode 版）

1. ZCode 讀 `data/dashboard-state.json`（知道各專案目前 progress / next）。
2. 你告訴 ZCode 今天各專案做了什麼（或讓它讀 git log / 對話紀錄）。
3. ZCode 把結果寫成 `daily-brief.txt`：
   ```
   guru: 88 | P0 修復 + VIX 上線 + 推 GitHub | 驗散戶多空比公式
   ig-car: 20 | 首波 9 篇 Carousel 開寫 | 完成 Bio 與專業帳號設定
   ```
4. ZCode 執行：`node scripts/daily-report.js`
   （會自動：寫 worklog → 更新 main.jsx → 重生 dashboard-state.json → build → commit → push）
5. 完成。

---

## 四、指令備忘

```bash
# 只看會寫入什麼，不改任何檔
node scripts/daily-report.js --dry

# 更新 + build，但不 commit/push
node scripts/daily-report.js --no-push

# 完整（更新 + build + commit + push）
node scripts/daily-report.js

# 只重生「給 AI 讀」的快照
node scripts/export-state.js
```

或直接雙擊 `daily-report.bat`（等同 export-state + daily-report 完整流程）。

---

## 五、要排程的話

- **本機（免費、0 AI）**：Windows 工作排程器每天執行 `daily-report.bat`。
- **AutoClaw 定時任務**：目前 23:50 那條是「AI 精簡版」；若改用本腳本，可把該任務關掉（純腳本不吃 AI 額度）。
- **注意**：此流程只更新 **repo 內的 seed**；本機瀏覽器要看到最新內容，需在 Settings 按「重置工作區」載入新 seed。

---

## 六、檔案清單（本路線新增）

| 檔案 | 作用 |
|---|---|
| `daily-brief.txt` | 你／AI 填的每日方向輸入表 |
| `scripts/export-state.js` | 從 `src/main.jsx` 匯出 `data/dashboard-state.json` |
| `scripts/daily-report.js` | 讀 brief → 更新 → build → push |
| `daily-report.bat` | 雙擊一鍵執行 |
| `data/dashboard-state.json` | 給 AI / ZCode 讀的最新儀表板快照 |

*建立：2026-09-17*

---

## 七、自動收集（重點：不用自己填）

`scripts/collect.js` 會自動把「你平常工作本來就會留下的痕跡」彙整成一個檔，AI 讀這個就好：

```bash
node scripts/collect.js            # 最近 3 天
node scripts/collect.js --days 7   # 最近 7 天
# 輸出：data/daily-input.md
```

收集內容：
- 各 git repo 的近期 commit（目前：guru／股流Radar）
- 各來源工作檔的「最後修改時間 + 章節大綱」（IG 兩帳、進度總覽、YT 企劃）
- 今日有異動的檔案（workspace、D:\ZCODE\IG運營、D:\ZCODE\兒童YT頻道）
- 目前儀表板狀態（各專案 progress／next）

因此「每日流程」可以完全不用手動填表：

1. `node scripts/collect.js`
2. AI 讀 `data/daily-input.md` → 寫 `daily-brief.txt`
3. `node scripts/daily-report.js`

> 想加新的追蹤來源（例如某專案的 git repo 或工作檔），只要改 `scripts/collect.js` 最上方的 `REPOS` / `DOCS` / `SCAN_DIRS` 設定即可。