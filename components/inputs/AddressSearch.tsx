"use client";
import { useState } from "react";

interface Props {
  onSearch: (address: string) => void;
  isLoading: boolean;
}

export default function AddressSearch({ onSearch, isLoading }: Props) {
  const [term, setTerm] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if(term) onSearch(term); }} className="w-full relative">
      <input
        type="text"
        placeholder="Enter Property Address (e.g., 123 Fixer Upper Ln)"
        className="w-full p-4 pl-6 rounded-xl border border-slate-200 shadow-sm text-lg focus:ring-2 focus:ring-slate-900 outline-none"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        disabled={isLoading}
      />
      <button 
        type="submit"
        disabled={isLoading || !term}
        className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
      >
        {isLoading ? "Analyzing..." : "Run Analysis"}
      </button>
    </form>
  );
}