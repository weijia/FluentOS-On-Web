# Resolves the absolute path to node.exe so start.bat does NOT depend on node
# being on PATH (fnm only injects node into a shell's PATH, so a double-clicked
# cmd.exe usually lacks it).
#
# We scan fnm's install directory on disk for the highest installed version.
# Verified fnm layout on Windows:
#   <FNM_DIR>/node-versions/<ver>/installation/node.exe   (current fnm)
#   <FNM_DIR>/node-versions/<ver>/installation/bin/node.exe
#   <FNM_DIR>/node-versions/<ver>/node.exe                (older layout)
#
# Prints the absolute path, or prints nothing if node could not be found.

$ErrorActionPreference = 'SilentlyContinue'

$candidates = @()

# Candidate fnm base directories.
$bases = @()
if ($env:FNM_DIR) { $bases += $env:FNM_DIR }
$bases += (Join-Path $env:APPDATA 'fnm')
$bases += (Join-Path $env:USERPROFILE '.fnm')
$bases += (Join-Path $env:LOCALAPPDATA 'fnm')

$relPatterns = @(
    'node-versions\*\installation\node.exe',
    'node-versions\*\installation\bin\node.exe',
    'node-versions\*\node.exe'
)

foreach ($base in $bases) {
    if (-not $base -or -not (Test-Path $base)) { continue }
    foreach ($rel in $relPatterns) {
        $pattern = Join-Path $base $rel
        $found = Get-ChildItem $pattern -ErrorAction SilentlyContinue
        if ($found) { $candidates += $found }
    }
}

# node on PATH (system install, or the WorkBuddy-managed node used in this sandbox).
$c = Get-Command node -ErrorAction SilentlyContinue
if ($c) { $candidates += (Get-Item $c.Source) }

# Last resort: where.exe node.
try {
    $lines = & where.exe node 2>$null
    if ($lines) {
        foreach ($ln in $lines) {
            $p = $ln.Trim()
            if ($p -and (Test-Path $p)) { $candidates += (Get-Item $p) }
        }
    }
} catch {}

if (-not $candidates) { exit 0 }

# Pick the highest version. Directory name like v24.16.0 -> compare (24.16.0).
$node = ($candidates | Sort-Object {
    try { [version]($_.Directory.Parent.Name -replace '^v', '') } catch { [version]'0.0.0' }
} -Descending | Select-Object -First 1).FullName

if ($node) { Write-Output $node }
