'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';

interface TimeFilterProps {
  startTime: number;
  endTime: number;
  onChange: (range: [number, number]) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ startTime, endTime, onChange }) => {
  const [range, setRange] = useState<[number, number]>([startTime, endTime]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setRange([value[0], value[1]]);
    }
  };

  const handleAfterChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      onChange([value[0], value[1]]);
    }
  };

  const formatTime = (ts: number) => {
    // Fallback for server-side to prevent layout shift
    if (!isMounted) return new Date(ts).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-3/4 max-w-2xl bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-slate-200 z-[1000]">
      <div className="flex justify-between mb-4 text-slate-700 font-semibold font-mono text-sm">
        {/* The Magic Flag: suppressHydrationWarning */}
        <span suppressHydrationWarning>
          {formatTime(range[0])}
        </span>
        
        <span className="text-slate-400 text-xs tracking-widest uppercase">Time Window</span>
        
        <span suppressHydrationWarning>
          {formatTime(range[1])}
        </span>
      </div>
      
      <Slider
        range
        min={startTime}
        max={endTime}
        value={range}
        onChange={handleChange}
        onAfterChange={handleAfterChange}
        trackStyle={[{ backgroundColor: '#3b82f6', height: 6 }]}
        handleStyle={[
          { borderColor: '#2563eb', height: 20, width: 20, marginTop: -7, backgroundColor: '#fff', opacity: 1 },
          { borderColor: '#2563eb', height: 20, width: 20, marginTop: -7, backgroundColor: '#fff', opacity: 1 }
        ]}
        railStyle={{ backgroundColor: '#e2e8f0', height: 6 }}
      />
    </div>
  );
};

export default TimeFilter;