import { runActuary } from '../lib/pipeline/3-actuary';
import { PropertyData } from '../lib/types';

// --- THE SCENARIO ---
// A simple $100k property renting for $1,000/mo (The 1% Rule)
const mockProperty: PropertyData = {
  purchasePrice: 100000,
  grossMonthlyRent: 1000,
  vacancyRate: 0.05, // 5% vacancy
  closingCosts: 2000,
  rehabCosts: 0,
  expenses: {
    propertyTax: 1200,      // $100/mo
    insurance: 600,         // $50/mo
    managementFeePercent: 0.10, // 10%
    maintenancePercent: 0.05,   // 5%
    utilities: 0,
    hoa: 0,
    capitalExpenditures: 600 // $50/mo
  },
  loan: {
    downPaymentPercent: 0.20, // 20% down ($20k)
    interestRate: 0.07,       // 7% interest
    loanTermYears: 30
  }
};

console.log("\n---  STARTING ACTUARY SMOKE TEST ---");
console.log(`Input: Buy for $${mockProperty.purchasePrice}, Rent for $${mockProperty.grossMonthlyRent}/mo`);

// --- EXECUTE ---
const report = runActuary(mockProperty);

// --- REPORT ---
console.log("\n---  FINANCIAL RESULTS ---");
console.log(`Gross Scheduled Income:  $${report.financials.grossScheduledIncome.toFixed(2)}`);
console.log(`Effective Gross Income:  $${report.financials.effectiveGrossIncome.toFixed(2)}`);
console.log(`Total Expenses:          $${report.financials.totalOperatingExpenses.toFixed(2)}`);
console.log(`NOI (Net Operating Inc): $${report.financials.netOperatingIncome.toFixed(2)}`);
console.log(`Annual Debt Service:     $${report.financials.annualDebtService.toFixed(2)}`);
console.log(`Cash Flow (Pre-Tax):     $${report.financials.preTaxCashFlow.toFixed(2)}`);

console.log("\n---  KPI METRICS ---");
console.log(`Cap Rate:                ${(report.metrics.capRate * 100).toFixed(2)}%`);
console.log(`Cash on Cash Return:     ${(report.metrics.cashOnCashReturn * 100).toFixed(2)}%`);
console.log(`DSCR:                    ${report.metrics.debtServiceCoverageRatio.toFixed(2)}x`);

// --- VERIFICATION ---
const expectedNOI = 7860; // Rough estimate based on inputs
const tolerance = 500;    // Allow slight variance for math precision

if (Math.abs(report.financials.netOperatingIncome - expectedNOI) < tolerance) {
    console.log("\n TEST PASSED: Math is within expected range.");
} else {
    console.log("\n TEST FAILED: Numbers look suspect. Check logic.");
}