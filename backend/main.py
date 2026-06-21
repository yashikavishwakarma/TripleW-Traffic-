from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List
from pathlib import Path

import pandas as pd
import numpy as np

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier


# -----------------------------
# App setup
# -----------------------------

app = FastAPI(title="WWW Traffic Command API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "data" / "astram_event_data.csv"

df_global = None
model = None


# -----------------------------
# Request model
# -----------------------------

class EventRequest(BaseModel):
    event_type: str = Field(default="planned")
    event_cause: str = Field(default="public_event")
    latitude: float = Field(default=12.9716)
    longitude: float = Field(default=77.5946)

    corridor: str = Field(default="Non-corridor")
    police_station: str = Field(default="No Police Station")
    zone: str = Field(default="Central Zone 1")
    junction: str = Field(default="Unknown")
    priority: str = Field(default="High")

    crowd_size: int = Field(default=15000)
    start_hour: int = Field(default=18)
    duration_hours: float = Field(default=3.0)

    available_officers: int = Field(default=35)
    available_barricades: int = Field(default=5)

    scenario: str = Field(default="normal")


FEATURE_COLS = [
    "event_type",
    "event_cause",
    "corridor",
    "priority",
    "police_station",
    "zone",
    "junction",
    "hour",
    "day_of_week",
    "month",
    "is_weekend",
    "lat_bin",
    "lon_bin",
]


# -----------------------------
# Utility functions
# -----------------------------

def clean_text(value: Any) -> str:
    if pd.isna(value):
        return "Unknown"
    value = str(value).strip()
    if value == "":
        return "Unknown"
    return value


def normalize_event_cause(value: str) -> str:
    value = clean_text(value)
    return value.replace(" ", "_").lower()


def load_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"CSV file not found at: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    required_cols = [
        "event_type",
        "latitude",
        "longitude",
        "event_cause",
        "requires_road_closure",
        "start_datetime",
        "corridor",
        "priority",
        "police_station",
        "zone",
        "junction",
    ]

    for col in required_cols:
        if col not in df.columns:
            df[col] = np.nan

    text_cols = [
        "event_type",
        "event_cause",
        "corridor",
        "priority",
        "police_station",
        "zone",
        "junction",
    ]

    for col in text_cols:
        df[col] = df[col].apply(clean_text)

    df["event_cause"] = df["event_cause"].apply(normalize_event_cause)

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce").fillna(12.9716)
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce").fillna(77.5946)

    df["start_datetime"] = pd.to_datetime(df["start_datetime"], errors="coerce")
    df["hour"] = df["start_datetime"].dt.hour.fillna(12).astype(int)
    df["day_of_week"] = df["start_datetime"].dt.dayofweek.fillna(0).astype(int)
    df["month"] = df["start_datetime"].dt.month.fillna(1).astype(int)
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    df["lat_bin"] = (df["latitude"] * 100).round().astype(int).astype(str)
    df["lon_bin"] = (df["longitude"] * 100).round().astype(int).astype(str)

    df["requires_road_closure"] = df["requires_road_closure"].astype(bool)

    return df


def train_model(df: pd.DataFrame):
    X = df[FEATURE_COLS].copy()
    y = df["requires_road_closure"].astype(int)

    categorical_cols = [
        "event_type",
        "event_cause",
        "corridor",
        "priority",
        "police_station",
        "zone",
        "junction",
        "lat_bin",
        "lon_bin",
    ]

    numeric_cols = ["hour", "day_of_week", "month", "is_weekend"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
            ("num", "passthrough", numeric_cols),
        ]
    )

    clf = RandomForestClassifier(
        n_estimators=250,
        random_state=42,
        class_weight="balanced",
        min_samples_leaf=3,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("model", clf),
        ]
    )

    pipeline.fit(X, y)
    return pipeline


def haversine_km(lat1, lon1, lat2, lon2):
    radius = 6371

    lat1, lon1, lat2, lon2 = map(
        np.radians, [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    )

    c = 2 * np.arcsin(np.sqrt(a))
    return radius * c


def build_model_row(req: EventRequest) -> pd.DataFrame:
    row = {
        "event_type": clean_text(req.event_type),
        "event_cause": normalize_event_cause(req.event_cause),
        "corridor": clean_text(req.corridor),
        "priority": clean_text(req.priority),
        "police_station": clean_text(req.police_station),
        "zone": clean_text(req.zone),
        "junction": clean_text(req.junction),
        "hour": int(req.start_hour),
        "day_of_week": 0,
        "month": 1,
        "is_weekend": 0,
        "lat_bin": str(int(round(req.latitude * 100))),
        "lon_bin": str(int(round(req.longitude * 100))),
    }

    return pd.DataFrame([row])


def crowd_factor(crowd_size: int) -> float:
    if crowd_size < 1000:
        return 0.18
    if crowd_size < 5000:
        return 0.38
    if crowd_size < 15000:
        return 0.62
    if crowd_size < 30000:
        return 0.82
    return 0.95


def time_factor(hour: int) -> float:
    if 8 <= hour <= 11:
        return 0.72
    if 17 <= hour <= 21:
        return 0.92
    if 12 <= hour <= 16:
        return 0.55
    return 0.35


def cause_factor(event_cause: str) -> float:
    cause = normalize_event_cause(event_cause)

    high_risk = {
        "vip_movement": 0.92,
        "protest": 0.88,
        "procession": 0.84,
        "public_event": 0.80,
        "tree_fall": 0.76,
        "construction": 0.72,
        "accident": 0.68,
        "water_logging": 0.66,
        "congestion": 0.70,
        "vehicle_breakdown": 0.48,
        "pot_holes": 0.42,
        "road_conditions": 0.45,
        "others": 0.50,
    }

    return high_risk.get(cause, 0.50)


def scenario_factor(scenario: str) -> float:
    scenario = clean_text(scenario).lower()

    factors = {
        "normal": 1.00,
        "rain": 1.16,
        "vip_movement": 1.25,
        "crowd_surge": 1.32,
        "road_blockage": 1.36,
        "ambulance_emergency": 1.18,
    }

    return factors.get(scenario, 1.00)


def compute_risk_score(
    closure_probability: float,
    req: EventRequest
) -> int:
    score = (
        0.40 * closure_probability
        + 0.24 * crowd_factor(req.crowd_size)
        + 0.18 * cause_factor(req.event_cause)
        + 0.18 * time_factor(req.start_hour)
    )

    score = score * scenario_factor(req.scenario)
    score = min(score, 1.0)

    return int(round(score * 100))


# -----------------------------
# Feature 1: Impact Timeline Engine
# -----------------------------

def build_impact_timeline(req: EventRequest, risk_score: int) -> List[Dict[str, Any]]:
    build_up = min(int(risk_score * 0.58), 100)
    peak = min(int(risk_score * 0.84), 100)
    shockwave = min(int(risk_score * 1.13 * scenario_factor(req.scenario)), 100)
    recovery = max(int(shockwave * 0.52), 10)

    return [
        {
            "phase": "Build-up",
            "window": "60–15 min before start",
            "risk": build_up,
            "description": "Crowd begins arriving; parking and entry-side roads start loading.",
        },
        {
            "phase": "Event Peak",
            "window": "During event",
            "risk": peak,
            "description": "Venue-side roads and nearby junctions stay under pressure.",
        },
        {
            "phase": "Dispersal Shockwave",
            "window": "15–30 min after event ends",
            "risk": shockwave,
            "description": "Highest-risk window: crowd exits together and congestion radiates outward.",
        },
        {
            "phase": "Recovery",
            "window": "30–90 min after event ends",
            "risk": recovery,
            "description": "Congestion clears if diversion and deployment plan holds.",
        },
    ]


# -----------------------------
# Feature 2: Comparable Memory Engine
# -----------------------------

def find_comparable_events(req: EventRequest, limit: int = 5) -> List[Dict[str, Any]]:
    df = df_global.copy()

    df["distance_km"] = haversine_km(
        req.latitude,
        req.longitude,
        df["latitude"],
        df["longitude"],
    )

    req_cause = normalize_event_cause(req.event_cause)

    df["similarity_score"] = 0.0

    df.loc[df["event_cause"] == req_cause, "similarity_score"] += 45
    df.loc[df["event_type"] == req.event_type, "similarity_score"] += 18
    df.loc[df["corridor"] == req.corridor, "similarity_score"] += 18
    df.loc[df["police_station"] == req.police_station, "similarity_score"] += 12

    df["similarity_score"] += np.maximum(0, 15 - df["distance_km"] * 3)

    comparable_df = (
        df.sort_values(["similarity_score", "distance_km"], ascending=[False, True])
        .head(limit)
    )

    output = []

    for _, row in comparable_df.iterrows():
        output.append(
            {
                "event_type": clean_text(row["event_type"]),
                "event_cause": clean_text(row["event_cause"]),
                "corridor": clean_text(row["corridor"]),
                "police_station": clean_text(row["police_station"]),
                "priority": clean_text(row["priority"]),
                "distance_km": round(float(row["distance_km"]), 2),
                "required_closure": bool(row["requires_road_closure"]),
            }
        )

    return output


def build_confidence(comparables: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(comparables)
    close_matches = sum(1 for item in comparables if item["distance_km"] <= 3)

    if total >= 5 and close_matches >= 2:
        return {
            "label": "High",
            "score": 86,
            "message": "Strong confidence: enough nearby or similar past events found.",
        }

    if total >= 3:
        return {
            "label": "Medium",
            "score": 68,
            "message": "Medium confidence: some comparable events found.",
        }

    return {
        "label": "Low",
        "score": 42,
        "message": "Low confidence: limited comparable history. Use conservative planning.",
    }


# -----------------------------
# Feature 3: War-Game Plan Lab
# -----------------------------

def generate_deployment_plan(req: EventRequest, risk_score: int) -> Dict[str, Any]:
    officers_low = int(8 + risk_score * 0.26 + crowd_factor(req.crowd_size) * 10)
    officers_high = officers_low + 8

    if req.available_officers < officers_low:
        manpower_status = "Shortage"
    elif req.available_officers > officers_high:
        manpower_status = "Surplus"
    else:
        manpower_status = "Sufficient"

    barricades_needed = max(2, min(10, int(round(risk_score / 14))))

    if risk_score >= 75:
        closure_recommendation = "Partial closure strongly recommended"
    elif risk_score >= 50:
        closure_recommendation = "Conditional closure near venue"
    else:
        closure_recommendation = "No major closure needed"

    return {
        "manpower_band": f"{officers_low}–{officers_high} officers",
        "available_officers": req.available_officers,
        "manpower_status": manpower_status,
        "barricades_recommended": barricades_needed,
        "available_barricades": req.available_barricades,
        "road_closure_recommendation": closure_recommendation,
        "ranked_diversions": [
            {
                "rank": 1,
                "name": "Primary diversion",
                "use_case": "Move private vehicles away from venue-facing roads.",
            },
            {
                "rank": 2,
                "name": "Secondary diversion",
                "use_case": "Absorb overflow if primary diversion saturates.",
            },
            {
                "rank": 3,
                "name": "Emergency fallback diversion",
                "use_case": "Use if road blockage occurs during dispersal.",
            },
        ],
    }


def stress_test_plan(req: EventRequest, risk_score: int) -> Dict[str, Any]:
    scenario = clean_text(req.scenario).lower()
    stress_score = min(int(risk_score * scenario_factor(scenario)), 100)

    failures = []

    if stress_score >= 65:
        failures.append("Exit-side crowd may overwhelm the first diversion during dispersal.")

    if req.available_officers < 30 and stress_score >= 55:
        failures.append("Available officers may be insufficient for venue exits and diversion junctions.")

    if req.available_barricades < 4 and stress_score >= 55:
        failures.append("Barricade count may be too low to separate crowd flow from vehicle flow.")

    if scenario in ["rain", "crowd_surge"]:
        failures.append("Crowd movement speed changes suddenly; plan needs extra exit-side coverage.")

    if scenario in ["ambulance_emergency", "road_blockage"]:
        failures.append("Lifeline corridor may fail if it overlaps with the crowd exit path.")

    if len(failures) == 0:
        failures.append("Plan is stable under selected scenario. Continue live monitoring.")

    return {
        "scenario": scenario,
        "stress_score": stress_score,
        "plan_status": "Fails under stress" if stress_score >= 75 else "Needs adjustment" if stress_score >= 50 else "Stable",
        "failure_points": failures,
    }


# -----------------------------
# Feature 4: Lifeline Corridor Guardian
# -----------------------------

def lifeline_corridor(req: EventRequest, risk_score: int) -> Dict[str, Any]:
    base_clearance = 100 - int(risk_score * 0.55)

    if req.scenario == "ambulance_emergency":
        base_clearance -= 8

    if req.available_officers >= 35:
        base_clearance += 8

    clearance = max(35, min(96, base_clearance))

    return {
        "corridor_name": "Protected Lifeline Corridor",
        "purpose": "Reserved for ambulance, fire, police movement, and emergency evacuation.",
        "clearance_probability": clearance,
        "status": "Protected" if clearance >= 75 else "At Risk",
        "rules": [
            "Do not place barricades directly on lifeline route.",
            "Assign minimum 4 officers to corridor entry and exit points.",
            "Keep diversion traffic away from this route during dispersal.",
        ],
    }


# -----------------------------
# Feature 5: Resource Slack Optimizer
# -----------------------------

def resource_slack_optimizer(req: EventRequest, risk_score: int) -> Dict[str, Any]:
    df = df_global.copy()

    active_zone = clean_text(req.zone)

    zone_stats = (
        df.groupby("zone")
        .agg(
            total_events=("id", "count"),
            closure_rate=("requires_road_closure", "mean"),
        )
        .reset_index()
    )

    zone_stats = zone_stats[zone_stats["zone"] != "Unknown"]
    zone_stats = zone_stats[zone_stats["zone"] != active_zone]

    if zone_stats.empty:
        return {
            "message": "No nearby zone history available.",
            "suggestions": [],
        }

    zone_stats["slack_score"] = (
        (1 - zone_stats["closure_rate"]) * 70
        + (1 / np.sqrt(zone_stats["total_events"] + 1)) * 30
    )

    best = zone_stats.sort_values("slack_score", ascending=False).head(3)

    suggestions = []

    needed_support = max(0, int((risk_score - 55) / 8))

    for _, row in best.iterrows():
        lend = max(2, min(8, needed_support + 2))
        suggestions.append(
            {
                "zone": clean_text(row["zone"]),
                "suggested_officers": lend,
                "reason": f"Lower historical closure pressure. Closure rate: {round(row['closure_rate'] * 100, 1)}%",
            }
        )

    return {
        "message": "Suggested temporary support zones based on historical event pressure.",
        "suggestions": suggestions,
    }


# -----------------------------
# API routes
# -----------------------------

@app.on_event("startup")
def startup():
    global df_global, model
    df_global = load_data()
    model = train_model(df_global)


@app.get("/")
def home():
    return {
        "message": "WWW Traffic Command backend is running",
        "features": [
            "Impact Timeline Engine",
            "Comparable Memory Engine",
            "War-Game Plan Lab",
            "Lifeline Corridor Guardian",
            "Resource Slack Optimizer",
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "rows_loaded": 0 if df_global is None else len(df_global),
        "csv_path": str(DATA_PATH),
    }


@app.get("/options")
def options():
    df = df_global.copy()

    return {
        "event_types": sorted(df["event_type"].dropna().unique().tolist()),
        "event_causes": sorted(df["event_cause"].dropna().unique().tolist()),
        "corridors": sorted(df["corridor"].dropna().unique().tolist())[:50],
        "police_stations": sorted(df["police_station"].dropna().unique().tolist())[:80],
        "zones": sorted(df["zone"].dropna().unique().tolist()),
        "priorities": sorted(df["priority"].dropna().unique().tolist()),
        "scenarios": [
            "normal",
            "rain",
            "vip_movement",
            "crowd_surge",
            "road_blockage",
            "ambulance_emergency",
        ],
    }


@app.post("/analyze")
def analyze(req: EventRequest):
    prediction_row = build_model_row(req)

    closure_probability = float(model.predict_proba(prediction_row)[0][1])

    risk_score = compute_risk_score(
        closure_probability=closure_probability,
        req=req,
    )

    comparables = find_comparable_events(req)
    confidence = build_confidence(comparables)

    timeline = build_impact_timeline(req, risk_score)
    plan = generate_deployment_plan(req, risk_score)
    stress_test = stress_test_plan(req, risk_score)
    lifeline = lifeline_corridor(req, risk_score)
    resource_slack = resource_slack_optimizer(req, risk_score)

    return {
        "summary": {
            "road_closure_probability": round(closure_probability, 3),
            "risk_score": risk_score,
            "risk_level": "High" if risk_score >= 75 else "Medium" if risk_score >= 45 else "Low",
            "highest_risk_window": "15–30 min after event ends",
        },
        "impact_timeline": timeline,
        "comparable_memory": {
            "confidence": confidence,
            "events": comparables,
        },
        "war_game_plan_lab": {
            "deployment_plan": plan,
            "stress_test": stress_test,
        },
        "lifeline_corridor_guardian": lifeline,
        "resource_slack_optimizer": resource_slack,
    }