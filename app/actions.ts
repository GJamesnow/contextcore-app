'use server'

import { prisma } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { runActuary } from '../lib/pipeline/3-actuary'; // <--- THE NEW BRAIN
import { PropertyData } from '../lib/types';

export async function submitAnalysis(prevState: any, formData: FormData) {
  console.log("Processing Real Analysis...");

  // 1. Extract & Sanitize Data
  const rawPrice = parseFloat(formData.get('purchasePrice') as string) || 0;
  const rawRent = parseFloat(formData.get('grossRent') as string) || 0;
  const address = formData.get('propertyAddress') as string || "Unknown Address";

  // 2. Build the Data Object (Using Defaults for now)
  // In the future, these hardcoded values will come from an "Advanced Settings" form.
  const propertyData: PropertyData = {
    purchasePrice: rawPrice,
    grossMonthlyRent: rawRent,
    vacancyRate: 0.05, // 5% default
    closingCosts: rawPrice * 0.02, // Est 2%
    rehabCosts: 0,
    expenses: {
      propertyTax: rawPrice * 0.012, // Est 1.2%
      insurance: 800, // Flat est
      managementFeePercent: 0.08, // 8%
      maintenancePercent: 0.05,   // 5%
      utilities: 0,
      hoa: 0,
      capitalExpenditures: 600
    },
    loan: {
      downPaymentPercent: 0.20, // 20% down
      interestRate: 0.07,       // 7% rate
      loanTermYears: 30
    }
  };

  // 3. RUN THE ACTUARY (The Real Logic)
  const report = runActuary(propertyData);

  // 4. Save to Database
  await prisma.analysis.create({
    data: {
      propertyAddress: address,
      purchasePrice: report.inputs.purchasePrice,
      grossRent: report.inputs.grossMonthlyRent,
      noi: report.financials.netOperatingIncome,
      capRate: report.metrics.capRate * 100, // Convert to % for display
      cashFlow: report.financials.preTaxCashFlow,
    },
  });

  // 5. Refresh UI
  revalidatePath('/');
  return { message: 'Success' };
}