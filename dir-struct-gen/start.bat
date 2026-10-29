@echo off
cd /d "%~dp0"

REM --- locate a usable node: try the PATH one first, fall back to fnm ---
set "NODE_CMD="

where node >nul 2>nul
if %errorlevel%==0 goto :try_direct_node

where fnm >nul 2>nul
if %errorlevel%==0 goto :try_fnm

goto :no_node

:try_direct_node
REM A node binary is on PATH, but it may be an fnm shim that has no
REM FNM_* env vars yet (double-clicked cmd is a fresh session), so verify
REM it actually runs before using it.
node -e "process.exit(0)" >nul 2>nul
if %errorlevel%==0 goto :use_direct
REM Direct node unusable, fall back to fnm if present.
where fnm >nul 2>nul
if %errorlevel%==0 goto :try_fnm
goto :no_node

:use_direct
set "NODE_CMD=node"
goto :serve

:try_fnm
REM `fnm use` needs FNM_* environment variables (injected by `fnm env` in the
REM shell profile). In a fresh cmd they are missing, so inject them now:
REM `fnm env` prints one `SET ...` line per variable; `call` applies each one
REM to this session. After that, `node` resolves to fnm's current version.
for /f "usebackq delims=" %%i in (`fnm env`) do call %%i
where node >nul 2>nul
if not %errorlevel%==0 goto :no_node
node -e "process.exit(0)" >nul 2>nul
if not %errorlevel%==0 goto :no_node
set "NODE_CMD=node"
goto :serve

:no_node
echo Node.js not found. Install Node.js (or fnm) and ensure it is in PATH.
pause
exit /b 1

:serve
echo Starting Dir Struct Generator at http://localhost:8000/
echo The browser will open automatically once the server is ready.
echo Press Ctrl+C in this window to stop the server.
echo.

REM --- open browser automatically once the server is accepting connections ---
start "" powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){ try { (Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing -TimeoutSec 1).StatusCode; $ok=$true; break } catch {} Start-Sleep -Seconds 1 }; if($ok){ Start-Process http://localhost:8000/ } else { Write-Host 'Server did not start in time - open http://localhost:8000/ manually.' }"

%NODE_CMD% serve.js
