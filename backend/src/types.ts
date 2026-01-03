// lib/types.ts

// --- INPUTS (From Extractor/Harvester) ---

export interface LoanDetails {
  downPaymentPercent: number; // e.g., 0.20 for 20%
  interestRate: number;       // e.g., 0.065 for 6.5%
  loanTermYears: number;      // e.g., 30
}

export interface ExpenseBreakdown {
  propertyTax: number;        // Annual
  insurance: number;          // Annual
  managementFeePercent: number; // % of Effective Gross Income
  maintenancePercent: number;   // % of Gross Income
  utilities: number;          // Annual (Landlord paid)
  hoa: number;                // Annual
  capitalExpenditures: number; // Annual reserve
}

export interface PropertyData {
  purchasePrice: number;
  grossMonthlyRent: number;
  vacancyRate: number;        // e.g., 0.05 for 5%
  closingCosts: number;       // Estimated upfront costs
  rehabCosts: number;         // Initial renovation budget
  
  // Nested Objects for cleaner separation
  expenses: ExpenseBreakdown;
  loan: LoanDetails;
}

// --- OUTPUTS (Calculated by Actuary) ---

export interface FinancialHealth {
  grossScheduledIncome: number; // GSI
  effectiveGrossIncome: number; // EGI
  totalOperatingExpenses: number;
  netOperatingIncome: number;   // NOI
  annualDebtService: number;
  preTaxCashFlow: number;
}

export interface InvestmentKPIs {
  capRate: number;              // NOI / Purchase Price
  cashOnCashReturn: number;     // Cash Flow / Total Cash Invested
  debtServiceCoverageRatio: number; // NOI / Debt Service
  grossRentMultiplier: number;  // Price / GSI
  breakEvenRatio: number;       // (OpEx + Debt) / GSI
}

// The Final "Truth" Object passed to the Analyst (LLM)
export interface ActuaryReport {
  inputs: PropertyData;
  financials: FinancialHealth;
  metrics: InvestmentKPIs;
  timestamp: string;
}