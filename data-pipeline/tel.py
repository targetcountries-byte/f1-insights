"""
tel.py — Core telemetry extractor for a single F1 session
Usage: python tel.py <year> <event> <session>
  e.g. python tel.py 2026 "Chinese Grand Prix" Q
"""

import sys
import math
import fastf1
import numpy as np
import pandas as pd
from pathlib import Path
from utils import (
    load_session, safe_float, safe_int, safe_bool,
    laptime_to_seconds, build_output_path, write_json,
    compound_color, driver_color, driver_team,
    extract_aero_channel, map_track_status,
    get_compound_colors,
)

def extract_session(year: int, event: str, session_type: str):
    print(f"\n=== Extracting {year} {event} {session_type} ===")
    session = load_session(year, event, session_type)

    laps = session.laps
    total_laps = int(laps["LapNumber"].max()) if len(laps) else 0
    drivers = laps["Driver"].unique().tolist()

    # ── Track status timeline ──────────────────────────────────────────
    track_status_timeline = []
    if hasattr(session, "track_status") and session.track_status is not None:
        for _, row in session.track_status.iterrows():
            track_status_timeline.append({
                "time": safe_float(row["Time"].total_seconds() if hasattr(row["Time"], "total_seconds") else row["Time"]),
                "status": map_track_status(str(row["Status"])),
                "message": str(row.get("Message", "")),
            })

    # ── Weather snapshot ───────────────────────────────────────────────
    weather_snap = {}
    if hasattr(session, "weather_data") and session.weather_data is not None and len(session.weather_data):
        wd = session.weather_data.iloc[0]
        weather_snap = {
            "air_temp":   safe_float(wd.get("AirTemp")),
            "track_temp": safe_float(wd.get("TrackTemp")),
            "humidity":   safe_float(wd.get("Humidity")),
            "wind_speed": safe_float(wd.get("WindSpeed")),
            "rainfall":   safe_bool(wd.get("Rainfall")),
        }

    # ── Per-driver lap + telemetry ─────────────────────────────────────
    all_drivers_data = {}

    for drv in drivers:
        drv_laps = laps.pick_drivers(drv)
        if drv_laps.empty:
            continue

        laps_list = []
        for _, lap in drv_laps.iterrows():
            lap_num   = safe_int(lap["LapNumber"])
            lap_time  = laptime_to_seconds(lap["LapTime"])
            s1        = laptime_to_seconds(lap["Sector1Time"])
            s2        = laptime_to_seconds(lap["Sector2Time"])
            s3        = laptime_to_seconds(lap["Sector3Time"])
            compound  = str(lap.get("Compound", "UNKNOWN")).upper()
            tyre_life = safe_int(lap.get("TyreLife"))
            is_fresh  = safe_bool(lap.get("FreshTyre"))
            stint     = safe_int(lap.get("Stint"))
            pit_in    = laptime_to_seconds(lap.get("PitInTime"))
            pit_out   = laptime_to_seconds(lap.get("PitOutTime"))
            speed_i1  = safe_float(lap.get("SpeedI1"))
            speed_i2  = safe_float(lap.get("SpeedI2"))
            speed_fl  = safe_float(lap.get("SpeedFL"))
            speed_st  = safe_float(lap.get("SpeedST"))
            pos       = safe_int(lap.get("Position"))
            is_acc    = safe_bool(lap.get("IsAccurate"))

            # Telemetry per lap
            tel_data = []
            try:
                tel = lap.get_telemetry()
                if tel is not None and not tel.empty:
                    for _, t in tel.iterrows():
                        aero = extract_aero_channel(t, year)
                        tel_data.append({
                            "d":  safe_float(t.get("Distance"), 1),
                            "sp": safe_float(t.get("Speed"), 1),
                            "th": safe_float(t.get("Throttle"), 1),
                            "br": safe_bool(t.get("Brake")),
                            "g":  safe_int(t.get("nGear")),
                            "r":  safe_int(t.get("RPM")),
                            **({
                                "drs": safe_int(aero["DRS"])
                            } if aero["DRS"] is not None else {
                                "aa": safe_int(aero["ActiveAero"])
                            }),
                        })
            except Exception as e:
                print(f"  tel error {drv} lap {lap_num}: {e}")

            laps_list.append({
                "lap":        lap_num,
                "time":       lap_time,
                "s1":         s1,
                "s2":         s2,
                "s3":         s3,
                "compound":   compound,
                "tyre_life":  tyre_life,
                "fresh_tyre": is_fresh,
                "stint":      stint,
                "pit_in":     pit_in,
                "pit_out":    pit_out,
                "spd_i1":     speed_i1,
                "spd_i2":     speed_i2,
                "spd_fl":     speed_fl,
                "spd_st":     speed_st,
                "pos":        pos,
                "accurate":   is_acc,
                "tel":        tel_data,
            })

        team = driver_team(drv, year)
        all_drivers_data[drv] = {
            "driver":      drv,
            "team":        team,
            "color":       driver_color(drv, year),
            "team_color":  driver_color(drv, year),
            "total_laps":  total_laps,
            "laps":        laps_list,
        }

    # ── Session metadata ───────────────────────────────────────────────
    output = {
        "year":           year,
        "event":          event,
        "session":        session_type,
        "date":           str(session.date) if hasattr(session, "date") else "",
        "circuit":        str(session.event.get("Location", "")),
        "country":        str(session.event.get("Country", "")),
        "total_laps":     total_laps,
        "drivers":        list(all_drivers_data.keys()),
        "track_status":   track_status_timeline,
        "weather":        weather_snap,
        "compound_colors": get_compound_colors(year),
        "data":           all_drivers_data,
    }

    # ── Write output ───────────────────────────────────────────────────
    out_path = build_output_path(year, event, session_type, "session")
    write_json(out_path, output)
    print(f"Done: {out_path}")
    return output


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python tel.py <year> <event> <session>")
        sys.exit(1)
    extract_session(int(sys.argv[1]), sys.argv[2], sys.argv[3])
