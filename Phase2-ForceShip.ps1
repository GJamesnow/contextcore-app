# Phase2-ForceShip.ps1
# Axiom Architect: Synchronizes Local Codebase with Cloud Production

$ErrorActionPreference = "Stop"

Write-Host ">>> AXIOM: INITIATING UPLOAD TO CLOUD..." -ForegroundColor Cyan

# 1. STAGE ALL CHANGES
# This grabs the new White UI, Maps Integration, and Prisma Schema
Write-Host ">>> [1/3] Staging Phase 2 Files..." -ForegroundColor Yellow
git add .

# 2. COMMIT
# We timestamp this to ensure the server sees it as a new event
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Phase 2 Deployment: Geospatial Engine ($timestamp)"
Write-Host ">>> [2/3] Committing: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg

# 3. PUSH
Write-Host ">>> [3/3] Pushing to GitHub (Triggering Vercel)..." -ForegroundColor Yellow
$pushOutput = git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: CODE HAS LEFT YOUR COMPUTER." -ForegroundColor Green
    Write-Host ">>> VERCEL IS NOW RECEIVING THE UPDATE."
    Write-Host "--------------------------------------------------------"
    Write-Host "NEXT STEPS:"
    Write-Host "1. Go to your Vercel Dashboard."
    Write-Host "2. Watch the top deployment change from 'Ready' to 'Building' (Blue)."
    Write-Host "3. When it turns Green, refresh your live URL."
} else {
    Write-Error "UPLOAD FAILED. Git Error Details:`n$pushOutput"
}
