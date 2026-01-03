$ErrorActionPreference = "Stop"
$apiUrl = "http://localhost:3001/api/logs"

function New-AxiomLog {
    param (
        [string]$Source,
        [double]$Lat,
        [double]$Lng,
        [string]$Message
    )
    $payload = @{
        source  = $Source
        lat     = $Lat
        lng     = $Lng
        message = $Message
    } | ConvertTo-Json -Compress

    try {
        $null = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $payload -ContentType "application/json"
        Write-Host " -> OK: $Source" -ForegroundColor Green
    }
    catch {
        Write-Host " -> FAIL: $Source (Is Backend running on Port 3001?)" -ForegroundColor Red
    }
}

# TEST 1: PRECISION SEED (5 NODES)
Write-Host "
>>> TEST 1: PRECISION SEED (5 NODES) <<<" -ForegroundColor Cyan
$precisionData = @(
    @{ s="Omicron-HQ"; lat=51.0890; lng=-115.3590; msg="Canmore Base: Signal Strong" },
    @{ s="Alpha-YYC";  lat=51.0447; lng=-114.0719; msg="Calgary HQ: Sync Active" },
    @{ s="Xi-Banff";   lat=51.1784; lng=-115.5708; msg="Banff Gate: Low Voltage" },
    @{ s="Sigma-Ghost";lat=51.2500; lng=-114.5000; msg="Ghost Lake: Anomaly" },
    @{ s="K-Country";  lat=50.9000; lng=-115.1000; msg="Kananaskis: Unit Online" }
)
foreach ($node in $precisionData) {
    New-AxiomLog -Source $node.s -Lat $node.lat -Lng $node.lng -Message $node.msg
}

# TEST 2: LOAD GENERATION (100 NODES)
Write-Host "
>>> TEST 2: LOAD TEST (100 NODES) <<<" -ForegroundColor Cyan
$baseLat = 51.08; $baseLng = -115.35
for ($i = 1; $i -le 100; $i++) {
    $latOffset = (Get-Random -Minimum -20 -Maximum 20) / 100.0
    $lngOffset = (Get-Random -Minimum -20 -Maximum 20) / 100.0
    New-AxiomLog -Source "LoadBot-$i" -Lat ($baseLat + $latOffset) -Lng ($baseLng + $lngOffset) -Message "Stress Test Packet #$i"
}
Write-Host "
Done." -ForegroundColor Gray
