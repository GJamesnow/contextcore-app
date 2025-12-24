# ==============================================================================
# AXIOM: SMART DIAGNOSTIC TOOL
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"
$ApiUrl = "http://localhost:3001/api"
$Launcher = "C:\Axiom\launch_axiom.ps1"

Write-Host ">>> AXIOM: INTELLIGENT DIAGNOSTIC STARTED..." -ForegroundColor Cyan

# 1. AUTO-START SEQUENCE
# ------------------------------------------------------------------------------
Write-Host ">>> [1/3] CHECKING ENGINE STATUS..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "$ApiUrl/latest?limit=1" -Method Get -ErrorAction Stop
    Write-Host "   [STATUS] System is already ONLINE." -ForegroundColor Green
} catch {
    Write-Host "   [STATUS] System is OFFLINE. Initiating Launch Sequence..." -ForegroundColor Yellow
    
    if (Test-Path $Launcher) {
        Invoke-Expression $Launcher
        Write-Host "   [WAIT] Booting up (Waiting 15s)..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 15
    } else {
        Write-Error "CRITICAL: 'launch_axiom.ps1' not found. Cannot auto-start."
        exit
    }
}

# 2. WAIT FOR PULSE (Retry Loop)
# ------------------------------------------------------------------------------
$Retries = 0
do {
    try {
        $null = Invoke-RestMethod -Uri "$ApiUrl/latest?limit=1" -Method Get -ErrorAction Stop
        $Online = $true
    } catch {
        $Retries++
        Write-Host "   ...waiting for API heartbeat ($Retries/10)..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
        $Online = $false
    }
} until ($Online -or $Retries -ge 10)

if (-not $Online) { Write-Error "FATAL: System failed to start."; exit }

# 3. RUN VERIFICATION LOGIC
# ------------------------------------------------------------------------------
Write-Host "`n>>> [2/3] EXECUTING LOGIC TESTS..." -ForegroundColor Yellow

function Test-Geo ($Name, $Lat, $Lng, $Expected) {
    $Payload = @{ latitude = $Lat; longitude = $Lng; source = "SMART_VERIFY" } | ConvertTo-Json
    try {
        $Resp = Invoke-RestMethod -Uri "$ApiUrl/ingest" -Method Post -Body $Payload -ContentType "application/json"
        if ($Resp.status -eq $Expected) {
            Write-Host "   [PASS] $Name -> $($Resp.status)" -ForegroundColor Green
        } else {
            Write-Host "   [FAIL] $Name -> Expected $Expected" -ForegroundColor Red
        }
    } catch { Write-Host "   [FAIL] $Name -> API Error" -ForegroundColor Red }
}

Test-Geo "NYC (Hot Zone)"    40.7128 -74.0060 "HOT"
Test-Geo "London (Monitor)"  51.5074 -0.1278  "MONITOR"

# 4. HANDOFF CHECK
# ------------------------------------------------------------------------------
Write-Host "`n>>> [3/3] FINAL CHECKS..." -ForegroundColor Yellow
if (Test-Path "C:\Axiom\AI_HANDOFF.md") { Write-Host "   [PASS] AI_HANDOFF.md detected." -ForegroundColor Green }
else { Write-Host "   [WARN] AI_HANDOFF.md missing." -ForegroundColor Red }

Write-Host "`n>>> SYSTEM GREEN." -ForegroundColor Cyan