import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// We define a Zod schema that mirrors our TypeScript interfaces 
// but allows NULLs because listings are often incomplete.
const ExtractionSchema = z.object({
  purchasePrice: z.number().nullable().describe(" The listing price or asking price."),
  grossMonthlyRent: z.number().nullable().describe("Current or projected monthly rent. If annual is given, divide by 12."),
  vacancyRate: z.number().nullable().describe("Vacancy rate as a decimal (e.g. 0.05). Default to null if not found."),
  closingCosts: z.number().nullable().describe("Estimated closing costs."),
  rehabCosts: z.number().nullable().describe("Estimated repair/renovation costs."),
  
  expenses: z.object({
    propertyTax: z.number().nullable().describe("Annual property tax."),
    insurance: z.number().nullable().describe("Annual insurance cost."),
    managementFeePercent: z.number().nullable().describe("Management fee as a decimal (e.g. 0.10)."),
    maintenancePercent: z.number().nullable().describe("Maintenance reserve as a decimal."),
    utilities: z.number().nullable().describe("Annual landlord-paid utilities."),
    hoa: z.number().nullable().describe("Annual HOA fees. If monthly, multiply by 12."),
    capitalExpenditures: z.number().nullable().describe("Annual CapEx reserve.")
  }),
  
  loan: z.object({
    downPaymentPercent: z.number().nullable().describe("Down payment as decimal (e.g. 0.20)."),
    interestRate: z.number().nullable().describe("Interest rate as decimal (e.g. 0.065)."),
    loanTermYears: z.number().nullable().describe("Loan term in years.")
  })
});

// Type inference for the partial data
export type ExtractedData = z.infer<typeof ExtractionSchema>;

/**
 * STAGE 1: EXTRACTOR
 * Converts raw listing text into structured data using GPT-4o.
 */
export async function runExtractor(rawText: string): Promise<ExtractedData> {
  
  const { object } = await generateObject({
    model: openai('gpt-4o'), // High intelligence required for reasoning about "hidden" costs
    schema: ExtractionSchema,
    prompt: `
      You are an expert Real Estate Underwriter.
      Extract financial data from the listing description below.
      
      RULES:
      1. Be skeptical. If a number isn't explicitly stated or strongly implied, return null.
      2. Convert all monthly figures to ANNUAL, except for 'grossMonthlyRent'.
      3. Convert percentages to decimals (e.g., 5% -> 0.05).
      4. Ignore marketing fluff. Focus on the numbers.
      
      LISTING TEXT:
      "${rawText}"
    `,
  });

  return object;
}