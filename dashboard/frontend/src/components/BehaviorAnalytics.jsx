import React, { useState } from 'react';
import { Users, UserX, UserCheck, Activity, Target, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function BehaviorAnalytics() {
  const [inputData, setInputData] = useState(JSON.stringify({
    "login_hour": 3,
    "session_duration": 480,
    "failed_logins": 5,
    "pages_visited": 120,
    "data_transferred": 5000
  }, null, 2));
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeBehavior = async () => {
    setLoading(true);
    try {
      const parsed = JSON.parse(inputData);
      const res = await fetch('http://localhost:5005/api/behavior/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [parsed] })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Invalid JSON format");
    }
    setLoading(false);
  };

  const loadPreset = (type) => {
    if (type === 'normal') {
      setInputData(JSON.stringify({
        "login_hour": 10,
        "session_duration": 45,
        "failed_logins": 0,
        "pages_visited": 15,
        "data_transferred": 200
      }, null, 2));
    } else {
      setInputData(JSON.stringify({
        "login_hour": 2,
        "session_duration": 600,
        "failed_logins": 8,
        "pages_visited": 350,
        "data_transferred": 15000
      }, null, 2));
    }
  };

  // Mock historical data
  const historyData = Array.from({length: 30}).map((_, i) => ({
    day: i,
    risk: Math.max(0, 20 + Math.sin(i/3)*10 + (i === 25 ? 60 : 0))
  }));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
          <Users className="text-primary" size={28} />
          UEBA (User & Entity Behavior Analytics)
        </h2>
        <p className="text-textMuted text-sm">Unsupervised anomaly detection using Isolation Forests to flag compromised accounts or insider threats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="glass-card flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Target size={16}/> Session Parameters</h3>
            <div className="flex gap-2">
              <button onClick={() => loadPreset('normal')} className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Normal Session</button>
              <button onClick={() => loadPreset('anomaly')} className="text-xs px-2 py-1 bg-danger/10 text-danger hover:bg-danger/20 rounded">Suspicious Activity</button>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <textarea 
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full flex-1 bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-primary/90 focus:outline-none focus:border-primary/50 min-h-[200px]"
            />
            <button 
              onClick={analyzeBehavior}
              disabled={loading}
              className="btn-primary w-full mt-4 py-3"
            >
              {loading ? 'Processing Model...' : 'Evaluate Behavioral Risk'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col gap-6">
          {result ? (() => {
            const isNormal = result.risk_level >= 80;
            return (
            <div className={`glass-card p-6 border-l-4 ${!isNormal ? 'border-danger bg-danger/5' : 'border-success bg-success/5'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-2xl font-bold mb-1 flex items-center gap-2 ${!isNormal ? 'text-danger' : 'text-success'}`}>
                    {!isNormal ? <UserX size={28}/> : <UserCheck size={28}/>}
                    {isNormal ? 'NORMAL' : 'SUSPICIOUS'}
                  </h3>
                  <p className="text-sm text-textMuted">Risk Level: {!isNormal ? 'High' : 'Low'}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{result.risk_level}<span className="text-lg text-textMuted">/100</span></div>
                  <p className="text-xs text-textMuted mt-1">Risk Score</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-textMuted">Anomaly Score (Isolation Forest)</span>
                  <span className="font-mono">{result.anomaly_score.toFixed(4)}</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${!isNormal ? 'bg-danger' : 'bg-success'}`}
                    style={{ width: `${result.risk_level}%` }}
                  ></div>
                </div>
              </div>
            </div>
            );
          })() : (
            <div className="glass-card p-6 flex flex-col items-center justify-center flex-1 opacity-50 border border-dashed border-white/20">
              <Shield size={48} className="text-textMuted mb-4 opacity-50" />
              <p className="font-medium">Awaiting Data</p>
              <p className="text-sm text-textMuted">Run evaluation to see results.</p>
            </div>
          )}

          {/* Historical Baseline Mockup */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-4 text-textMuted uppercase flex items-center gap-2">
              <Activity size={16}/> User Historical Risk Baseline
            </h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Area type="monotone" dataKey="risk" stroke="#f59e0b" fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
