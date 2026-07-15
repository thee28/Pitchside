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

Tournament data lives in `backend/etl/seed/seed_data.json` and is loaded by
`python -m etl.load` (pandas transform → Postgres upsert, safe to re-run).
`backend/etl/fetcher.py` defines the source interface — swap `ApiSource` in
once a football data API has full post-tournament coverage (set `ETL_SOURCE=api`).

## Design reference

The finalized design lives in `Pitchside - World Cup 2026.html` (Claude Design
export). `python3 scripts/extract_design.py` regenerates `design/template.html`
and `design/logic.js`, which the frontend pages mirror.
