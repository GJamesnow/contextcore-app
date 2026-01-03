"use client";

import React, { useState, useMemo } from "react";
import { 
  Building2, MapPin, Calculator, Printer, Share2, 
  TrendingUp, X, Save, CheckCircle, AlertTriangle
} from "lucide-react";
import HistoryFeed from "@/components/HistoryFeed";

// --- TYPES ---
interface FinancialState {
  purchasePrice: number;
  renovationBudget: number;
  grossRent: number;
  operatingExpenses: number;
}

interface LocationState {
  country: string;
  region: string;
  city: string;
  notes: string;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export default function ContextCore() {
  // --- STATE ---
  const [financials, setFinancials] = useState<FinancialState>({
    purchasePrice: 1200000, renovationBudget: 150000, grossRent: 14000, operatingExpenses: 45000
  });

  const [location, setLocation] = useState<LocationState>({
    country: "Canada", region: "Northeast", city: "New York", notes: "Corner lot, high foot traffic."
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SUCCESS" | "ERROR">("IDLE");

  // --- ENGINE ---
  const metrics = useMemo(() => {
    const annualRent = financials.grossRent * 12;
    const noi = annualRent - financials.operatingExpenses;
    const totalInvestment = financials.purchasePrice + financials.renovationBudget;
    const capRate = totalInvestment > 0 ? (noi / financials.purchasePrice) * 100 : 0;
    const cashOnCash = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
    return { annualRent, noi, totalInvestment, capRate, cashOnCash };
  }, [financials]);

  const contextScore = useMemo(() => {
    let score = 0;
    if (metrics.capRate > 6) score += 20; else if (metrics.capRate > 4) score += 10;
    if (metrics.cashOnCash > 8) score += 20; else if (metrics.cashOnCash > 5) score += 10;
    if (location.city.length > 2) score += 15;
    if (location.region === "Northeast") score += 15;
    if (location.notes.length > 20) score += 30;
    return Math.min(100, score);
  }, [metrics, location]);

  // --- HANDLERS ---
  const handlePrint = () => window.print();
  
  const handleSave = async () => {
    setSaveStatus("SAVING");
    try {
      const payload = { location, financials, metrics, contextScore };
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Server Error");
      setSaveStatus("SUCCESS");
      setTimeout(() => setSaveStatus("IDLE"), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus("ERROR");
      setTimeout(() => setSaveStatus("IDLE"), 3000);
    }
  };

  const handleShare = async () => {
    const shareData = { title: "ContextCore", text: `Score: ${contextScore}`, url: window.location.href };
    try { 
      if (navigator.share) await navigator.share(shareData); 
      else { await navigator.clipboard.writeText(JSON.stringify(shareData)); alert("Copied!"); }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 print:bg-white print:text-black">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold">
              <Building2 size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Context<span className="text-emerald-500">Core</span></h1>
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleSave} 
              disabled={saveStatus === "SAVING"}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition text-xs uppercase tracking-wider ${
                saveStatus === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" :
                saveStatus === "ERROR" ? "bg-red-500/20 text-red-400 border border-red-500/50" :
                "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {saveStatus === "SAVING" ? <span className="animate-spin">...</span> : 
               saveStatus === "SUCCESS" ? <CheckCircle size={16}/> : 
               saveStatus === "ERROR" ? <AlertTriangle size={16}/> : 
               <Save size={16}/>}
              {saveStatus === "SUCCESS" ? "Saved" : saveStatus === "ERROR" ? "Failed" : "Save Analysis"}
            </button>
            <div className="h-6 w-px bg-slate-800 mx-2"></div>
            <button onClick={handlePrint} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"><Printer size={20} /></button>
            <button onClick={handleShare} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-emerald-400"><Share2 size={20} /></button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-8 print:w-full">
          {/* LOCATION */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 print:border-gray-300 print:bg-white">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
              <MapPin className="text-emerald-500" size={18} /> Asset Location
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="label-text">Country</label>
                  <select className="input-field" value={location.country} onChange={e => setLocation({...location, country: e.target.value})}>
                    <option value="USA">United States</option><option value="Canada">Canada</option><option value="UK">United Kingdom</option>
                  </select>
               </div>
               <div>
                  <label className="label-text">Region</label>
                  <select className="input-field" value={location.region} onChange={e => setLocation({...location, region: e.target.value})}>
                    <option value="Northeast">Northeast</option><option value="Southeast">Southeast</option><option value="Midwest">Midwest</option>
                  </select>
               </div>
            </div>
            <div className="mb-4">
              <label className="label-text">City</label>
              <input type="text" className="input-field" value={location.city} onChange={e => setLocation({...location, city: e.target.value})} />
            </div>
            <div>
              <label className="label-text">Notes</label>
              <textarea className="input-field min-h-[80px]" value={location.notes} onChange={e => setLocation({...location, notes: e.target.value})} />
            </div>
          </section>

          {/* FINANCIALS */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 print:border-gray-300 print:bg-white">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
              <Calculator className="text-emerald-500" size={18} /> Financial Engine
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="sub-header">Acquisition</h3>
                <div><label className="label-text">Purchase Price</label><input type="number" className="input-mono" value={financials.purchasePrice} onChange={e => setFinancials({...financials, purchasePrice: +e.target.value})} /></div>
                <div><label className="label-text">Reno Budget</label><input type="number" className="input-mono" value={financials.renovationBudget} onChange={e => setFinancials({...financials, renovationBudget: +e.target.value})} /></div>
              </div>
              <div className="space-y-4">
                <h3 className="sub-header">Operations</h3>
                <div><label className="label-text">Gross Rent (Mo)</label><input type="number" className="input-mono" value={financials.grossRent} onChange={e => setFinancials({...financials, grossRent: +e.target.value})} /></div>
                <div><label className="label-text">OpEx (Yr)</label><input type="number" className="input-mono" value={financials.operatingExpenses} onChange={e => setFinancials({...financials, operatingExpenses: +e.target.value})} /></div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: OUTPUT & HISTORY */}
        <div className="lg:col-span-5 space-y-6">
           {/* SCORE */}
           <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-500/30 rounded-xl p-6 text-center print:border-black print:bg-white">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2 print:text-black">Context Score</h3>
              <div className="text-6xl font-black text-white mb-2 print:text-black">{contextScore}<span className="text-2xl text-slate-400 font-normal">/100</span></div>
           </div>
           
           {/* METRICS */}
           <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden print:border-gray-300 print:bg-white">
              <div className="divide-y divide-slate-800 print:divide-gray-300">
                <MetricRow label="NOI" value={formatCurrency(metrics.noi)} />
                <MetricRow label="Total Invest" value={formatCurrency(metrics.totalInvestment)} />
                <MetricRow label="Cap Rate" value={`${metrics.capRate.toFixed(2)}%`} highlight />
                <MetricRow label="Cash-on-Cash" value={`${metrics.cashOnCash.toFixed(2)}%`} highlight />
              </div>
           </div>

           <button onClick={() => setIsModalOpen(true)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 print:hidden">
             <TrendingUp size={18} /> View Drill-down
           </button>

           {/* HISTORY FEED */}
           <div className="pt-6 border-t border-slate-800">
             <HistoryFeed />
           </div>

        </div>
      </main>

      {/* STYLES */}
      <style jsx global>{`
        .label-text { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
        .input-field { width: 100%; background-color: #020617; border: 1px solid #334155; border-radius: 0.25rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; transition: all; }
        .input-field:focus { border-color: #10b981; box-shadow: 0 0 0 1px #10b981; }
        .input-mono { width: 100%; background-color: #020617; border: 1px solid #334155; border-radius: 0.25rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; font-family: monospace; text-align: right; }
        .input-mono:focus { border-color: #10b981; box-shadow: 0 0 0 1px #10b981; }
        .sub-header { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
      `}</style>
      
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl p-6">
             <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Details</h3><button onClick={()=>setIsModalOpen(false)}><X/></button></div>
             <p className="text-slate-400 mb-4">Detailed market analysis would appear here.</p>
             <button onClick={()=>setIsModalOpen(false)} className="w-full bg-emerald-600 py-3 rounded font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const MetricRow = ({ label, value, highlight }: any) => (
  <div className="flex justify-between p-4 hover:bg-slate-800/50">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className={`font-mono font-bold ${highlight ? 'text-emerald-400 text-lg' : 'text-slate-200'}`}>{value}</span>
  </div>
);