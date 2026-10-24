@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8000/
  node serve.js
  pause
) else (
  where fnm >nul 2>nul
  if %errorlevel%==0 (
    start "" http://localhost:8000/
    fnm use && node serve.js
    pause
  ) else (
    echo Node.js not found. Install Node via fnm or add node to PATH.
    pause
  )
)
