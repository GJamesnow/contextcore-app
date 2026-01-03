import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';

// Dynamically import Map (No SSR)
const AxiomMap = dynamic(() => import('../components/AxiomMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-black/50 animate-pulse" />
});

// Dynamically import TimeFilter (No SSR)
const TimeFilter = dynamic(() => import('../components/TimeFilter'), { ssr: false });

export default function Home() {
  // 1. CLIENT-ONLY GATE
  // We start 'mounted' as false. The useEffect only runs in the browser.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [data, setData] = useState([]);
  
  // Define Slider Bounds (Default: Last 24 Hours)
  // These are calculated only when the component renders.
  const [bounds] = useState(() => {
    const now = Date.now();
    return {
      min: now - (24 * 60 * 60 * 1000), 
      max: now
    };
  });

  const [timeWindow, setTimeWindow] = useState<[number, number]>([bounds.min, bounds.max]);

  const fetchData = useCallback(async () => {
    if (!mounted) return; // Don't fetch on server

    try {
      const startISO = new Date(timeWindow[0]).toISOString();
      const endISO = new Date(timeWindow[1]).toISOString();
      
      const url = `/api/logs?start=${startISO}&end=${endISO}`;
      
      const res = await fetch(url);
      const json = await res.json();
      if (Array.isArray(json)) setData(json);
    } catch (err) { 
      console.error("Fetch Failed", err); 
    }
  }, [timeWindow, mounted]);

  // Initial Fetch & Polling
  useEffect(() => {
    if (!mounted) return;

    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, [fetchData, mounted]);

  // 2. RENDER LOADING STATE IF NOT MOUNTED
  // This ensures the Server and Initial Client render match perfectly (both are null or loading).
  if (!mounted) {
    return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Initializing Axiom...</div>;
  }

  return (
    <div className="h-screen w-screen bg-black text-white relative">
      <Head>
        <title>Axiom Unified</title>
        <link rel="stylesheet" href="https://unpkg.com/rc-slider@10.0.0/assets/index.css" />
      </Head>

      <div className="absolute top-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur p-4 rounded border border-gray-700 shadow-xl">
        <h1 className="text-xl font-bold text-blue-500">AXIOM UNIFIED</h1>
        <div className="text-sm text-gray-400 mt-2">
          Status: <span className="text-green-400">ONLINE</span><br/>
          Arch: <span className="text-purple-400">NEXT.JS FULL STACK</span><br/>
          Nodes: <span className="text-white">{data.length}</span>
        </div>
      </div>

      <TimeFilter 
        startTime={bounds.min} 
        endTime={bounds.max} 
        onChange={(newRange) => setTimeWindow(newRange)} 
      />

      <AxiomMap data={data} />
    </div>
  );
}