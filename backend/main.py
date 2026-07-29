import os
import time
from collections import deque

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import bracket, home, leaders, matches, players, stadiums, teams

# The interactive docs describe an API that is public, read-only and static, so
# they leak nothing exploitable — but they are pure attack-surface for scrapers,
# so keep them off in production. Set ENABLE_DOCS=1 locally to get them back.
_docs_enabled = os.getenv("ENABLE_DOCS") == "1"

app = FastAPI(
    title="Pitchside API",
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
    openapi_url="/openapi.json" if _docs_enabled else None,
)

app.include_router(home.router)
app.include_router(teams.router)
app.include_router(players.router)
app.include_router(bracket.router)
app.include_router(leaders.router)
app.include_router(matches.router)
app.include_router(stadiums.router)

# Per-IP request cap. A visitor browsing hard fires a handful of calls per page,
# so this only ever bites scrapers and runaway loops. In-process and per-worker,
# which is enough: it exists to bound cost on a single small instance, not to be
# a real WAF (Render already fronts us with Cloudflare).
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MIN", "120"))
RATE_WINDOW = 60.0
_hits: dict[str, deque[float]] = {}


def _client_ip(request: Request) -> str:
    """Best-effort client IP.

    `CF-Connecting-IP` is written by Render's Cloudflare edge and overwrites
    anything the caller sent, so it is trustworthy. `X-Forwarded-For` is not:
    a caller can seed it and the proxy only appends, so the *last* entry is the
    closest to a real hop. Fall back to the socket for local runs.
    """
    cf = request.headers.get("cf-connecting-ip")
    if cf:
        return cf.strip()
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if request.url.path == "/api/health":
        return await call_next(request)

    now = time.monotonic()
    ip = _client_ip(request)
    window = _hits.setdefault(ip, deque())
    while window and now - window[0] > RATE_WINDOW:
        window.popleft()

    if len(window) >= RATE_LIMIT:
        retry_after = int(RATE_WINDOW - (now - window[0])) + 1
        return JSONResponse(
            {"detail": "Too many requests"},
            status_code=429,
            headers={"Retry-After": str(retry_after)},
        )

    window.append(now)

    # Drop idle buckets so a stream of unique IPs cannot grow the dict forever.
    if len(_hits) > 10_000:
        for stale_ip in [
            k for k, v in _hits.items() if not v or now - v[-1] > RATE_WINDOW
        ]:
            _hits.pop(stale_ip, None)

    return await call_next(request)


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
