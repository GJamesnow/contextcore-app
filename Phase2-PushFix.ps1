# Phase2-PushFix.ps1
# Axiom Architect: Fixes Branch Mismatch and Pushes Code

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: RESOLVING BRANCH TARGETING ERROR..." -ForegroundColor Cyan

# 1. IDENTIFY BRANCH
# The error logs confirmed you are on "master".
$branch = "master"
Write-Host ">>> Detected Local Branch: $branch" -ForegroundColor Gray

# 2. PUSH MASTER
Write-Host ">>> Pushing local '$branch' to remote..." -ForegroundColor Yellow
# We redirect error stream to output to capture details if it fails
$pushOutput = git push origin $branch 2>&1

# Check result
if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: CODE SHIPPED TO REMOTE '$branch'." -ForegroundColor Green
    Write-Host ">>> VERCEL TRIGGER: This will likely create a PREVIEW deployment."
    Write-Host "--------------------------------------------------------"
    Write-Host "NEXT STEPS:"
    Write-Host "1. Check Vercel Dashboard."
    Write-Host "2. You will see a new deployment for branch 'master'."
    Write-Host "3. Open THAT deployment to see the Phase 2 White UI."
} else {
    Write-Host "PUSH FAILED. Details below:" -ForegroundColor Red
    Write-Host $pushOutput
}
