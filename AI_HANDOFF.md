# 🧬 PROJECT AXIOM: AI OPERATIONS MANUAL

## 1. OPERATIONAL PROTOCOLS (READ FIRST)
**Role:** You are the **Lead DevOps Engineer & System Architect** for Project Axiom.
**User Style:** The user prefers **Executable Solutions** over checklists. Do not say "Try this"; provide a script that *does* it.
**Philosophy:** "The Diamond Protocol" / "Clean Room". When in doubt, wipe the environment and rebuild. We do not patch leaks; we replace the pipe.
**Tone:** Professional, Authoritative, Autonomous. You are a partner, not a search engine.

## 2. THE WORKFLOW
1.  **Startup:** The system is launched via launch_axiom.ps1.
2.  **State Management:** We use version-locked package.json to prevent drift.
3.  **Troubleshooting:** If the system acts up, run the "Diamond Protocol" (wipe 
ode_modules and .next, re-install, re-launch).
4.  **Deployment:** Future deployments must maintain the specific port mapping (5433 for DB) established to avoid local conflicts.

## 3. SYSTEM ARCHITECTURE (PHASE 1 - VERTICAL SLICE)
- **Status:** COMPLETE. Data flows from API -> DB -> Dashboard.
- **Frontend:** Next.js 14 (App Router) @ Port 3000.
- **Backend:** Node.js / Express / TypeScript @ Port 3001.
- **Database:** PostgreSQL (Docker) @ Port 5433 (Mapped to 5432 internally).
- **Visualization:** Real-time Dashboard with "Simulate Ping" capability.

## 4. CRITICAL CONFIGURATIONS

### Package.json (The Truth)
\\\json
{
    "name": "axiom",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "directories": {
        "lib": "lib"
    },
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "dev:backend": "npx ts-node src/index.ts"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "type": "commonjs",
    "dependencies": {
        "@prisma/client": "^5.13.0",
        "clsx": "^2.1.1",
        "cors": "^2.8.5",
        "dotenv": "^17.2.3",
        "express": "^5.2.1",
        "lucide-react": "^0.562.0",
        "next": "^14.2.3",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "swr": "^2.3.8",
        "tailwind-merge": "^3.4.0"
    },
    "devDependencies": {
        "@types/cors": "^2.8.19",
        "@types/express": "^5.0.6",
        "@types/node": "^25.0.3",
        "@types/react": "^19.2.7",
        "@types/react-dom": "^19.2.3",
        "autoprefixer": "^10.4.19",
        "eslint": "^8.57.1",
        "eslint-config-next": "^14.2.3",
        "postcss": "^8.4.38",
        "prisma": "^5.13.0",
        "tailwindcss": "^3.4.1",
        "ts-node": "^10.9.2",
        "typescript": "^5.9.3"
    }
}

\\\

### Docker Compose (The Infrastructure)
\\\yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: axiom_db
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: axiom_user
      POSTGRES_PASSWORD: secure_password_123
      POSTGRES_DB: axiom_core
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
\\\

### Prisma Schema (The Data)
\\\prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model GeoLog {
  id          String   @id @default(uuid())
  latitude    Float
  longitude   Float
  source      String?
  marketScore Float    @default(0)
  status      String   @default("PENDING")
  timestamp   DateTime @default(now())

  @@index([timestamp])
  @@index([marketScore])
}
\\\

## 5. HISTORICAL CONTEXT (LORE)
- **The Port 5432 Conflict:** We moved Postgres to Port 5433 to bypass a phantom local Postgres instance on the user's machine.
- **The Frontend Drift:** We migrated from a confused src/pages vs src/app structure to a clean, strict src/app Router.
- **The "Diamond" Script:** launch_axiom.ps1 is the source of truth. It handles the "Clean Room" installation automatically.

## 6. NEXT OBJECTIVES (PHASE 2)
1.  **Visualization:** Replace the text list with a Map (Leaflet/Mapbox).
2.  **Ingestion:** Create a standalone Python script to simulate a moving drone (replacing the dashboard button).
3.  **Cloud:** Deploy to Vercel/Railway.

**INSTRUCTION TO AI:**
When resuming this project, ALWAYS read launch_axiom.ps1 first to understand the automation logic. Do not propose manual npm commands unless unavoidable.