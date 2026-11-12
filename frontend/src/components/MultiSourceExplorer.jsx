import React, { useEffect, useState } from 'react';
import { Database, ExternalLink, Satellite, BookOpen } from 'lucide-react';

const CHANNEL_COLORS = {
  'Infrared': '#00f2fe', 'Water Vapor': '#818cf8', 'Passive Microwave': '#f87171',
  'Visible': '#e2e8f0', 'Multi-Source': '#34d399', 'Track': '#fbbf24',
};

export default function MultiSourceExplorer() {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/datasets')
      .then(r => r.json()).then(d => setDatasets(d.datasets || []))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Part I — Research Dataset Library</p>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" /> Multi-Source Satellite Dataset Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Curated benchmark datasets referenced in the project proposal document for cyclone classification and spatiotemporal prediction. All datasets are publicly accessible.
        </p>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {datasets.map((d, idx) => {
          const chanKey = Object.keys(CHANNEL_COLORS).find(k => d.channels.includes(k));
          const accentColor = chanKey ? CHANNEL_COLORS[chanKey] : '#67e8f9';
          return (
            <div key={idx} className="glass-panel p-5 flex flex-col gap-4 transition-all hover:scale-[1.01]"
              style={{borderTop:`3px solid ${accentColor}66`}}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:`${accentColor}18`,border:`1px solid ${accentColor}33`}}>
                  <Satellite className="w-5 h-5" style={{color:accentColor}} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm leading-tight">{d.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{d.purpose}</p>
                </div>
              </div>

              <div className="rounded-xl p-3 space-y-2.5" style={{background:'rgba(15,23,42,0.6)',border:'1px solid rgba(30,41,59,0.8)'}}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Frames / Coverage</span>
                    <span className="font-mono font-semibold" style={{color:accentColor}}>{d.frames}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Cyclones</span>
                    <span className="text-slate-200 font-semibold">{d.cyclones}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500 block mb-0.5">Channels / Variables</span>
                  <span className="text-slate-300 leading-relaxed">{d.channels}</span>
                </div>
              </div>

              <a href={d.link} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{color:accentColor}}>
                <ExternalLink className="w-3.5 h-3.5" /> Access Repository
              </a>
            </div>
          );
        })}
      </div>

      {/* Research Papers */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" /> Key References — Part II Research Papers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title:'ConvLSTM for NIO Cyclone Classification & Wind Estimation', year:2025, link:'https://doi.org/10.1371/journal.pone.0330705' },
            { title:'Multi-Source Satellite Probabilistic Intensity Estimation', year:2024, link:'https://www.mdpi.com/2072-4292/16/4/606' },
            { title:'Himawari-8 Cloud Products + CNN for Intensity Classification', year:2022, link:'https://www.mdpi.com/2072-4292/14/4/812' },
            { title:'TropiCycloneNet: Global TC Track & Intensity Forecasting', year:2025, link:'https://www.nature.com/articles/s41467-025-61087-4' },
            { title:'Short-Term Intensity Prediction via 3D CNN / ConvGRU', year:2024, link:'https://www.mdpi.com/2072-4292/16/6/984' },
            { title:'Operational Tropical Cyclone Forecasting with AI', year:2026, link:'https://www.nature.com/articles/s41586-026-10953-2' },
          ].map((p, i) => (
            <a key={i} href={p.link} target="_blank" rel="noreferrer"
              className="flex items-start gap-3 p-3.5 rounded-xl transition-all hover:scale-[1.01]"
              style={{background:'rgba(15,23,42,0.6)',border:'1px solid rgba(56,189,248,0.12)'}}>
              <span className="tag-badge mt-0.5 flex-shrink-0 font-mono" style={{background:'rgba(14,165,233,0.12)',color:'#38bdf8',border:'1px solid rgba(14,165,233,0.25)'}}>{p.year}</span>
              <span className="text-xs text-slate-300 leading-relaxed hover:text-cyan-300 transition-colors">{p.title} <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" /></span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
