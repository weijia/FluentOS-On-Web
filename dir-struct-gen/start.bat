@echo off
cd /d "%~dp0"

REM =========================================================================
REM  Start the local server for Dir Struct Generator (node serve.js).
REM
REM  Node resolution strategy (priority order):
REM   1. Primary: `where node` (cmd-native). Whenever node is on PATH this
REM      returns its FULL path; we use that absolute path so execution never
REM      depends on PATH again and we avoid the old bug where NODE_BIN ended up
REM      as the bare name "node".
REM   2. Fallback: resolve-node.ps1 - used only when node is not on PATH at all
REM      (e.g. a double-clicked cmd with an fnm-only setup). It scans fnm's
REM      install dir and falls back to Get-Command / where.exe.
REM
REM  NOTE: keep all echo text free of parentheses. Inside a parenthesized
REM  block cmd treats a closing ) in echo text as the end of the block, which
REM  breaks parsing. The error branch below uses goto to avoid that entirely.
REM =========================================================================

set "NODE_BIN="

REM --- 1. Primary: where node (capture the full path of the first match) ---
for /f "delims=" %%i in ('where node 2^>nul') do (
    if not defined NODE_BIN set "NODE_BIN=%%i"
)

REM --- 2. Fallback: powershell resolver (node not on PATH) ---
if not defined NODE_BIN (
    for /f "delims=" %%i in ('powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0resolve-node.ps1"') do set "NODE_BIN=%%i"
)

if not defined NODE_BIN goto :nonode

echo Using Node: %NODE_BIN%
echo.
echo Starting Dir Struct Generator: http://localhost:8000/
echo The browser opens automatically once the server is ready, or open the URL manually.
echo Press Ctrl+C in this window to stop the server.
echo.

REM Open the browser once the server responds. Runs in a HIDDEN window so the
REM user only sees the single server window. It self-exits after the server is
REM up or after a timeout.
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0wait-for-server.ps1"

"%NODE_BIN%" serve.js

REM These lines only run if serve.js exits (e.g. port already in use).
echo.
echo Server stopped. If you saw "port already in use", a previous instance is still
echo running - just open http://localhost:8000/ , or close the earlier window and retry.
echo.
pause
goto :eof

:nonode
echo.
echo Node.js not found.
echo   - If you use fnm, install a version with:  fnm install
echo     then set it as default with:  fnm default VERSION  , and retry.
echo   - Or install Node.js and make sure it is on PATH.
echo.
pause
exit /b 1
