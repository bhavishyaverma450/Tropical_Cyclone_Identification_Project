import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import io
import base64

# Category Reference Tables
IMD_CATEGORIES = [
    {"name": "Depression", "code": "D", "wind_min": 17, "wind_max": 27, "color": "#00d2ff"},
    {"name": "Deep Depression", "code": "DD", "wind_min": 28, "wind_max": 33, "color": "#0072ff"},
    {"name": "Cyclonic Storm", "code": "CS", "wind_min": 34, "wind_max": 47, "color": "#00f2fe"},
    {"name": "Severe Cyclonic Storm", "code": "SCS", "wind_min": 48, "wind_max": 63, "color": "#f6d365"},
    {"name": "Very Severe Cyclonic Storm", "code": "VSCS", "wind_min": 64, "wind_max": 89, "color": "#fda085"},
    {"name": "Extremely Severe Cyclonic Storm", "code": "ESCS", "wind_min": 90, "wind_max": 119, "color": "#ff0844"},
    {"name": "Super Cyclonic Storm", "code": "SuCS", "wind_min": 120, "wind_max": 160, "color": "#b83b5e"}
]

HISTORICAL_STORMS = [
    {
        "id": "TC-2026-01",
        "name": "Cyclone Fani-II",
        "basin": "North Indian Ocean (Bay of Bengal)",
        "sensor": "INSAT-3DR & Himawari-9",
        "lat": 14.2,
        "lon": 85.5,
        "current_wind_kts": 105,
        "current_pressure_hpa": 942,
        "category": "Extremely Severe Cyclonic Storm",
        "category_code": "ESCS",
        "eye_detected": True,
        "eye_coords": [256, 250],
        "rapid_intensification_prob": 0.84,
        "historical_track": [
            {"time": "-36h", "lat": 10.1, "lon": 82.0, "wind_kts": 45, "pressure": 994, "cat": "CS"},
            {"time": "-24h", "lat": 11.5, "lon": 83.1, "wind_kts": 65, "pressure": 982, "cat": "VSCS"},
            {"time": "-12h", "lat": 12.8, "lon": 84.3, "wind_kts": 85, "pressure": 960, "cat": "VSCS"},
            {"time": "0h (Now)", "lat": 14.2, "lon": 85.5, "wind_kts": 105, "pressure": 942, "cat": "ESCS"}
        ],
        "forecast_track": [
            {"time": "+6h", "lat": 15.0, "lon": 86.1, "wind_kts": 115, "pressure": 934, "uncertainty_km": 15},
            {"time": "+12h", "lat": 15.9, "lon": 86.8, "wind_kts": 120, "pressure": 928, "uncertainty_km": 30},
            {"time": "+24h", "lat": 17.5, "lon": 87.9, "wind_kts": 110, "pressure": 938, "uncertainty_km": 55},
            {"time": "+48h", "lat": 19.8, "lon": 89.2, "wind_kts": 85, "pressure": 962, "uncertainty_km": 110}
        ]
    },
    {
        "id": "TC-2026-02",
        "name": "Cyclone Biparjoy-X",
        "basin": "Arabian Sea",
        "sensor": "INSAT-3D & NOAA-20",
        "lat": 18.5,
        "lon": 67.2,
        "current_wind_kts": 75,
        "current_pressure_hpa": 970,
        "category": "Very Severe Cyclonic Storm",
        "category_code": "VSCS",
        "eye_detected": True,
        "eye_coords": [240, 260],
        "rapid_intensification_prob": 0.42,
        "historical_track": [
            {"time": "-36h", "lat": 15.2, "lon": 66.0, "wind_kts": 35, "pressure": 998, "cat": "CS"},
            {"time": "-24h", "lat": 16.3, "lon": 66.4, "wind_kts": 50, "pressure": 990, "cat": "SCS"},
            {"time": "-12h", "lat": 17.4, "lon": 66.8, "wind_kts": 65, "pressure": 980, "cat": "VSCS"},
            {"time": "0h (Now)", "lat": 18.5, "lon": 67.2, "wind_kts": 75, "pressure": 970, "cat": "VSCS"}
        ],
        "forecast_track": [
            {"time": "+6h", "lat": 19.1, "lon": 67.5, "wind_kts": 80, "pressure": 965, "uncertainty_km": 20},
            {"time": "+12h", "lat": 19.8, "lon": 68.0, "wind_kts": 85, "pressure": 960, "uncertainty_km": 40},
            {"time": "+24h", "lat": 21.0, "lon": 69.2, "wind_kts": 70, "pressure": 975, "uncertainty_km": 75},
            {"time": "+48h", "lat": 22.8, "lon": 70.5, "wind_kts": 45, "pressure": 992, "uncertainty_km": 140}
        ]
    },
    {
        "id": "TC-2026-03",
        "name": "Typhoon Mawar-II",
        "basin": "Northwest Pacific",
        "sensor": "Himawari-9 & GOES-18",
        "lat": 16.8,
        "lon": 135.4,
        "current_wind_kts": 135,
        "current_pressure_hpa": 915,
        "category": "Super Cyclonic Storm",
        "category_code": "SuCS",
        "eye_detected": True,
        "eye_coords": [256, 256],
        "rapid_intensification_prob": 0.92,
        "historical_track": [
            {"time": "-36h", "lat": 13.0, "lon": 139.0, "wind_kts": 70, "pressure": 975, "cat": "VSCS"},
            {"time": "-24h", "lat": 14.2, "lon": 137.8, "wind_kts": 100, "pressure": 945, "cat": "ESCS"},
            {"time": "-12h", "lat": 15.5, "lon": 136.5, "wind_kts": 120, "pressure": 925, "cat": "SuCS"},
            {"time": "0h (Now)", "lat": 16.8, "lon": 135.4, "wind_kts": 135, "pressure": 915, "cat": "SuCS"}
        ],
        "forecast_track": [
            {"time": "+6h", "lat": 17.5, "lon": 134.5, "wind_kts": 140, "pressure": 910, "uncertainty_km": 12},
            {"time": "+12h", "lat": 18.3, "lon": 133.4, "wind_kts": 140, "pressure": 910, "uncertainty_km": 25},
            {"time": "+24h", "lat": 19.8, "lon": 131.2, "wind_kts": 130, "pressure": 920, "uncertainty_km": 50},
            {"time": "+48h", "lat": 22.4, "lon": 127.5, "wind_kts": 110, "pressure": 940, "uncertainty_km": 100}
        ]
    }
]

def generate_satellite_image(channel="IR", size=(512, 512), storm_intensity=0.8, eye_x=256, eye_y=256):
    """
    Generates realistic multi-spectral synthetic satellite imagery for cyclone analysis.
    Channels:
      - IR (Infrared): Color enhanced cloud top temperatures (K / Deg C)
      - WV (Water Vapor): Deep atmospheric moisture spirals
      - MW (Passive Microwave): Rainband structures & inner eyewall dynamics
      - VIS (Visible): High-res daytime cloud texture
    """
    w, h = size
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    
    # Grid coordinates centered at eye
    y_grid, x_grid = np.ogrid[:h, :w]
    dx = x_grid - eye_x
    dy = y_grid - eye_y
    r = np.sqrt(dx**2 + dy**2)
    theta = np.arctan2(dy, dx)

    # Log spiral arm equation: r = a * exp(b * theta)
    spiral_pattern = np.sin(4 * theta + 0.05 * r - 3 * np.log(r + 1e-5))
    
    # Eyewall mask and outer band dampening
    eyewall_r = 25 * (1.2 - 0.5 * storm_intensity)
    eye_mask = np.clip((r - eyewall_r) / 15.0, 0, 1)
    cloud_envelope = np.exp(- (r / (180 * storm_intensity + 50))**2)
    
    # Combined convection signal
    convection = (0.5 + 0.5 * spiral_pattern) * cloud_envelope * eye_mask
    
    if channel == "IR":
        # Enhanced Infrared IR (BD Curve false color palette)
        # Cold cloud tops (200K - 220K) -> Purple/Red, Eyewall -> Deep Pink/Yellow, Water -> Blue
        ir_temp = 300 - convection * 100  # Kelvin (300K outer to 200K central convection)
        
        # Color mapping based on temperature (K)
        r_chan = np.clip(255 * (1.0 - (ir_temp - 200) / 70), 0, 255)
        g_chan = np.clip(255 * np.sin((ir_temp - 200) / 100 * np.pi), 0, 255)
        b_chan = np.clip(255 * ((ir_temp - 200) / 100), 0, 255)
        
        # Warm eye center
        eye_warmth = np.clip(1.0 - r / eyewall_r, 0, 1)
        r_chan = np.where(eye_warmth > 0, 220 * eye_warmth + r_chan * (1 - eye_warmth), r_chan)
        g_chan = np.where(eye_warmth > 0, 50 * eye_warmth + g_chan * (1 - eye_warmth), g_chan)
        b_chan = np.where(eye_warmth > 0, 50 * eye_warmth + b_chan * (1 - eye_warmth), b_chan)

        arr[..., 0] = r_chan.astype(np.uint8)
        arr[..., 1] = g_chan.astype(np.uint8)
        arr[..., 2] = b_chan.astype(np.uint8)
        
    elif channel == "WV":
        # Water Vapor (6.7 um channel) - Mid to upper tropospheric moisture
        wv_val = np.clip(convection * 255 + (1 - cloud_envelope) * 40, 0, 255)
        arr[..., 0] = (wv_val * 0.2).astype(np.uint8)
        arr[..., 1] = (wv_val * 0.7 + 30).astype(np.uint8)
        arr[..., 2] = (wv_val * 0.9 + 50).astype(np.uint8)
        
    elif channel == "MW":
        # Passive Microwave (89 GHz channel) - Penetrates clouds to show precipitation cores
        mw_rain = np.clip(convection**1.5 * 255, 0, 255)
        arr[..., 0] = np.clip(mw_rain * 1.2, 0, 255).astype(np.uint8) # Heavy rain -> Red
        arr[..., 1] = np.clip(mw_rain * 0.8, 0, 255).astype(np.uint8) # Moderate rain -> Yellow
        arr[..., 2] = np.clip(255 - mw_rain, 0, 255).astype(np.uint8) # Dry -> Blue
        
    else:  # VIS
        # Visible channel (0.65 um) - Bright white clouds over dark ocean
        vis_val = np.clip(convection * 230 + 20, 0, 255).astype(np.uint8)
        arr[..., 0] = vis_val
        arr[..., 1] = vis_val
        arr[..., 2] = np.clip(vis_val + 25, 0, 255)

    img = Image.fromarray(arr)
    # Apply subtle Gaussian blur for smooth satellite imagery appearance
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    return img

def image_to_base64(img):
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode("utf-8")
