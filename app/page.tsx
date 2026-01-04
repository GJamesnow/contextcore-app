"use client";
import { useState } from "react";
import AddressSearch from "@/components/inputs/AddressSearch";
import { createAnalysis } from "@/app/actions/create-analysis";

export default function Home() {
  const [loading, setLoading] = useState(false);
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-black">ContextCore</h1>
        <AddressSearch isLoading={loading} onSearch={async (addr) => {
          setLoading(true);
          const fd = new FormData(); fd.append("address", addr);
          await createAnalysis(fd);
        }} />
      </div>
    </main>
  );
}