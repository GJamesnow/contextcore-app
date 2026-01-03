import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ROUTE: Get All Analyses
app.get('/api/analysis', async (req, res) => {
  try {
    const data = await prisma.assetAnalysis.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ROUTE: Save Analysis
app.post('/api/analysis', async (req, res) => {
  try {
    const { location, financials, metrics, contextScore } = req.body;
    const result = await prisma.assetAnalysis.create({
      data: {
        country: location.country,
        region: location.region,
        city: location.city,
        notes: location.notes,
        purchasePrice: financials.purchasePrice,
        renovationBudget: financials.renovationBudget,
        grossRent: financials.grossRent,
        operatingExpenses: financials.operatingExpenses,
        capRate: metrics.capRate,
        cashOnCash: metrics.cashOnCash,
        contextScore: contextScore
      }
    });
    res.json(result);
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

app.listen(PORT, () => {
  console.log(`>>> AXIOM CORE: Backend Active on Port ${PORT}`);
});