"use client";
import { useState } from "react";
import AddressSearch from "@/components/inputs/AddressSearch";
import { createAnalysis } from "@/app/actions/create-analysis";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const handleSearch = async (address: string) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("address", address);
    await createAnalysis(formData);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-xl w-full space-y-8 text-center">
        <div className="space-y-2">
           <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
             ContextCore
           </h1>
           <p className="text-slate-500 text-xl">
             Instant Deal Analysis for Wholesalers.
           </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
           <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Find Your Next Deal</div>
           <AddressSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}