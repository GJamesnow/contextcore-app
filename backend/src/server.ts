import express from 'express';
import cors from 'cors';
import { GeoController } from './modules/ingestion/controllers/GeoController';

const app = express();
app.use(cors());
app.use(express.json());

const geoController = new GeoController();

// Route Binding
app.post('/api/ingest/geo', (req, res) => geoController.ingestLocation(req, res));

app.listen(3000, () => {
    console.log(" AXIOM SERVER READY");
    console.log("   Database Connected.");
});