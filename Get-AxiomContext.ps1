Write-Host "=== AXIOM: GENERATING CONTEXT SNAPSHOT ===" -ForegroundColor Cyan

$Root = "C:\Axiom\backend"
$Out = "SYSTEM OVERRIDE: SESSION RESTORE`n"
$Out += "DATE: $(Get-Date)`n"
$Out += ">>> PROJECT ANATOMY <<<`n"

# 1. Capture Dependency State
if (Test-Path "$Root\package.json") {
    $Pkg = Get-Content "$Root\package.json" | ConvertFrom-Json
    $Out += "DEPENDENCIES: $($Pkg.dependencies.PSObject.Properties.Name -join ', ' )`n"
}

# 2. Capture Database Schema (The Truth)
if (Test-Path "$Root\prisma\schema.prisma") {
    $Schema = Get-Content "$Root\prisma\schema.prisma" -Raw
    $Out += "`n>>> CURRENT DB SCHEMA <<<`n$Schema`n"
}

# 3. Capture Critical Logic Files (Truth Engine)
$CriticalFiles = @(
    "src\index.ts",
    "src\modules\ingestion\services\GeoService.ts",
    "src\routes\api.ts"
)

foreach ($File in $CriticalFiles) {
    if (Test-Path "$Root\$File") {
        $Content = Get-Content "$Root\$File" -Raw
        $Out += "`n>>> FILE: $File <<<`n$Content`n"
    }
}

# 4. Copy to Clipboard
Set-Clipboard -Value $Out
Write-Host " SNAPSHOT COPIED TO CLIPBOARD." -ForegroundColor Green
Write-Host "   (Action: Go to your Custom Gem and press Paste)" -ForegroundColor Gray