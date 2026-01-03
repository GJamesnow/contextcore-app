# Phase2-LinkRemote.ps1
# Axiom Architect: Re-establishes Connection to GitHub

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: REMOTE RECOVERY PROTOCOL..." -ForegroundColor Cyan

# 1. CHECK CURRENT STATUS
$currentRemote = git remote -v 2>&1
if ($currentRemote -match "origin") {
    Write-Host ">>> Origin currently points to:" -ForegroundColor Gray
    Write-Host $currentRemote
    Write-Host ">>> We will overwrite this to ensure correctness." -ForegroundColor Yellow
} else {
    Write-Host ">>> No remote 'origin' detected." -ForegroundColor Red
}

# 2. INPUT REQUEST
Write-Host ""
Write-Host ">>> ACTION REQUIRED: PASTE YOUR GITHUB REPO URL BELOW" -ForegroundColor Cyan
Write-Host "    (Example: https://github.com/username/project-axiom.git)" -ForegroundColor Gray
$repoUrl = Read-Host ">>> URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Error "CRITICAL: No URL provided. Aborting."
}

# 3. FIX REMOTE
# We try to remove it first (in case it exists but is broken/wrong), then add it fresh.
try { git remote remove origin 2>$null } catch {}

Write-Host ">>> Linking to: $repoUrl" -ForegroundColor Yellow
git remote add origin $repoUrl

# 4. PUSH MASTER
Write-Host ">>> Pushing 'master' branch to new origin..." -ForegroundColor Yellow
# -u sets the upstream so future pushes are just 'git push'
$pushOutput = git push -u origin master 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: CONNECTION RESTORED & CODE SHIPPED." -ForegroundColor Green
    Write-Host ">>> VERCEL WILL NOW DETECT THE COMMIT AND BUILD PHASE 2."
    Write-Host "--------------------------------------------------------"
} else {
    Write-Host "PUSH FAILED. Review error below:" -ForegroundColor Red
    Write-Host $pushOutput
}
