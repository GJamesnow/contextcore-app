import { Request, Response } from 'express';
import { GeoService } from '../services/GeoService';

export class GeoController {
    private service: GeoService;
    constructor() { this.service = new GeoService(); }

    async ingestLocation(req: Request, res: Response) {
        try {
            console.log("--> Received Ingest Request:", req.body.placeId);
            const result = await this.service.saveLocation(req.body);
            res.status(200).json({ success: true, id: result.id, status: result.status });
        } catch (error: any) {
            console.error("Error in Controller:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}