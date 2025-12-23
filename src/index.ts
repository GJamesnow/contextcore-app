import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api";
import { GeoService } from "./modules/ingestion/services/GeoService";

// Initialize Environment
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 
const geoService = new GeoService();

// Middleware
app.use(cors({
    origin: "http://localhost:3000", // Allow Next.js Frontend
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

async function startServer() {
  try {
    console.log(">>> AXIOM: Warming up GeoService...");
    await geoService.warmup();
    
    app.listen(PORT, () => {
      console.log('ðŸš€ Axiom Backend Live: http://localhost:' + PORT);
      console.log('   - Mode: ' + (process.env.NODE_ENV || 'DEVELOPMENT'));
    });
  } catch (err) {
      console.error("FATAL_BOOT:", err);
      process.exit(1);
  }
}

startServer();