import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runPipeline = async (req: Request, res: Response) => {
    try {
        console.log('[AXIOM] Pipeline Triggered...');
        
        // 1. EXTRACT (Simulation)
        const rawData = { source: 'Simulated_Sensor', lat: 51.0447, lng: -114.0719, value: Math.random() * 100 };
        
        // 2. TRANSFORM (Harvester Logic would go here)
        const score = rawData.value * 1.5;

        // 3. LOAD (Actuary)
        const log = await prisma.geoLog.create({
            data: {
                latitude: rawData.lat,
                longitude: rawData.lng,
                source: rawData.source,
                marketScore: score,
                status: 'PROCESSED'
            }
        });

        console.log('[AXIOM] Pipeline Success:', log.id);
        res.json({ success: true, data: log });

    } catch (error) {
        console.error('[AXIOM] Pipeline Failure:', error);
        res.status(500).json({ success: false, error: 'Pipeline Crash' });
    }
};

export const getLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.geoLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Database Unreachable' });
    }
};