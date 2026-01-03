import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    // Attempt to fetch data
    const data = await prisma.assetAnalysis.findMany({ 
      orderBy: { createdAt: "desc" },
      take: 50 
    });
    return NextResponse.json(data);
  } catch (error: any) {
    // CRITICAL: Log and return the EXACT error message
    console.error("Detailed DB Error:", error);
    return NextResponse.json({ 
      error: error.message || "Unknown Database Failure",
      details: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location, financials, metrics, contextScore } = body;
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
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}