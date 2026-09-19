# 北極星 自動收集輸入（給 AI 讀）
> 產生時間：2026-09-19 15:39　範圍：最近 3 天
> 用途：AI 讀完後，把各專案濃縮成「一行方向＋進度」，寫進 daily-brief.txt 或 worklog。

## 1. Git commit（自動）
### 股流Radar（guru）
```
55a829a | 2026-09-17 | feat(vix): 接上 TAIWAN VIX 官方免費資料源 — 新增 providers/taifex-vix.ts（抓 TAIFEX 月檔 txt）、GET /api/vix、大盤籌碼頁顯示真實 VIX 數值與白話情緒（取代資料源建置中標示）
d6e2488 | 2026-09-17 | feat: 新增每日存檔排程腳本（scripts/daily-archive.ts + 執行/註冊 bat），累積 SQLite 歷史（B0 快照 + 大盤籌碼 OI）；logs/ 加入 gitignore
0d569ee | 2026-09-17 | fix: 市場摘要買賣超方向改依法人淨額正負（原本用漲跌家數情緒+abs 會講反方向）；大盤籌碼頁新增 TAIWAN VIX「資料源建置中」標示
ce49afa | 2026-09-17 | chore: 專案現況快照 — 補 PROJECT.md/start-guliu.bat/.env.example/pnpm-lock；依賴改由 pnpm 鎖定；移除已不適用的 wouter 3.7.1 patch 設定（實際裝 3.11.0）
```

## 2. 來源工作檔／企劃（讀取重點）
### 進度總覽（跨專案總表）（all）
- 檔案：`D:/ZCODE/專案儀錶版/polaris-dashboard/進度總覽.md`
- 最後修改：2026-09-17 23:20　🟡 近期有動
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
## 3. 今日（2026-09-19 起）有異動的檔案
### workspace（3 個）
- C:/Users/amydo/.openclaw-autoclaw/workspace/.cluster/expert-playbook.md　(2026-09-19 15:35)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.opencode/config.json　(2026-09-19 15:32)
- C:/Users/amydo/.openclaw-autoclaw/workspace/config/mcporter.json　(2026-09-19 15:32)
### D:/ZCODE/IG運營（0 個）
（今日無異動）
### D:/ZCODE/兒童YT頻道（0 個）
（今日無異動）

## 4. 目前儀表板狀態（更新前）
- guru｜股流Radar｜stage=Active｜progress=58％｜next=把架構規格寫進產品
- poker｜Poker Trainer｜stage=MVP｜progress=18％｜next=確認第一個訓練循環
- ig-car｜中古車選品師 IG｜stage=Explore｜progress=15％｜next=設定顯示名稱／Bio／專業帳號／兩步驗證，產出首波 9 篇 Carousel
- ig-travel｜旅遊選品師 IG｜stage=Idea｜progress=8％｜next=建立 IG 帳號（travel.curator_chris）並製作卡通地圖頭貼
- yt-kids｜神仙童萌會（YT）｜stage=Idea｜progress=8％｜next=確認關公／媽祖去留並填全書大綱，再接第 1 集腳本（三太子×情緒管理）
- 其他：ideas=2 tasks=26 notes=10 goals=6 timeline=10
