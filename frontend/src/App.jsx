import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapViewer from './components/MapViewer';
import ClassifyPanel from './components/ImageInference';
import ForecastTrack from './components/ForecastTrack';
import ModelMetrics from './components/ModelMetrics';
import MultiSourceExplorer from './components/MultiSourceExplorer';
import AdvisoryReport from './components/AdvisoryReport';

export default function App() {
  const [activeTab, setActiveTab]       = useState('map');
  const [apiStatus, setApiStatus]       = useState(false);
  const [cyclones, setCyclones]         = useState([]);
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [satelliteImages, setSatelliteImages] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('http://127.0.0.1:8000/api/health');
        if (r.ok) setApiStatus(true);
        const cd = await fetch('http://127.0.0.1:8000/api/cyclones');
        const j = await cd.json();
        setCyclones(j.cyclones || []);
        if (j.cyclones?.length) setSelectedStorm(j.cyclones[0]);
      } catch { setApiStatus(false); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedStorm) return;
    fetch(`http://127.0.0.1:8000/api/cyclones/${selectedStorm.id}`)
      .then(r => r.json())
      .then(d => { if (d.satellite_imagery) setSatelliteImages(d.satellite_imagery); })
      .catch(console.error);
  }, [selectedStorm]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} apiStatus={apiStatus} />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-0">
        {activeTab === 'map'      && <MapViewer cyclones={cyclones} selectedStorm={selectedStorm} setSelectedStorm={setSelectedStorm} satelliteImages={satelliteImages} />}
        {activeTab === 'classify' && <ClassifyPanel />}
        {activeTab === 'forecast' && <ForecastTrack selectedStorm={selectedStorm} />}
        {activeTab === 'metrics'  && <ModelMetrics />}
        {activeTab === 'datasets' && <MultiSourceExplorer />}
        {activeTab === 'advisory' && <AdvisoryReport selectedStorm={selectedStorm} />}
      </main>

      <footer className="glass-nav py-4 px-6 text-center text-xs text-slate-500 mt-6">
        Tropical Cyclone Intelligence (TCI) · AI/ML Classification &amp; Prediction Framework · 
        INSAT-3D · Himawari-8/9 · IBTrACS · ResNet-50 · EfficientNet-B4 · ConvLSTM · 2026
      </footer>
    </div>
  );
}
