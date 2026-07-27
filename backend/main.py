import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import bracket, home, leaders, matches, players, teams

app = FastAPI(title="Pitchside API")

app.include_router(home.router)
app.include_router(teams.router)
app.include_router(players.router)
app.include_router(bracket.router)
app.include_router(leaders.router)
app.include_router(matches.router)

# Comma-separated list of allowed frontend origins. Defaults to the Vite dev
# server; set CORS_ORIGINS to the deployed frontend origin(s) in production.
_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}
