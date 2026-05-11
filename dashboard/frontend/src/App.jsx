import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Activity, Lock, Mail, Users, 
  CreditCard, FileSearch, Zap, CheckCircle2, XCircle,
  Video, Code
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import ThreatDashboard from './components/ThreatDashboard';
import PhishingScanner from './components/PhishingScanner';
import MalwareAnalysis from './components/MalwareAnalysis';
import NetworkIDS from './components/NetworkIDS';
import BehaviorAnalytics from './components/BehaviorAnalytics';
import DeepfakeScanner from './components/DeepfakeScanner';
import VulnerabilityScanner from './components/VulnerabilityScanner';
import EmailSecurity from './components/EmailSecurity';
import FraudDetection from './components/FraudDetection';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5005/api/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(err => console.error("API not reachable", err));
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <ThreatDashboard />;
      case 'phishing': return <PhishingScanner />;
      case 'malware': return <MalwareAnalysis />;
      case 'ids': return <NetworkIDS />;
      case 'behavior': return <BehaviorAnalytics />;
      case 'email': return <EmailSecurity />;
      case 'fraud': return <FraudDetection />;
      case 'deepfake': return <DeepfakeScanner />;
      case 'vulnerability': return <VulnerabilityScanner />;
      default: return <ThreatDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-danger/5 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card md:m-4 md:mr-0 z-10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">AI CyberSuite</h1>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              System Active
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={<Activity size={18}/>} label="Threat Dashboard" active={activeTab==='dashboard'} onClick={() => setActiveTab('dashboard')} />
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wider px-3">AI Modules</p>
          </div>
          <NavItem icon={<Mail size={18}/>} label="Phishing Scanner" active={activeTab==='phishing'} onClick={() => setActiveTab('phishing')} />
          <NavItem icon={<FileSearch size={18}/>} label="Malware Analysis" active={activeTab==='malware'} onClick={() => setActiveTab('malware')} />
          <NavItem icon={<Lock size={18}/>} label="Network IDS" active={activeTab==='ids'} onClick={() => setActiveTab('ids')} />
          <NavItem icon={<Users size={18}/>} label="Behavior Analytics" active={activeTab==='behavior'} onClick={() => setActiveTab('behavior')} />
          <NavItem icon={<Mail size={18}/>} label="Email Security" active={activeTab==='email'} onClick={() => setActiveTab('email')} />
          <NavItem icon={<CreditCard size={18}/>} label="Fraud Detection" active={activeTab==='fraud'} onClick={() => setActiveTab('fraud')} />
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wider px-3">Advanced Tools</p>
          </div>
          <NavItem icon={<Video size={18}/>} label="Deepfake Scanner" active={activeTab==='deepfake'} onClick={() => setActiveTab('deepfake')} />
          <NavItem icon={<Code size={18}/>} label="0-Day Code Scanner" active={activeTab==='vulnerability'} onClick={() => setActiveTab('vulnerability')} />
        </nav>

        {systemStatus && (
          <div className="p-4 border-t border-white/5 bg-black/20 m-4 rounded-xl">
            <p className="text-xs text-textMuted mb-2 font-medium">Model Engine Status</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text/80">API Connection</span>
              <span className="text-success flex items-center gap-1"><CheckCircle2 size={14}/> {systemStatus.status}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 glass-card mx-4 mt-4 mb-2 flex items-center justify-between px-6 z-10 flex-shrink-0">
          <h2 className="text-xl font-semibold capitalize">
            {activeTab === 'ids' ? 'Intrusion Detection System' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
              <AlertTriangle size={20} className="text-warning" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 z-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
      active 
        ? 'bg-primary/10 text-primary shadow-[inset_2px_0_0_0_#3b82f6]' 
        : 'text-text/70 hover:bg-white/5 hover:text-text'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
