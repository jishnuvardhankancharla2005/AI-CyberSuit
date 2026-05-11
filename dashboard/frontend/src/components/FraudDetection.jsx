import React, { useState } from 'react';
import { CreditCard, CheckCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function FraudDetection() {
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState('12');
  const [distance, setDistance] = useState('5');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5005/api/fraud/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: parseFloat(amount),
            hour: parseInt(time),
            distance_from_home: parseFloat(distance)
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="glass-card p-6 md:p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <CreditCard className="text-primary" size={28} />
            Financial Fraud Detection
          </h2>
          <p className="text-textMuted mb-6">Graph Convolutional Networks (GCN) to detect anomalies and fraudulent transaction rings in real-time.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-textMuted uppercase tracking-wider">Transaction Amount ($)</label>
                    <input 
                        type="number"
                        className="input-field w-full"
                        placeholder="e.g. 500"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-textMuted uppercase tracking-wider">Time of Day (0-23)</label>
                    <input 
                        type="number"
                        className="input-field w-full"
                        placeholder="e.g. 14"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-textMuted uppercase tracking-wider">Distance from Home (Miles)</label>
                    <input 
                        type="number"
                        className="input-field w-full"
                        placeholder="e.g. 5"
                        value={distance}
                        onChange={e => setDistance(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleScan} 
                disabled={loading || !amount}
                className="btn-primary px-8"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Evaluating Risk...' : 'Analyze Transaction'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {results && results.results && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Risk Assessment Report</h3>
          </div>
          
          <div className="divide-y divide-white/5">
            {results.results.map((r, i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-text truncate mb-1">
                    Amount: <span className="text-primary font-bold">${r.transaction.amount}</span> | 
                    Time: {r.transaction.hour}:00 | 
                    Distance: {r.transaction.distance_from_home}mi
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-black/50 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${r.prediction === 1 ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${r.fraud_probability}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-textMuted">Risk Score: {r.risk_score}/100</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {r.prediction === 1 ? (
                    <div className="flex items-center gap-2 text-danger bg-danger/10 px-4 py-2 rounded-lg border border-danger/20">
                      <AlertCircle size={18} />
                      <span className="font-bold tracking-wide text-sm">SUSPECTED FRAUD</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-lg border border-success/20">
                      <CheckCircle size={18} />
                      <span className="font-bold tracking-wide text-sm">LEGITIMATE</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
