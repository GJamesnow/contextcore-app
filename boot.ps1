# AXIOM BOOTLOADER
# ==========================================
$ErrorActionPreference = "Stop"

Write-Host ">>> [1/3] VERIFYING DEPENDENCIES..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "    Installing NPM packages..." -ForegroundColor Yellow
    npm install
}

Write-Host ">>> [2/3] GENERATING PRISMA CLIENT..." -ForegroundColor Cyan
# This is the specific fix for your error
cmd /c npx prisma generate
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Prisma generation failed. Is Docker running?" 
}

Write-Host ">>> [3/3] LAUNCHING BACKEND..." -ForegroundColor Green
# We use cmd /c to ensure npx resolves correctly in all shell types
cmd /c npx ts-node src/index.ts