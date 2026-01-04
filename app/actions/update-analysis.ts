'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Define the shape of the data strictly
interface AnalysisUpdateData {
  purchasePrice: number | string;
  rehabCost: number | string;
  estRent: number | string;
  taxAmount: number | string;
  interestRate: number | string;
  downPaymentPct: number | string;
  loanTermYears: number | string;
  vacancyRate: number | string;
  managementRate: number | string;
  opexAnnual: number | string;
  closingCosts: number | string;
  id?: string;
}

export async function updateAnalysis(id: string, data: AnalysisUpdateData) {
  if (!id) throw new Error('Analysis ID is required');

  const safeFloat = (val: number | string | undefined) => {
    if (val === undefined || val === '') return 0;
    const parsed = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const safeInt = (val: number | string | undefined) => {
     if (val === undefined || val === '') return 30;
     const parsed = typeof val === 'string' ? parseInt(val) : val;
     return isNaN(parsed) ? 30 : parsed;
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
        loanTermYears: safeInt(data.loanTermYears),
        vacancyRate: safeFloat(data.vacancyRate),
        managementRate: safeFloat(data.managementRate),
        opexAnnual: safeFloat(data.opexAnnual),
        closingCosts: safeFloat(data.closingCosts),
      },
    });

    // FIXED: String concatenation to avoid interpolation errors
    revalidatePath('/analysis/' + id);
    return { success: true };
  } catch (error) {
    console.error('Update failed:', error);
    return { success: false, error: 'Failed to save analysis' };
  }
}