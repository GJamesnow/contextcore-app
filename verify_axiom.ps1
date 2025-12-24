# ==============================================================================
# AXIOM: SYSTEM INTEGRITY VERIFIER
# GOAL: Validate Logic, Data, and Handoff State from ANY location.
# ==============================================================================

$ErrorActionPreference = "SilentlyContinue" 
$TargetDir = "C:\Axiom"
$ApiUrl = "http://localhost:3001/api"

Write-Host ">>> AXIOM: STARTING INTEGRITY CHECK..." -ForegroundColor Cyan

# 1. CONNECTIVITY CHECK
Write-Host ">>> [1/3] CHECKING CONNECTION..." -ForegroundColor Yellow
try {
    $Status = Invoke-RestMethod -Uri "$ApiUrl/latest?limit=1" -Method Get -ErrorAction Stop
    Write-Host "   [API] Backend is ONLINE (Port 3001)." -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Backend is OFFLINE." -ForegroundColor Red
    Write-Host "   CRITICAL: Run '.\launch_axiom.ps1' inside C:\Axiom first." -ForegroundColor Red
    exit
}

# 2. LOGIC STRESS TEST
Write-Host "`n>>> [2/3] VERIFYING GEOSPATIAL LOGIC..." -ForegroundColor Yellow
function Test-Geo ($Name, $Lat, $Lng, $Expected) {
    $Payload = @{ latitude = $Lat; longitude = $Lng; source = "VERIFY_BOT" } | ConvertTo-Json
    try {
        $Resp = Invoke-RestMethod -Uri "$ApiUrl/ingest" -Method Post -Body $Payload -ContentType "application/json"
        if ($Resp.status -eq $Expected) {
            Write-Host "   [PASS] $Name -> $($Resp.status) (Score: $($Resp.marketScore))" -ForegroundColor Green
        } else {
            Write-Host "   [FAIL] $Name -> Expected $Expected, got $($Resp.status)" -ForegroundColor Red
        }
    } catch { Write-Host "   [FAIL] $Name -> API Error" -ForegroundColor Red }
}

Test-Geo "NYC (Target)"      40.7128 -74.0060 "HOT"
Test-Geo "London (Cold)"     51.5074 -0.1278  "MONITOR"
Test-Geo "Philly (Nearby)"   39.9526 -75.1652 "MONITOR"

# 3. HANDOFF & PERSISTENCE
Write-Host "`n>>> [3/3] VERIFYING SYSTEM STATE..." -ForegroundColor Yellow
if (Test-Path "$TargetDir\AI_HANDOFF.md") {
    $Date = (Get-Item "$TargetDir\AI_HANDOFF.md").LastWriteTime
    Write-Host "   [PASS] AI_HANDOFF.md found (Saved: $Date)" -ForegroundColor Green
} else {
    Write-Host "   [WARN] AI_HANDOFF.md is MISSING." -ForegroundColor Red
}

try {
    $Count = (Invoke-RestMethod -Uri "$ApiUrl/latest?limit=100" -Method Get).length
    Write-Host "   [DB]   Current Log Count: $Count" -ForegroundColor Cyan
} catch { Write-Host "   [FAIL] Could not read database stats." -ForegroundColor Red }

Write-Host "`n>>> DIAGNOSTIC COMPLETE." -ForegroundColor Cyan