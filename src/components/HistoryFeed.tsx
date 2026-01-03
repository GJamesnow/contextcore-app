"use client";

import React from "react";
import useSWR from "swr";
import { Clock, TrendingUp, DollarSign, AlertCircle, Database } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const formatCurrency = (val: number) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export default function HistoryFeed() {
  // Polls backend every 2 seconds for new saves
  const { data, error, isLoading } = useSWR("http://localhost:3001/api/analysis", fetcher, { refreshInterval: 2000 });

  if (error) return <div className="p-4 text-red-400 text-xs flex items-center gap-2 border border-red-900/50 rounded bg-red-950/20"><AlertCircle size={14}/> Offline</div>;
  if (isLoading) return <div className="p-4 text-slate-500 text-xs animate-pulse flex items-center gap-2"><Database size={14}/> Syncing DB...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-white text-sm font-bold flex items-center gap-2">
          <Clock className="text-emerald-500" size={16}/> Recent Intelligence
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-wider">
          {data?.length || 0} Assets
        </span>
      </div>

      {/* SCROLLABLE CONTAINER */}
      <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {data?.map((item: any) => (
          <div key={item.id} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-lg flex justify-between items-center hover:bg-slate-800 hover:border-slate-700 transition group cursor-default">
            
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                item.contextScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                item.contextScore >= 50 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                "bg-slate-700/50 text-slate-400 border border-slate-600"
              }`}>
                {item.contextScore}
              </div>
              <div>
                <div className="text-slate-200 text-sm font-bold leading-tight">
                  {item.city}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                   <span>{item.region}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                   <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cap Rate</div>
              <div className={`font-mono font-bold text-sm ${item.capRate > 6 ? "text-emerald-400" : "text-slate-300"}`}>
                {item.capRate.toFixed(2)}%
              </div>
            </div>

          </div>
        ))}
        {data?.length === 0 && (
           <div className="py-8 text-center">
              <p className="text-slate-600 text-xs">Database is empty.</p>
              <p className="text-slate-700 text-[10px] mt-1">Save an analysis to begin tracking.</p>
           </div>
        )}
      </div>
    </div>
  );
}