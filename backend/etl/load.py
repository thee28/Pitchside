"""ETL: fetch tournament data, transform with pandas, upsert into Postgres.

Run from backend/: python -m etl.load
"""

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.dialects.postgresql import insert

import models
from config import SYNC_DATABASE_URL
from etl.fetcher import get_source

TABLES = {
    "teams": models.Team,
    "group_standings": models.GroupStanding,
    "matches": models.Match,
    "players": models.Player,
    "player_match_stats": models.PlayerMatchStat,
    "awards": models.Award,
    "tournament_stats": models.TournamentStat,
}

# Natural keys used for idempotent upserts on tables with serial PKs.
CONFLICT_KEYS = {
    "teams": ["id"],
    "group_standings": ["team_code"],
    "matches": ["stage", "home_code", "away_code"],
    "players": ["id"],
    "player_match_stats": ["player_id", "match_order"],
    "awards": ["award"],
    "tournament_stats": ["label"],
}

JSONB_COLS = {"radar", "bars"}


def build_frames(raw: dict) -> dict[str, pd.DataFrame]:
    teams = pd.DataFrame(raw["teams"]).rename(columns={"group": "group_letter"})

    standings = pd.DataFrame(raw["standings"]).rename(columns={"group": "group_letter"})

    matches = pd.DataFrame(raw["matches"])
    if "winner_code" not in matches.columns:
        matches["winner_code"] = None
    # Regulation results: winner from the scoreline; draws decided on
    # penalties keep their explicit winner_code from the source.
    matches["winner_code"] = matches["winner_code"].where(
        matches["winner_code"].notna(),
        matches.apply(
            lambda m: m["home_code"]
            if m["home_score"] > m["away_score"]
            else m["away_code"]
            if m["away_score"] > m["home_score"]
            else None,
            axis=1,
        ),
    )

    players = pd.DataFrame(raw["players"]).drop(columns=["form"])

    form_rows = [
        {
            "player_id": p["id"],
            "opponent_code": opp,
            "rating": rating,
            "match_order": i,
        }
        for p in raw["players"]
        for i, (opp, rating) in enumerate(p["form"])
    ]
    player_match_stats = pd.DataFrame(form_rows)

    awards = pd.DataFrame(raw["awards"])
    tournament_stats = pd.DataFrame(raw["tournament_stats"])

    return {
        "teams": teams,
        "group_standings": standings,
        "matches": matches,
        "players": players,
        "player_match_stats": player_match_stats,
        "awards": awards,
        "tournament_stats": tournament_stats,
    }


def validate(frames: dict[str, pd.DataFrame]) -> None:
    teams = frames["teams"]
    codes = set(teams["code"])
    standings = frames["group_standings"]

    assert len(teams) == len(set(teams["id"])) == len(codes), "duplicate team ids/codes"
    assert set(standings["team_code"]) == codes, "standings/teams mismatch"

    bad = standings[standings["played"] != standings[["won", "drawn", "lost"]].sum(axis=1)]
    assert bad.empty, f"standings arithmetic broken: {bad['team_code'].tolist()}"
    bad = standings[standings["points"] != standings["won"] * 3 + standings["drawn"]]
    assert bad.empty, f"points arithmetic broken: {bad['team_code'].tolist()}"

    matches = frames["matches"]
    match_codes = set(matches["home_code"]) | set(matches["away_code"])
    assert match_codes <= codes, f"unknown codes in matches: {match_codes - codes}"

    players = frames["players"]
    assert set(players["team_code"]) <= codes, "unknown player team codes"
    profile_ids = set(teams.loc[teams["has_profile"], "id"])
    linked = set(players["team_id"].dropna())
    assert linked <= profile_ids, f"players linked to non-profile teams: {linked - profile_ids}"

    stats = frames["player_match_stats"]
    assert set(stats["player_id"]) == set(players["id"]), "form rows/players mismatch"


def upsert(conn, table_name: str, df: pd.DataFrame) -> None:
    table = TABLES[table_name].__table__
    records = df.astype(object).where(df.notna(), None).to_dict(orient="records")
    for rec in records:
        for col, val in rec.items():
            if isinstance(val, float) and val.is_integer() and col not in JSONB_COLS:
                rec[col] = int(val)
    stmt = insert(table).values(records)
    update_cols = {
        c.name: stmt.excluded[c.name]
        for c in table.columns
        if c.name != "id" and c.name not in CONFLICT_KEYS[table_name]
    }
    conn.execute(
        stmt.on_conflict_do_update(
            index_elements=CONFLICT_KEYS[table_name], set_=update_cols
        )
    )


def main() -> None:
    raw = get_source().fetch()
    frames = build_frames(raw)
    validate(frames)
    engine = create_engine(SYNC_DATABASE_URL)
    with engine.begin() as conn:
        for name, df in frames.items():
            upsert(conn, name, df)
            count = conn.execute(text(f"SELECT count(*) FROM {name}")).scalar()
            print(f"{name}: loaded {len(df)} rows, table has {count}")


if __name__ == "__main__":
    main()
