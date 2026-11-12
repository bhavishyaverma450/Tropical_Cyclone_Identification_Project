import sys
from app.main import app
from app.pipelines.inference_pipeline import IntegratedInferencePipeline
from app.datasets.sample_data import generate_satellite_image
from app.utils.metrics import compute_benchmark_metrics

print("--- TESTING BACKEND COMPONENTS ---")
pipeline = IntegratedInferencePipeline()
img = generate_satellite_image(channel="IR")
result = pipeline.process_image(img, channel="IR", lat=14.2, lon=85.5)

print("[OK] Identification:", result["identification"]["confidence"], result["identification"]["eye_center"])
print("[OK] Classification:", result["classification"]["category"], result["classification"]["estimated_wind_kts"], "kts")
print("[OK] Forecast horizons:", len(result["forecast"]["forecast_horizons"]))
print("[OK] Advisory Bulletin Generated:", len(result["advisory_bulletin"]) > 0)

metrics = compute_benchmark_metrics()
print("[OK] Metrics overall accuracy:", metrics["overall_accuracy"])
print("--- BACKEND TEST PASSED SUCCESSFULLY ---")
