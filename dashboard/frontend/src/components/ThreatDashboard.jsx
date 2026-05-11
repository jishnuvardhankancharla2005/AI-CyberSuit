import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ThreatDashboard() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:5005/api/threat_score')
        .then(r => r.json())
        .then(d => setData(d))
        .catch(e => console.error(e));

      fetch('http://localhost:5005/api/alerts')
        .then(r => r.json())
        .then(d => setAlerts(d))
        .catch(e => console.error(e));
    };
    
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 2000); // Live poll every 2s
    
    return () => clearInterval(intervalId);
  }, []);

  // Mock chart data for visualization
  const chartData = Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    threats: Math.floor(Math.random() * 50) + (i > 18 ? 30 : 0) // spike in evening
  }));

  if (!data) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <Shield size={100} />
          </div>
          <p className="text-textMuted font-medium text-sm mb-1">Global Threat Score</p>
          <div className="flex items-end gap-3">
            <h3 className={`text-5xl font-bold ${data.overall_score > 60 ? 'text-danger' : data.overall_score > 30 ? 'text-warning' : 'text-success'}`}>
              {data.overall_score}
            </h3>
            <span className="text-textMuted pb-1">/ 100</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
            <span>Status:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              data.risk_level === 'Critical' ? 'bg-danger/20 text-danger' : 
              data.risk_level === 'High' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
            }`}>
              {data.risk_level.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="glass-card p-6 col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <p className="text-textMuted font-medium text-sm">24h Threat Activity</p>
            <Activity size={18} className="text-primary" />
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-primary"/> 
            AI Module Analytics
          </h3>
          <div className="space-y-5">
            {Object.entries(data.module_scores).map(([mod, score]) => (
              <div key={mod} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize font-medium text-text/80">{mod.replace('_', ' ')}</span>
                  <span className={score > 70 ? 'text-danger' : score > 40 ? 'text-warning' : 'text-success'}>{score}%</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      score > 70 ? 'bg-danger shadow-[0_0_10px_#ef4444]' : 
                      score > 40 ? 'bg-warning shadow-[0_0_10px_#f59e0b]' : 
                      'bg-success shadow-[0_0_10px_#10b981]'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning"/> 
              Recent Alerts
            </h3>
            <span className="bg-danger/20 text-danger text-xs font-bold px-2 py-1 rounded-full">{alerts.length} NEW</span>
          </div>
          <div className="overflow-y-auto max-h-[350px] p-2">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 m-2 glass-panel hover:bg-white/5 transition-colors group cursor-pointer flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-lg ${
                  alert.severity === 'Critical' ? 'bg-danger/20 text-danger' :
                  alert.severity === 'High' ? 'bg-warning/20 text-warning' :
                  'bg-primary/20 text-primary'
                }`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm text-text group-hover:text-primary transition-colors">{alert.message}</h4>
                    <span className="text-xs text-textMuted flex items-center gap-1 whitespace-nowrap ml-2">
                      <Clock size={12} /> {alert.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-textMuted bg-black/30 px-2 py-0.5 rounded">{alert.module}</span>
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
