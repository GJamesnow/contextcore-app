"use client";

import React from "react";
import useSWR from "swr";
import { Clock, AlertCircle, Database } from "lucide-react";

// DIAGNOSTIC FETCHER: Captures the REAL error message
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

export default function HistoryFeed() {
  const { data, error, isLoading } = useSWR("/api/analysis", fetcher, { 
    refreshInterval: 5000,
    shouldRetryOnError: false
  });

  const historyItems = Array.isArray(data) ? data : [];
  const isError = error || (data && !Array.isArray(data));

  if (isError) return (
    <div className="p-4 text-red-400 text-xs flex flex-col gap-1 border border-red-900/50 rounded bg-red-950/20">
      <div className="flex items-center gap-2 font-bold">
        <AlertCircle size={14}/> 
        <span>CONNECTION FAILED</span>
      </div>
      <div className="font-mono text-[10px] opacity-80 break-all">
        {error?.message || "Unknown Data Format Error"}
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="p-4 text-slate-500 text-xs animate-pulse flex items-center gap-2">
      <Database size={14}/> Syncing Intelligence...
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-white text-sm font-bold flex items-center gap-2">
          <Clock className="text-emerald-500" size={16}/> Recent Intelligence
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-wider">
          {historyItems.length} Assets
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1">
        {historyItems.map((item: any) => (
          <div key={item.id} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-lg flex justify-between items-center">
            <div>
                <div className="text-slate-200 text-sm font-bold">{item.city}</div>
                <div className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
            <div className={`font-mono font-bold text-sm ${item.capRate > 6 ? "text-emerald-400" : "text-slate-300"}`}>
                {item.capRate.toFixed(2)}%
            </div>
          </div>
        ))}
        {historyItems.length === 0 && (
           <div className="py-8 text-center text-slate-600 text-xs">Awaiting Analysis Data...</div>
        )}
      </div>
    </div>
  );
}