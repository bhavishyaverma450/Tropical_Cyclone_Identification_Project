import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Navigation2, Crosshair, TrendingUp, AlertTriangle, Wind, Gauge } from 'lucide-react';

const eyeIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:32px;height:32px;border-radius:50%;background:rgba(239,68,68,0.25);border:2.5px solid #ef4444;display:flex;align-items:center;justify-content:center;animation:pulse 2s infinite;">
           <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></div>
         </div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const histIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#38bdf8;border:2px solid #0ea5e9;box-shadow:0 0 6px rgba(56,189,248,0.6);"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});

const fcIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#fbbf24;border:2px solid #f59e0b;box-shadow:0 0 8px rgba(251,191,36,0.6);"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});

const CATEGORY_COLORS = {
  SuCS: '#b83b5e', ESCS: '#ff4458', VSCS: '#ff6b35',
  SCS: '#fbbf24', CS: '#34d399', DD: '#38bdf8', D: '#94a3b8'
};

export default function MapViewer({ cyclones, selectedStorm, setSelectedStorm, satelliteImages }) {
  const [activeChannel, setActiveChannel] = useState('IR');

  const storm = selectedStorm || (cyclones && cyclones[0]);
  if (!storm) {
    return (
      <div className="flex items-center justify-center h-80 text-slate-500">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full animate-pulse" style={{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.2)'}} />
          <p>Loading satellite telemetry...</p>
        </div>
      </div>
    );
  }

  const histCoords = storm.historical_track.map(t => [t.lat, t.lon]);
  const fcCoords = [[storm.lat, storm.lon], ...storm.forecast_track.map(t => [t.lat, t.lon])];
  const catColor = CATEGORY_COLORS[storm.category_code] || '#94a3b8';
  const channels = [
    { code: 'IR', name: 'Infrared',     desc: 'Cloud-Top Temp' },
    { code: 'WV', name: 'Water Vapor',  desc: '6.7µm Moisture' },
    { code: 'MW', name: 'Microwave',    desc: '89GHz Precip' },
    { code: 'VIS',name: 'Visible',      desc: '0.65µm Daytime' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
      {/* ─── Sidebar ─── */}
      <div className="xl:col-span-1 flex flex-col gap-4">
        {/* Storm Selector */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Navigation2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Active Cyclones</h2>
          </div>
          <div className="space-y-2.5">
            {cyclones && cyclones.map(s => {
              const sc = CATEGORY_COLORS[s.category_code] || '#94a3b8';
              const active = storm.id === s.id;
              return (
                <button key={s.id} onClick={() => setSelectedStorm(s)}
                  className="w-full text-left p-3.5 rounded-xl transition-all"
                  style={{
                    background: active ? 'rgba(14,165,233,0.12)' : 'rgba(15,23,42,0.5)',
                    border: `1px solid ${active ? 'rgba(14,165,233,0.4)' : 'rgba(30,41,59,0.8)'}`,
                    boxShadow: active ? '0 0 14px rgba(14,165,233,0.12)' : 'none'
                  }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white truncate">{s.name}</span>
                    <span className="tag-badge text-white flex-shrink-0 ml-2" style={{background:sc+'33',color:sc,border:`1px solid ${sc}66`}}>{s.category_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate">{s.basin.split('(')[0].trim()}</span>
                    <span className="font-mono font-semibold ml-2" style={{color:sc}}>{s.current_wind_kts} kts</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spectral Channels */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Spectral Channel</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {channels.map(ch => (
              <button key={ch.code} onClick={() => setActiveChannel(ch.code)}
                className="p-2.5 rounded-lg text-left text-xs transition-all"
                style={{
                  background: activeChannel===ch.code ? 'rgba(14,165,233,0.18)' : 'rgba(15,23,42,0.6)',
                  border: `1px solid ${activeChannel===ch.code ? 'rgba(14,165,233,0.5)' : 'rgba(30,41,59,0.9)'}`,
                  color: activeChannel===ch.code ? '#67e8f9' : '#94a3b8'
                }}>
                <div className="font-bold">{ch.code}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{ch.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Telemetry */}
        <div className="glass-panel p-5" style={{borderLeft:`3px solid ${catColor}`}}>
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="w-4 h-4" style={{color:catColor}} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Telemetry</h2>
          </div>
          <div className="space-y-3">
            {[
              { label:'Position',       val:`${storm.lat}°N, ${storm.lon}°E`,   color:'#f8fafc', icon: null },
              { label:'Category',       val:storm.category_code,                 color:catColor },
              { label:'Max Wind',       val:`${storm.current_wind_kts} kts`,     color:'#fbbf24' },
              { label:'Min Pressure',   val:`${storm.current_pressure_hpa} hPa`, color:'#67e8f9' },
              { label:'RI Probability', val:`${(storm.rapid_intensification_prob*100).toFixed(0)}%`, color:'#f87171' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-mono font-bold" style={{color: item.color || '#f8fafc'}}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Map Panel ─── */}
      <div className="xl:col-span-3 glass-panel p-4 flex flex-col" style={{height:660}}>
        {/* Map header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">GIS Spatial Radar — Live Tracking</p>
            <h2 className="text-base font-bold text-white">{storm.name}
              <span className="ml-2 text-sm font-normal text-slate-400">[{storm.sensor}]</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono px-3 py-1.5 rounded-lg" style={{background:'rgba(15,23,42,0.8)',border:'1px solid rgba(30,41,59,0.9)'}}>
            <span className="flex items-center gap-1.5 text-sky-400"><span className="inline-block w-2 h-2 rounded-full bg-sky-400" /> Track History</span>
            <span className="flex items-center gap-1.5 text-rose-400"><span className="inline-block w-2 h-2 rounded-full bg-rose-500" /> Eye</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> +48h Forecast</span>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="flex-1 rounded-xl overflow-hidden relative" style={{minHeight:0}}>
          <MapContainer center={[storm.lat, storm.lon]} zoom={6} scrollWheelZoom style={{width:'100%',height:'100%'}}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {/* Historical Track */}
            <Polyline positions={histCoords} pathOptions={{color:'#38bdf8',weight:3,dashArray:'5 6',opacity:0.8}} />
            {storm.historical_track.map((n,i) => (
              <Marker key={i} position={[n.lat,n.lon]} icon={histIcon}>
                <Popup><div className="text-xs space-y-0.5 py-1">
                  <p className="font-bold text-sky-300">{n.time}</p>
                  <p>{n.cat} · {n.wind_kts} kts · {n.pressure} hPa</p>
                </div></Popup>
              </Marker>
            ))}
            {/* Current Eye */}
            <Circle center={[storm.lat,storm.lon]} radius={40000} pathOptions={{color:'#ef4444',fillColor:'#ef4444',fillOpacity:0.15,weight:2}} />
            <Marker position={[storm.lat,storm.lon]} icon={eyeIcon}>
              <Popup><div className="text-xs space-y-0.5 py-1">
                <p className="font-bold text-rose-400">{storm.name} — Eye Center</p>
                <p>{storm.category} ({storm.category_code})</p>
                <p>{storm.current_wind_kts} kts · {storm.current_pressure_hpa} hPa</p>
              </div></Popup>
            </Marker>
            {/* Forecast Track */}
            <Polyline positions={fcCoords} pathOptions={{color:'#fbbf24',weight:3.5,opacity:0.9}} />
            {storm.forecast_track.map((fc,i) => (
              <React.Fragment key={i}>
                <Circle center={[fc.lat,fc.lon]} radius={fc.uncertainty_km*1000} pathOptions={{color:'#fbbf24',fillColor:'#fbbf24',fillOpacity:0.07,dashArray:'4 6',weight:1.5}} />
                <Marker position={[fc.lat,fc.lon]} icon={fcIcon}>
                  <Popup><div className="text-xs space-y-0.5 py-1">
                    <p className="font-bold text-amber-300">{fc.time}</p>
                    <p>{fc.lat}°N, {fc.lon}°E</p>
                    <p>{fc.wind_kts} kts · {fc.pressure_hpa} hPa</p>
                    <p className="text-slate-400">±{fc.uncertainty_km} km cone</p>
                  </div></Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Satellite Image Thumbnail */}
          {satelliteImages && satelliteImages[activeChannel] && (
            <div className="absolute bottom-4 right-4 z-[400]" style={{
              background:'rgba(10,15,29,0.92)',
              border:'1px solid rgba(0,242,254,0.4)',
              borderRadius:12,
              padding:'8px',
              boxShadow:'0 0 20px rgba(0,242,254,0.15)',
              width:180,
            }}>
              <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 px-0.5">
                <span className="text-cyan-400">{activeChannel} FEED</span>
                <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> LIVE</span>
              </div>
              <img src={satelliteImages[activeChannel]} alt="satellite" className="w-full h-36 object-cover rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
