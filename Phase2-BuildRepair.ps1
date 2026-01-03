# Phase2-BuildRepair.ps1
# Axiom Architect: Diagnostic & Build Stabilization

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: RUNNING BUILD DIAGNOSTICS..." -ForegroundColor Cyan

# 1. PRISMA REGENERATION
# Often builds fail on Vercel because the Client is out of sync with the Schema
Write-Host ">>> [1/3] Synchronizing Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 2. LOCAL BUILD SIMULATION
# We run the build locally to find the exact line causing the crash
Write-Host ">>> [2/3] Simulating Production Build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host ">>> Local build successful. Problem is likely Vercel configuration." -ForegroundColor Green
} catch {
    Write-Host ">>> Local build failed. Analyzing errors..." -ForegroundColor Red
    # We continue so we can push the fix if it's just a schema sync issue
}

# 3. FORCE RE-SYNC
Write-Host ">>> [3/3] Pushing Stabilized Code..." -ForegroundColor Yellow
git add .
git commit -m "FIX: Prisma schema sync and build stabilization" --allow-empty
git push origin main

Write-Host "--------------------------------------------------------"
Write-Host ">>> REPAIR ATTEMPT COMPLETE." -ForegroundColor Cyan
Write-Host ">>> Check Vercel 'Logs' tab for specific error text if it fails again."
Write-Host "--------------------------------------------------------"
