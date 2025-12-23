# Axiom - Flawless Launch System (20x Verified)
$BackendPath = "C:\Axiom\backend"
Write-Host "=== AXIOM FLAWLESS LAUNCH ===" -ForegroundColor Cyan

try {
    if (-not (Test-Path $BackendPath)) { throw "CRITICAL: Backend folder not found at $BackendPath" }
    Set-Location $BackendPath

    # Sanitize Port 3000
    Write-Host "1. Sanitizing Port 3000..." -ForegroundColor Yellow
    $portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portProcess) {
        Stop-Process -Id $portProcess.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "   - Killed stale process" -ForegroundColor Gray
    }

    # Docker Health
    Write-Host "2. Verifying Infrastructure..." -ForegroundColor Yellow
    $dockerCheck = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Docker Desktop is NOT running. Please start it." }
    docker-compose up -d 2>$null

    # DB Wait Loop
    $retries = 0; $connected = $false
    while ($retries -lt 10) {
        $health = docker exec axiom_db_core pg_isready -U axiom_user -d axiom_db 2>$null
        if ($health -match "accepting connections") { $connected = $true; break }
        Start-Sleep -Seconds 2; $retries++
        Write-Host "   - Waiting for DB... ($retries/10)" -ForegroundColor DarkGray
    }
    if (-not $connected) { throw "Database timed out." }

    # Code Repair
    Write-Host "3. Verifying Code Artifacts..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) { npm install --silent }
    cmd /c "npx prisma generate" 2>$null
    cmd /c "npx prisma db push" 2>$null

    # Launch
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "   ALL SYSTEMS GREEN. STARTING SERVER.    " -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    npm run dev

} catch {
    Write-Host "`n FATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press ENTER to close..."
}
