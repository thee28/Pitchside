from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import bracket, home, leaders, players, teams

app = FastAPI(title="Pitchside API")

app.include_router(home.router)
app.include_router(teams.router)
app.include_router(players.router)
app.include_router(bracket.router)
app.include_router(leaders.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}
