@echo off
cd /d "D:\ZCODE\±M®×»ö¿öª©\nora-workspace"
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
  start "Polaris Server" /min cmd /c "npm run dev"
  timeout /t 4 /nobreak >nul
)
start "" "http://127.0.0.1:8080/"
