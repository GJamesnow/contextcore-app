import express from "express";
import apiRoutes from "./routes/api";
import { GeoService } from "./modules/ingestion/services/GeoService";

const app = express();
const PORT = 3001; 
const geoService = new GeoService();

app.use(express.json());
app.use("/api", apiRoutes);

async function startServer() {
  await geoService.warmup();
  app.listen(PORT, () => {
    console.log('🚀 Axiom Backend Live: http://localhost:' + PORT);
  });
}
startServer().catch(err => {
  console.error("FATAL_BOOT:", err);
  process.exit(1);
});