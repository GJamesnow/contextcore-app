# Phase2-AuthPush.ps1
# Axiom Architect: Interactive Push Protocol

Write-Host ">>> AXIOM: INITIATING UPLOAD..." -ForegroundColor Cyan
Write-Host ">>> PLEASE WATCH YOUR BROWSER FOR A GITHUB LOGIN PROMPT." -ForegroundColor Yellow
Write-Host ">>> (If a window pops up on your taskbar, click it!)" -ForegroundColor Yellow

# We run this directly to allow the popup to function correctly
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n>>> SUCCESS: CODE SHIPPED TO GITHUB." -ForegroundColor Green
    Write-Host ">>> GO TO VERCEL NOW. YOU WILL SEE A NEW DEPLOYMENT BUILDING." -ForegroundColor Cyan
} else {
    Write-Host "`n>>> PUSH FAILED." -ForegroundColor Red
    Write-Host ">>> If you saw 'non-fast-forward', we need to force push."
}
