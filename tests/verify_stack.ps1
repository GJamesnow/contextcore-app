Write-Host ">>> AXIOM: INITIATING HEALTH PROBE..." -ForegroundColor Cyan

# A. HEALTH CHECK
try {
     = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -ErrorAction Stop
    Write-Host "   [PASS] Health Probe: ONLINE ($(.status))" -ForegroundColor Green
} catch {
    Write-Error "   [FAIL] Backend Unreachable. Is 'npm run dev' running?"
}

# B. INGESTION TEST (POST)
# Simulating a coordinate near the anchor (New York) to trigger 'HOT' status
 = @{
    latitude = 40.7128
    longitude = -74.0060
    source = "AXIOM_PROBE_01"
} | ConvertTo-Json

try {
    Write-Host "   Sending Telemetry Payload..." -ForegroundColor DarkGray
     = Invoke-RestMethod -Uri "http://localhost:3001/api/ingest" -Method Post -Body  -ContentType "application/json"
    
    if (.status -eq "HOT") {
        Write-Host "   [PASS] Ingestion Logic: ACCURATE (Score: $(.marketScore))" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Ingestion Logic: UNEXPECTED STATUS ($(.status))" -ForegroundColor Yellow
    }
} catch {
    Write-Error "   [FAIL] Ingestion Endpoint Failed: "
}

# C. RETRIEVAL TEST (GET)
try {
     = Invoke-RestMethod -Uri "http://localhost:3001/api/latest?limit=1" -Method Get
    if (.Count -gt 0) {
        Write-Host "   [PASS] Database Retrieval: SUCCESS (ID: $([0].id))" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Database Retrieval: EMPTY" -ForegroundColor Red
    }
} catch {
    Write-Error "   [FAIL] Retrieval Endpoint Failed"
}

Write-Host ">>> VERIFICATION COMPLETE." -ForegroundColor Cyan