# 北極星 自動收集輸入（給 AI 讀）
> 產生時間：2026-09-23 23:50　範圍：最近 3 天
> 用途：AI 讀完後，把各專案濃縮成「一行方向＋進度」，寫進 daily-brief.txt 或 worklog。

## 1. Git commit（自動）
### 股流Radar（guru）
```
9583f29 | 2026-09-22 | docs: 新增測試員操作手冊（docs/測試員操作手冊.md）
659e715 | 2026-09-22 | feat(tunnel): 支援 Cloudflare Tunnel — vite allowedHosts 加入 .trycloudflare.com/.cfargotunnel.com 與 EXTRA_ALLOWED_HOSTS；新增 scripts/start-tunnel.bat 一鍵啟動
273da74 | 2026-09-22 | chore(schedule): 每日存檔統一為單一排程 週一-五 21:00（此時行情/法人/籌碼皆已公布，避免重複執行）；移除 15:00 與補跑任務
1f17c31 | 2026-09-21 | feat: 市場法人金額改用證交所官方 BFI82U(含籌碼判讀，與摘要同源) + flowSource 標示；每日排程改 15:00 主排程(另加 21:00 補跑，因法人/籌碼較晚公布)
64d2ea6 | 2026-09-21 | fix(data): 修正資料慢一天 — TWSE 行情改用 rwd MI_INDEX(當日即可取得)，openapi STOCK_DAY_ALL 僅作後備；新增 parseTwseDate 處理西元/民國日期(修 3937 年誤判)
558530b | 2026-09-21 | fix(chip): 籌碼判讀 v3 — 外資改「現貨為主、期貨為輔」，不同調時保留現貨方向並明講(修正外資大買卻顯示方向不明顯);移除左下角標註回饋按鈕;新增 2 項測試
eb2504d | 2026-09-21 | feat(exdiv): 處理除權息 — 新增 shared/quote-change.ts 統一漲跌口徑(X/缺值→changePct=null+exDividend, 不再產生 NaN 或假 0); hotzones 上市/上櫃皆改用; 型別與前端顯示加除權息標記; 新增 7 項測試
148f3ee | 2026-09-21 | feat(watchlist): 自選股遷移至 SQLite（每檔一列、交易原子性、順序/群組/成本價保留）+ 一次性 JSON 遷移(含旗標) + 儲存層驗證腳本(22 項)
fd3968b | 2026-09-21 | feat(security/ops): .env 載入(修正啟動順序) + JWT fail-fast/來源回報 + 登入限流 + 密碼政策 + 自選股後端驗證 + /api/health + 法遵頁(服務條款/隱私權)+頁尾連結 + 備份腳本與排程重試
f97d830 | 2026-09-21 | fix(kgi): PoC 分辨『未安裝』與『已裝但匯入失敗(llvmlite.dll)』並印出修復指令；啟動器優先用 py -3.13（llvmlite/numba 相容）
e1e0f1e | 2026-09-21 | fix(bat): 所有 .bat 改為 CRLF 且移除中文（cmd 誤解析會導致 cd 失敗、找不到 bridge 路徑）；poc-kgi.bat 優先使用一般版 Python；互動程式對無輸入安全
9e27176 | 2026-09-21 | feat(kgi): PoC 增加期货夜盤選項(TXF)，README 補現貨/夜盤時段對照；夜盤 15:00-05:00 可即時驗證帳號憑證
b46b949 | 2026-09-21 | feat(kgi): 新增互動式 PoC 引導（bridge/poc_runner.py + scripts/poc-kgi.bat 雙擊即可），README 補一鍵操作與 Python 安裝說明
3a9d213 | 2026-09-21 | feat(kgi): 新增凱基 SUPER PY 行情橋接（Python -> 本機 HTTP -> Node provider），含 PoC 腳本、啟動 bat、.env 範例與 README；端對端以假 SDK 驗證通過
7811d86 | 2026-09-21 | fix(security): 自選股 API 加擁有權檢查(修 IDOR) + 新增異動稽核紀錄(audit-log)與管理端端點; .gitignore 排除稽核/執行期資料
70360bc | 2026-09-21 | feat: 三項收尾 — (1)散戶留倉納入每日存檔(archive_retail)+單日變動計算,並修正 asOf 用回應 Date 避免盤中誤標; (2)修正 TPEx 上櫃法人解析(欄位為位置式,原比對名稱永遠為0); (3)清理 users.json 測試帳號並移出版控+gitignore
d8b9587 | 2026-09-21 | fix(chip): 修正散戶多空比 — 對照真實 TAIFEX API 修正契約代碼(中文名)與欄位(總量OI);公式改為業界淨多空比(散戶多-散戶空)/市場總OI;引擎升 v2(以0為中心±10死區、小台+微台並列、中性文案);UI與測試同步
```

## 2. 來源工作檔／企劃（讀取重點）
### 進度總覽（跨專案總表）（all）
- 檔案：`D:/ZCODE/專案儀錶版/polaris-dashboard/進度總覽.md`
- 最後修改：2026-09-17 23:20
- 章節：
```
# 進度總覽
## 一、專案總表
## 二、各專案明細
### 股流Radar（`guru`）— Active 55%
### 中古車選品師 IG（`ig-car`）— Explore 15%
### 旅遊選品師 IG（`ig-travel`）— Idea 8%
### 神仙童萌會 YT（`yt-kids`）— Idea 5%　★目前重心
### Poker Trainer（`poker`）— MVP 18%
## 三、目標（Goals）
## 四、跨專案待辦／雜項
## 五、更新紀錄
## 六、怎麼用（收工流程）
```

### 中古車選品師 IG（ig-car）
- 檔案：`D:/ZCODE/IG運營/中古車選品師IG.md`
- 最後修改：2026-08-23 18:42
- 章節：
```
# 中古車選品師IG｜工作檔
## 品牌定案（2026-08-23）
## 商業模式
## 現況與待辦
## 相關
```

### 旅遊選品師 IG（ig-travel）
- 檔案：`D:/ZCODE/IG運營/旅遊選品師IG.md`
- 最後修改：2026-08-23 18:42
- 章節：
```
# 旅遊選品師IG｜工作檔
## 品牌定案（Gemini 對話 2026-04 起討論）
## 商業模式
## 內容架構
## 現況與待辦
## 相關
```

### IG 進度總覽（ig-all）
- 檔案：`D:/ZCODE/IG運營/進度總覽.md`
- 最後修改：2026-09-11 04:48
- 章節：
```
# 客里斯雙 IG 帳號 · 進度總覽（2026-08-24）
## 一、兩個帳號現況
### 🚗 中古車選品師（uc.curator_chris）
### ✈️ 旅遊選品師（待建）
## 二、定案 Bio（直接複製貼上）
### 中古車
### 旅遊
## 三、Notion 計畫位置
## 四、頭貼位置
## 五、AI 工具線
## 六、待做事項（依優先順序）
### 立即（每個帳號都要做，各約 5 分鐘）
### 第二波（帳號建好後）
## 七、相關記憶檔（開新對話可用）
```

- ⚠ 神仙童萌會 YT（yt-kids）找不到：C:/Users/amydo/OneDrive/桌面/內容自媒體/兒童神話動畫頻道運營企劃書.md
## 3. 今日（2026-09-23 起）有異動的檔案
### workspace（57 個）
- C:/Users/amydo/.openclaw-autoclaw/workspace/.cluster/expert-playbook.md　(2026-09-23 12:17)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-014203-18e5d215-8cf-S__52830213_0.jpg　(2026-09-23 01:41)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-014203-74151cd8-b17-S__52830212_0.jpg　(2026-09-23 01:41)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-014203-9bf0d56e-312-S__52830214_0.jpg　(2026-09-23 01:41)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-049437f5-0f0-S__52846615_0.jpg　(2026-09-23 12:35)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-364d1703-a78-S__52846604_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-45cc2f05-5b9-S__52846605_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-4e5ce6ef-f4d-S__52846609_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-6a6534b2-8bf-S__52846603_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-70bd1592-1ce-S__52846600_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-7ea79198-d63-S__52846606_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-82a5099f-eb0-S__52846601_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-86e10307-e34-S__52846612_0.jpg　(2026-09-23 12:35)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-9d7a3909-26b-S__52846611_0.jpg　(2026-09-23 12:35)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-dda71a87-1f7-S__52846608_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-e1f7df52-0ae-S__52846613_0.jpg　(2026-09-23 12:35)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-ec5edcd1-5f0-S__52846614_0.jpg　(2026-09-23 12:35)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-f2170924-f09-S__52846602_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.openclaw-attachments/20260923-123842-fcaefbeb-861-S__52846607_0.jpg　(2026-09-23 12:36)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.opencode/config.json　(2026-09-23 12:15)
- C:/Users/amydo/.openclaw-autoclaw/workspace/config/mcporter.json　(2026-09-23 12:15)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/.gitignore　(2026-09-23 13:08)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/.tmp-test-data/admin-token.txt　(2026-09-23 13:08)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/.tmp-test-data/mapsync.db　(2026-09-23 13:08)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/.tmp-test-data/mapsync.db-shm　(2026-09-23 13:08)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/.tmp-test-data/mapsync.db-wal　(2026-09-23 13:08)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/data/mapsync.db-shm　(2026-09-23 13:05)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/data/mapsync.db-wal　(2026-09-23 19:48)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/index.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/iOS捷徑設定指南.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/MVP-範圍定義.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/OCR實測報告.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/β測試執行計畫.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/上線前完成報告.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/上線待辦與協助清單.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/上線檢查清單與部署說明.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/五項缺口解法評估.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/交接與維運手冊.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/加朋友與登入方案.html　(2026-09-23 23:39)
- C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/docs/完整架構藍圖與進度.html　(2026-09-23 23:39)
### D:/ZCODE/IG運營（0 個）
（今日無異動）
### D:/ZCODE/兒童YT頻道（10 個）
- D:/ZCODE/兒童YT頻道/腳本-S1-第03章-不完美也可以-定稿-2026-09-23.md　(2026-09-23 01:00)
- D:/ZCODE/兒童YT頻道/腳本-S1-第04章-家是最安全的地方-初稿-2026-09-23.md　(2026-09-23 02:24)
- D:/ZCODE/兒童YT頻道/腳本-S1-第05章-把功課拆成小怪-初稿-2026-09-23.md　(2026-09-23 02:24)
- D:/ZCODE/兒童YT頻道/腳本-S1-第06章-口袋裡的分享-初稿-2026-09-23.md　(2026-09-23 03:04)
- D:/ZCODE/兒童YT頻道/腳本-S1-第07章-輸了可以再來-初稿-2026-09-23.md　(2026-09-23 02:26)
- D:/ZCODE/兒童YT頻道/腳本-S1-第08章-專注的小魔法-初稿-2026-09-23.md　(2026-09-23 02:28)
- D:/ZCODE/兒童YT頻道/腳本-S1-第09章-被看見的我-初稿-2026-09-23.md　(2026-09-23 02:28)
- D:/ZCODE/兒童YT頻道/腳本-S1-第10章-求助不是軟弱-初稿-2026-09-23.md　(2026-09-23 02:29)
- D:/ZCODE/兒童YT頻道/腳本-S1-第11章-合作比搶贏更厲害-初稿-2026-09-23.md　(2026-09-23 02:32)
- D:/ZCODE/兒童YT頻道/腳本-S1-第12章-季終三神殿亮-初稿-2026-09-23.md　(2026-09-23 02:32)

## 4. 目前儀表板狀態（更新前）
- guru｜股流Radar｜stage=Active｜progress=68％｜next=週四（9/24）交付測試員開跑驗收（Go/No-Go）；驗收後把凱基即時行情從 PoC 接成正式資料源
- poker｜Poker Trainer｜stage=MVP｜progress=18％｜next=確認第一個訓練循環
- ig-car｜中古車選品師 IG｜stage=Explore｜progress=15％｜next=設定顯示名稱／Bio／專業帳號／兩步驗證，產出首波 9 篇 Carousel
- ig-travel｜旅遊選品師 IG｜stage=Idea｜progress=8％｜next=建立 IG 帳號（travel.curator_chris）並製作卡通地圖頭貼
- yt-kids｜神仙童萌會（YT）｜stage=Idea｜progress=16％｜next=依 12 章大綱續寫第 3 集起腳本，NotebookLM 逐章內容審核後進入錄製
- 其他：ideas=2 tasks=26 notes=10 goals=6 timeline=10
