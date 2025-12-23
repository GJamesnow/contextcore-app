# PROJECT AXIOM: VERTICAL SLICE (PHASE 1)

## Status
- **Frontend:** Next.js (Port 3000)
- **Backend:** Node/Express/TS (Port 3001)
- **Database:** PostgreSQL (Port 5433)
- **Launch System:** Automated via 'launch_axiom.ps1'

## How to Restart
1. Open PowerShell in this folder.
2. Run: '.\launch_axiom.ps1'
3. The system will auto-repair and launch.

## Architecture
- **Ingestion:** /api/ingest (POST)
- **Retrieval:** /api/latest (GET)
- **Visualization:** Dashboard polls every 1s.