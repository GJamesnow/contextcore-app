# Axiom - Ingestion Verification
$Uri = "http://localhost:3000/api/ingest/geo"
Write-Host "=== AXIOM INGESTION TEST ===" -ForegroundColor Cyan

$Payload = @{
    placeId       = "AXIOM-ALPHA-001"
    address       = "101 Cybernetics Blvd, Neo Tokyo"
    latitude      = 35.6895
    longitude     = 139.6917
    sourceType    = "CLI_TEST"
    rawSourceData = @{ verifiedBy = "System Architect"; priority = "High" }
} | ConvertTo-Json -Depth 5

try {
    Write-Host "Sending Data to $Uri..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $Uri -Method Post -Body $Payload -ContentType "application/json"
    
    if ($response.status -eq "PENDING" -or $response.id) {
        Write-Host "`n✅ SUCCESS: Data Ingested." -ForegroundColor Green
        Write-Host "   ID:     $($response.id)" -ForegroundColor Gray
        Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    } else {
        Write-Host "`n⚠️  Unexpected Response:" -ForegroundColor Yellow
        $response | Format-List
    }
} catch {
    Write-Host "`n🛑 FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Ensure the server window is still running." -ForegroundColor Gray
}
