export interface SimulatedDeal {
  purchasePrice: number;
  estRent: number;
  taxAmount: number;
  insurance: number;
  yearBuilt: number;
  zoning: string;
}

// Generates consistent "fake" data based on the address string
// This ensures "123 Main St" always gives the same numbers.
export function simulateDealContext(address: string): SimulatedDeal {
  const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base Price between $300k and $1.3M
  const basePrice = 300000 + (hash * 1234 % 1000000);
  
  // Rent is approx 0.8% - 1.1% of price (The "1% Rule" variation)
  const rentRatio = 0.008 + ((hash % 5) / 1000);
  const estRent = Math.round(basePrice * rentRatio);
  
  // Tax is approx 1.2%
  const taxAmount = Math.round(basePrice * 0.012);
  
  // Insurance approx 0.4%
  const insurance = Math.round(basePrice * 0.004);
  
  // Year Built (1950 - 2024)
  const yearBuilt = 1950 + (hash % 74);
  
  const zoningTypes = ["R-1 (Single Family)", "R-2 (Duplex)", "C-1 (Commercial)", "MU-1 (Mixed Use)"];
  const zoning = zoningTypes[hash % zoningTypes.length];

  return {
    purchasePrice: Math.round(basePrice / 1000) * 1000, // Round to nearest k
    estRent,
    taxAmount,
    insurance,
    yearBuilt,
    zoning
  };
}