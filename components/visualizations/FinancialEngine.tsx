"use client";
import { useState } from "react";

export default function FinancialEngine({ initialData }: any) {
  const data = initialData || {};
  const arv = data.rawSourceData?.arv || (data.purchasePrice * 1.3) || 0;
  const spread = arv - (data.purchasePrice + (data.rehabCost || 0) + (data.closingCosts || 0));

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-slate-500 font-bold uppercase text-xs">Projected Profit Spread</h2>
      <div className={"text-4xl font-extrabold my-2 " + (spread > 0 ? "text-emerald-600" : "text-red-600")}>
        ${spread.toLocaleString()}
      </div>
      <div className="text-sm text-slate-400">Based on ARV: ${arv.toLocaleString()}</div>
    </div>
  );
}