"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAnalysis(id: string, data: any) {
  if (!id) throw new Error("Analysis ID is required");

  // GAUNTLET FIX: Helper to safely parse numbers, defaulting to 0 if NaN
  const safeFloat = (val: any) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  try {
    await prisma.analysis.update({
      where: { id },
      data: {
        purchasePrice: safeFloat(data.purchasePrice),
        rehabCost: safeFloat(data.rehabCost),
        estRent: safeFloat(data.estRent),
        taxAmount: safeFloat(data.taxAmount),
        interestRate: safeFloat(data.interestRate),
        downPaymentPct: safeFloat(data.downPaymentPct),
        loanTermYears: parseInt(data.loanTermYears) || 30,
        vacancyRate: safeFloat(data.vacancyRate),
        managementRate: safeFloat(data.managementRate),
        opexAnnual: safeFloat(data.opexAnnual),
        closingCosts: safeFloat(data.closingCosts),
      },
    });

    revalidatePath(`/analysis/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update failed:", error);
    return { success: false, error: "Failed to save analysis" };
  }
}