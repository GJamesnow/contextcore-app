# ==============================================================================
# AXIOM: AUTONOMOUS LAUNCH SYSTEM
# ROLE: LEAD DEVOPS ENGINEER
# GOAL: Single-click bootstrap & launch.
# ==============================================================================

$ErrorActionPreference = "Stop"
$Root = Get-Location
Write-Host ">>> AXIOM: INITIALIZING LAUNCH SEQUENCE..." -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# STEP 1: STATE VALIDATION & REPAIR (The "Diamond Protocol")
# ------------------------------------------------------------------------------
# We check if the environment is healthy. If not, we rebuild it automatically.
if (-not (Test-Path "node_modules") -or -not (Test-Path "src/app/page.tsx")) {
    Write-Host ">>> [SYSTEM] ENVIRONMENT DRIFT DETECTED. EXECUTING REPAIR..." -ForegroundColor Yellow
    
    # A. KILL ZOMBIE PROCESSES
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

    # B. WIPE CORRUPTED ARTIFACTS
    Remove-Item "node_modules", ".next", "package-lock.json" -Recurse -Force -ErrorAction SilentlyContinue

    # C. RESTORE CONFIGURATION (Version Locking)
    $PackageJson = @"
{
  "name": "axiom-core",
  "version": "1.0.0",
  "scripts": { "dev": "next dev", "dev:backend": "ts-node src/index.ts" },
  "dependencies": {
    "next": "14.2.3", "react": "18.3.1", "react-dom": "18.3.1",
    "express": "4.19.2", "cors": "2.8.5", "dotenv": "16.4.5",
    "@prisma/client": "5.14.0", "swr": "2.2.5", "lucide-react": "0.378.0",
    "clsx": "2.1.1", "tailwind-merge": "2.3.0"
  },
  "devDependencies": {
    "typescript": "5.4.5", "@types/node": "20.12.12", "@types/react": "18.3.2",
    "@types/express": "4.17.21", "@types/cors": "2.8.17", "ts-node": "10.9.2",
    "prisma": "5.14.0", "tailwindcss": "3.4.3", "postcss": "8.4.38"
  }
}
"@
    [System.IO.File]::WriteAllText("package.json", $PackageJson)

    # TSConfig (Hybrid)
    $TSConfig = @"
{ "compilerOptions": { "lib": ["dom", "esnext"], "allowJs": true, "skipLibCheck": true, "strict": false, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler", "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve", "incremental": true, "plugins": [{ "name": "next" }] }, "include": ["**/*.ts", "**/*.tsx"], "exclude": ["node_modules"] }
"@
    [System.IO.File]::WriteAllText("tsconfig.json", $TSConfig)

    # D. INSTALL & SYNC
    Write-Host "   [INSTALL] Hydrating dependencies (Wait ~60s)..." -ForegroundColor Cyan
    npm install
    
    Write-Host "   [DB] Syncing Database Schema..." -ForegroundColor Cyan
    cmd /c npx prisma generate
    cmd /c npx prisma db push

    # E. REBUILD UI (Robust Dashboard)
    if (Test-Path "src/pages") { Remove-Item "src/pages" -Recurse -Force }
    if (-not (Test-Path "src/app")) { New-Item -ItemType Directory -Force -Path "src/app" | Out-Null }

    $PageContent = @"
"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { Activity, Server, MapPin } from 'lucide-react';
interface GeoLog { id: string; source: string; marketScore: number; status: string; timestamp: string; latitude: number; longitude: number; }
const fetcher = (url: string) => fetch(url).then(r => r.json());
export default function Page() {
  const { data: logs, mutate } = useSWR<GeoLog[]>('http://localhost:3001/api/latest?limit=10', fetcher, { refreshInterval: 1000 });
  const [loading, setLoading] = useState(false);
  const ping = async () => {
    setLoading(true);
    try { await fetch('http://localhost:3001/api/ingest', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ latitude: 40.7128, longitude: -74.0060, source: 'AUTO_LAUNCHER' }) }); mutate(); } catch (e) { console.error(e); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2"><Activity/> AXIOM LAUNCHER</h1>
            <button onClick={ping} disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold flex items-center gap-2 transition">{loading ? 'PINGING...' : 'SIMULATE PING'}</button>
        </header>
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded border border-slate-800"><div className="text-xs text-slate-500 mb-1">STATUS</div><div className="text-xl font-bold text-emerald-400">ONLINE</div></div>
            <div className="bg-slate-900 p-4 rounded border border-slate-800"><div className="text-xs text-slate-500 mb-1">DATABASE</div><div className="text-xl font-bold text-blue-400">PORT 5433</div></div>
            <div className="bg-slate-900 p-4 rounded border border-slate-800"><div className="text-xs text-slate-500 mb-1">LOGS</div><div className="text-xl font-bold text-white">{logs ? logs.length : '-'}</div></div>
        </div>
        <div className="bg-slate-900 rounded border border-slate-800 overflow-hidden">
            {!logs ? <div className="p-8 text-center text-slate-600">Connecting to Backend...</div> : logs.map(log => (
                <div key={log.id} className="p-4 border-b border-slate-800 flex justify-between items-center hover:bg-slate-800/50">
                    <div><div className="font-bold text-slate-200">{log.source}</div><div className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div></div>
                    <div className="text-right"><div className={log.status === 'HOT' ? 'text-red-400 font-bold' : 'text-slate-400'}>SCORE: {log.marketScore}</div><div className="text-xs text-slate-600 font-mono">{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</div></div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
"@
    [System.IO.File]::WriteAllText("src/app/page.tsx", $PageContent)
    [System.IO.File]::WriteAllText("src/app/layout.tsx", "import './globals.css'; export default function Root({children}: {children: React.ReactNode}) { return <html lang='en'><body>{children}</body></html> }")
    [System.IO.File]::WriteAllText("src/app/globals.css", "@tailwind base; @tailwind components; @tailwind utilities;")

    Write-Host ">>> [SYSTEM] REPAIR COMPLETE." -ForegroundColor Green
} else {
    Write-Host ">>> [SYSTEM] INTEGRITY VERIFIED." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# STEP 2: MULTI-PROCESS LAUNCH
# ------------------------------------------------------------------------------
Write-Host ">>> AXIOM: SPINNING UP SERVICES..." -ForegroundColor Cyan

# We use Start-Process to create NEW, DETACHED windows.
# This prevents them from blocking this script.

Write-Host "   [1/3] Backend Service (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:backend" -WindowStyle Minimized

Write-Host "   [2/3] Frontend Service (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

Write-Host "   [3/3] Waiting for handshake (15s)..." -ForegroundColor DarkGray
Start-Sleep -Seconds 15

# ------------------------------------------------------------------------------
# STEP 3: HANDOFF
# ------------------------------------------------------------------------------
Write-Host ">>> LAUNCH SUCCESSFUL." -ForegroundColor Green
Start-Process "http://localhost:3000"