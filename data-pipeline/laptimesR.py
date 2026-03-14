"""
laptimesR.py — Extract and store clean lap times for all race sessions
Used by the laptimes GitHub Actions workflow.
"""

import sys
import json
import fastf1
import pandas as pd
from pathlib import Path
from utils import (
    load_session, laptime_to_seconds, safe_int, safe_float, safe_bool,
    build_output_path, write_json, driver_team, driver_color,
    compound_color, get_fuel_params, fuel_corrected_laptime,
)


def extract_laptimes(year: int, event: str, session_type: str = "R"):
    print(f"\n=== Lap Times: {year} {event} {session_type} ===")
    session = load_session(year, event, session_type)
    laps = session.laps
    if laps.empty:
        print("  No laps found.")
        return

    total_laps = int(laps["LapNumber"].max())
    fuel_params = get_fuel_params(year, session_type)

    records = []
    for _, lap in laps.iterrows():
        drv       = str(lap["Driver"])
        lap_num   = safe_int(lap["LapNumber"])
        lap_time  = laptime_to_seconds(lap["LapTime"])
        compound  = str(lap.get("Compound", "UNKNOWN")).upper()
        tyre_life = safe_int(lap.get("TyreLife"))
        stint     = safe_int(lap.get("Stint"))
        pos       = safe_int(lap.get("Position"))
        is_acc    = safe_bool(lap.get("IsAccurate"))
        is_pb     = safe_bool(lap.get("IsPersonalBest"))
        s1        = laptime_to_seconds(lap.get("Sector1Time"))
        s2        = laptime_to_seconds(lap.get("Sector2Time"))
        s3        = laptime_to_seconds(lap.get("Sector3Time"))

        # Fuel-corrected time
        fuel_corrected = None
        if lap_time and lap_num and total_laps:
            fuel_corrected = round(fuel_corrected_laptime(
                lap_time, lap_num, total_laps, year, "Sprint" if session_type in ("SR", "SS") else "Race"
            ), 3)

        records.append({
            "driver":         drv,
            "team":           driver_team(drv, year),
            "color":          driver_color(drv, year),
            "lap":            lap_num,
            "time":           lap_time,
            "fuel_corrected": fuel_corrected,
            "compound":       compound,
            "tyre_life":      tyre_life,
            "stint":          stint,
            "pos":            pos,
            "accurate":       is_acc,
            "personal_best":  is_pb,
            "s1":             s1,
            "s2":             s2,
            "s3":             s3,
        })

    output = {
        "year":        year,
        "event":       event,
        "session":     session_type,
        "total_laps":  total_laps,
        "fuel_params": fuel_params,
        "laps":        records,
    }

    out_path = build_output_path(year, event, session_type, "laptimes")
    write_json(out_path, output)
    print(f"  Extracted {len(records)} laps → {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python laptimesR.py <year> <event> [session=R]")
        sys.exit(1)
    sess = sys.argv[3] if len(sys.argv) > 3 else "R"
    extract_laptimes(int(sys.argv[1]), sys.argv[2], sess)
