# Axiom - Master System Bootloader
# Role: Senior Systems Architect
# Purpose: Completes the backend assembly (Server Entry Point) and launches the Dev Environment.

$BackendRoot = "C:\Axiom\backend"

Write-Host "=== Axiom 10x Boot Sequence ===" -ForegroundColor Cyan

# 1. Validation: Ensure Environment Exists
if (-not (Test-Path $BackendRoot)) {
    Write-Error "CRITICAL: Backend root not found."
    exit 1
}

Push-Location $BackendRoot

# 2. THE MISSING LINK: Create server.ts (Entry Point)
# This wires the GeoController to an actual HTTP Route
$ServerCode = @'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GeoController } from './modules/ingestion/controllers/GeoController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Controllers
const geoController = new GeoController();

// Routes
// We bind the method explicitly to preserve 'this' context
app.post('/api/ingest/geo', (req, res) => geoController.ingestLocation(req, res));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 AXIOM SERVER RUNNING ON PORT ${PORT}`);
    console.log(`👉 Ingestion Endpoint: http://localhost:${PORT}/api/ingest/geo`);
    console.log(`👉 Health Check:       http://localhost:${PORT}/health\n`);
});
'@

$ServerPath = "$BackendRoot\src\server.ts"
if (-not (Test-Path $ServerPath)) {
    Set-Content -Path $ServerPath -Value $ServerCode -Encoding UTF8
    Write-Host "✅ Created missing Entry Point: src/server.ts" -ForegroundColor Green
}

# 3. CONFIGURATION: Update package.json scripts
# We need a reliable way to start the app using 'ts-node'
$PkgJsonPath = "$BackendRoot\package.json"
if (Test-Path $PkgJsonPath) {
    $pkg = Get-Content $PkgJsonPath -Raw | ConvertFrom-Json
    
    # Add/Overwrite scripts
    if (-not $pkg.scripts) { $pkg | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{} }
    
    $pkg.scripts | Add-Member -MemberType NoteProperty -Name "dev" -Value "ts-node src/server.ts" -Force
    $pkg.scripts | Add-Member -MemberType NoteProperty -Name "build" -Value "tsc" -Force
    $pkg.scripts | Add-Member -MemberType NoteProperty -Name "start" -Value "node dist/server.js" -Force
    
    $pkg | ConvertTo-Json -Depth 10 | Set-Content $PkgJsonPath
    Write-Host "✅ Updated package.json with startup scripts." -ForegroundColor Green
}

# 4. INFRASTRUCTURE: Ensure DB is Up
Write-Host "Checking Database Status..." -ForegroundColor Yellow
try {
    docker-compose up -d
    # Quick health wait
    Start-Sleep -Seconds 5 
} catch {
    Write-Error "Docker Error. Is Docker Desktop running?"
    exit 1
}

# 5. LAUNCH: Start the API Server
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "SYSTEM READY. Starting API Server..." -ForegroundColor Cyan
Write-Host "Keep this window OPEN. It is your Server Log." -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Cyan

# Run the dev server
npm run dev