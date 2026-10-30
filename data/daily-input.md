# 北極星 自動收集輸入（給 AI 讀）
> 產生時間：2026-10-31 02:53　範圍：最近 3 天
> 用途：AI 讀完後，把各專案濃縮成「一行方向＋進度」，寫進 daily-brief.txt 或 worklog。

## 0. 北極星收件匣（其他 AI 交辦；資料夾：D:/ZCODE/北極星收件匣）
### ai-workspace-2026-10-29.md（2026-10-30 09:04）　🆕 未註冊的新專案 → 請在 daily-brief 寫一行：ai-workspace: <進度>% | <摘要> | <下一步> | name=<名稱> | stage=<階段>（儀表板會自動新增）
# AIOS 每日清收巡檢 2026-10-29

- 逾期 INBOX：cloud-kit-wenshin-20261011.zip（10-11）、cloud-kit-yt-kids-20261011.zip（10-11）
- 交接停滯：正常（最後一筆 2026-10-28，jiuqu）
- 停滯專案列（>14 天且非暫停／完成）：poker、ig-car、ig-travel、yt-kids、guru、wenshin、polaris、ai-workspace
- 未停滯：jiuqu（10-28）、ai-creative-hub（10-16，13 天）

建議動作：
- 兩個 cloud-kit zip 已置 INBOX 18 天：確認對應專案（wenshin／yt-kids）是否已匯入，是則移出或歸檔 02_KNOWLEDGE
- guru 主力推進（55%）但「最近更新」卡 09-17：下次動手時同步更新該列日期
- polaris／ai-workspace 若無實際變化，在 INDEX 標「無變更」或降為週更，避免每次巡檢都報停滯
- 明日 09:00 loop 自動重跑，同日期報告直接覆寫


## 1. Git commit（自動）
### 股流Radar（guru）
（近期無 commit）
- ⚠ 咻揪趣（jiuqu）找不到 repo：C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp

## 2. 來源工作檔／企劃（讀取重點）
### 進度總覽（跨專案總表）（all）
- 檔案：`D:/ZCODE/專案儀錶版/polaris-dashboard/進度總覽.md`
- 最後修改：2026-10-07 23:55
- 章節：
```
# 進度總覽
## 一、專案總表
## 二、各專案明細
### 股流Radar（`guru`）— Active 55%
### 中古車選品師 IG（`ig-car`）— Explore 15%
### 旅遊選品師 IG（`ig-travel`）— Idea 8%
### 神仙童萌會 YT（`yt-kids`）— MVP 40%　★目前重心
### Poker Trainer（`poker`）— MVP 18%
### 咻揪趣（`jiuqu`）— MVP 60%
## 三、目標（Goals）
## 四、跨專案待辦／雜項
## 五、更新紀錄
## 六、怎麼用（收工流程）
```

- ⚠ 中古車選品師 IG（ig-car）找不到：D:/ZCODE/IG運營/中古車選品師IG.md
- ⚠ 旅遊選品師 IG（ig-travel）找不到：D:/ZCODE/IG運營/旅遊選品師IG.md
- ⚠ IG 進度總覽（ig-all）找不到：D:/ZCODE/IG運營/進度總覽.md
### 神仙童萌會 YT（yt-kids）
- 檔案：`D:/ZCODE/兒童YT頻道/企劃規劃/上架企劃-S1-13週週更規劃-2026-09-30.md`
- 最後修改：2026-10-25 23:31
- 章節：
```
# 《神仙童萌會》S1 上架企劃 v3——13 週 × 每週 2 正片（全季 27 集）
## 一、每週上架節奏（「2–3 集」的落地方式）
## 二、S1 全季 26 集總表（★＝新寫 14 集）
## 三、計分器改制（隨 27 集擴編）
## 四、開播前衝刺與門檻（2 集/週版）
## 五、讓頻道「看起來很齊」
## 六、題材續航（「題材會不會用完？」的答案）
## 七、風險與備案
## 八、開播前檢查清單
```

- ⚠ 咻揪趣 README（jiuqu）找不到：C:/Users/amydo/.openclaw-autoclaw/workspace/projects/mapsync-mvp/README.md
## 3. 今日（2026-10-31 起）有異動的檔案
### workspace（3 個）
- C:/Users/amydo/.openclaw-autoclaw/workspace/.cluster/expert-playbook.md　(2026-10-31 02:49)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.opencode/config.json　(2026-10-31 02:45)
- C:/Users/amydo/.openclaw-autoclaw/workspace/config/mcporter.json　(2026-10-31 02:45)
### D:/ZCODE/IG運營（0 個）
（今日無異動）
### D:/ZCODE/兒童YT頻道（0 個）
（今日無異動）

## 4. 目前儀表板狀態（更新前）
- guru｜股流Radar｜stage=Active｜progress=72％｜next=用回補腳本補齊 10/2、10/5 行情／法人（連同籌碼空窗）；持續觀察排程＋補跑穩定；驗收後把凱基即時行情從 PoC 接成正式資料源
- poker｜Poker Trainer｜stage=MVP｜progress=18％｜next=確認第一個訓練循環
- ig-car｜中古車選品師 IG｜stage=Explore｜progress=20％｜next=審〈買車痛點篇〉8 張樣卡 → 60 篇規格轉 spec＋批次出圖；完成帳號設定（顯示名稱、Bio、頭貼、專業帳號、2FA）＋裝 OpenCLI 擴充；60 篇排程依開跑日重排
- ig-travel｜旅遊選品師 IG｜stage=Idea｜progress=35％｜next=先確認帳號五步設定是否完成；完成後照 13 週排程開跑第 1 週（01／02／07）
- yt-kids｜神仙童萌會（YT）｜stage=MVP｜progress=40％｜next=角色試稿收斂→定稿（三視圖定稿、主視覺 v2）；續推未驗收項（通路門面、TTS 首批 7 集、A 版第 1 集）；開播後兩週內補齊 B 版 12 集音檔
- jiuqu｜咻揪趣｜stage=MVP｜progress=60％｜next=選定主機平台＋網域即可部署上線（部署後跑 preflight＋smoke）；可選配 LLM／Places 金鑰提升解析；LINE 登入待填 Channel Secret
- 其他：ideas=2 tasks=36 notes=13 goals=6 timeline=13
