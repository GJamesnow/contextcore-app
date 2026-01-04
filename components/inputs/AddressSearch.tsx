"use client";
import { useState } from "react";
interface Props { onSearch: (addr: string) => void; isLoading: boolean; }

export default function AddressSearch({ onSearch, isLoading }: Props) {
  const [term, setTerm] = useState("");
  return (
    <div className="w-full">
      <input 
        className="w-full p-4 border rounded-xl mb-4 text-black" 
        placeholder="Enter Address..." 
        value={term} 
        onChange={(e) => setTerm(e.target.value)} 
      />
      <button 
        onClick={() => term && onSearch(term)}
        disabled={isLoading}
        className="w-full bg-black text-white p-4 rounded-xl font-bold"
      >
        {isLoading ? "Analyzing..." : "Analyze Deal"}
      </button>
    </div>
  );
}