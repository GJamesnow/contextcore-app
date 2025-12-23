"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { MapPin, Activity, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: logs, error, mutate } = useSWR('http://localhost:3001/api/latest?limit=10', fetcher, { refreshInterval: 2000 });
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const isHot = Math.random() > 0.5;
      await fetch('http://localhost:3001/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            latitude: isHot ? 40.7128 : 35.0000, 
            longitude: isHot ? -74.0060 : -80.0000, 
            source: 'DASHBOARD_SIM' 
        }),
      });
      mutate();
    } catch (err) { console.error(err); } 
    finally { setSimulating(false); }
  };

  // Inline styles to ensure visibility regardless of Tailwind config
  const containerStyle = { backgroundColor: '#0f172a', color: '#e2e8f0', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' };
  const buttonStyle = { 
    backgroundColor: '#059669', color: 'white', padding: '10px 20px', borderRadius: '5px', 
    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' 
  };
  const cardStyle = { backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity /> AXIOM MONITOR
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>REAL-TIME GEOSPATIAL INTELLIGENCE</p>
          </div>
          <button onClick={handleSimulate} disabled={simulating} style={buttonStyle}>
            {simulating ? <RefreshCw className="animate-spin" /> : <MapPin />} SIMULATE PING
          </button>
        </div>

        {/* STATUS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '0.75rem', color: '#64748b' }}>SYSTEM STATUS</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#34d399' }}>ONLINE</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '0.75rem', color: '#64748b' }}>DATA SOURCE</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#60a5fa' }}>PORT 3001</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '0.75rem', color: '#64748b' }}>LOGS CAPTURED</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{logs ? logs.length : '-'}</p>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div style={cardStyle}>
          <div style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#cbd5e1' }}>INCOMING TELEMETRY STREAM</h2>
          </div>
          <div>
            {!logs ? <p>Connecting to Axiom Backend...</p> : logs.map((log: any) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{log.source}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</div>
                  <div style={{ fontWeight: 'bold', color: log.marketScore > 75 ? '#f87171' : '#94a3b8' }}>
                    SCORE: {log.marketScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}