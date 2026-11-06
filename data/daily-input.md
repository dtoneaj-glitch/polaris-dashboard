# 北極星 自動收集輸入（給 AI 讀）
> 產生時間：2026-11-07 03:36　範圍：最近 3 天
> 用途：AI 讀完後，把各專案濃縮成「一行方向＋進度」，寫進 daily-brief.txt 或 worklog。

## 0. 北極星收件匣（其他 AI 交辦；資料夾：D:/ZCODE/北極星收件匣）
### ai-workspace-2026-11-04.md（2026-11-04 09:03）
# AIOS 每日清收巡檢 2026-11-04

- 逾期 INBOX：cloud-kit-wenshin-20261011.zip（10-11，24 天）、cloud-kit-yt-kids-20261011.zip（10-11，24 天）
- 交接停滯：正常但臨界 — 最後一筆 2026-10-28（jiuqu），今天剛好 7 天；11-05 起若無新筆即超閾值
- 停滯專案列（更新日 < 10-21 且非暫停／完成）：poker、ig-car、ig-travel、yt-kids、guru、wenshin、polaris、ai-workspace、ai-creative-hub
- 未停滯：jiuqu（10-28）

建議動作：
- 兩個 cloud-kit zip 已 24 天（連續第 2 日列名）：決定歸檔 02_KNOWLEDGE 或歸入對應專案入口，下 loop 起將標「連續 2 日未清」
- 今晚或明早補一筆 AI_HANDOFF（任意專案收工即可），避免 11-05 起交接停滯列名
- guru（主力推進 55%）卡 09-17 最久：優先更新該列「最近更新」與下一步

### polaris-2026-11-04.md（2026-11-04 09:05）　🆕 未註冊的新專案 → 請在 daily-brief 寫一行：polaris: <進度>% | <摘要> | <下一步> | name=<名稱> | stage=<階段>（儀表板會自動新增）
# 📝 Polaris 日報 2026-11-04

> 數據截止：11-03 無新工作紀錄（worklog 止於 10-31；交接紀錄止於 10-28；儀表板匯出 10-31 23:53 未變；daily-input 仍為 10-31 23:50 快照）。
> 下表進度＝10-31 快照現值，非 11-03 實際值。11-03 收件匣僅 2 筆程序紀錄：AIOS 09:00 巡檢（ai-workspace-2026-11-03.md）與昨日 Polaris 日報（polaris-2026-11-03.md）。

## 昨日（11-03）日報

| 專案 | 進度 | 昨日異動 | 下一步 |
|------|------|----------|--------|
| guru 股流Radar | 72% | 無紀錄 | 確認 10/2、10/5 行情／法人回補；觀察排程穩定；驗收後接凱基即時行情正式資料源 |
| poker Poker Trainer | 18% | 無紀錄 | 確認第一個訓練循環 |
| ig-car 中古車選品師 IG | 20% | 無紀錄 | 審 8 張樣卡 → 60 篇 spec＋批次出圖；帳號設定＋OpenCLI 擴充；60 篇排程重排 |
| ig-travel 旅遊選品師 IG | 40% | 無紀錄 | 完成五步設定＋刪 kelisi.travel 重複帳號＋裝 OpenCLI；完成後隔天起每天一篇，9 天補完九宮格 |
| yt-kids 神仙童萌會 YT | 45% | 無紀錄 | 母稿複審定稿 → TTS 首批 7 集 → A 版第 1 集；補頻道門面與上架素材 |
| jiuqu 咻揪趣 | 60% | 無紀錄 | 實測 `D:\ZCODE\咻揪趣\start.bat` → 選主機平台＋網域部署；可選配 LLM／Places 金鑰；LINE 待填 Channel Secret |
| ai-workspace AIOS | 30% | 11-03 09:00 AIOS 巡檢重跑，報告入匣（cloud-kit ×2 逾期 23 天、停滯 9 列） | 決定 cloud-kit zip 歸檔或歸專案；盤點停滯列改「暫停」；同步 guru 列日期 |

## 今天最值得先做三件（11-03 無新紀錄，擇取與昨日相同）

1. **jiuqu**：先實測 `start.bat`（http://127.0.0.1:8848）＋preflight，再選主機平台＋網域部署。理由：10-28 交接明列「搬遷後未實測、再按原計畫部署」為下一步，且是最近唯一有實際動作的專案。
2. **ig-travel**：完成帳號五步設定＋刪 kelisi.travel＋裝 OpenCLI 擴充。理由：next 明寫「設定完成後隔天起每天一篇」，是 9 天九宮格排程的唯一前置，一次做完即可開跑。
3. **yt-kids**：TTS 首批 7 集音檔（task-ytkids-8，截止 10-12）。理由：已逾兩週未動，開播門檻（序章＋A 版第 1 集＋音檔 7 集）全卡在這批音檔。

## 待確認

- **Polaris 自動收集器停擺**：`daily-input.md` 最後產生於 10-31 23:50，11-03／11-04 無新快照；`daily-report.bat` 亦未再執行 → 各專案若 11-03 有實際工作，目前全鏈路無處可查，需先修收集器。
- jiuqu 自動 git 收集器仍指舊路徑 `C:\Users\amydo\.openclaw-autoclaw\workspace\projects\mapsync-mvp`（10-28 已遷至 `D:\ZCODE\咻揪趣`）。
- `D:\ZCODE\IG運營\` 三份檔案缺失（10-31 收集即警報，至今未消）。
- cloud-kit-wenshin／cloud-kit-yt-kids 兩個 zip 逾期 23 天（11-03 巡檢建議：決定歸檔 02_KNOWLEDGE 或歸專案入口）。
- PROJECT_INDEX 停滯 9 列，guru 主力推進卻卡 09-17（巡檢建議：下次動手時同步該列日期）。


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
## 3. 今日（2026-11-07 起）有異動的檔案
### workspace（3 個）
- C:/Users/amydo/.openclaw-autoclaw/workspace/.cluster/expert-playbook.md　(2026-11-07 03:32)
- C:/Users/amydo/.openclaw-autoclaw/workspace/.opencode/config.json　(2026-11-07 03:30)
- C:/Users/amydo/.openclaw-autoclaw/workspace/config/mcporter.json　(2026-11-07 03:30)
### D:/ZCODE/IG運營（33 個）
- D:/ZCODE/IG運營/_notion/canva_B_p1.png　(2026-11-07 02:45)
- D:/ZCODE/IG運營/_tools/gen_gimi_final_01.py　(2026-11-07 03:24)
- D:/ZCODE/IG運營/_tools/gen_gimi_samples_01.py　(2026-11-07 02:46)
- D:/ZCODE/IG運營/_tools/gen_gimi_samples_01_v2.py　(2026-11-07 02:55)
- D:/ZCODE/IG運營/旅遊/三版內容檢驗-2026-11-07.html　(2026-11-07 01:58)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/brands/客里斯_七色.json　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市/s01_hook.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市/s02_opening.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市/s03_last_week.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市/s04_solo.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市/s05_rule.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市/s06_cta.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周一篇_下週跨縣市_2026-11-07.json　(2026-11-07 02:30)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s01_hook.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s02_north.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s03_north_central.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s04_central_south.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s05_south_east.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s06_east_islands.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆/s07_cta.png　(2026-11-07 02:35)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/周五篇_本周末行事曆_2026-11-07.json　(2026-11-07 02:30)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s01_hook.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s02_exhibit_1.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s03_exhibit_2.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s04_exhibit_3.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s05_exhibit_4.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s06_exhibit_5.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s07_exhibit_6.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s08_exhibit_7.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s09_exhibit_8.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展/s10_cta.png　(2026-11-07 02:34)
- D:/ZCODE/IG運營/旅遊/輪播_bearcarousel/月初篇_11月大展_2026-11.json　(2026-11-07 02:25)
- D:/ZCODE/IG運營/旅遊/週活動審閱-2026-11-06.html　(2026-11-07 01:50)
### D:/ZCODE/兒童YT頻道（0 個）
（今日無異動）

## 4. 目前儀表板狀態（更新前）
- guru｜股流Radar｜stage=Active｜progress=72％｜next=確認 10/2、10/5 行情／法人回補；持續觀察排程穩定；驗收後把凱基即時行情從 PoC 接成正式資料源
- poker｜Poker Trainer｜stage=MVP｜progress=18％｜next=確認第一個訓練循環
- ig-car｜中古車選品師 IG｜stage=Explore｜progress=20％｜next=審〈買車痛點篇〉8 張樣卡 → 60 篇規格轉 spec＋批次出圖；完成帳號設定（顯示名稱、Bio、頭貼、專業帳號、2FA）＋裝 OpenCLI 擴充；60 篇排程依開跑日重排
- ig-travel｜旅遊選品師 IG｜stage=Idea｜progress=40％｜next=完成五步設定＋刪重複帳號＋裝 OpenCLI 擴充；設定完成後隔天起每天一篇，9 天補完九宮格
- yt-kids｜神仙童萌會（YT）｜stage=MVP｜progress=45％｜next=母稿複審定稿→TTS 首批 7 集→A 版第 1 集；同步補頻道門面與上架素材
- jiuqu｜咻揪趣｜stage=MVP｜progress=60％｜next=選定主機平台＋網域即可部署上線（部署後跑 preflight＋smoke）；可選配 LLM／Places 金鑰提升解析；LINE 登入待填 Channel Secret
- ai-workspace｜AI 工作區（AIOS）｜stage=營運｜progress=30％｜next=確認 wenshin／yt-kids 的 cloud-kit 是否已匯入（是則移出 INBOX／歸檔 02_KNOWLEDGE）；停滯專案標「無變更」或降週更；同步 guru 的最近更新日期
- 其他：ideas=2 tasks=36 notes=13 goals=6 timeline=13
