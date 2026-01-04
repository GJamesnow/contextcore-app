import { prisma } from "@/lib/prisma";
import FinancialEngine from "@/components/visualizations/FinancialEngine";
import DealMap from "@/components/visualizations/DealMap";

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: params.id },
  });

  if (!analysis) {
    return <div>Analysis not found</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-2xl font-bold text-slate-900">{analysis.address}</h1>
              <div className="flex gap-2 text-sm text-slate-500 mt-1">
                 <span>{analysis.city}, {analysis.country}</span>
                 {analysis.zoningCode && <span className="bg-slate-200 px-2 rounded text-xs py-0.5">Zone: {analysis.zoningCode}</span>}
              </div>
           </div>
           <a href="/" className="text-sm font-medium text-slate-600 hover:text-black"> Back to Search</a>
        </div>

        {/* MAP & CONTEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 h-64 rounded-xl overflow-hidden shadow-sm border border-slate-200">
              <DealMap address={analysis.address} lat={analysis.lat} lng={analysis.lng} />
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Property Context</h3>
              <div className="space-y-3 text-sm">
                 <div className="flex justify-between">
                    <span className="text-slate-500">Source</span>
                    <span className="font-medium">Public Record</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Year Built</span>
                    <span className="font-medium">{analysis.yearBuilt || "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Flood Zone</span>
                    <span className="font-medium bg-green-100 text-green-700 px-2 rounded">
                       {analysis.floodZoneCode || "X (Low Risk)"}
                    </span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-400">DATA PROVENANCE</div>
                    <div className="text-xs text-slate-500 italic mt-1">
                       Live connectivity enabled. Scraper modules pending activation in Phase 4.
                    </div>
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