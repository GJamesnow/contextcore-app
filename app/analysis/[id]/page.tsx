import { prisma } from "@/lib/prisma";
import { simulateDealContext } from "@/lib/simulation";
import FinancialEngine from "@/components/visualizations/FinancialEngine";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  let analysis = await prisma.analysis.findUnique({ where: { id: params.id } });
  if (!analysis) return <div>Loading...</div>;

  if (analysis.purchasePrice === 0) {
    const sim = simulateDealContext(analysis.address);
    analysis = await prisma.analysis.update({
      where: { id: params.id },
      data: { 
        purchasePrice: sim.purchasePrice, 
        rehabCost: sim.rehabCost,
        rawSourceData: { arv: sim.arv }
      }
    });
  }

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-black">{analysis.address}</h1>
        <FinancialEngine initialData={analysis} />
      </div>
    </main>
  );
}