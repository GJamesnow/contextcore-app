export function simulateDealContext(address: string) {
  // Simple deterministic simulation
  const hash = address.length * 1000;
  const arv = 500000 + hash;
  return {
    purchasePrice: Math.round(arv * 0.7),
    arv: arv,
    rehabCost: 50000,
    estRent: arv * 0.008,
    taxAmount: arv * 0.012,
    yearBuilt: 1980,
    zoningCode: "R1"
  };
}