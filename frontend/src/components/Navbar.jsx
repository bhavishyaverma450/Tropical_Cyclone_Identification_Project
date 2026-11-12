import React from 'react';
import { CloudLightning, Satellite, Activity, BarChart3, Database, FileText, Wifi } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiStatus }) {
  const navItems = [
    { id: 'map',      label: 'Live Satellite Map',      icon: Satellite },
    { id: 'classify', label: 'Classification Engine',   icon: Activity },
    { id: 'forecast', label: 'Trajectory Forecast',     icon: CloudLightning },
    { id: 'metrics',  label: 'Model Evaluation',        icon: BarChart3 },
    { id: 'datasets', label: 'Dataset Hub',             icon: Database },
    { id: 'advisory', label: 'Advisory Bulletin',       icon: FileText },
  ];

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#0ea5e9,#6366f1)'}}>
                <Satellite className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#050811]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-black tracking-tight glow-text-cyan">
                  TROPICAL CYCLONE INTELLIGENCE
                </h1>
                <span className="tag-badge" style={{background:'rgba(14,165,233,0.15)',color:'#38bdf8',border:'1px solid rgba(14,165,233,0.3)'}}>
                  TCI · v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI/ML Multi-Source Satellite Framework · Classification &amp; Prediction
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{background:'rgba(15,23,42,0.8)',border:'1px solid rgba(56,189,248,0.2)'}}>
              <span className={`inline-block w-2 h-2 rounded-full ${apiStatus ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 font-medium">{apiStatus ? 'AI Engine Online' : 'Connecting...'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-slate-400" style={{background:'rgba(15,23,42,0.6)',border:'1px solid rgba(30,41,59,0.8)'}}>
              <Wifi className="w-3 h-3 text-cyan-400" />
              INSAT-3DR · Himawari-9 · IBTrACS
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex items-center gap-1.5 mt-4 overflow-x-auto scrollbar-hide pb-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-tab ${activeTab === id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
