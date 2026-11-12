import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from app.datasets.sample_data import HISTORICAL_STORMS, IMD_CATEGORIES, generate_satellite_image, image_to_base64
from app.pipelines.inference_pipeline import IntegratedInferencePipeline
from app.utils.metrics import compute_benchmark_metrics

app = FastAPI(
    title="Tropical Cyclone Intelligence (TCI) API",
    description="Multi-Source Satellite AI/ML Framework for Cyclone Classification and Prediction",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = IntegratedInferencePipeline()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "framework": "Tropical Cyclone Intelligence (TCI)",
        "scope": "Cyclone Pattern Classification & Spatiotemporal Prediction",
        "models_loaded": {
            "classification": "ResNet50 + EfficientNet-B4 [IMD 7-Category & Wind Speed/Pressure Estimator]",
            "prediction": "ConvLSTM-Seq2Seq [6h to 48h Trajectory & Intensity Forecast Engine]"
        },
        "supported_satellites": ["INSAT-3D", "INSAT-3DR", "Himawari-8/9", "NOAA/GOES", "IBTrACS"],
        "version": "2.4.0"
    }

@app.get("/api/cyclones")
def list_cyclones():
    """Returns list of monitored tropical cyclones with historical and forecast tracks."""
    return {"cyclones": HISTORICAL_STORMS}

@app.get("/api/cyclones/{storm_id}")
def get_cyclone_details(storm_id: str):
    """Returns detailed track telemetry, multi-spectral satellite imagery, and AI predictions."""
    storm = next((s for s in HISTORICAL_STORMS if s["id"].lower() == storm_id.lower()), None)
    if not storm:
        raise HTTPException(status_code=404, detail="Cyclone ID not found")
    
    images = {}
    for ch in ["IR", "WV", "MW", "VIS"]:
        img = generate_satellite_image(
            channel=ch,
            size=(512, 512),
            storm_intensity=storm["current_wind_kts"] / 140.0,
            eye_x=storm["eye_coords"][0],
            eye_y=storm["eye_coords"][1]
        )
        images[ch] = image_to_base64(img)

    return {
        "storm": storm,
        "satellite_imagery": images
    }

@app.post("/api/analyze")
async def analyze_satellite_image(
    channel: str = Form("IR"),
    lat: float = Form(14.2),
    lon: float = Form(85.5),
    file: UploadFile = File(None)
):
    """
    Runs AI Classification & Temporal Prediction on uploaded or sample multi-spectral satellite imagery.
    """
    if file:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    else:
        img = generate_satellite_image(channel=channel, size=(512, 512))

    result = pipeline.process_image(img, channel=channel, lat=lat, lon=lon)
    return result

@app.get("/api/metrics")
def get_metrics():
    """Returns classification confusion matrix, ROC-AUC, and forecasting MAE/RMSE benchmark statistics."""
    return compute_benchmark_metrics()

@app.get("/api/datasets")
def get_datasets_info():
    """Returns metadata for research datasets (TCIR, IBTrACS, INCYDE, TyphoonSat, TropiCycloneNet)."""
    return {
        "datasets": [
            {
                "name": "TCIR (Tropical Cyclone Image-to-Intensity Regression)",
                "frames": "70,501 frames",
                "cyclones": "1,285 TCs",
                "channels": "Infrared, Water Vapor, Visible, Passive Microwave",
                "purpose": "Multi-spectral intensity classification benchmark",
                "link": "https://www.csie.ntu.edu.tw/~htlin/program/TCIR/"
            },
            {
                "name": "INCYDE (INSAT-3D/3DR Cyclone Dataset)",
                "frames": "100,000+ images",
                "cyclones": "North Indian Ocean Basin",
                "channels": "INSAT TIR1, TIR2, MIR, VIS",
                "purpose": "Regional Indian Ocean intensity estimation",
                "link": "https://zenodo.org/records/8015331"
            },
            {
                "name": "IBTrACS (International Best Track Archive)",
                "frames": "Global 1848 - Present",
                "cyclones": "Global Best Track Archive",
                "channels": "Lat/Lon, Min Pressure, Max Wind Speed, Category",
                "purpose": "Ground truth labels & trajectory verification",
                "link": "https://www.ncei.noaa.gov/products/international-best-track-archive"
            },
            {
                "name": "TyphoonSat",
                "frames": "2015-2024 NW Pacific",
                "cyclones": "Himawari-8/9 Satellite Imagery",
                "channels": "16 Spectral Bands (0.47µm to 13.3µm)",
                "purpose": "High-resolution cloud structure & category classification",
                "link": "https://zenodo.org/records/21636482"
            },
            {
                "name": "TropiCycloneNet",
                "frames": "70 Years Global",
                "cyclones": "6 Ocean Basins",
                "channels": "Satellite + ERA5 Reanalysis Grids",
                "purpose": "Multimodal track & intensity spatiotemporal forecasting",
                "link": "https://github.com/xiaochengfuhuo/TropiCycloneNet-Dataset"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
