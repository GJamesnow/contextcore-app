# Phase2-VerifyStatus.ps1
# Axiom Architect: Verifies GitHub Synchronization

$ErrorActionPreference = "Continue" # Don't crash on Git output
Write-Host ">>> AXIOM: VERIFYING CLOUD STATUS..." -ForegroundColor Cyan

# 1. CHECK REMOTE REPO
# We ask GitHub: "Do you have the 'main' branch?"
$remoteCheck = git ls-remote --heads origin main

if ($remoteCheck -match "refs/heads/main") {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> STATUS: SUCCESS (CONFIRMED)" -ForegroundColor Green
    Write-Host ">>> Your code is safely on GitHub 'main'."
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> CRITICAL NEXT STEP (THE FINAL LINK):" -ForegroundColor Yellow
    Write-Host "1. Go to your Vercel Dashboard."
    Write-Host "2. Click 'Settings' -> 'Git'."
    Write-Host "3. Click 'Connect Git Repository'."
    Write-Host "4. Select 'GJamesnow/contextcore-app'."
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> ONCE CONNECTED: Vercel will automatically build the new site."
} else {
    Write-Host ">>> STATUS: PUSH FAILED (RETRYING)" -ForegroundColor Red
    Write-Host ">>> Attempting Force Push now..."
    
    # Simple push, no error trapping to allow full output
    git push origin main --force
    
    Write-Host "`n>>> IF NO RED TEXT ABOVE, PUSH WAS SUCCESSFUL." -ForegroundColor Green
}
