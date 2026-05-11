import React, { useState } from 'react';
import { Camera, CheckCircle, Search, Video, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';

export default function DeepfakeScanner() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5005/api/deepfake/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: input })
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
            <Camera className="text-primary" size={28} />
            Deepfake & Media Authenticity Scanner
          </h2>
          <p className="text-textMuted mb-6">Advanced spectral analysis and CNN-based detection to identify AI-generated artifacts in audio and video files.</p>
          
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                className="input-field w-full"
                placeholder="Enter Media URL (Video/Audio) to scan..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="absolute top-3 right-3 text-textMuted opacity-50 pointer-events-none">
                <Video size={20} />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleScan} 
                disabled={loading || !input.trim()}
                className="btn-primary px-8"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Analyzing Artifacts...' : 'Scan Media'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Authenticity Analysis</h3>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-text truncate mb-1" title={results.url}>Media: {results.media_url}</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-48 bg-black/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${results.is_deepfake ? 'bg-danger' : 'bg-success'}`}
                    style={{ width: `${results.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs text-textMuted">{results.confidence}% confidence</span>
              </div>
              <p className="text-sm text-textMuted">Artifacts detected: {results.artifacts_found.join(', ')}</p>
            </div>
            
            <div className="flex-shrink-0">
              {results.is_deepfake ? (
                <div className="flex items-center gap-2 text-danger bg-danger/10 px-4 py-2 rounded-lg border border-danger/20">
                  <AlertCircle size={18} />
                  <span className="font-bold tracking-wide text-sm">DEEPFAKE DETECTED</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-lg border border-success/20">
                  <CheckCircle size={18} />
                  <span className="font-bold tracking-wide text-sm">AUTHENTIC MEDIA</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
