"""One-shot raw API puller. Fetches every API-Football response Pitchside's
ETL needs into etl/seed/raw_cache/ so the merge (fetcher.ApiSource) runs
offline and re-runs cost zero API calls.

Run from backend/:  python -m etl.pull_raw
Requires API_FOOTBALL_KEY in the environment (backend/.env).
"""

import json
import os
import ssl
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import certifi

BASE = "https://v3.football.api-sports.io"
LEAGUE = 1
SEASON = 2026
CACHE = Path(__file__).parent / "seed" / "raw_cache"
KEY = os.environ["API_FOOTBALL_KEY"]
SSL_CTX = ssl.create_default_context(cafile=certifi.where())


def get(path: str, **params) -> dict:
    url = f"{BASE}/{path}"
    if params:
        url += "?" + urlencode(params)
    req = Request(url, headers={"x-apisports-key": KEY})
    with urlopen(req, timeout=30, context=SSL_CTX) as r:
        return json.loads(r.read())


def cache(name: str, path: str, **params) -> dict:
    dest = CACHE / f"{name}.json"
    data = get(path, **params)
    errors = data.get("errors")
    if errors:
        raise SystemExit(f"{name}: API errors {errors}")
    dest.write_text(json.dumps(data, ensure_ascii=False))
    print(f"{name}: {data.get('results')} results")
    return data


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)

    cache("teams", "teams", league=LEAGUE, season=SEASON)
    cache("standings", "standings", league=LEAGUE, season=SEASON)
    fixtures = cache("fixtures", "fixtures", league=LEAGUE, season=SEASON)
    cache("topscorers", "players/topscorers", league=LEAGUE, season=SEASON)
    cache("topassists", "players/topassists", league=LEAGUE, season=SEASON)

    # Per-fixture player stats: the master set that yields per-match ratings
    # (player form) and aggregate bar stats for every player.
    fx_dir = CACHE / "fixtures_players"
    fx_dir.mkdir(exist_ok=True)
    ids = [f["fixture"]["id"] for f in fixtures["response"]]
    done = 0
    for fid in ids:
        dest = fx_dir / f"{fid}.json"
        if dest.exists():
            done += 1
            continue
        data = get("fixtures/players", fixture=fid)
        dest.write_text(json.dumps(data, ensure_ascii=False))
        done += 1
        if done % 10 == 0:
            print(f"fixtures_players: {done}/{len(ids)}")
        time.sleep(0.2)  # stay under the per-minute rate cap
    print(f"fixtures_players: {done}/{len(ids)} cached")


if __name__ == "__main__":
    main()
