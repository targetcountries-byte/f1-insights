# F1 Analytics 🏎️

Formula 1 telemetry analysis platform — interactive lap times, tyre strategy, speed traces and race insights. Built with Next.js + FastF1 + Plotly.js.

**Live site:** [Deploy on Vercel](#deployment)

---

## What it does

- **Interactive charts** — lap times, tyre strategy, speed trace, GG plot, sector analysis, position changes, stint breakdown
- **2026-regulation-aware** — no C6 compound, Active Aero (SLM) replaces DRS, 11 teams including Cadillac and Audi
- **Auto-updating** — GitHub Actions runs ~30 min after every F1 session to extract and commit fresh telemetry
- **Fuel correction** — adjusts lap times for fuel burn (year-aware constants)
- **URL-shareable** — every session/driver combo has a unique URL (`?y=2026&e=Chinese&s=Q`)

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Plotly.js |
| Data pipeline | Python 3.10, FastF1, GitHub Actions |
| Data storage | JSON files in this repo (no database) |
| Hosting | Vercel (frontend) |

---

## Project structure

```
├── .github/workflows/      # Auto-extract: FP1, Q, Race after every session
├── data-pipeline/
│   ├── utils.py            # Compound colours, team colours, fuel correction (2026-aware)
│   ├── tel.py              # Telemetry extractor (speed, throttle, brake, DRS/ActiveAero)
│   ├── laptimesR.py        # Lap times + fuel correction
│   └── requirements.txt
├── data/                   # Auto-generated JSON telemetry (one file per session)
│   └── 2026/
│       └── Chinese Grand Prix/
│           └── Q/session.json
└── frontend/
    ├── app/                # Next.js App Router pages
    ├── components/
    │   ├── Charts/         # Plotly chart components
    │   ├── Selectors/      # Session/driver selectors
    │   └── Layout/         # Navbar
    └── lib/
        ├── constants.ts    # All F1 constants (year-aware)
        ├── store.ts        # Zustand global state
        └── api.ts          # Data fetching helpers
```

---

## 2026 Regulation changes handled

| Change | Status |
|---|---|
| C6 compound removed (C1–C5 only) | ✅ `get_compound_colors(year)` |
| DRS → Active Aero (SLM + Overtake Mode) | ✅ `extract_aero_channel(t, year)` |
| Cadillac added (11th team) | ✅ `TEAM_COLORS_2026` |
| Sauber renamed to Audi | ✅ `TEAM_COLORS_2026` |
| Driver lineup updates (HAM→Ferrari, ANT→Mercedes, etc.) | ✅ `DRIVER_TEAM_2026` |
| Fuel correction constant adjusted for smaller hybrid tank | ✅ `get_fuel_params(year)` |
| Monaco 2-stop mandatory rule dropped | ✅ `get_circuit_special_rules(year)` |

---

## Data pipeline

The pipeline runs automatically via GitHub Actions after each session:

- **FP1/FP2/FP3** — extracts telemetry, lap times, sector times
- **Qualifying** — full telemetry per driver per lap
- **Race** — telemetry + lap times + fuel-corrected times + stint data

Data format per session (`data/{year}/{event}/{session}/session.json`):
```json
{
  "year": 2026,
  "event": "Chinese Grand Prix",
  "session": "Q",
  "total_laps": 3,
  "compound_colors": { "SOFT": "#FF3333", ... },
  "data": {
    "VER": {
      "driver": "VER",
      "team": "Red Bull Racing",
      "color": "#3671C6",
      "laps": [
        {
          "lap": 1, "time": 91.234, "compound": "SOFT",
          "s1": 28.1, "s2": 30.4, "s3": 32.7,
          "tel": [{ "d": 0, "sp": 0, "th": 0, "br": false, "g": 1, "r": 8000, "aa": 0 }]
        }
      ]
    }
  }
}
```

---

## Running locally

```bash
# Data pipeline
cd data-pipeline
pip install -r requirements.txt
python tel.py 2026 "Chinese Grand Prix" Q

# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Deployment

**Vercel (recommended):**
1. Fork this repo
2. Connect to Vercel — it auto-detects the `vercel.json` config
3. Deploy → live in 2 minutes

**GitHub Actions tokens:**
- The workflows use `secrets.GITHUB_TOKEN` — no setup needed, GitHub provides it automatically

---

## Data sources

- **FastF1** — official F1 timing feeds
- **Ergast/Jolpica API** — historical race data

---

*Unofficial fan project. Not affiliated with Formula 1, FIA, or any F1 team.*
