# Pitchside — World Cup 2026

Historical dashboard for the completed World Cup 2026: group standings, knockout
bracket, team scout reports, player stats, and tournament leaders.

- **Frontend:** React + Vite + Tailwind (`frontend/`)
- **Backend:** FastAPI (async) + SQLAlchemy (`backend/`)
- **Database:** PostgreSQL 16 (Docker)
- **ETL:** Pandas seed loader (`backend/etl/`)

## Run locally

```sh
# 1. Database (host port 5433)
docker compose up -d

# 2. Backend
cd backend
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
./venv/bin/alembic upgrade head        # create schema
./venv/bin/python -m etl.load          # load tournament data (idempotent)
./venv/bin/uvicorn main:app --reload   # http://localhost:8000

# 3. Frontend (separate shell)
cd frontend
npm install
npm run dev                            # http://localhost:5173 (proxies /api → :8000)
```

## API

| Endpoint | Page |
|---|---|
| `GET /api/home` | Home — hero, standings, knockout results, stats |
| `GET /api/teams` | Teams grid |
| `GET /api/teams/{id}` | Team profile (radar, group table, run, key players) |
| `GET /api/players/{id}` | Player stats, performance bars, form chart |
| `GET /api/bracket` | Knockout tree |
| `GET /api/leaders` | Top scorers, assists, awards |

## Data

`python -m etl.load` loads the tournament (pandas transform → Postgres upsert,
safe to re-run). It defaults to `ETL_SOURCE=api`: the real API-Football results,
merged from the committed offline cache in `backend/etl/seed/raw_cache/` by
`backend/etl/merge.py`. No network call is made at load time.

Set `ETL_SOURCE=seed` to load the legacy `backend/etl/seed/seed_data.json`
instead — a fabricated, partial dataset kept only for local design work. Do not
ship it: its results are not real.

Refresh the cache with `python -m etl.pull_raw` (needs `API_FOOTBALL_KEY`).

The dataset is a static, completed-tournament snapshot: it does not update at
request time and has no live feed. Match dates are stored as date-only labels
(e.g. "Jul 19") with no kickoff times or timezones.

## Deployment

Set these in the respective environments before deploying:

- Backend: `DATABASE_URL`, and `CORS_ORIGINS` = the deployed frontend origin(s),
  comma-separated.
- Frontend: `VITE_API_BASE` = the backend origin, when the built site is served
  from a different origin than the API. Leave unset if the API is same-origin
  (e.g. behind a reverse proxy that routes `/api`).

## Design reference

The extracted design reference the frontend mirrors lives in
`design/template.html` and `design/logic.js` (committed). These were generated
from a Claude Design export (`Pitchside - World Cup 2026.html`) that is **not**
committed. To regenerate, place that export at the repo root and run
`python3 scripts/extract_design.py`; otherwise use the committed `design/` files.
