"""
utils.py — Shared utilities for F1 telemetry extraction pipeline
TracingInsights-style data pipeline, 2026-regulation-aware
"""

import os
import json
import fastf1
import fastf1.plotting
import pandas as pd
from pathlib import Path
from datetime import datetime

# ─────────────────────────────────────────────
# CACHE SETUP
# ─────────────────────────────────────────────
CACHE_DIR = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

# ─────────────────────────────────────────────
# COMPOUND COLORS  (2026: no C6)
# ─────────────────────────────────────────────
_COMPOUND_COLORS_BASE = {
    "SOFT":         "#FF3333",
    "MEDIUM":       "#FFD700",
    "HARD":         "#EEEEEE",
    "INTERMEDIATE": "#39B54A",
    "WET":          "#0067FF",
    "UNKNOWN":      "#888888",
    "TEST_UNKNOWN": "#434649",
    "C1":           "#EEEEEE",
    "C2":           "#D3D3D3",
    "C3":           "#FFD700",
    "C4":           "#FF8C00",
    "C5":           "#FF3333",
}

_COMPOUND_COLORS_PRE_2026 = {
    **_COMPOUND_COLORS_BASE,
    "C6": "#DA70D6",   # C6 existed up to and including 2025
}


def get_compound_colors(year: int) -> dict:
    """Return compound color palette for the given season.
    C6 was removed from Pirelli's range starting 2026."""
    if year >= 2026:
        return _COMPOUND_COLORS_BASE
    return _COMPOUND_COLORS_PRE_2026


def compound_color(compound: str, year: int) -> str:
    return get_compound_colors(year).get(str(compound).upper(), "#888888")


# ─────────────────────────────────────────────
# TEAM COLORS
# ─────────────────────────────────────────────
TEAM_COLORS_2025 = {
    "Red Bull Racing":  "#3671C6",
    "Ferrari":          "#E8002D",
    "Mercedes":         "#27F4D2",
    "McLaren":          "#FF8000",
    "Aston Martin":     "#229971",
    "Alpine":           "#FF87BC",
    "Williams":         "#64C4FF",
    "Racing Bulls":     "#6692FF",
    "Haas":             "#B6BABD",
    "Sauber":           "#52E252",
}

TEAM_COLORS_2026 = {
    "Red Bull Racing":  "#3671C6",
    "Ferrari":          "#E8002D",
    "Mercedes":         "#27F4D2",
    "McLaren":          "#FF8000",
    "Aston Martin":     "#229971",
    "Alpine":           "#FF87BC",
    "Williams":         "#64C4FF",
    "Racing Bulls":     "#6692FF",
    "Haas":             "#B6BABD",
    "Audi":             "#B8B8B8",   # formerly Sauber
    "Cadillac":         "#CC0000",   # new 11th team (hex TBC after AUS)
}


def get_team_colors(year: int) -> dict:
    if year >= 2026:
        return TEAM_COLORS_2026
    return TEAM_COLORS_2025


def team_color(team: str, year: int) -> str:
    return get_team_colors(year).get(team, "#888888")


# ─────────────────────────────────────────────
# DRIVER → TEAM MAPPINGS
# ─────────────────────────────────────────────
DRIVER_TEAM_2025 = {
    "VER": "Red Bull Racing",  "TSU": "Red Bull Racing",
    "LEC": "Ferrari",          "SAI": "Ferrari",
    "HAM": "Mercedes",         "RUS": "Mercedes",
    "NOR": "McLaren",          "PIA": "McLaren",
    "ALO": "Aston Martin",     "STR": "Aston Martin",
    "GAS": "Alpine",           "DOO": "Alpine",
    "ALB": "Williams",         "SAR": "Williams",
    "LAW": "Racing Bulls",     "HAD": "Racing Bulls",
    "MAG": "Haas",             "BEA": "Haas",
    "HUL": "Sauber",           "BOR": "Sauber",
    "PER": "Red Bull Racing",
}

DRIVER_TEAM_2026 = {
    "VER": "Red Bull Racing",  "LAW": "Red Bull Racing",
    "LEC": "Ferrari",          "HAM": "Ferrari",
    "RUS": "Mercedes",         "ANT": "Mercedes",
    "NOR": "McLaren",          "PIA": "McLaren",
    "ALO": "Aston Martin",     "STR": "Aston Martin",
    "GAS": "Alpine",           "COL": "Alpine",
    "ALB": "Williams",         "SAR": "Williams",
    "TSU": "Racing Bulls",     "HAD": "Racing Bulls",
    "MAG": "Haas",             "BEA": "Haas",
    "HUL": "Audi",             "BOR": "Audi",
    "PER": "Cadillac",         "BOT": "Cadillac",
}


def get_driver_team_map(year: int) -> dict:
    if year >= 2026:
        return DRIVER_TEAM_2026
    return DRIVER_TEAM_2025


def driver_team(driver: str, year: int) -> str:
    return get_driver_team_map(year).get(driver.upper(), "Unknown")


def driver_color(driver: str, year: int) -> str:
    team = driver_team(driver, year)
    return team_color(team, year)


# ─────────────────────────────────────────────
# FUEL CORRECTION  (2026: smaller hybrid tank)
# ─────────────────────────────────────────────
def get_fuel_params(year: int, session_type: str = "Race") -> dict:
    """
    Returns fuel correction parameters for a season.
    2026: 50/50 ICE-electric split → smaller fuel load.
    FUEL_2026_KG is a placeholder — update after real 2026 race data.
    """
    FUEL_2026_KG  = 70   # PLACEHOLDER — refine after AUS 2026
    FACTOR        = 0.03  # seconds saved per kg burned per lap

    if year >= 2026:
        return {
            "initial_kg": FUEL_2026_KG if session_type == "Race" else 25,
            "factor":     FACTOR,
            "note":       "2026 estimate — update after first race",
        }
    return {
        "initial_kg": 100 if session_type == "Race" else 30,
        "factor":     FACTOR,
        "note":       "validated 2022-2025",
    }


def fuel_corrected_laptime(lap_time_s: float, lap_num: int,
                            total_laps: int, year: int,
                            session_type: str = "Race") -> float:
    p = get_fuel_params(year, session_type)
    remaining = p["initial_kg"] * (1 - lap_num / max(total_laps, 1))
    return lap_time_s - (remaining * p["factor"])


# ─────────────────────────────────────────────
# ACTIVE AERO CHANNEL  (2026: no DRS)
# ─────────────────────────────────────────────
def extract_aero_channel(telemetry_row, year: int) -> dict:
    """
    ≤2025: DRS is 0/10/12/14 (closed → open states).
    2026+: DRS replaced by Active Aero / SLM.
           FastF1 may still use 'DRS' key for the SLM state.
    """
    if year >= 2026:
        val = telemetry_row.get("DRS", telemetry_row.get("ActiveAero"))
        return {
            "ActiveAero": int(val) if val is not None else None,
            "DRS":        None,
        }
    return {
        "DRS":        int(telemetry_row.get("DRS", 0)),
        "ActiveAero": None,
    }


# ─────────────────────────────────────────────
# SESSION LOADER
# ─────────────────────────────────────────────
def load_session(year: int, event: str, session_type: str):
    """Load a FastF1 session with caching."""
    session = fastf1.get_session(year, event, session_type)
    session.load(telemetry=True, laps=True, weather=True, messages=True)
    return session


# ─────────────────────────────────────────────
# JSON OUTPUT HELPERS
# ─────────────────────────────────────────────
def safe_float(v, decimals=3):
    try:
        return round(float(v), decimals)
    except (TypeError, ValueError):
        return None


def safe_int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def safe_bool(v):
    try:
        return bool(v)
    except (TypeError, ValueError):
        return None


def laptime_to_seconds(td) -> float | None:
    """Convert timedelta lap time to seconds."""
    try:
        return round(td.total_seconds(), 3)
    except Exception:
        return None


def build_output_path(year: int, event: str, session: str, driver: str) -> Path:
    """Build the canonical output path for a telemetry JSON file."""
    base = Path(__file__).parent.parent / "data" / str(year) / event / session
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{driver}.json"


def write_json(path: Path, data: dict | list):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"  wrote {path}")


# ─────────────────────────────────────────────
# TRACK STATUS MAPPING
# ─────────────────────────────────────────────
TRACK_STATUS = {
    "1": "green",
    "2": "yellow",
    "4": "safety_car",
    "5": "red_flag",
    "6": "vsc",
    "7": "vsc_ending",
}


def map_track_status(code: str) -> str:
    return TRACK_STATUS.get(str(code), "unknown")


# ─────────────────────────────────────────────
# CIRCUIT SPECIAL RULES
# ─────────────────────────────────────────────
def get_circuit_special_rules(year: int) -> dict:
    """Return circuit-specific regulation overrides for a season."""
    if year == 2025:
        return {
            "Monaco Grand Prix": {
                "min_pit_stops": 2,
                "note": "FIA mandatory 2-stop rule (2025 only, dropped for 2026)",
            }
        }
    return {}   # Monaco 2-stop rule dropped for 2026+
