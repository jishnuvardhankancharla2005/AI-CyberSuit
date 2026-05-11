import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Crosshair, Server, Play, Square } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function NetworkIDS() {
  const [active, setActive] = useState(true);
  const [logs, setLogs] = useState([]);
  const [trafficData, setTrafficData] = useState(Array.from({length: 20}).map((_, i) => ({ time: i, packets: 100 })));

  // Simulate network traffic stream
  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      // Simulate traffic volume
      const newVol = Math.max(50, trafficData[trafficData.length-1].packets + (Math.random() * 60 - 30));
      setTrafficData(prev => [...prev.slice(1), { time: prev[prev.length-1].time + 1, packets: newVol }]);
      
      // Randomly trigger packet analysis 
      if (Math.random() > 0.6) {
        analyzePacket();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [active, trafficData]);

  const analyzePacket = async () => {
    // Generate a dummy network log text
    const src = `192.168.1.${Math.floor(Math.random()*255)}`;
    const port = Math.random() > 0.8 ? [22, 80, 443, 3306][Math.floor(Math.random()*4)] : Math.floor(Math.random()*60000)+1024;
    const logText = `SRC=${src} DST=10.0.0.5 PORT=${port} LEN=${Math.floor(Math.random()*1500)} FLAG=${Math.random()>0.9?'SYN':'ACK'}`;

    try {
      const res = await fetch('http://localhost:5005/api/ids/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: logText })
      });
      const data = await res.json();
      
      const newLog = {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        raw: logText,
        ...data
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="text-primary" size={28} />
            Intrusion Detection System
          </h2>
          <p className="text-textMuted text-sm">Real-time network traffic analysis using Random Forest classifiers.</p>
        </div>
        <button 
          onClick={() => setActive(!active)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
            active ? 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30' : 'bg-success/20 text-success border border-success/30 hover:bg-success/30'
          }`}
        >
          {active ? <><Square size={16} fill="currentColor"/> STOP SENSOR</> : <><Play size={16} fill="currentColor"/> START SENSOR</>}
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-textMuted uppercase tracking-wider flex items-center gap-2">
            <Server size={16}/> Live Traffic Volume
          </h3>
          <span className="text-xs font-mono bg-black/50 px-2 py-1 rounded text-primary border border-primary/20">PORT: ETH0</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6' }}
                labelStyle={{ display: 'none' }}
              />
              <Line type="monotone" dataKey="packets" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card overflow-hidden flex flex-col h-[400px]">
        <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
          <h3 className="font-semibold text-sm text-textMuted uppercase tracking-wider flex items-center gap-2">
            <Crosshair size={16}/> Packet Inspection Stream
          </h3>
          <span className="text-xs text-textMuted">Last 50 packets</span>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-black/20 font-mono text-xs p-4 space-y-1">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-textMuted">Waiting for traffic...</div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`flex gap-4 p-2 rounded items-center border-l-2 transition-all ${
                  log.prediction === 1 
                    ? 'bg-danger/10 border-danger text-danger hover:bg-danger/20' 
                    : 'border-success/30 text-text/70 hover:bg-white/5'
                }`}
              >
                <span className="opacity-50 w-20 shrink-0">{log.time}</span>
                <span className="flex-1 truncate" title={log.raw}>{log.raw}</span>
                {log.prediction === 1 ? (
                  <span className="font-bold flex items-center gap-1 bg-danger/20 px-2 py-0.5 rounded shrink-0">
                    <ShieldAlert size={12}/> {log.attack_type}
                  </span>
                ) : (
                  <span className="text-success opacity-50 shrink-0">OK</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
