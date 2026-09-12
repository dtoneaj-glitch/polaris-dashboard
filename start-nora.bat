@echo off
cd /d "D:\ZCODE\專案儀錶版\nora-workspace"
echo Starting Nora Workspace...
start "" cmd /c "npm run dev && pause"
timeout /t 3 >nul
start "" http://127.0.0.1:8080
echo Nora is starting on port 8080
