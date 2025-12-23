<#
.SYNOPSIS
    AXIOM VISUAL IGNITION (UNIVERSAL)
    Builds the Visual Truth Layer and patches CORS.
.DESCRIPTION
    1. Locates Project Root dynamically.
    2. Patches Backend for Port 3000 Access.
    3. Installs Leaflet/Axios.
    4. Generates Visual Components (Native IO).
#>
$ErrorActionPreference = "Stop"

# --- 1. DYNAMIC ROOT LOCATION ---
function Get-ProjectRoot {
    $current = Get-Location
    # Look for the 'backend' and 'frontend' folders
    while ($current -ne $null) {
        if ((Test-Path (Join-Path $current "backend")) -and (Test-Path (Join-Path $current "frontend"))) {
            return $current.Path
        }
        $current = Split-Path $current -Parent
    }
    Write-Error "[FATAL] Could not locate Axiom Project Root. Ensure you are inside the project folder."
    exit
}

$RootPath = Get-ProjectRoot
$BackendPath = Join-Path $RootPath "backend"
$FrontendPath = Join-Path $RootPath "frontend"

Write-Host ">>> [AXIOM] PROJECT ROOT DETECTED: $RootPath" -ForegroundColor Cyan

# --- 2. BACKEND SECURITY PATCH (CORS) ---
Write-Host ">>> [SEC] Patching Backend CORS Policy..." -ForegroundColor Yellow
$AppTsPath = Join-Path $BackendPath "src\app.ts"
$AppTsContent = "
import express from 'express';
import cors from 'cors';
import { propertyRoutes } from './routes/propertyRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';

const app = express();

// AXIOM MIDDLEWARE
app.use(express.json());

// AXIOM STRICT CORS POLICY
// Explicitly allowing the Frontend Port 3000
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// ROUTES
app.use('/api/properties', propertyRoutes);
app.use('/api/analytics', analyticsRoutes);

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({ status: 'AXIOM CORE ONLINE', timestamp: new Date() });
});

export default app;
"
[System.IO.File]::WriteAllText($AppTsPath, $AppTsContent)
Write-Host "   + [PATCHED] src/app.ts" -ForegroundColor Gray


# --- 3. FRONTEND IGNITION ---
Write-Host ">>> [FRONTEND] Installing Visualization Engine..." -ForegroundColor Yellow
Push-Location $FrontendPath
# Install dependencies silently
if (-not (Test-Path "node_modules/leaflet")) {
    cmd /c "npm install leaflet react-leaflet axios"
    cmd /c "npm install -D @types/leaflet"
} else {
    Write-Host "   + [SKIP] Dependencies already installed." -ForegroundColor DarkGray
}

# DIRECTORY STRUCTURE (NATIVE IO)
$LibDir = Join-Path $FrontendPath "src\lib"
$MapDir = Join-Path $FrontendPath "src\components\Map"

if (-not (Test-Path $LibDir)) { New-Item -ItemType Directory -Force -Path $LibDir | Out-Null }
if (-not (Test-Path $MapDir)) { New-Item -ItemType Directory -Force -Path $MapDir | Out-Null }

# --- FILE A: API CLIENT (SINGLETON) ---
$ApiPath = Join-Path $LibDir "api.ts"
$ApiContent = "
import axios from 'axios';

// AXIOM TRUTH ENGINE CONNECTION
// Centralized configuration to prevent 'magic string' errors
const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Direct link to Backend Port 3001
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
"
[System.IO.File]::WriteAllText($ApiPath, $ApiContent)
Write-Host "   + [CREATED] src/lib/api.ts" -ForegroundColor Gray


# --- FILE B: HEATMAP COMPONENT (CLIENT SIDE) ---
$HeatmapPath = Join-Path $MapDir "Heatmap.tsx"
$HeatmapContent = "
'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface HeatmapPoint {
    id: number;
    lat: number;
    lng: number;
    score: number;
    address?: string;
}

const Heatmap = () => {
    const [points, setPoints] = useState<HeatmapPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('[AXIOM] Requesting Truth Data...');
                const response = await api.get('/analytics/heatmap');
                setPoints(response.data);
            } catch (error) {
                console.error('[AXIOM] Sync Failure:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // AXIOM COLOR CODING (Logic Layer v2)
    const getColor = (score: number) => {
        if (score >= 90) return '#10b981'; // Emerald (High Value)
        if (score >= 75) return '#f59e0b'; // Amber (Moderate)
        return '#ef4444'; // Red (Low Value)
    };

    // Default View: Edmonton/Stony Plain Corridor
    const defaultCenter: [number, number] = [53.5461, -113.4938];

    if (loading) return (
        <div className='flex items-center justify-center h-[600px] bg-slate-900 text-emerald-500 font-mono animate-pulse'>
            >>> AXIOM: SYNCING VISUALS...
        </div>
    );

    return (
        <MapContainer 
            center={defaultCenter} 
            zoom={11} 
            style={{ height: '600px', width: '100%', borderRadius: '12px', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href=""https://www.openstreetmap.org/copyright"">OpenStreetMap</a> contributors'
                url=""https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png""
            />
            {points.map((point) => (
                <CircleMarker
                    key={point.id}
                    center={[point.lat, point.lng]}
                    radius={10}
                    pathOptions={{ 
                        color: getColor(point.score),
                        fillColor: getColor(point.score),
                        fillOpacity: 0.7,
                        weight: 2
                    }}
                >
                    <Popup>
                        <div className=""p-2 font-sans min-w-[150px]"">
                            <strong className=""block text-lg border-b border-gray-200 mb-1"">Score: {point.score}</strong>
                            <span className=""text-gray-600 text-sm"">{point.address || 'Unknown Address'}</span>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default Heatmap;
"
[System.IO.File]::WriteAllText($HeatmapPath, $HeatmapContent)
Write-Host "   + [CREATED] src/components/Map/Heatmap.tsx" -ForegroundColor Gray


# --- FILE C: DYNAMIC WRAPPER (SSR ISOLATION) ---
$MapIndexPath = Join-Path $MapDir "index.tsx"
$MapIndexContent = "
'use client';

import dynamic from 'next/dynamic';

// DYNAMIC ISOLATION: Forces client-side render only
const AxiomMap = dynamic(() => import('./Heatmap'), {
    ssr: false,
    loading: () => <div className='h-[600px] bg-slate-800 animate-pulse rounded-xl'></div>
});

export default AxiomMap;
"
[System.IO.File]::WriteAllText($MapIndexPath, $MapIndexContent)
Write-Host "   + [CREATED] src/components/Map/index.tsx" -ForegroundColor Gray


# --- FILE D: DASHBOARD INTEGRATION ---
$PagePath = Join-Path $FrontendPath "src\app\page.tsx"
$PageContent = "
import AxiomMap from '../components/Map';

export default function Home() {
  return (
    <main className=""min-h-screen bg-slate-950 p-8 font-sans text-slate-200"">
      <div className=""max-w-7xl mx-auto space-y-8"">
        
        {/* HEADER */}
        <header className=""flex justify-between items-end border-b border-slate-800 pb-6"">
          <div>
            <h1 className=""text-5xl font-black text-white tracking-tighter"">AXIOM</h1>
            <p className=""text-emerald-500 font-mono text-sm mt-2"">/// VISUAL TRUTH LAYER v2.2</p>
          </div>
          <div className=""flex gap-4 font-mono text-xs"">
             <div className=""bg-slate-900 px-3 py-1 rounded border border-slate-800"">
                BACKEND: 3001
             </div>
             <div className=""bg-emerald-900/20 px-3 py-1 rounded border border-emerald-500/20 text-emerald-400"">
                STATUS: ONLINE
             </div>
          </div>
        </header>

        {/* ANALYTICS GRID */}
        <div className=""grid grid-cols-1 lg:grid-cols-4 gap-6"">
          
          {/* SIDEBAR */}
          <div className=""lg:col-span-1 space-y-4"">
            <div className=""bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm"">
                <h3 className=""text-slate-400 font-bold text-xs uppercase tracking-widest mb-4"">Live Metrics</h3>
                <div className=""space-y-6"">
                    <div>
                        <div className=""text-4xl font-light text-white"">LIVE</div>
                        <div className=""text-slate-500 text-sm"">Data Stream</div>
                    </div>
                    <div>
                        <div className=""text-4xl font-light text-emerald-400"">ACTIVE</div>
                        <div className=""text-slate-500 text-sm"">Truth Engine</div>
                    </div>
                </div>
            </div>
          </div>

          {/* MAIN MAP INTERFACE */}
          <div className=""lg:col-span-3"">
            <div className=""bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative"">
                <div className=""absolute top-4 right-4 z-10 bg-black/80 backdrop-blur text-xs px-3 py-1 rounded-full border border-white/10"">
                    Live Feed
                </div>
                <AxiomMap />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
"
[System.IO.File]::WriteAllText($PagePath, $PageContent)
Write-Host "   + [CREATED] src/app/page.tsx" -ForegroundColor Gray

Pop-Location
Write-Host ">>> [SUCCESS] Visual Truth Layer Ignited." -ForegroundColor Cyan