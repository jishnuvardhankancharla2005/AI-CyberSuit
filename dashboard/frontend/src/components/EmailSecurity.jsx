import React, { useState } from 'react';
import { Mail, CheckCircle, Search, RefreshCw, AlertTriangle } from 'lucide-react';

export default function EmailSecurity() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5005/api/email/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: input.split('\n').filter(e => e.trim()) })
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
            <Mail className="text-primary" size={28} />
            Email Security & Spam Filter
          </h2>
          <p className="text-textMuted mb-6">Transformer-based NLP (BERT) sequence classification to catch evasive spam and targeted phishing emails.</p>
          
          <div className="space-y-4">
            <div className="relative">
              <textarea 
                className="input-field min-h-[120px] font-mono text-sm resize-y"
                placeholder="Paste email content here (one per line)...&#10;e.g. Congratulations! You won $1000 click here now"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="absolute top-3 right-3 text-textMuted opacity-50 pointer-events-none">
                <Mail size={20} />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleScan} 
                disabled={loading || !input.trim()}
                className="btn-primary px-8"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Analyzing Semantics...' : 'Scan Emails'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Scan Results</h3>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-textMuted">Total: {results.total}</span>
              <span className="text-danger flex items-center gap-1"><AlertTriangle size={14}/> Threats: {results.threats}</span>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {results.results.map((r, i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-text truncate mb-1" title={r.email_preview}>{r.email_preview}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-black/50 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${r.prediction === 1 ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${r.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-textMuted">{r.confidence}% confidence</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {r.prediction === 1 ? (
                    <div className="flex items-center gap-2 text-danger bg-danger/10 px-4 py-2 rounded-lg border border-danger/20">
                      <AlertTriangle size={18} />
                      <span className="font-bold tracking-wide text-sm">SPAM/PHISHING</span>
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
