"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { MapPin, Activity, RefreshCw, Database, Server } from 'lucide-react';

// Strict Type Definition
interface GeoLog {
  id: string;
  latitude: number;
  longitude: number;
  source: string;
  marketScore: number;
  status: string;
  timestamp: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: logs, error, mutate } = useSWR<GeoLog[]>('http://localhost:3001/api/latest?limit=10', fetcher, {
    refreshInterval: 2000,
  });

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

  // Inline Styles for robustness
  const cardStyle = { backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity /> AXIOM MONITOR
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>REAL-TIME GEOSPATIAL INTELLIGENCE</p>
          </div>
          <button 
            onClick={handleSimulate} 
            disabled={simulating} 
            style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            {simulating ? <RefreshCw className="animate-spin" size={16}/> : <MapPin size={16}/>} 
            SIMULATE PING
          </button>
        </div>

        {/* METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}><Server size={14}/> SYSTEM STATUS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>ONLINE</div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}><Database size={14}/> DB CONNECTION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>PORT 5433</div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}><Activity size={14}/> TOTAL LOGS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9' }}>{logs ? logs.length : '-'}</div>
          </div>
        </div>

        {/* FEED */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #334155', backgroundColor: '#1e293b' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#cbd5e1' }}>INCOMING TELEMETRY</h2>
          </div>
          <div style={{ backgroundColor: '#0f172a' }}>
            {error && <div style={{ padding: '2rem', color: '#ef4444', textAlign: 'center' }}>CONNECTION ERROR - ENSURE BACKEND IS RUNNING ON PORT 3001</div>}
            
            {!logs ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Establishing Uplink...</div>
            ) : logs.map((log: GeoLog) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: log.status === 'HOT' ? '#ef4444' : '#475569', boxShadow: log.status === 'HOT' ? '0 0 8px #ef4444' : 'none' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{log.source}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: log.marketScore > 75 ? '#f87171' : '#64748b' }}>SCORE: {log.marketScore}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}