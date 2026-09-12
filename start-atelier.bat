@echo off
cd /d "D:\ZCODE\專案儀錶版\儀錶板grok-workspace"
echo Starting Atelier...
start "" cmd /c "npx vite dev --host 0.0.0.0 --port 3000 && pause"
timeout /t 3 >nul
start "" http://127.0.0.1:3000
echo Atelier is starting on port 3000
