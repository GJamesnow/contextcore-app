export function simulateDealContext(address: string) {
  const hash = address.length * 1234;
  const arv = 450000 + (hash % 500000);
  return {
    purchasePrice: Math.round(arv * 0.70), // 70% Rule
    arv: arv,
    rehabCost: 45000,
    estRent: Math.round(arv * 0.009),
    taxAmount: Math.round(arv * 0.012),
    yearBuilt: 1975,
    zoningCode: "R2-Medium"
  };
}