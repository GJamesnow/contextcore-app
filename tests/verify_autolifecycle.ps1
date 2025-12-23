# 1. SETUP: DEFINITIONS
$LogFile = ".\server_boot.log"
$Port = 3001
$MaxRetries = 20

function Get-ProcessOnPort($Port) {
    $TcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($TcpConnection) { return $TcpConnection.OwningProcess }
    return $null
}

Write-Host ">>> AXIOM: LIFECYCLE TEST INITIATED..." -ForegroundColor Cyan

# 2. START BACKEND
Write-Host "   [INIT] Booting Backend (npm run dev:backend)..." -ForegroundColor DarkGray
$Job = Start-Job -ScriptBlock { 
    Set-Location "C:\Axiom"
    npm run dev:backend > server_boot.log 2>&1 
}

# 3. HEALTH POLLING
Write-Host "   [WAIT] Awaiting Health Signal..." -NoNewline
$RetryCount = 0
$ServerUp = $false

while ($RetryCount -lt $MaxRetries) {
    try {
        $Res = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -Method Get -ErrorAction Stop
        if ($Res.status -eq "AXIOM_CORE_ONLINE") {
            $ServerUp = $true
            Write-Host " ONLINE!" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 2
        Write-Host "." -NoNewline
        $RetryCount++
    }
}

if (-not $ServerUp) {
    Stop-Job $Job
    Remove-Job $Job
    Write-Error "Backend failed to boot within timeout. Check server_boot.log."
}

# 4. EXECUTE LOGIC
Write-Host "
>>> RUNNING TEST SUITE..." -ForegroundColor Cyan

# A. INGESTION
try {
    $Payload = @{ latitude = 40.7128; longitude = -74.0060; source = "AUTO_LIFECYCLE_TEST" } | ConvertTo-Json
    $Response = Invoke-RestMethod -Uri "http://localhost:$Port/api/ingest" -Method Post -Body $Payload -ContentType "application/json"
    
    if ($Response.status -eq "HOT") {
        # Note: Double backticks used below to ensure literal interpretation in generated file
        Write-Host "   [PASS] Ingestion Logic (Score: $($Response.marketScore))" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Ingestion Logic Unexpected" -ForegroundColor Red
    }
} catch {
    Write-Error "   [FAIL] Ingestion Request: $($_.Exception.Message)"
}

# B. RETRIEVAL
try {
    $Logs = Invoke-RestMethod -Uri "http://localhost:$Port/api/latest?limit=1" -Method Get
    if ($Logs.Count -gt 0) {
        # CRITICAL FIX: Double escaping Logs to ensure it appears as $Logs in the file
        Write-Host "   [PASS] Database Retrieval (ID: $($Logs[0].id))" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Database Empty" -ForegroundColor Red
    }
} catch {
    Write-Error "   [FAIL] Retrieval Request: $($_.Exception.Message)"
}

# 5. TEARDOWN
Write-Host ">>> TEARDOWN..." -ForegroundColor Cyan
Stop-Job $Job
Remove-Job $Job
$NodePID = Get-ProcessOnPort $Port
if ($NodePID) { Stop-Process -Id $NodePID -Force; Write-Host "   [INFO] Port released." -ForegroundColor DarkGray }

Write-Host ">>> LIFECYCLE COMPLETE." -ForegroundColor Cyan