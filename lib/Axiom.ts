import { runExtractor } from './pipeline/1-extractor';
import { runHarvester } from './pipeline/2-harvester';
import { runActuary } from './pipeline/3-actuary';
import { ActuaryReport } from './types';

/**
 * THE AXIOM CONTROLLER
 * The single entry point for the "Truth Engine".
 * * Pipeline:
 * 1. INPUT: Raw Text
 * 2. EXTRACTOR: Text -> Partial JSON (AI)
 * 3. HARVESTER: Partial JSON -> Complete JSON (Defaults/Sanitization)
 * 4. ACTUARY: Complete JSON -> Financial Report (Math)
 * 5. OUTPUT: Deterministic Report
 */
export async function analyzeListing(rawText: string): Promise<ActuaryReport> {
  console.log("--- AXIOM PIPELINE START ---");

  // Step 1: Extract (The AI part)
  console.log("1. Running Extractor...");
  const rawData = await runExtractor(rawText);
  
  // Step 2: Harvest (The Safety Net)
  console.log("2. Running Harvester...");
  const sanitizedData = runHarvester(rawData);
  
  // Step 3: Actuary (The Math)
  console.log("3. Running Actuary...");
  const report = runActuary(sanitizedData);
  
  console.log("--- AXIOM PIPELINE COMPLETE ---");
  return report;
}