import React, { useState } from 'react';
import { Activity, Upload, RefreshCw, Zap, Gauge, Wind, TrendingUp, ThermometerSun } from 'lucide-react';

const CHANNELS = [
  { code:'IR',  name:'Infrared (TIR1)',       color:'#00f2fe', desc:'BD-Curve Enhanced Cloud-Top Temperature' },
  { code:'WV',  name:'Water Vapor (6.7µm)',   color:'#818cf8', desc:'Mid/Upper Troposphere Moisture Spirals' },
  { code:'MW',  name:'Microwave (89 GHz)',     color:'#f87171', desc:'Precipitation Core & Rainband Structure' },
  { code:'VIS', name:'Visible (0.65µm)',       color:'#e2e8f0', desc:'High-Resolution Daytime Cloud Texture' },
];

export default function ClassifyPanel() {
  const [channel, setChannel]   = useState('IR');
  const [lat, setLat]           = useState(14.2);
  const [lon, setLon]           = useState(85.5);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleFile = e => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); }
  };

  const handleRun = async () => {
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('channel', channel);
      fd.append('lat', lat);
      fd.append('lon', lon);
      if (file) fd.append('file', file);
      const res = await fetch('http://127.0.0.1:8000/api/analyze', { method:'POST', body:fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const cls = result?.classification;
  const fcs = result?.forecast;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">ResNet-50 + EfficientNet-B4 · IMD Classification Engine</p>
        <h2 className="text-xl font-black text-white">Cyclone Classification &amp; Intensity Analysis</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload multi-spectral satellite imagery or generate synthetic IR/WV test frames — the AI pipeline classifies cyclone intensity category,
          estimates maximum sustained wind speed, minimum central pressure and Dvorak T-number.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ─── Config Panel ─── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Channel Selector */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Satellite Channel
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map(ch => (
                <button key={ch.code} onClick={() => setChannel(ch.code)}
                  className="p-3 rounded-xl text-left text-xs transition-all"
                  style={{
                    background: channel===ch.code ? `${ch.color}22` : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${channel===ch.code ? `${ch.color}55` : 'rgba(30,41,59,0.9)'}`,
                    color: channel===ch.code ? ch.color : '#94a3b8',
                  }}>
                  <div className="font-bold text-sm">{ch.code}</div>
                  <div className="text-[10px] opacity-80 mt-0.5 leading-tight">{ch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Storm Coordinates</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{label:'Latitude (°N)',val:lat,set:setLat},{label:'Longitude (°E)',val:lon,set:setLon}].map(f => (
                <div key={f.label}>
                  <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                  <input type="number" step="0.1" value={f.val}
                    onChange={e => f.set(parseFloat(e.target.value))}
                    className="w-full rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none transition-all"
                    style={{background:'rgba(15,23,42,0.8)',border:'1px solid rgba(56,189,248,0.2)'}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Satellite Image Upload</h3>
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all"
              style={{border:'2px dashed rgba(56,189,248,0.3)',background:'rgba(14,165,233,0.04)'}}>
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs text-slate-400 text-center px-2">
                {file ? file.name : 'Upload PNG / JPG satellite image (optional)'}
              </span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            {preview && <img src={preview} alt="preview" className="w-full h-28 object-cover rounded-xl border border-slate-800" />}
          </div>

          {/* Run Button */}
          <button onClick={handleRun} disabled={loading}
            className="btn-primary py-3.5 w-full"
            style={{fontSize:'0.875rem'}}>
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running Classification Pipeline...</>
              : <><Zap className="w-4 h-4" /> Run AI Classification &amp; Prediction</>
            }
          </button>

          {error && (
            <div className="rounded-xl p-4 text-xs text-rose-300" style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)'}}>
              Error: {error} — Make sure the backend is running on port 8000.
            </div>
          )}
        </div>

        {/* ─── Results Panel ─── */}
        <div className="lg:col-span-3 space-y-4">
          {cls ? (
            <>
              {/* Category Result Banner */}
              <div className="glass-panel p-6" style={{borderLeft:`4px solid ${cls.category_color}`}}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:cls.category_color}}>IMD Intensity Classification</p>
                    <h3 className="text-2xl font-black text-white">{cls.category}</h3>
                    <p className="text-sm text-slate-400 mt-1">Satellite: {result.satellite_source} | Pos: {result.coordinates.lat}°N, {result.coordinates.lon}°E</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Dvorak T-Number</p>
                    <p className="text-3xl font-black font-mono" style={{color:'#00f2fe'}}>T{cls.dvorak_t_number}</p>
                  </div>
                </div>

                {/* 4 Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    { label:'Max Wind', val:`${cls.estimated_wind_kts} kts`, sub:`${cls.estimated_wind_kmh} km/h`, color:'#fbbf24', Icon:Wind },
                    { label:'Min Pressure', val:`${cls.estimated_pressure_hpa} hPa`, sub:'Atkinson-Holliday', color:'#67e8f9', Icon:Gauge },
                    { label:'Eyewall Org.', val:cls.structural_analysis.eyewall_organization_index, sub:'Closed ring index', color:'#86efac', Icon:TrendingUp },
                    { label:'CDO Radius', val:`${cls.structural_analysis.central_dense_overcast_radius_km} km`, sub:'Cloud shield', color:'#c4b5fd', Icon:ThermometerSun },
                  ].map(({label,val,sub,color,Icon}) => (
                    <div key={label} className="stat-card flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5" style={{color}} />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
                      </div>
                      <span className="text-base font-black font-mono" style={{color}}>{val}</span>
                      <span className="text-[10px] text-slate-500">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Probability Bars */}
              <div className="glass-panel p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Category Softmax Probability Distribution</h4>
                <div className="space-y-2.5">
                  {Object.entries(cls.category_probabilities).map(([code, item]) => (
                    <div key={code}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{item.name} <span className="text-slate-500">({code})</span></span>
                        <span className="font-mono font-medium text-slate-400">{(item.probability*100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full rounded-full h-2 overflow-hidden" style={{background:'rgba(30,41,59,0.8)'}}>
                        <div className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{width:`${item.probability*100}%`, background:`linear-gradient(90deg, ${item.color}aa, ${item.color})`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Annotated Image */}
              {result.annotated_image_base64 && (
                <div className="glass-panel p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Feature Map — Pattern Analysis Output</h4>
                  <img src={result.annotated_image_base64} alt="Feature Map" className="w-full rounded-xl border border-slate-800 object-contain max-h-72" />
                  <p className="text-[11px] text-slate-500">Satellite channel: {result.channel} | Confidence: {(result.classification.classification_confidence*100).toFixed(1)}% | Model: {cls.model_backbone}</p>
                </div>
              )}

              {/* Quick Forecast Preview */}
              {fcs && (
                <div className="glass-panel p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">48-Hour Forecast Preview from Classification Result</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {fcs.forecast_horizons.map(h => (
                      <div key={h.lead_time_hours} className="rounded-xl p-3 text-center text-xs"
                        style={{background:'rgba(15,23,42,0.7)',border:'1px solid rgba(56,189,248,0.15)'}}>
                        <p className="text-amber-400 font-bold font-mono">+{h.lead_time_hours}h</p>
                        <p className="text-white font-mono font-bold mt-1">{h.wind_kts} kts</p>
                        <p className="text-cyan-300 font-mono">{h.pressure_hpa} hPa</p>
                        <p className="text-slate-500 text-[10px] mt-1">±{h.uncertainty_radius_km} km</p>
                      </div>
                    ))}
                  </div>
                  {fcs.rapid_intensification_alert && (
                    <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-rose-300"
                      style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)'}}>
                      <Zap className="w-4 h-4" />
                      RAPID INTENSIFICATION ALERT — {(fcs.rapid_intensification_probability*100).toFixed(0)}% probability of ≥30 kts gain within 24 hours
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center animate-float"
                style={{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.25)'}}>
                <Activity className="w-9 h-9 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready for Classification</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Select a satellite channel, set coordinates, and click <strong className="text-cyan-400">Run AI Classification</strong> to analyze cyclone intensity patterns using ResNet-50 + EfficientNet-B4.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
