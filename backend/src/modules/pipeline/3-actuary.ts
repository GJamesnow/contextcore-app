import { 
  PropertyData, 
  ActuaryReport, 
  FinancialHealth, 
  InvestmentKPIs 
} from '../types';

/**
 * PURE FUNCTION: Calculates monthly mortgage payment using standard amortization formula.
 * M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
 */
const calculateAnnualDebtService = (
  loanAmount: number, 
  rate: number, 
  years: number
): number => {
  if (rate === 0) return loanAmount / years;
  
  const monthlyRate = rate / 12;
  const numberOfPayments = years * 12;
  
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return monthlyPayment * 12;
};

/**
 * CORE LOGIC: The Actuary
 * Receives sanitized inputs, returns definitive financial truth.
 */
export function runActuary(data: PropertyData): ActuaryReport {
  // 1. Revenue Calculations
  const grossScheduledIncome = data.grossMonthlyRent * 12;
  const vacancyLoss = grossScheduledIncome * data.vacancyRate;
  const effectiveGrossIncome = grossScheduledIncome - vacancyLoss;

  // 2. Expense Calculations
  // Note: Management fees are typically based on Collected Rent (EGI), not GSI.
  const managementFee = effectiveGrossIncome * data.expenses.managementFeePercent;
  const maintenanceCost = grossScheduledIncome * data.expenses.maintenancePercent; // Usually based on GSI
  
  const totalOperatingExpenses = 
    data.expenses.propertyTax +
    data.expenses.insurance +
    data.expenses.utilities +
    data.expenses.hoa +
    data.expenses.capitalExpenditures +
    managementFee +
    maintenanceCost;

  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

  // 3. Debt & Cash Flow
  const loanAmount = data.purchasePrice * (1 - data.loan.downPaymentPercent);
  const annualDebtService = calculateAnnualDebtService(
    loanAmount, 
    data.loan.interestRate, 
    data.loan.loanTermYears
  );
  
  const preTaxCashFlow = netOperatingIncome - annualDebtService;
  const totalCashInvested = 
    (data.purchasePrice * data.loan.downPaymentPercent) + 
    data.closingCosts + 
    data.rehabCosts;

  // 4. KPI Derivation
  // Guard against division by zero
  const capRate = data.purchasePrice > 0 
    ? (netOperatingIncome / data.purchasePrice) 
    : 0;

  const cashOnCashReturn = totalCashInvested > 0 
    ? (preTaxCashFlow / totalCashInvested) 
    : 0;

  const debtServiceCoverageRatio = annualDebtService > 0 
    ? (netOperatingIncome / annualDebtService) 
    : 100; // Infinite coverage if no debt

  const grossRentMultiplier = grossScheduledIncome > 0 
    ? (data.purchasePrice / grossScheduledIncome) 
    : 0;

  const breakEvenRatio = grossScheduledIncome > 0
    ? ((totalOperatingExpenses + annualDebtService) / grossScheduledIncome)
    : 0;

  // 5. Construct Payload
  const financials: FinancialHealth = {
    grossScheduledIncome,
    effectiveGrossIncome,
    totalOperatingExpenses,
    netOperatingIncome,
    annualDebtService,
    preTaxCashFlow
  };

  const metrics: InvestmentKPIs = {
    capRate,
    cashOnCashReturn,
    debtServiceCoverageRatio,
    grossRentMultiplier,
    breakEvenRatio
  };

  return {
    inputs: data,
    financials,
    metrics,
    timestamp: new Date().toISOString()
  };
}