import numpy as np
from PIL import Image
import io
import base64
from app.models.identification import CycloneIdentificationModel
from app.models.classification import CycloneClassificationModel
from app.models.temporal_prediction import CycloneSpatiotemporalPredictionModel
from app.datasets.sample_data import generate_satellite_image, image_to_base64

class IntegratedInferencePipeline:
    """
    End-to-End Multi-Source AI Pipeline:
    Multi-Spectral Imagery -> Identification -> Intensity Classification -> Spatiotemporal Forecast -> Advisory Bulletin
    """
    def __init__(self):
        self.identifier = CycloneIdentificationModel()
        self.classifier = CycloneClassificationModel()
        self.predictor = CycloneSpatiotemporalPredictionModel()

    def process_image(self, img, channel="IR", lat=14.2, lon=85.5):
        """
        Runs complete 5-stage AI pipeline on a satellite image object (PIL Image or numpy array).
        """
        if isinstance(img, Image.Image):
            img_np = np.array(img)
        else:
            img_np = img
            img = Image.fromarray(img_np)

        # Stage 1 & 2: Identification & Spatial Localization
        ident_res = self.identifier.predict(img_np)

        # Stage 3: Intensity & Pattern Classification
        class_res = self.classifier.classify(img_np, identification_result=ident_res)

        # Stage 4: Spatiotemporal Forecast
        wind_kts = class_res["estimated_wind_kts"]
        press_hpa = class_res["estimated_pressure_hpa"]
        pred_res = self.predictor.forecast(lat, lon, wind_kts, press_hpa)

        # Generate Base64 image representation with Bounding Box & Eye overlay
        overlay_img = self._draw_annotations(img, ident_res, class_res)
        image_base64 = image_to_base64(overlay_img)

        # Stage 5: Meteorological Warning Advisory text
        advisory_bulletin = self._generate_advisory_text(lat, lon, class_res, pred_res)

        return {
            "channel": channel,
            "satellite_source": f"INSAT-3DR / Himawari-9 [{channel} Channel]",
            "coordinates": {"lat": lat, "lon": lon},
            "identification": ident_res,
            "classification": class_res,
            "forecast": pred_res,
            "annotated_image_base64": image_base64,
            "advisory_bulletin": advisory_bulletin
        }

    def _draw_annotations(self, img, ident, class_res):
        from PIL import ImageDraw, ImageFont
        annotated = img.copy().convert("RGB")
        draw = ImageDraw.Draw(annotated)
        
        bx = ident["bounding_box"]
        eye = ident["eye_center"]
        cat_name = class_res["category"]
        wind_kts = class_res["estimated_wind_kts"]

        # Draw Bounding Box (Cyan/Red)
        draw.rectangle([bx["x"], bx["y"], bx["x"] + bx["width"], bx["y"] + bx["height"]], outline="#00f2fe", width=3)
        
        # Draw Eye Center Crosshair & Ring
        ex, ey = eye["x"], eye["y"]
        draw.ellipse([ex - 15, ey - 15, ex + 15, ey + 15], outline="#ff0844", width=3)
        draw.line([ex - 22, ey, ex + 22, ey], fill="#ff0844", width=2)
        draw.line([ex, ey - 22, ex, ey + 22], fill="#ff0844", width=2)

        # Draw Label Banner
        banner_text = f"{cat_name.upper()} | {wind_kts} kts | Eye: ({ex},{ey})"
        draw.rectangle([bx["x"], max(0, bx["y"] - 30), bx["x"] + len(banner_text) * 11, bx["y"]], fill="#111936")
        draw.text((bx["x"] + 8, max(5, bx["y"] - 24)), banner_text, fill="#00f2fe")

        return annotated

    def _generate_advisory_text(self, lat, lon, class_res, pred_res):
        cat = class_res["category"]
        wind = class_res["estimated_wind_kts"]
        press = class_res["estimated_pressure_hpa"]
        next_24h = pred_res["forecast_horizons"][2]

        return (
            f"TROPICAL CYCLONE WARNING ADVISORY BULLETIN\n"
            f"--------------------------------------------------\n"
            f"CURRENT POSITION: {lat}°N, {lon}°E\n"
            f"CLASSIFICATION  : {cat.upper()} ({class_res['category_code']})\n"
            f"MAX SUSTAINED WIND: {wind} knots ({class_res['estimated_wind_kmh']} km/h)\n"
            f"ESTIMATED CENTRAL PRESSURE: {press} hPa\n"
            f"DVORAK T-NUMBER : T{class_res['dvorak_t_number']}\n"
            f"\n24-HOUR FORECAST:\n"
            f"EXPECTED POSITION: {next_24h['lat']}°N, {next_24h['lon']}°E\n"
            f"EXPECTED WIND    : {next_24h['wind_kts']} knots ({next_24h['wind_kmh']} km/h)\n"
            f"EXPECTED PRESSURE: {next_24h['pressure_hpa']} hPa\n"
            f"RAPID INTENSIFICATION RISK: {'HIGH' if pred_res['rapid_intensification_alert'] else 'MODERATE/LOW'}\n"
            f"REMARKS: Spatial AI analysis indicates tight eyewall organization with high vortex symmetry."
        )
