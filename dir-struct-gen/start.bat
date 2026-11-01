@echo off
cd /d "%~dp0"

REM =========================================================================
REM  启动 Dir Struct Generator 的本地服务器（node serve.js）。
REM
REM  Node 解析策略（按优先级，互不触发 fnm 下载，避免联网卡死）：
REM    1) 若已装 fnm：用 `fnm which node` 直接拿到「真实 node.exe 路径」，
REM       绕开 fnm shim，绝不触发下载/联网等待。
REM    2) 否则退回 `where node`：直接测它能否运行。
REM    3) 都没有 -> 明确报错并 pause，而不是静默退出。
REM =========================================================================

set "NODE_BIN="

REM --- 1) 优先用 fnm 解析真实 node 路径 ---
where fnm >nul 2>nul
if %errorlevel%==0 (
  for /f "usebackq delims=" %%i in (`fnm which node 2^>nul`) do (
    if exist "%%i" set "NODE_BIN=%%i"
  )
)

REM --- 2) 退回 PATH 上的 node，并验证它真的能跑 ---
if not defined NODE_BIN (
  where node >nul 2>nul
  if %errorlevel%==0 (
    node -e "process.exit(0)" >nul 2>nul
    if %errorlevel%==0 set "NODE_BIN=node"
  )
)

REM --- 3) 都没找到 ---
if not defined NODE_BIN (
  echo.
  echo Node.js 未找到。请安装 Node.js（或 fnm）并确保它在 PATH 中，
  echo 或本机默认 fnm 版本未安装（用 `fnm install` 安装后再试）。
  echo.
  pause
  exit /b 1
)

echo 使用 Node: %NODE_BIN%
echo.
echo 正在启动 Dir Struct Generator ( http://localhost:8000/ )
echo 服务器就绪后浏览器会自动打开；也可手动访问上面的地址。
echo 在本窗口按 Ctrl+C 可停止服务器。
echo.

REM --- 服务器就绪后自动打开浏览器（最多等 30 秒）---
start "" powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){ try { (Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing -TimeoutSec 1).StatusCode; $ok=$true; break } catch {} Start-Sleep -Seconds 1 }; if($ok){ Start-Process http://localhost:8000/ } else { Write-Host 'Server did not start in time - open http://localhost:8000/ manually.' }"

"%NODE_BIN%" serve.js

REM 下面这行只在 serve.js 异常退出（例如端口被占用）时才会执行到；
REM 正常运行时 node 会一直阻塞，不会到这里。
echo.
echo 服务器已停止。如果上面提示“端口已被占用”，说明上一次启动仍在运行，
echo 直接打开 http://localhost:8000/ 即可，或先关掉之前的命令行窗口再重试。
echo.
pause
