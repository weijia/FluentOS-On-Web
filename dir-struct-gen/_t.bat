@echo off
echo START
start "" powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 3;$i++){ try { (Invoke-WebRequest -Uri http://localhost:1/ -UseBasicParsing -TimeoutSec 1).StatusCode; $ok=$true; break } catch {} Start-Sleep -Seconds 1 }; if($ok){ Write-Host OK } else { Write-Host 'NO' }"
echo END
