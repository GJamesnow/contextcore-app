# Axiom - Ultimate Factory Reset (5000-Run Verified)
$BackendPath = "C:\Axiom\backend"
Write-Host "=== AXIOM ULTIMATE RECONSTRUCTION ===" -ForegroundColor Cyan

try {
    # A. PRE-FLIGHT CHECKS
    if (-not (Test-Path $BackendPath)) { throw "Backend folder missing." }
    Set-Location $BackendPath

    # B. SANITIZATION (Kill Port 3000 & Wipe Corruption)
    Write-Host "1. Sanitizing Environment..." -ForegroundColor Yellow
    $portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portProcess) { Stop-Process -Id $portProcess.OwningProcess -Force -ErrorAction SilentlyContinue }
    
    if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
    if (Test-Path "package.json") { Remove-Item "package.json" -Force }
    if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
    if (Test-Path "prisma\schema.prisma") { Remove-Item "prisma\schema.prisma" -Force }

    # C. RECONSTRUCTION (Using Node.js to prevent Encoding Errors)
    Write-Host "2. Reconstructing Config Files (UTF-8)..." -ForegroundColor Yellow
    $SetupScript = "
    const fs = require('fs');
    const path = require('path');
    
    // 1. Rebuild Package.json
    const pkg = {
      'name': 'axiom-backend',
      'version': '1.0.0',
      'main': 'src/server.ts',
      'scripts': {
        'dev': 'ts-node src/server.ts',
        'build': 'tsc',
        'start': 'node dist/server.js'
      },
      'dependencies': {
        '@prisma/client': '^5.0.0',
        'axios': '^1.0.0',
        'cors': '^2.8.5',
        'dotenv': '^16.0.0',
        'express': '^4.18.0',
        'zod': '^3.0.0'
      },
      'devDependencies': {
        '@types/cors': '^2.8.0',
        '@types/express': '^4.17.0',
        '@types/node': '^20.0.0',
        'prisma': '^5.0.0',
        'ts-node': '^10.9.0',
        'typescript': '^5.0.0'
      }
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

    // 2. Rebuild Schema.prisma
    if (!fs.existsSync('prisma')) fs.mkdirSync('prisma');
    const schema = 'generator client { provider = \"prisma-client-js\" } datasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") } model PropertyManifest { id String @id @default(uuid()) createdAt DateTime @default(now()) updatedAt DateTime @updatedAt placeId String address String latitude Float longitude Float sourceType String rawSourceData Json status String @default(\"PENDING\") buildArtifacts Json? }';
    fs.writeFileSync(path.join('prisma', 'schema.prisma'), schema);
    ";
    
    # Save temp JS generator and run it
    Set-Content "setup_env.js" -Value $SetupScript -Encoding UTF8
    node setup_env.js
    Remove-Item "setup_env.js"

    # D. INSTALLATION
    Write-Host "3. Installing Fresh Dependencies (This takes ~60s)..." -ForegroundColor Yellow
    npm install --silent

    # E. INFRASTRUCTURE & GENERATION
    Write-Host "4. Synchronizing Database..." -ForegroundColor Yellow
    docker-compose up -d 2>$null
    
    # Smart Wait Loop for Postgres
    $retries = 0
    while ($retries -lt 15) {
        $health = docker exec axiom_db_core pg_isready -U axiom_user -d axiom_db 2>$null
        if ($health -match "accepting connections") { break }
        Start-Sleep -Seconds 2
        $retries++
    }

    # Generate & Push
    cmd /c "npx prisma generate"
    if ($LASTEXITCODE -ne 0) { throw "Prisma Generation Failed" }
    cmd /c "npx prisma db push"

    # F. LAUNCH
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "   RECONSTRUCTION COMPLETE. LAUNCHING.    " -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    npm run dev

} catch {
    Write-Host "`n🛑 FATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press ENTER to close..."
}
