"""Merge API-Football facts onto the editorial seed.

The seed (etl/seed/seed_data.json) is the editorial base: it owns the slugs,
flag emojis, blurbs, radar/xG figures, player notes and the 25-player curation
that the API has no concept of. This module overlays *factual* numbers pulled
into etl/seed/raw_cache/ (see pull_raw.py) onto that base:

  * group standings      -> real positions / W-D-L / GD / points
  * group-stage matches  -> the ~50 group fixtures the seed omits
  * curated players       -> real goals / assists / minutes / rating,
                             real performance bars and per-match form
  * Golden Boot award     -> real top scorer + goal count

Knockout matches keep their hand-verified seed scores. Anything the API can't
supply (radar, xG, blurbs, flag emojis, slugs) is left untouched. Everything is
read from the on-disk cache, so a merge run makes zero API calls.
"""

import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path

SEED_DIR = Path(__file__).parent / "seed"
CACHE = SEED_DIR / "raw_cache"

# API team ids whose names don't normalise to a seed team name.
TEAM_ALIASES = {1113: "BIH", 1508: "DRC", 1533: "CPV", 2384: "USA"}


def norm(s: str) -> str:
    """Lowercase, strip accents/diacritics — so 'Pulišić' == 'Pulisic'."""
    decomposed = unicodedata.normalize("NFKD", s)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).lower().strip()


def _load(name: str) -> dict:
    return json.loads((CACHE / f"{name}.json").read_text())


def _load_editorial() -> dict:
    return json.loads((SEED_DIR / "seed_data.json").read_text())


def _fmt_gd(diff: int) -> str:
    return f"+{diff}" if diff > 0 else str(diff)


def _date_label(iso: str) -> str:
    d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return f"{d.strftime('%b')} {d.day}"


# ---------------------------------------------------------------------------
# identity maps
# ---------------------------------------------------------------------------

def team_id_to_code(editorial: dict) -> dict[int, str]:
    by_name = {norm(t["name"]): t["code"] for t in editorial["teams"]}
    out: dict[int, str] = {}
    for a in _load("teams")["response"]:
        tid = a["team"]["id"]
        code = TEAM_ALIASES.get(tid) or by_name.get(norm(a["team"]["name"]))
        if code is None:
            raise ValueError(f"unmapped API team {tid} {a['team']['name']!r}")
        out[tid] = code
    return out


def team_id_to_group(id2code: dict[int, str]) -> dict[int, str]:
    tables = _load("standings")["response"][0]["league"]["standings"]
    out: dict[int, str] = {}
    for table in tables:
        for row in table:
            grp = row.get("group", "")
            letter = grp.split()[-1] if grp.startswith("Group ") else ""
            if len(letter) == 1:
                out[row["team"]["id"]] = letter
    return out


# ---------------------------------------------------------------------------
# per-player aggregation from the 104 cached fixture player-stat files
# ---------------------------------------------------------------------------

def _fixture_meta() -> dict[int, dict]:
    """fixture id -> {date, home_id, away_id} from the cached fixtures list."""
    out = {}
    for fx in _load("fixtures")["response"]:
        out[fx["fixture"]["id"]] = {
            "date": fx["fixture"]["date"],
            "home_id": fx["teams"]["home"]["id"],
            "away_id": fx["teams"]["away"]["id"],
        }
    return out


def aggregate_players(id2code: dict[int, str]) -> dict[str, dict]:
    """Return {normalised name: aggregate} across every cached fixture."""
    meta = _fixture_meta()
    agg: dict[int, dict] = {}
    for f in sorted((CACHE / "fixtures_players").glob("*.json")):
        fid = int(f.stem)
        fm = meta.get(fid)
        data = json.loads(f.read_text())
        for block in data.get("response", []):
            own_id = block["team"]["id"]
            opp_id = None
            if fm:
                opp_id = fm["away_id"] if own_id == fm["home_id"] else fm["home_id"]
            for pl in block.get("players", []):
                pid = pl["player"]["id"]
                s = pl["statistics"][0]
                a = agg.setdefault(
                    pid,
                    {
                        "name": pl["player"]["name"],
                        "team_id": own_id,
                        "minutes": 0,
                        "goals": 0,
                        "assists": 0,
                        "shots_total": 0,
                        "shots_on": 0,
                        "pass_total": 0,
                        "pass_accurate": 0.0,
                        "drib_att": 0,
                        "drib_succ": 0,
                        "duel_total": 0,
                        "duel_won": 0,
                        "form": [],  # (iso_date, opponent_id, rating)
                    },
                )
                a["minutes"] += s["games"]["minutes"] or 0
                a["goals"] += s["goals"]["total"] or 0
                a["assists"] += s["goals"]["assists"] or 0
                a["shots_total"] += s["shots"]["total"] or 0
                a["shots_on"] += s["shots"]["on"] or 0
                pt = s["passes"]["total"] or 0
                # In fixtures/players, passes.accuracy is the COUNT of completed
                # passes (not a percentage — that's only true on the season
                # players endpoint). Verified: sum(count)/sum(total) matches the
                # season accuracy figure.
                pa = s["passes"]["accuracy"]
                a["pass_total"] += pt
                if pa is not None:
                    a["pass_accurate"] += int(pa)
                a["drib_att"] += s["dribbles"]["attempts"] or 0
                a["drib_succ"] += s["dribbles"]["success"] or 0
                a["duel_total"] += s["duels"]["total"] or 0
                a["duel_won"] += s["duels"]["won"] or 0
                rating = s["games"]["rating"]
                if rating is not None and fm:
                    a["form"].append((fm["date"], opp_id, float(rating)))
    return {norm(v["name"]): v for v in agg.values()}


def _pct(num: int, den: int):
    return round(num / den * 100) if den else None


def _bars_from(agg: dict, seed_bars: list) -> list:
    """Overlay real percentages onto the seed's bar labels; keep seed value
    for any metric the API didn't cover (denominator zero)."""
    computed = {
        "shot": _pct(agg["shots_on"], agg["shots_total"]),
        "pass": _pct(round(agg["pass_accurate"]), agg["pass_total"]),
        "dribble": _pct(agg["drib_succ"], agg["drib_att"]),
        "duel": _pct(agg["duel_won"], agg["duel_total"]),
    }
    keymap = {"shot": "shot", "pass": "pass", "dribble": "dribble", "duel": "duel"}
    out = []
    for label, value, _pct_old in seed_bars:
        low = label.lower()
        key = next((k for k in keymap if k in low), None)
        pct = computed.get(key) if key else None
        if pct is None:
            out.append([label, value, _pct_old])
        else:
            out.append([label, f"{pct}%", pct])
    return out


# ---------------------------------------------------------------------------
# section merges
# ---------------------------------------------------------------------------

def merge_standings(editorial: dict, id2code: dict[int, str]) -> list:
    qual = {s["team_code"]: s.get("qualification") for s in editorial["standings"]}
    seed_group = {s["team_code"]: s["group"] for s in editorial["standings"]}
    tables = _load("standings")["response"][0]["league"]["standings"]
    rows = []
    for table in tables:
        for r in table:
            grp = r.get("group", "")
            letter = grp.split()[-1] if grp.startswith("Group ") else ""
            if len(letter) != 1:
                continue
            code = id2code[r["team"]["id"]]
            allrec = r["all"]
            rows.append(
                {
                    "group": seed_group.get(code, letter),
                    "team_code": code,
                    "position": r["rank"],
                    "played": allrec["played"],
                    "won": allrec["win"],
                    "drawn": allrec["draw"],
                    "lost": allrec["lose"],
                    "gd": _fmt_gd(r["goalsDiff"]),
                    "points": r["points"],
                    "qualification": qual.get(code),
                }
            )
    return rows


def merge_matches(editorial: dict, id2code: dict, id2group: dict) -> list:
    matches = [dict(m) for m in editorial["matches"]]
    have_pairs = {frozenset((m["home_code"], m["away_code"])) for m in matches}

    for fx in _load("fixtures")["response"]:
        rnd = fx["league"]["round"]
        if not rnd.startswith("Group Stage"):
            continue  # knockout stays editorial
        home = id2code[fx["teams"]["home"]["id"]]
        away = id2code[fx["teams"]["away"]["id"]]
        if frozenset((home, away)) in have_pairs:
            continue
        letter = id2group.get(fx["teams"]["home"]["id"])
        if letter is None:
            continue
        matches.append(
            {
                "stage": f"GROUP {letter}",
                "stage_order": 0,  # assigned below
                "home_code": home,
                "away_code": away,
                "home_score": fx["goals"]["home"],
                "away_score": fx["goals"]["away"],
                "note": None,
                "date_label": _date_label(fx["fixture"]["date"]),
                "venue": None,
                "kind": None,
                "_date": fx["fixture"]["date"],
            }
        )

    # Normalise group-stage ordering to chronological. Knockout untouched.
    groups = [m for m in matches if m["stage"].startswith("GROUP")]
    groups.sort(key=lambda m: (m.get("_date") or "", m["home_code"]))
    for i, m in enumerate(groups):
        m["stage_order"] = i
    for m in matches:
        m.pop("_date", None)
    return matches


def merge_players(editorial: dict, id2code: dict) -> tuple[list, list]:
    by_name = aggregate_players(id2code)
    players, unmatched = [], []
    for p in editorial["players"]:
        agg = by_name.get(norm(p["name"]))
        if agg is None:
            players.append(dict(p))  # keep editorial wholesale
            unmatched.append(p["name"])
            continue
        merged = dict(p)
        merged["goals"] = agg["goals"]
        merged["assists"] = agg["assists"]
        merged["minutes"] = agg["minutes"]
        # Keep any goal count embedded in the editorial note honest, e.g.
        # "GOLDEN BOOT · 9 GOALS" -> "... 10 GOALS".
        if p.get("note"):
            merged["note"] = re.sub(
                r"\b\d+(?=\s+GOALS\b)", str(agg["goals"]), p["note"]
            )
        ratings = [r for _, _, r in agg["form"]]
        if ratings:
            merged["rating"] = round(sum(ratings) / len(ratings), 1)
        merged["bars"] = _bars_from(agg, p["bars"])
        form = sorted(agg["form"], key=lambda t: t[0])
        merged["form"] = [
            [id2code.get(opp, "?"), round(r, 1)] for _, opp, r in form
        ]
        if not merged["form"]:
            merged["form"] = p["form"]  # never leave a player with no form rows
        players.append(merged)
    return players, unmatched


def merge_awards(editorial: dict) -> list:
    awards = [dict(a) for a in editorial["awards"]]
    top = _load("topscorers")["response"]
    if top:
        winner = top[0]
        goals = winner["statistics"][0]["goals"]["total"]
        for a in awards:
            if a["award"].lower() == "golden boot":
                a["player_name"] = winner["player"]["name"]
                a["detail"] = f"{goals} goals"
    return awards


def build_merged() -> dict:
    editorial = _load_editorial()
    id2code = team_id_to_code(editorial)
    id2group = team_id_to_group(id2code)

    players, unmatched = merge_players(editorial, id2code)
    if unmatched:
        print(f"merge: {len(unmatched)} player(s) kept editorial (no API data): {unmatched}")

    return {
        "teams": editorial["teams"],  # editorial-only (radar/blurb/emoji/slug)
        "standings": merge_standings(editorial, id2code),
        "matches": merge_matches(editorial, id2code, id2group),
        "players": players,
        "awards": merge_awards(editorial),
        "tournament_stats": editorial["tournament_stats"],
    }


if __name__ == "__main__":
    m = build_merged()
    for k, v in m.items():
        print(f"{k}: {len(v)} rows")
