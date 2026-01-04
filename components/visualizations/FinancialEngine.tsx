"use client";
import { useState } from "react";

export default function FinancialEngine({ initialData }: any) {
  // Safe Hydration
  const safeData = {
    id: initialData?.id || "",
    purchasePrice: initialData?.purchasePrice || 0,
    rehabCost: initialData?.rehabCost || 0,
    closingCosts: initialData?.closingCosts || 0,
    arv: initialData?.rawSourceData?.arv || (initialData?.purchasePrice * 1.3) || 0, // Fallback ARV
  };
  const [data, setData] = useState(safeData);

  // -- WHOLESALER MATH --
  const totalCost = data.purchasePrice + data.rehabCost + data.closingCosts;
  // Profit Spread = What it's worth fixed up (ARV) minus what it cost to get there.
  const profitSpread = data.arv - totalCost;
  const roi = totalCost > 0 ? (profitSpread / totalCost) * 100 : 0;

  const handleChange = (field: string, value: string) => {
    const cleanVal = value === "" ? 0 : parseFloat(value);
    setData({ ...data, [field]: isNaN(cleanVal) ? 0 : cleanVal });
  };

  return (
    <div className="space-y-6">
      
      {/* PROFIT HERO CARD */}
      <div className={`p-6 rounded-xl shadow-sm border ${profitSpread >= 20000 ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
         <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Estimated Profit Spread</h2>
         <div className="flex items-baseline gap-4 mt-2">
            <span className={`text-4xl font-extrabold ${profitSpread > 0 ? "text-emerald-700" : "text-red-600"}`}>
               ${profitSpread.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </span>
            <span className={`text-lg font-bold ${roi >= 15 ? "text-emerald-600" : "text-slate-500"}`}>
               {roi.toFixed(1)}% ROI
            </span>
         </div>
         <p className="text-xs text-slate-400 mt-2">Based on ARV of ${data.arv.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INPUTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
           <h3 className="text-lg font-bold text-slate-900">Deal Structure</h3>
           <div>
              <label className="text-xs font-medium text-slate-500">My Offer Price</label>
              <input type="number" value={data.purchasePrice || ""} onChange={(e) => handleChange("purchasePrice", e.target.value)}
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900" />
           </div>
           <div>
              <label className="text-xs font-medium text-slate-500">Rehab Estimate</label>
              <input type="number" value={data.rehabCost || ""} onChange={(e) => handleChange("rehabCost", e.target.value)}
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900" />
           </div>
        </div>
        
        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-center">
           <div className="flex justify-between text-sm pb-2 border-b border-slate-100">
              <span className="text-slate-500">After Repair Value (ARV)</span>
              <span className="font-bold">${data.arv.toLocaleString()}</span>
           </div>
           <div className="flex justify-between text-sm pb-2 border-b border-slate-100">
              <span className="text-slate-500">Total Investment</span>
              <span className="font-medium">${totalCost.toLocaleString()}</span>
           </div>
           <div className="pt-4">
              <button className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-colors">
                 Save Deal & Share Link
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}