@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  Polaris daily report  (0 AI, local)
echo ============================================
echo.
echo [1/2] export current state snapshot
node scripts/export-state.js
echo.
echo [2/2] apply daily-brief.txt -^> worklog -^> updater -^> build -^> push
node scripts/daily-report.js
echo.
echo Done. Press any key to close.
pause >nul
