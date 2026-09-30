# 北極星 自動收集輸入（給 AI 讀）
> 產生時間：2026-09-30 23:56　範圍：最近 3 天
> 用途：AI 讀完後，把各專案濃縮成「一行方向＋進度」，寫進 daily-brief.txt 或 worklog。

## 1. Git commit（自動）
### 股流Radar（guru）
```
9a0cddd | 2026-09-28 | fix(schedule): 排程改 S4U 登出也能執行; run-daily-archive.bat 修正退出碼(成功回 0 失敗回非 0)
d57035e | 2026-09-28 | feat: 新增回補腳本 scripts/backfill-history.ts、匯出 fetchTwseDailyByDate、修正上櫃漲跌幅未走 deriveChange 的不一致
9bc799f | 2026-09-28 | fix(taifex): findLatestTradingDate 改用回應內 Date（該端點忽略 date 參數），修正休市日被誤標有資料的問題（籌碼曾標成 09-28 休市日）
3a83b9b | 2026-09-28 | fix(schedule): register-daily-task.ps1 改為自建任務 XML 匯入（避免 MismatchedPSTypeName 與解析問題），確實套用 StartWhenAvailable/WakeToRun/允許電池
dbe9b2c | 2026-09-28 | fix(schedule): 排程可靠性 — 新增 register-daily-task.ps1(StartWhenAvailable 錯過補跑 / WakeToRun 喚醒 / 允許電池)，bat 改為薄包裝；避免電腦未開機時漏抓資料
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
## 3. 今日（2026-09-30 起）有異動的檔案
### workspace（4 個）
- C:/Users/amydo/.openclaw-autoclaw/workspace/.cluster/expert-playbook.md　(2026-09-30 12:34)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.opencode/config.json　(2026-09-30 12:31)
- C:/Users/amydo/.openclaw-autoclaw/workspace/autoclaw-support-letter-2026-09-30.md　(2026-09-30 01:14)
- C:/Users/amydo/.openclaw-autoclaw/workspace/config/mcporter.json　(2026-09-30 12:31)
### D:/ZCODE/IG運營（0 個）
（今日無異動）
### D:/ZCODE/兒童YT頻道（17 個）
- D:/ZCODE/兒童YT頻道/上架企劃-S1-13週週更規劃-2026-09-30.md　(2026-09-30 23:01)
- D:/ZCODE/兒童YT頻道/取題對照表-100課題-2026-09-21.md　(2026-09-30 23:02)
- D:/ZCODE/兒童YT頻道/口播稿-S1-第01章-火氣變成超能力-B版延長樣稿-2026-09-30.md　(2026-09-30 22:20)
- D:/ZCODE/兒童YT頻道/口播稿-S1-第03章-家是最安全的地方-單聲道示範-2026-09-30.md　(2026-09-30 18:28)
- D:/ZCODE/兒童YT頻道/口播稿-轉換規範-單聲道版.md　(2026-09-30 02:26)
- D:/ZCODE/兒童YT頻道/腳本-S1-序章初遇-定稿-工坊版-2026-09-22.md　(2026-09-30 16:15)
- D:/ZCODE/兒童YT頻道/腳本-S1-第01章-火氣變成超能力-定稿-2026-09-22.md　(2026-09-30 18:29)
- D:/ZCODE/兒童YT頻道/腳本-S1-第02章-不完美也可以-定稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第03章-家是最安全的地方-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第04章-把功課拆成小怪-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第05章-口袋裡的分享-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第06章-輸了可以再來-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第07章-專注的小魔法-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第08章-被看見的我-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第09章-求助不是軟弱-初稿-2026-09-23.md　(2026-09-30 22:19)
- D:/ZCODE/兒童YT頻道/腳本-S1-第10章-合作比搶贏更厲害-初稿-2026-09-23.md　(2026-09-30 18:28)
- D:/ZCODE/兒童YT頻道/腳本-S1-第11章-季終三神殿亮-初稿-2026-09-23.md　(2026-09-30 18:28)

## 4. 目前儀表板狀態（更新前）
- guru｜股流Radar｜stage=Active｜progress=70％｜next=確認排程連續數日自動入庫正常、補齊缺漏資料；驗收後把凱基即時行情從 PoC 接成正式資料源
- poker｜Poker Trainer｜stage=MVP｜progress=18％｜next=確認第一個訓練循環
- ig-car｜中古車選品師 IG｜stage=Explore｜progress=15％｜next=設定顯示名稱／Bio／專業帳號／兩步驗證，產出首波 9 篇 Carousel
- ig-travel｜旅遊選品師 IG｜stage=Idea｜progress=8％｜next=建立 IG 帳號（travel.curator_chris）並製作卡通地圖頭貼
- yt-kids｜神仙童萌會（YT）｜stage=Idea｜progress=28％｜next=把第 4–12 章初稿潤成定稿，NotebookLM 逐章內容審核後，進入配音錄製與角色定裝／分鏡
- 其他：ideas=2 tasks=26 notes=10 goals=6 timeline=10
