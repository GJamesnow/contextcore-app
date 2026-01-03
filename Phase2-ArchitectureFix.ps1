# Phase2-ArchitectureFix.ps1
# Axiom Architect: Standardizes Branching & Pushes "Main"

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: RUNNING GAUNTLET STANDARDIZATION..." -ForegroundColor Cyan

# 1. RENAME MASTER TO MAIN
# This aligns your project with modern CI/CD standards
$currentBranch = git branch --show-current
if ($currentBranch -eq "master") {
    Write-Host ">>> Renaming 'master' to 'main'..." -ForegroundColor Yellow
    git branch -m master main
}

# 2. PUSH MAIN
# We force push to ensure the remote GitHub repo accepts the new structure
Write-Host ">>> Pushing 'main' to GitHub..." -ForegroundColor Yellow
git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: REPOSITORY STANDARDIZED." -ForegroundColor Green
    Write-Host "--------------------------------------------------------"
    
    # 3. OPEN VERCEL DASHBOARD (User Action Required)
    # We cannot automate the "Click" inside Vercel, but we can take you to the exact door.
    Write-Host ">>> OPENING VERCEL SETTINGS..." -ForegroundColor Cyan
    Start-Process "https://vercel.com/dashboard"
} else {
    Write-Error "Migration failed. Check Git output above."
}
