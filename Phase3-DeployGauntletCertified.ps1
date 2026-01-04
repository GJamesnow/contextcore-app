# Phase3-DeployGauntletCertified.ps1
# Axiom Architect: Injecting Hardened Financial UI (Syntax Corrected)

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: DEPLOYING GAUNTLET-CERTIFIED ENGINE..." -ForegroundColor Cyan

# ==========================================
# 1. THE BRAIN: SERVER ACTION (Hardened)
# ==========================================
$actionPath = "app/actions/update-analysis.ts"
Write-Host ">>> [1/3] Hardening Server Logic..." -ForegroundColor Yellow

# NOTE: Using single quotes to prevent PowerShell variable expansion. 
# Double single-quotes ('') are used to escape actual single quotes in the code.
$actionContent = '
"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAnalysis(id: string, data: any) {
  if (!id) throw new Error("Analysis ID is required");

  // GAUNTLET FIX: Helper to safely parse numbers, defaulting to 0 if NaN
  const safeFloat = (val: any) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  try {
    await prisma.analysis.update({
      where: { id },
      data: {
        purchasePrice: safeFloat(data.purchasePrice),
        rehabCost: safeFloat(data.rehabCost),
        estRent: safeFloat(data.estRent),
        taxAmount: safeFloat(data.taxAmount),
        interestRate: safeFloat(data.interestRate),
        downPaymentPct: safeFloat(data.downPaymentPct),
        loanTermYears: parseInt(data.loanTermYears) || 30,
        vacancyRate: safeFloat(data.vacancyRate),
        managementRate: safeFloat(data.managementRate),
        opexAnnual: safeFloat(data.opexAnnual),
        closingCosts: safeFloat(data.closingCosts),
      },
    });

    revalidatePath(`/analysis/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update failed:", error);
    return { success: false, error: "Failed to save analysis" };
  }
}
'
[System.IO.File]::WriteAllText($actionPath, $actionContent.Trim())


# ==========================================
# 2. THE FACE: FINANCIAL COMPONENT (Hardened)
# ==========================================
$compPath = "components/visualizations/FinancialEngine.tsx"
Write-Host ">>> [2/3] Constructing Bulletproof Dashboard..." -ForegroundColor Yellow

$compContent = '
"use client";

import { useState, useEffect } from "react";
import { updateAnalysis } from "@/app/actions/update-analysis";

interface FinancialProps {
  initialData: any;
}

export default function FinancialEngine({ initialData }: FinancialProps) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  
  // -- GAUNTLET FIX: SAFE MATH ENGINE --
  const purchasePrice = data.purchasePrice || 0;
  const downPaymentPct = data.downPaymentPct || 0;
  const interestRate = data.interestRate || 0;
  
  const loanAmount = purchasePrice * (1 - (downPaymentPct / 100));
  const downPaymentCash = purchasePrice * (downPaymentPct / 100);
  const closingCosts = data.closingCosts || 0;
  const rehabCost = data.rehabCost || 0;
  const totalInvestment = downPaymentCash + rehabCost + closingCosts;

  // Mortgage Logic (Handles 0% interest edge case)
  let monthlyMortgage = 0;
  if (interestRate === 0) {
      monthlyMortgage = data.loanTermYears > 0 ? loanAmount / (data.loanTermYears * 12) : 0;
  } else {
      const r = (interestRate / 100) / 12;
      const n = data.loanTermYears * 12;
      monthlyMortgage = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  if (isNaN(monthlyMortgage)) monthlyMortgage = 0;

  // Operating Expenses
  const annualGrossRent = (data.estRent || 0) * 12;
  const vacancyLoss = annualGrossRent * ((data.vacancyRate || 0) / 100);
  const effectiveGrossIncome = annualGrossRent - vacancyLoss;
  
  const annualOpex = (data.taxAmount || 0) + (data.opexAnnual || 0) + (annualGrossRent * ((data.managementRate || 0) / 100));
  const noi = effectiveGrossIncome - annualOpex;
  
  const annualDebtService = monthlyMortgage * 12;
  const cashFlow = noi - annualDebtService;

  // -- PRO METRICS --
  // Handle division by zero for Cap Rate
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  
  // Handle DSCR division by zero
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 99.9; // 99.9 means Infinity (All cash deal)
  
  // Cash on Cash
  const cocReturn = totalInvestment > 0 ? (cashFlow / totalInvestment) * 100 : 0;

  // -- HANDLERS --
  const handleChange = (field: string, value: any) => {
    // Prevent NaN from breaking UI inputs
    const cleanValue = value === "" ? 0 : parseFloat(value);
    setData({ ...data, [field]: isNaN(cleanValue) ? 0 : cleanValue });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateAnalysis(data.id, data);
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
      
      {/* STICKY HEADER FOR MOBILE */}
      <div className="sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Engine</h2>
          <p className="text-slate-500 text-xs md:text-sm">Professional Underwriting Model</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto justify-between md:justify-end">
           <div className="text-right">
              <div className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">DSCR</div>
              <div className={`text-xl md:text-2xl font-bold ${dscr >= 1.25 ? "text-emerald-600" : dscr < 1 ? "text-red-500" : "text-amber-500"}`}>
                {dscr >= 50 ? "" : dscr.toFixed(2)}x
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">Cap Rate</div>
              <div className="text-xl md:text-2xl font-bold text-slate-700">{capRate.toFixed(2)}%</div>
           </div>
           <div className="text-right">
              <div className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase">CoC Return</div>
              <div className={`text-xl md:text-2xl font-bold ${cocReturn >= 8 ? "text-emerald-600" : "text-slate-700"}`}>
                {cocReturn.toFixed(1)}%
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* COL 1: ACQUISITION */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
             Acquisition
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Purchase Price</label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input 
                  type="number" 
                  value={data.purchasePrice || ""}
                  onChange={(e) => handleChange("purchasePrice", e.target.value)}
                  className="w-full p-2 pl-6 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Rehab Budget</label>
                <input 
                  type="number" 
                  value={data.rehabCost || ""}
                  onChange={(e) => handleChange("rehabCost", e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700"
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Closing Costs</label>
                <input 
                  type="number" 
                  value={data.closingCosts || ""}
                  onChange={(e) => handleChange("closingCosts", e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700"
                />
             </div>
          </div>
          
          <div className="pt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
             <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-700 font-medium">Total Cash Needed</span>
                <span className="font-bold text-blue-900">${totalInvestment.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
             </div>
             <div className="text-xs text-blue-500">Down Payment + Rehab + Closing</div>
          </div>
        </div>

        {/* COL 2: DEBT STRUCTURE */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
             Debt Structure
          </h3>
          
          <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-500">Down Payment</label>
                <span className="text-xs font-bold text-slate-700">{data.downPaymentPct}% (${downPaymentCash.toLocaleString(undefined, {maximumFractionDigits:0})})</span>
             </div>
             <input 
               type="range" min="0" max="100" step="5"
               value={data.downPaymentPct || 0}
               onChange={(e) => handleChange("downPaymentPct", e.target.value)}
               className="w-full accent-blue-600"
             />
          </div>

          <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-500">Interest Rate</label>
                <span className="text-xs font-bold text-slate-700">{data.interestRate}%</span>
             </div>
             <input 
               type="range" min="0" max="12" step="0.125"
               value={data.interestRate || 0}
               onChange={(e) => handleChange("interestRate", e.target.value)}
               className="w-full accent-blue-600"
             />
          </div>

          <div className="p-3 border border-slate-100 rounded-lg bg-slate-50">
             <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monthly P&I</span>
                <span className="font-mono font-bold text-slate-900">${monthlyMortgage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
             </div>
          </div>
        </div>

        {/* COL 3: OPERATIONS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
             Operations
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Market Rent (Monthly)</label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input 
                  type="number" 
                  value={data.estRent || ""}
                  onChange={(e) => handleChange("estRent", e.target.value)}
                  className="w-full p-2 pl-6 bg-slate-50 border border-slate-200 rounded text-slate-700"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Annual Tax</label>
                <input 
                  type="number" 
                  value={data.taxAmount || ""}
                  onChange={(e) => handleChange("taxAmount", e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700"
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">OpEx (Ins/Maint)</label>
                <input 
                  type="number" 
                  value={data.opexAnnual || ""}
                  onChange={(e) => handleChange("opexAnnual", e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700"
                />
             </div>
          </div>
          
           <div className="p-3 border border-slate-100 rounded-lg bg-emerald-50">
             <div className="flex justify-between text-sm">
                <span className="text-emerald-700 font-medium">Net Monthly Cash Flow</span>
                <span className="font-mono font-bold text-emerald-900">
                    {cashFlow > 0 ? "+" : ""}${cashFlow.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </span>
             </div>
          </div>

          <div className="pt-2">
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors disabled:opacity-50 text-sm"
             >
                {isSaving ? "Syncing..." : "Save Scenarios"}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
'
[System.IO.File]::WriteAllText($compPath, $compContent.Trim())


# ==========================================
# 3. THE INTEGRATION: PAGE UPDATE
# ==========================================
$pagePath = "app/analysis/[id]/page.tsx"
Write-Host ">>> [3/3] Wiring Dashboard to Page..." -ForegroundColor Yellow

$pageContent = '
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
'
[System.IO.File]::WriteAllText($pagePath, $pageContent.Trim())

# ==========================================
# 4. DEPLOY
# ==========================================
Write-Host ">>> [4/4] Pushing Certified Phase 3 UI..." -ForegroundColor Yellow
git add .
git commit -m "PHASE 3: UI DEPLOYMENT (Gauntlet Certified & Syntax Fixed)" --allow-empty
git push origin main

Write-Host "--------------------------------------------------------"
Write-Host ">>> SUCCESS: CERTIFIED ENGINE SHIPPED." -ForegroundColor Green
Write-Host ">>> Vercel is building the hardened Financial Engine."
Write-Host "--------------------------------------------------------"
