# =============================================================================
# AXIOM ARCHITECT: AUTOMATED RECOVERY SCRIPT
# =============================================================================
$ErrorActionPreference = 'Stop'
$RootPath = Get-Location

Write-Host '>>> WIPING FRONTEND...' -ForegroundColor Red
docker compose down --volumes --remove-orphans 2>$null
Remove-Item -Path src, public, .next, node_modules, package.json, tsconfig.json, Dockerfile, docker-compose.yml -Recurse -Force -ErrorAction SilentlyContinue

Write-Host '>>> GENERATING NEW FILES...' -ForegroundColor Green
New-Item -Path src/app, src/components, public -ItemType Directory -Force | Out-Null

# FILES
$Pkg = @{
    name='axiom'; version='4.0.0'; private=$true; scripts=@{dev='next dev'; build='next build'; start='next start'}
    dependencies=@{next='14.1.0'; react='^18'; 'react-dom'='^18'; leaflet='^1.9.4'; 'react-leaflet'='^4.2.1'; 'lucide-react'='^0.300.0'}
    devDependencies=@{typescript='^5'; '@types/node'='^20'; '@types/react'='^18'; tailwindcss='^3.3.0'; postcss='^8'; autoprefixer='^10.0.1'}
} | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText((Join-Path $RootPath 'package.json'), $Pkg, [Text.Encoding]::UTF8)

[IO.File]::WriteAllText((Join-Path $RootPath 'tsconfig.json'), '{ "compilerOptions": { "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true, "strict": true, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler", "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve", "incremental": true, "plugins": [{ "name": "next" }], "paths": { "@/*": ["./src/*"] } }, "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], "exclude": ["node_modules"] }', [Text.Encoding]::UTF8)
[IO.File]::WriteAllText((Join-Path $RootPath 'tailwind.config.ts'), 'import type { Config } from "tailwindcss"; const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { axiom: { bg: "#09090b", panel: "#18181b", primary: "#3b82f6" } } } }, plugins: [] }; export default config;', [Text.Encoding]::UTF8)
[IO.File]::WriteAllText((Join-Path $RootPath 'postcss.config.js'), 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {}, }, }', [Text.Encoding]::UTF8)

# APP CODE
[IO.File]::WriteAllText((Join-Path $RootPath 'src/app/globals.css'), '@tailwind base; @tailwind components; @tailwind utilities; .leaflet-container { width: 100%; height: 100%; z-index: 10; background: #18181b; } body { background: #09090b; color: white; }', [Text.Encoding]::UTF8)

$Map = '
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
export default function AxiomMap() { return ( <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full rounded-lg"> <TileLayer attribution="&copy; OSM" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" /> <Marker position={[51.505, -0.09]}><Popup>Axiom Node</Popup></Marker> </MapContainer> ); }
'
[IO.File]::WriteAllText((Join-Path $RootPath 'src/components/AxiomMap.tsx'), $Map.Trim(), [Text.Encoding]::UTF8)

$Page = '
"use client";
import dynamic from "next/dynamic";
import { Server } from "lucide-react";
const AxiomMap = dynamic(() => import("@/components/AxiomMap"), { ssr: false, loading: () => <p>Loading...</p> });
export default function Home() { return ( <main className="flex h-screen flex-col p-4 gap-4 bg-axiom-bg text-white"> <header className="flex justify-between border-b border-gray-800 pb-4"> <h1 className="text-xl font-bold text-axiom-primary">AXIOM // PHASE 4</h1> <div className="flex gap-4 text-sm font-mono"><span className="flex items-center gap-2"><Server size={14}/> SYSTEM: ONLINE</span></div> </header> <div className="flex-1 bg-axiom-panel border border-gray-800 rounded-lg overflow-hidden relative"> <AxiomMap /> </div> </main> ); }
'
[IO.File]::WriteAllText((Join-Path $RootPath 'src/app/page.tsx'), $Page.Trim(), [Text.Encoding]::UTF8)
[IO.File]::WriteAllText((Join-Path $RootPath 'src/app/layout.tsx'), 'import type { Metadata } from "next"; import { Inter } from "next/font/google"; import "./globals.css"; const inter = Inter({ subsets: ["latin"] }); export const metadata: Metadata = { title: "Axiom" }; export default function RootLayout({ children }: { children: React.ReactNode }) { return ( <html lang="en"> <body className={inter.className}>{children}</body> </html> ); }', [Text.Encoding]::UTF8)

# DOCKER
[IO.File]::WriteAllText((Join-Path $RootPath '.dockerignore'), "node_modules
.next
.git", [Text.Encoding]::UTF8)

$Dockerfile = '
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
'
[IO.File]::WriteAllText((Join-Path $RootPath 'Dockerfile'), $Dockerfile.Trim(), [Text.Encoding]::UTF8)

$Compose = '
services:
  db:
    image: postgres:15-alpine
    container_name: axiom_db
    environment: { POSTGRES_USER: user, POSTGRES_PASSWORD: password, POSTGRES_DB: axiom }
    volumes: [ "postgres_data:/var/lib/postgresql/data" ]
  backend:
    build: ./backend
    container_name: axiom_backend
    ports: ["3001:3001"]
    environment: { DATABASE_URL: postgres://user:password@db:5432/axiom }
    depends_on: [db]
  frontend:
    build: .
    container_name: axiom_frontend
    ports: ["3000:3000"]
    depends_on: [backend]
volumes: { postgres_data: }
'
[IO.File]::WriteAllText((Join-Path $RootPath 'docker-compose.yml'), $Compose.Trim(), [Text.Encoding]::UTF8)

Write-Host ">>> RECOVERY FILE 'Fix-Axiom.ps1' CREATED." -ForegroundColor Cyan
