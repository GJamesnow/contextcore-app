import { prisma } from "@/lib/prisma";
import { simulateDealContext } from "@/lib/simulation";
import FinancialEngine from "@/components/visualizations/FinancialEngine";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  let analysis = await prisma.analysis.findUnique({ where: { id: params.id } });
  if (!analysis) return <div>Not found</div>;

  // If new deal (price 0), run simulation and save
  if (analysis.purchasePrice === 0) {
     const context = simulateDealContext(analysis.address);
     analysis = await prisma.analysis.update({
        where: { id: params.id },
        data: {
           purchasePrice: context.purchasePrice, // The suggested offer
           rehabCost: context.rehabCost,
           estRent: context.estRent,
           taxAmount: context.taxAmount,
           yearBuilt: context.yearBuilt,
           zoningCode: context.zoning,
           // Store ARV in raw data for now as we lack a specific column
           rawSourceData: { arv: context.arv },
           // Defaults
           downPaymentPct: 100, // Wholesalers usually calculate cash price
           interestRate: 0,
           loanTermYears: 0,
           closingCosts: Math.round(context.purchasePrice * 0.02)
        }
     });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{analysis.address}</h1>
           <div className="flex gap-2 text-sm mt-1">
              <span className="bg-slate-200 px-2 rounded text-slate-700">{analysis.zoningCode}</span>
              <span className="bg-slate-200 px-2 rounded text-slate-700">Built {analysis.yearBuilt}</span>
           </div>
        </div>
        <FinancialEngine initialData={analysis} />
      </div>
    </main>
  );
}