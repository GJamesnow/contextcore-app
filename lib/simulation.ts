// Generates realistic data for Wholesaling perspective
export interface SimulatedDeal {
  purchasePrice: number; // The suggested offer price
  arv: number;           // After Repair Value
  rehabCost: number;     // Est. repairs
  estRent: number;
  taxAmount: number;
  yearBuilt: number;
  zoning: string;
}

export function simulateDealContext(address: string): SimulatedDeal {
  const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base Value ($300k - $900k)
  const baseValue = 300000 + (hash * 1234 % 600000); 
  
  // Wholesaler Logic: They find distressed assets.
  const arv = Math.round(baseValue * 1.3); // ARV is much higher
  const rehabCost = Math.round(baseValue * 0.20); // Needs significant work (20%)
  // Purchase price is ARV minus repairs minus their profit margin (~15% of ARV)
  const targetMargin = arv * 0.15;
  const purchasePrice = Math.round((arv - rehabCost - targetMargin) / 1000) * 1000;

  return {
    purchasePrice, // The "Strike Price"
    arv,
    rehabCost,
    estRent: Math.round(arv * 0.008),
    taxAmount: Math.round(arv * 0.011),
    yearBuilt: 1950 + (hash % 60),
    zoning: (hash % 2 === 0) ? "R1 (Single Family)" : "R2 (Low Density Multi)"
  };
}