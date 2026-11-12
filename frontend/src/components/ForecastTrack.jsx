import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { CloudLightning, AlertOctagon, Navigation2, Clock, TrendingDown } from 'lucide-react';

const MOCK_STORM = {
  name:'Cyclone Fani-II',
  current_wind_kts:105, current_pressure_hpa:942,
  rapid_intensification_prob:0.84,
  historical_track:[
    {time:'-36h',wind_kts:45,pressure:994},{time:'-24h',wind_kts:65,pressure:982},
    {time:'-12h',wind_kts:85,pressure:960},{time:'Now', wind_kts:105,pressure:942},
  ],
  forecast_track:[
    {time:'+6h', wind_kts:115,pressure_hpa:934,lat:15.0,lon:86.1,uncertainty_km:15},
    {time:'+12h',wind_kts:120,pressure_hpa:928,lat:15.9,lon:86.8,uncertainty_km:30},
    {time:'+24h',wind_kts:110,pressure_hpa:938,lat:17.5,lon:87.9,uncertainty_km:55},
    {time:'+48h',wind_kts:85, pressure_hpa:962,lat:19.8,lon:89.2,uncertainty_km:110},
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'rgba(10,15,29,0.97)',border:'1px solid rgba(56,189,248,0.3)',borderRadius:10,padding:'10px 14px'}}>
      <p className="font-bold text-cyan-300 text-xs mb-2">{label}</p>
      {payload.map((p,i) => (
        <p key={i} className="text-xs font-mono" style={{color:p.color}}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function ForecastTrack({ selectedStorm }) {
  const storm = selectedStorm || MOCK_STORM;

  const chartData = [
    ...storm.historical_track.map(h => ({
      time: h.time, hist_wind: h.wind_kts, hist_press: h.pressure,
    })),
    ...storm.forecast_track.map(f => ({
      time: f.time, fc_wind: f.wind_kts, fc_press: f.pressure_hpa,
    })),
  ];

  const peakWind = Math.max(...storm.forecast_track.map(f => f.wind_kts));
  const lowestPress = Math.min(...storm.forecast_track.map(f => f.pressure_hpa));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">ConvLSTM Sequence-to-Sequence · Spatiotemporal Prediction</p>
          <h2 className="text-xl font-black text-white">{storm.name} — 48-Hour Trajectory &amp; Intensity Forecast</h2>
          <p className="text-sm text-slate-400 mt-1">
            LSTM-based model trained on TCIR, IBTrACS &amp; ERA5 predicts cyclone center coordinates, wind speed decay/intensification curves and error cones at 6h, 12h, 24h and 48h lead times.
          </p>
        </div>

        {/* RI Alert */}
        <div className="flex-shrink-0 rounded-2xl p-4 flex items-center gap-4"
          style={{background:`rgba(239,68,68,${storm.rapid_intensification_prob>0.5?'0.12':'0.06'})`,border:`1px solid rgba(239,68,68,${storm.rapid_intensification_prob>0.5?'0.4':'0.2'})`}}>
          <div className="p-2.5 rounded-xl" style={{background:'rgba(239,68,68,0.2)'}}>
            <AlertOctagon className="w-6 h-6 text-rose-400 animate-pulse-slow" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-300">RI Probability</p>
            <p className="text-2xl font-black text-rose-400 font-mono">{(storm.rapid_intensification_prob*100).toFixed(0)}%</p>
            <p className="text-[10px] text-slate-400">≥30 kts gain / 24 h</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Wind Speed Chart */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-amber-400" /> Maximum Sustained Wind Speed
            </h3>
            <span className="tag-badge font-mono" style={{background:'rgba(251,191,36,0.15)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.3)'}}>
              Peak: {peakWind} kts
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" />
              <XAxis dataKey="time" stroke="#475569" tick={{fill:'#64748b',fontSize:11}} />
              <YAxis stroke="#475569" tick={{fill:'#64748b',fontSize:11}} domain={[20,160]} unit=" kt" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:12,color:'#94a3b8'}} />
              <ReferenceLine y={storm.current_wind_kts} stroke="#475569" strokeDasharray="3 3" label={{value:'Now',fill:'#64748b',fontSize:10}} />
              <Line type="monotone" dataKey="hist_wind" name="Historical Wind" stroke="#38bdf8" strokeWidth={3} dot={{r:4,fill:'#38bdf8'}} connectNulls />
              <Line type="monotone" dataKey="fc_wind" name="+48h Forecast" stroke="#fbbf24" strokeWidth={3} strokeDasharray="6 4" dot={{r:5,fill:'#fbbf24'}} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pressure Chart */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" /> Minimum Central Pressure
            </h3>
            <span className="tag-badge font-mono" style={{background:'rgba(0,242,254,0.12)',color:'#00f2fe',border:'1px solid rgba(0,242,254,0.3)'}}>
              Lowest: {lowestPress} hPa
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" />
              <XAxis dataKey="time" stroke="#475569" tick={{fill:'#64748b',fontSize:11}} />
              <YAxis stroke="#475569" tick={{fill:'#64748b',fontSize:11}} domain={[895,1010]} unit=" hPa" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:12,color:'#94a3b8'}} />
              <ReferenceLine y={storm.current_pressure_hpa} stroke="#475569" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="hist_press" name="Historical Pressure" stroke="#38bdf8" strokeWidth={3} dot={{r:4,fill:'#38bdf8'}} connectNulls />
              <Line type="monotone" dataKey="fc_press" name="+48h Forecast" stroke="#00f2fe" strokeWidth={3} strokeDasharray="6 4" dot={{r:5,fill:'#00f2fe'}} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead Time Forecast Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Forecast Lead Horizons Table
        </h3>
        <div className="overflow-x-auto rounded-xl" style={{border:'1px solid rgba(30,41,59,0.8)'}}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{background:'rgba(15,23,42,0.9)',borderBottom:'1px solid rgba(56,189,248,0.2)'}}>
                {['Lead Time','Latitude / Longitude','Wind Speed (kts)','Wind Speed (km/h)','Pressure (hPa)','Error Cone'].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storm.forecast_track.map((fc, i) => (
                <tr key={i} className="transition-colors"
                  style={{borderBottom:'1px solid rgba(30,41,59,0.5)', background: i%2===0?'rgba(15,23,42,0.4)':'rgba(10,15,29,0.3)'}}>
                  <td className="py-3.5 px-4 font-black font-mono text-amber-400">{fc.time}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{fc.lat}°N, {fc.lon}°E</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{fc.wind_kts} kts</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{(fc.wind_kts*1.852).toFixed(1)} km/h</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">{fc.pressure_hpa} hPa</td>
                  <td className="py-3.5 px-4 font-mono text-rose-300">±{fc.uncertainty_km} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500">Model: ConvLSTM-Seq2Seq · Mean 24h Track Error: 42.8 km · Mean Wind MAE: 6.4 kts</p>
      </div>
    </div>
  );
}
