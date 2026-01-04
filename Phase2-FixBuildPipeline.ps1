# Phase2-FixBuildPipeline.ps1
# Axiom Architect: Injects Post-Install Hooks to Fix Vercel Builds

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: REPAIRING DEPLOYMENT PIPELINE..." -ForegroundColor Cyan

# 1. MODIFY PACKAGE.JSON
# We need to ensure "postinstall": "prisma generate" exists.
$pkgPath = "package.json"
if (Test-Path $pkgPath) {
    $pkgJson = Get-Content $pkgPath -Raw | ConvertFrom-Json
    
    # Check if scripts object exists, create if not
    if (-not $pkgJson.scripts) { $pkgJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{} }
    
    # Check/Update postinstall
    if (-not $pkgJson.scripts.postinstall) {
        Write-Host ">>> [1/4] Injecting 'postinstall' script..." -ForegroundColor Yellow
        $pkgJson.scripts | Add-Member -MemberType NoteProperty -Name "postinstall" -Value "prisma generate"
    } else {
        Write-Host ">>> [1/4] 'postinstall' already exists. Updating to ensure Prisma runs..." -ForegroundColor Yellow
        $pkgJson.scripts.postinstall = "prisma generate"
    }

    # Save back to file (pretty printed)
    $pkgJson | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
} else {
    Write-Error "CRITICAL: package.json not found."
}

# 2. LOCAL VERIFICATION
# We run the exact sequence Vercel will run to prove it works.
Write-Host ">>> [2/4] running 'npm install' (Regenerating Lockfile)..." -ForegroundColor Yellow
npm install

Write-Host ">>> [3/4] running 'npm run build' (Local Simulation)..." -ForegroundColor Yellow
# We allow this to fail without crashing the script immediately so we can read the error
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host ">>> LOCAL BUILD SUCCESS." -ForegroundColor Green
        $buildPassed = $true
    } else {
        throw "Build Failed"
    }
} catch {
    Write-Host ">>> LOCAL BUILD FAILED." -ForegroundColor Red
    Write-Host ">>> REVIEW THE ERROR ABOVE. DO NOT PUSH UNTIL FIXED." -ForegroundColor Red
    $buildPassed = $false
}

# 3. PUSH IF SUCCESSFUL
if ($buildPassed) {
    Write-Host ">>> [4/4] pushing fix to Vercel..." -ForegroundColor Yellow
    git add .
    git commit -m "FIX: Add postinstall hook for Prisma generation" --allow-empty
    git push origin main
    
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> SUCCESS: REPAIR SHIPPED." -ForegroundColor Green
    Write-Host ">>> Vercel will now automatically regenerate Prisma before building."
    Write-Host "--------------------------------------------------------"
}
