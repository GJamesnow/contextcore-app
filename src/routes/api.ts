import { Router, Request, Response } from 'express';
import { GeoService } from '../modules/ingestion/services/GeoService';

const router = Router();
const geoService = new GeoService();

// GET /api/health - Liveness probe
router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'AXIOM_CORE_ONLINE', timestamp: new Date() });
});

// POST /api/ingest - Ingest raw coordinates
router.post('/ingest', async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, source } = req.body;

        if (latitude === undefined || longitude === undefined) {
             res.status(400).json({ error: "Missing latitude or longitude" });
             return;
        }

        const log = await geoService.ingestCoordinates(
            parseFloat(latitude), 
            parseFloat(longitude), 
            source || 'UNKNOWN'
        );
        
        res.status(201).json(log);
    } catch (error) {
        console.error("INGEST_ERR:", error);
        res.status(500).json({ error: "Internal System Error" });
    }
});

// GET /api/latest - Fetch recent logs for dashboard
router.get('/latest', async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const logs = await geoService.getRecentLogs(limit);
        res.json(logs);
    } catch (error) {
        console.error("FETCH_ERR:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

export default router;