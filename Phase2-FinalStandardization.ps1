# Phase2-FinalStandardization.ps1
# Axiom Architect: Force-Aligning Production Pipeline

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: EXECUTING FINAL GAUNTLET ALIGNMENT..." -ForegroundColor Cyan

# 1. Ensure we are on 'main' and it has the latest Phase 2 code
Write-Host ">>> [1/3] Aligning local branches..." -ForegroundColor Yellow
git checkout -B main

# 2. Add and Commit all Phase 2 files (Ensuring White UI is included)
Write-Host ">>> [2/3] Staging Phase 2 assets..." -ForegroundColor Yellow
git add .
git commit -m "ARCHITECT: Phase 2 Final Production Alignment (White UI)" --allow-empty

# 3. Force Push to GitHub Main
# This guarantees Vercel sees the new code as the 'Production' state
Write-Host ">>> [3/3] Overwriting GitHub Production Branch..." -ForegroundColor Yellow
git push origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: PRODUCTION PIPELINE REALIGNED." -ForegroundColor Green
    Write-Host ">>> VERCEL IS NOW BUILDING THE WHITE UI ENGINE."
    Write-Host "--------------------------------------------------------"
}
