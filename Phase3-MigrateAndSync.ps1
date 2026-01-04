# Phase3-MigrateAndSync.ps1
# Axiom Architect: Database Evolution & Cloud Sync

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: INITIATING PHASE 3 MIGRATION..." -ForegroundColor Cyan

# 1. MIGRATE DATABASE (Neon)
# This sends the new schema to the cloud and creates the tables
Write-Host ">>> [1/3] Applying Schema to Cloud Database..." -ForegroundColor Yellow
# We use --name to label this event in the database history
npx prisma migrate dev --name phase3_financial_engine

# 2. GENERATE CLIENT
# This updates node_modules so VS Code and Next.js know about 'interestRate', 'rawSourceData', etc.
Write-Host ">>> [2/3] Regenerating Type Definitions..." -ForegroundColor Yellow
npx prisma generate

# 3. PUSH TO GITHUB
# We must save the new 'migration.sql' file that step 1 created
Write-Host ">>> [3/3] Syncing Architecture to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "PHASE 3: Financial Engine & Source of Truth Schema" --allow-empty
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: DATABASE UPGRADED." -ForegroundColor Green
    Write-Host ">>> The backend is now ready to accept Debt & Provenance data."
    Write-Host "--------------------------------------------------------"
}
