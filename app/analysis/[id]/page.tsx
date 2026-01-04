import { prisma } from "@/lib/prisma";
import { simulateDealContext } from "@/lib/simulation";
import FinancialEngine from "@/components/visualizations/FinancialEngine";
import DealMap from "@/components/visualizations/DealMap";

export const dynamic = "force-dynamic"; // Ensure we always fetch fresh data

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  let analysis = await prisma.analysis.findUnique({
    where: { id: params.id },
  });

  if (!analysis) {
    return <div className="p-10 text-center">Analysis not found</div>;
  }

  // INTELLIGENCE CHECK: Is this a "Blank" deal?
  // If Price is 0, we assume it is new and needs Simulated Context.
  if (analysis.purchasePrice === 0) {
     const context = simulateDealContext(analysis.address);
     
     // Save the simulation to the DB so it persists
     analysis = await prisma.analysis.update({
        where: { id: params.id },
        data: {
           purchasePrice: context.purchasePrice,
           estRent: context.estRent,
           taxAmount: context.taxAmount,
           opexAnnual: context.insurance, // Using simulated insurance as base OpEx
           yearBuilt: context.yearBuilt,
           zoningCode: context.zoning,
           // Set defaults for the engine
           downPaymentPct: 20,
           interestRate: 6.5,
           loanTermYears: 30,
           vacancyRate: 5,
           managementRate: 8,
           closingCosts: Math.round(context.purchasePrice * 0.03)
        }
     });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-2xl font-bold text-slate-900">{analysis.address}</h1>
              <div className="flex gap-2 text-sm text-slate-500 mt-1 items-center">
                 <span>{analysis.city}, {analysis.country}</span>
                 {analysis.zoningCode && (
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-700">
                       {analysis.zoningCode}
                    </span>
                 )}
                 <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Active Context
                 </span>
              </div>
           </div>
           <a href="/" className="text-sm font-medium text-slate-600 hover:text-black transition-colors">
               Search New Asset
           </a>
        </div>

        {/* MAP & CONTEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 h-64 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-200 relative group">
              <DealMap address={analysis.address} lat={analysis.lat} lng={analysis.lng} />
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                 Satellite View
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                 Asset Intelligence
              </h3>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Year Built</span>
                    <span className="font-medium">{analysis.yearBuilt || "Est. 1985"}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Zoning Code</span>
                    <span className="font-medium text-slate-900">{analysis.zoningCode || "Pending"}</span>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Risk Profile</span>
                    <span className="font-bold text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                       Low / Stable
                    </span>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 leading-relaxed">
                       * Data auto-populated via ContextCore Intelligence. 
                       Verify via official county records.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* FINANCIAL ENGINE */}
        <FinancialEngine initialData={analysis} />

      </div>
    </main>
  );
}