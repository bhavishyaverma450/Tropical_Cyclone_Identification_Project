# Tropical Cyclone Intelligence (TCI)

An AI/ML-Based Multi-Source Satellite Framework for Cyclone Identification, Classification and Prediction.

## System Architecture

The system consists of two primary components:
1. **Python FastAPI AI/ML Backend (`/backend`)**:
   - **Data Preprocessing & Data Integration**: Multi-spectral imagery loaders (Infrared IR, Water Vapor WV, Passive Microwave MW, Visible VIS) and IBTrACS best track alignment.
   - **Cyclone Spatial Localizer & Identification Engine**: CNN vortex detector for cyclone presence and eye coordinates.
   - **Intensity Pattern Classifier**: Deep learning model classifying 7 IMD categories (Depression to Super Cyclonic Storm) and calculating wind speed (kts), central pressure (hPa), and Dvorak T-numbers.
   - **Spatiotemporal Forecast Engine**: ConvLSTM sequence model for 6h to 48h track movement and intensity trends.
   - **Evaluation & Benchmarks Suite**: Calculates confusion matrices, ROC-AUC, MAE, and RMSE across datasets (TCIR, INCYDE, Himawari-8, IBTrACS).

2. **React + Vite Modern GIS Dashboard (`/frontend`)**:
   - Interactive GIS satellite map viewer with storm tracks, eye markers, and forecast cones.
   - Real-time satellite image upload & instant AI inference visualizer.
   - Recharts temporal forecast graphs for wind speed and pressure.
   - Model metrics & cross-sensor benchmark tables.
   - Research dataset hub & formal meteorological warning bulletin exporter.

## Quick Start Launcher

To run the entire system:
1. Open `d:\Capstone\Project`.
2. Double-click `run_app.bat`.
3. Open browser at `http://localhost:5173`.
