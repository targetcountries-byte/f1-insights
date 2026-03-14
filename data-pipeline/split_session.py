"""
split_session.py — Splits an existing monolithic session.json 
into session_meta.json + per-driver {DRIVER}.json files
"""
import sys, json
from pathlib import Path

def split(session_json_path: str):
    p = Path(session_json_path)
    print(f"Reading {p} ({p.stat().st_size / 1e6:.1f} MB)...")
    
    with open(p) as f:
        full = json.load(f)
    
    base_dir = p.parent
    
    # Build meta (without driver data)
    meta = {k: v for k, v in full.items() if k != 'data'}
    meta['driver_colors'] = {d: full['data'][d]['color'] for d in full.get('drivers', []) if d in full.get('data', {})}
    
    meta_path = base_dir / 'session_meta.json'
    with open(meta_path, 'w') as f:
        json.dump(meta, f, separators=(',', ':'))
    print(f"  wrote session_meta.json ({meta_path.stat().st_size / 1e3:.1f} KB)")
    
    # Write per-driver files
    for driver, driver_data in full.get('data', {}).items():
        driver_path = base_dir / f'{driver}.json'
        with open(driver_path, 'w') as f:
            json.dump(driver_data, f, separators=(',', ':'))
        print(f"  wrote {driver}.json ({driver_path.stat().st_size / 1e3:.1f} KB)")
    
    print(f"Done! Split into {1 + len(full.get('data', {}))} files")

if __name__ == '__main__':
    split(sys.argv[1] if len(sys.argv) > 1 else 'session.json')
