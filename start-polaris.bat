@echo off
rem Polaris (bei ji xing) dashboard launcher - path independent
cd /d "%~dp0"
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
  start "Polaris Server" /min cmd /c "npm run dev"
  timeout /t 4 /nobreak >nul
)
start "" "http://127.0.0.1:8080/"
