# 北極星儀表版 Polaris（工作／發佈版）

- **角色**：唯一會更新的工作副本（含 git + 自動化）
- **更名紀錄**：原資料夾名 `nora-workspace` → 2026-09-17 更名為 `polaris-dashboard`（舊名易與其他專案混淆）
- **位置**：`D:\ZCODE\專案儀錶版\polaris-dashboard`
- **技術**：React 19 + Vite（單檔 SPA：`src/main.jsx`，約 1600 行）+ `src/styles.css`
- **啟動**：雙擊 `start-polaris.bat`，或 `npm run dev` → http://127.0.0.1:8080
- **遠端倉庫**：https://github.com/dtoneaj-glitch/polaris-dashboard （branch `master`）
- **自動更新鏈**：`data/git-scanner.js` → `worklog/YYYY-MM-DD.json` → `data/updater.js` 改寫 `src/main.jsx` → `npm run build` → commit & push
- **每晚 23:50**：AutoClaw 定時任務自動產生「每日工作回報」並更新本儀表板
- **關鍵文件**：`docs/DAILY-REPORT-GUIDE.md`、`docs/DAILY-REPORT-TEMPLATE.md`、`docs/AUTO-UPDATE.md`、`AI-HANDOFF.md`
- **敏感項**：`.git/config` 的 remote URL 內嵌 GitHub token，請勿外傳
- **注意**：本儀表板的 LocalStorage key 固定為 `nora_workspace_v1_demo_fresh`，**不可變更**（改了會清空既有資料）
- **對應的原始碼存檔（唯讀參考，不在此更新）**：`D:\個人台\北極星 Polaris\polaris-dashboard-refactored\polaris-dashboard`（多檔重構版：App.jsx + pages/ + components/）