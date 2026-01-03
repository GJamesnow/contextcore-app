import { ExtractedData } from './1-extractor';
import { PropertyData, ExpenseBreakdown, LoanDetails } from '../types';

// --- SAFE ASSUMPTIONS (The Safety Net) ---
// These should eventually be moved to a configuration file or database.
const MARKET_DEFAULTS = {
  vacancyRate: 0.05,          // 5% standard vacancy
  closingCostsPercent: 0.03,  // Estimate 3% of purchase price if unknown
  rehabCosts: 0,              // Assume turnkey if not stated (risky, but deterministic)
  
  loan: {
    downPaymentPercent: 0.25, // Investor standard (25%)
    interestRate: 0.07,       // Conservative current market rate (7%)
    loanTermYears: 30         // Standard term
  },
  
  expenses: {
    propertyTaxRate: 0.012,     // 1.2% of purchase price (National Avg estimate)
    insuranceRate: 0.005,       // 0.5% of purchase price
    managementFeePercent: 0.10, // 10% standard PM fee
    maintenancePercent: 0.05,   // 5% maintenance reserve
    utilities: 0,               // Assume tenant pays utilities (Single Family default)
    hoa: 0,                     // Assume none unless specified
    capitalExpenditures: 0.05   // 5% CapEx reserve
  }
};

/**
 * STAGE 2: HARVESTER
 * Merges extracted data with market defaults to produce a complete dataset.
 */
export function runHarvester(extracted: ExtractedData): PropertyData {
  
  // 1. Resolve Purchase Price (Critical Fail State)
  // If we don't have a price, the math is impossible. 
  // For now, we return 0 to prevent crashes, but the UI should flag this.
  const purchasePrice = extracted.purchasePrice ?? 0;

  // 2. Resolve Expenses
  // We prioritize extracted data. If missing, we calculate based on defaults.
  const expenses: ExpenseBreakdown = {
    propertyTax: extracted.expenses.propertyTax 
      ?? (purchasePrice * MARKET_DEFAULTS.expenses.propertyTaxRate),
      
    insurance: extracted.expenses.insurance 
      ?? (purchasePrice * MARKET_DEFAULTS.expenses.insuranceRate),
      
    managementFeePercent: extracted.expenses.managementFeePercent 
      ?? MARKET_DEFAULTS.expenses.managementFeePercent,
      
    maintenancePercent: extracted.expenses.maintenancePercent 
      ?? MARKET_DEFAULTS.expenses.maintenancePercent,
      
    utilities: extracted.expenses.utilities 
      ?? MARKET_DEFAULTS.expenses.utilities,
      
    hoa: extracted.expenses.hoa 
      ?? MARKET_DEFAULTS.expenses.hoa,
      
    capitalExpenditures: extracted.expenses.capitalExpenditures 
      ?? (extracted.grossMonthlyRent ? extracted.grossMonthlyRent * 12 * MARKET_DEFAULTS.expenses.capitalExpenditures : 0) 
      // Note: If extracted rent is missing, CapEx reserve calc might be 0 initially.
  };

  // 3. Resolve Loan
  const loan: LoanDetails = {
    downPaymentPercent: extracted.loan.downPaymentPercent 
      ?? MARKET_DEFAULTS.loan.downPaymentPercent,
      
    interestRate: extracted.loan.interestRate 
      ?? MARKET_DEFAULTS.loan.interestRate,
      
    loanTermYears: extracted.loan.loanTermYears 
      ?? MARKET_DEFAULTS.loan.loanTermYears
  };

  // 4. Construct Final Object
  return {
    purchasePrice,
    grossMonthlyRent: extracted.grossMonthlyRent ?? 0, // Critical: If 0, Actuary will show bad KPIs
    vacancyRate: extracted.vacancyRate ?? MARKET_DEFAULTS.vacancyRate,
    closingCosts: extracted.closingCosts ?? (purchasePrice * MARKET_DEFAULTS.closingCostsPercent),
    rehabCosts: extracted.rehabCosts ?? MARKET_DEFAULTS.rehabCosts,
    expenses,
    loan
  };
}