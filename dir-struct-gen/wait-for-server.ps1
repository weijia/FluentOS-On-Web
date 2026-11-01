# Polls http://localhost:8000 until it responds with HTTP 200, then opens the browser.
$uri = 'http://localhost:8000/'
$ok = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 1
        if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch {}
    Start-Sleep -Seconds 1
}
if ($ok) {
    Start-Process $uri
} else {
    Write-Host 'Server did not start in time - open http://localhost:8000/ manually.'
}
