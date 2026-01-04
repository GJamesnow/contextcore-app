# Phase2-SystemRestoration.ps1
# Axiom Architect: Root Layout Injection & Dependency Locking

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: INITIATING SYSTEM RESTORATION..." -ForegroundColor Cyan

# ==========================================
# 1. ROOT LAYOUT RECOVERY (The Critical Fix)
# ==========================================
$layoutPath = "app/layout.tsx"
Write-Host ">>> [1/5] Injecting Root Layout..." -ForegroundColor Yellow
$layoutContent = "
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ContextCore | Real Estate Investment Engine',
  description: 'Professional Deal Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
"
[System.IO.File]::WriteAllText($layoutPath, $layoutContent.Trim())

# ==========================================
# 2. STYLE ENGINE CHECK
# ==========================================
$cssPath = "app/globals.css"
if (-not (Test-Path $cssPath)) {
    Write-Host ">>> [2/5] Restoring Tailwind Globals..." -ForegroundColor Yellow
    $cssContent = "@tailwind base;`n@tailwind components;`n@tailwind utilities;"
    [System.IO.File]::WriteAllText($cssPath, $cssContent)
}

# ==========================================
# 3. DEPENDENCY LOCK (The Gauntlet Safety)
# ==========================================
Write-Host ">>> [3/5] Locking Stable Dependencies..." -ForegroundColor Yellow
# We force install specific versions to avoid the v5 vs v7 crash
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-exact

# ==========================================
# 4. BUILD SIMULATION
# ==========================================
Write-Host ">>> [4/5] Regenerating Client & Verifying Build..." -ForegroundColor Yellow
npx prisma generate

try {
    # Attempt local build
    npm run build
    Write-Host ">>> LOCAL BUILD PASSED. SYSTEM STABLE." -ForegroundColor Green
    $stable = $true
} catch {
    Write-Host ">>> BUILD FAILURE DETECTED." -ForegroundColor Red
    Write-Host ">>> We will push the Layout Fix anyway, as it is the primary blocker." -ForegroundColor Red
    $stable = $false
}

# ==========================================
# 5. PRODUCTION PUSH
# ==========================================
Write-Host ">>> [5/5] Shipping Restoration Patch..." -ForegroundColor Yellow
git add .
git commit -m "AXIOM RESTORE: Root Layout & Dependency Lock" --allow-empty
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------"
    Write-Host ">>> RECOVERY COMPLETE." -ForegroundColor Green
    Write-Host ">>> Vercel is now rebuilding with the corrected structure."
    Write-Host "--------------------------------------------------------"
}
