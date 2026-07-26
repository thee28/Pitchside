"""Merge API-Football data onto the editorial seed — FULL REALIGN.

The seed (etl/seed/seed_data.json) began life as a *fabricated* tournament
(France champions) written before the real 2026 results existed. The real
tournament — Spain champions, Argentina runners-up, England third, France
fourth — is documented by API-Football and cached under etl/seed/raw_cache/
(see pull_raw.py). This module overwrites every *factual* layer with the real
data and rewrites the result-narrative fields so nothing contradicts reality:

  * teams            -> real fate / champion flag / factual sub, status, blurb
  * standings        -> real positions / W-D-L / GD / points
  * matches (all 104)-> real scores, winners, stages; KO scorers + match stats
  * players          -> real goals / assists / minutes / rating / bars / form,
                        board re-ranked by real output
  * awards           -> real Golden Boot + Golden Glove (computed), Golden Ball
  * tournament_stats -> recomputed from the 104 real fixtures

The seed still OWNS what the API has no concept of: slugs, flag emojis, radar
(playing-style) figures, the 25-player curation and which teams have profile
pages. Those are left untouched — see the KNOWN GAPS note at the bottom.

Everything is read from the on-disk cache, so a merge run makes zero API calls.
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

# API round string -> internal stage label (see routers/shared.py STAGE_RANK).
ROUND_TO_STAGE = {
    "Round of 32": "ROUND OF 32",
    "Round of 16": "ROUND OF 16",
    "Quarter-finals": "QUARTER-FINAL",
    "Semi-finals": "SEMI-FINAL",
    "3rd Place Final": "THIRD PLACE",
    "Final": "FINAL",
}

# Fate label by the deepest stage a side reached and how it left it.
FATE_BY_STAGE = {
    "ROUND OF 32": "Round of 32",
    "ROUND OF 16": "Round of 16",
    "QUARTER-FINAL": "Quarter-finals",
    "SEMI-FINAL": "Semi-finals",  # overridden by the third-place game
}

# Primary shirt colour per nation, for the home hero possession bar
# (stats.colors). Only the FINAL is rendered with these; anything missing
# falls back to the pitch greens.
TEAM_COLORS = {
    "ESP": "#C60B1E", "ARG": "#75AADB", "FRA": "#0055A4", "ENG": "#FFFFFF",
    "BRA": "#009C3B", "POR": "#006600", "NED": "#F36C21", "GER": "#111111",
    "MEX": "#006847", "USA": "#3C3B6E", "MAR": "#C1272D", "NOR": "#BA0C2F",
    "BEL": "#E30613", "CRO": "#FF0000", "COL": "#FCD116",
}
FALLBACK_COLORS = ["#4a7c40", "#89a06f"]


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
# fixtures -> normalised match rows
# ---------------------------------------------------------------------------

def _penalty_note(fx: dict) -> str | None:
    pen = fx["score"].get("penalty") or {}
    if pen.get("home") is not None and pen.get("away") is not None:
        return f"Pens {pen['home']}–{pen['away']}"
    if (fx["fixture"]["status"] or {}).get("short") == "AET":
        return "AET"
    return None


def _winner_code(fx: dict, id2code: dict) -> str | None:
    h, a = fx["teams"]["home"], fx["teams"]["away"]
    if h.get("winner"):
        return id2code[h["id"]]
    if a.get("winner"):
        return id2code[a["id"]]
    return None  # regulation draw (group stage)


def normalised_matches(id2code: dict, id2group: dict) -> list[dict]:
    rows = []
    for fx in _load("fixtures")["response"]:
        rnd = fx["league"]["round"]
        home, away = fx["teams"]["home"]["id"], fx["teams"]["away"]["id"]
        hc, ac = id2code[home], id2code[away]
        if rnd.startswith("Group Stage"):
            letter = id2group.get(home) or id2group.get(away)
            stage = f"GROUP {letter}"
            kind = None
        else:
            stage = ROUND_TO_STAGE.get(rnd)
            if stage is None:
                continue
            kind = "champ" if stage == "FINAL" else "third" if stage == "THIRD PLACE" else None
        venue = fx["fixture"]["venue"] or {}
        rows.append(
            {
                "fid": fx["fixture"]["id"],
                "stage": stage,
                "home_code": hc,
                "away_code": ac,
                "home_score": fx["goals"]["home"],
                "away_score": fx["goals"]["away"],
                "winner_code": _winner_code(fx, id2code),
                "note": _penalty_note(fx),
                "date_label": _date_label(fx["fixture"]["date"]),
                "venue": (venue.get("city") or None) if stage in ("FINAL", "THIRD PLACE") else None,
                "kind": kind,
                "_date": fx["fixture"]["date"],
                "_venue_long": venue.get("name"),
            }
        )
    # Chronological stage_order within each stage.
    from collections import defaultdict
    buckets = defaultdict(list)
    for m in rows:
        buckets[m["stage"]].append(m)
    for group in buckets.values():
        group.sort(key=lambda m: (m["_date"], m["home_code"]))
        for i, m in enumerate(group):
            m["stage_order"] = i
    return rows


# ---------------------------------------------------------------------------
# knockout events / statistics  ->  hero scorers + match stats
# ---------------------------------------------------------------------------

def _scorers(fid: int, id2code: dict, home_code: str, away_code: str) -> dict | None:
    path = CACHE / "fixtures_events" / f"{fid}.json"
    if not path.exists():
        return None
    home, away = [], []
    for e in json.loads(path.read_text()).get("response", []):
        if e.get("type") != "Goal" or e.get("detail") == "Missed Penalty":
            continue
        elapsed = e["time"]["elapsed"]
        extra = e["time"].get("extra")
        minute = f"{elapsed}+{extra}" if extra else f"{elapsed}"
        tag = " (pen)" if e["detail"] == "Penalty" else " (og)" if e["detail"] == "Own Goal" else ""
        line = f"{e['player']['name']} {minute}′{tag}"
        (home if id2code.get(e["team"]["id"]) == home_code else away).append(line)
    return {"home": home, "away": away}


def _match_stats(fid: int, home_code: str, away_code: str, id2code: dict, venue_long: str | None) -> dict | None:
    path = CACHE / "fixtures_stats" / f"{fid}.json"
    if not path.exists():
        return None
    by_code = {}
    for team in json.loads(path.read_text()).get("response", []):
        code = id2code.get(team["team"]["id"])
        by_code[code] = {s["type"]: s["value"] for s in team["statistics"]}
    h, a = by_code.get(home_code, {}), by_code.get(away_code, {})
    if not h or not a:
        return None

    def poss(v):
        return int(str(v).rstrip("%")) if v not in (None, "") else 0

    def pair(key):
        return f"{h.get(key) or 0} – {a.get(key) or 0}"

    def xg(v):
        return f"{float(v):.1f}" if v not in (None, "") else "—"

    return {
        "possession": [poss(h.get("Ball Possession")), poss(a.get("Ball Possession"))],
        "colors": [
            TEAM_COLORS.get(home_code, FALLBACK_COLORS[0]),
            TEAM_COLORS.get(away_code, FALLBACK_COLORS[1]),
        ],
        "shots": pair("Total Shots"),
        "onTarget": pair("Shots on Goal"),
        "xg": f"{xg(h.get('expected_goals'))} – {xg(a.get('expected_goals'))}",
        "venueLong": venue_long or "",
    }


# ---------------------------------------------------------------------------
# per-team fate from the real knockout results
# ---------------------------------------------------------------------------

def compute_fates(matches: list[dict]) -> dict[str, str]:
    """code -> fate label, derived purely from real results."""
    stage_rank = {"ROUND OF 32": 1, "ROUND OF 16": 2, "QUARTER-FINAL": 3,
                  "SEMI-FINAL": 4, "THIRD PLACE": 5, "FINAL": 6}
    fate: dict[str, str] = {}
    # Everyone who reached a knockout stage: default fate = the round they lost.
    for m in matches:
        if m["stage"] not in stage_rank:
            continue
        for code in (m["home_code"], m["away_code"]):
            won = m["winner_code"] == code
            if m["stage"] == "FINAL":
                fate[code] = "World Champions" if won else "Runners-up"
            elif m["stage"] == "THIRD PLACE":
                fate[code] = "Third place" if won else "Fourth place"
            elif not won:
                fate[code] = FATE_BY_STAGE[m["stage"]]
            else:
                fate.setdefault(code, FATE_BY_STAGE[m["stage"]])
    return fate


def _blurb(code: str, name: str, fate: str, matches: list[dict], id2name: dict) -> str:
    """A terse, factual one-liner. No invented colour — just the real result."""
    ko = [m for m in matches if m["stage"] not in
          (s for s in {m2["stage"] for m2 in matches} if s.startswith("GROUP"))
          and code in (m["home_code"], m["away_code"])]
    if fate == "World Champions":
        fin = next(m for m in matches if m["stage"] == "FINAL")
        opp = fin["away_code"] if fin["home_code"] == code else fin["home_code"]
        sa, sb = (fin["home_score"], fin["away_score"]) if fin["home_code"] == code else (fin["away_score"], fin["home_score"])
        extra = " after extra time" if fin["note"] == "AET" else ""
        return f"{name} won the 2026 World Cup, beating {id2name[opp]} {sa}–{sb} in the final{extra}."
    if fate == "Runners-up":
        return f"{name} reached the final and finished runners-up."
    if fate == "Third place":
        return f"{name} won the third-place play-off to finish third."
    if fate == "Fourth place":
        return f"{name} lost the third-place play-off to finish fourth."
    if fate in ("Quarter-finals", "Round of 16", "Round of 32"):
        return f"{name} were knocked out in the {fate.lower()}."
    return f"{name} were eliminated in the group stage."


# ---------------------------------------------------------------------------
# per-player aggregation from the 104 cached fixture player-stat files
# ---------------------------------------------------------------------------

def _fixture_meta() -> dict[int, dict]:
    out = {}
    for fx in _load("fixtures")["response"]:
        out[fx["fixture"]["id"]] = {
            "date": fx["fixture"]["date"],
            "home_id": fx["teams"]["home"]["id"],
            "away_id": fx["teams"]["away"]["id"],
        }
    return out


def aggregate_players() -> tuple[dict[str, dict], dict]:
    """Return ({normalised name: aggregate}, {team_id: clean_sheet_count})."""
    meta = _fixture_meta()
    agg: dict[int, dict] = {}
    keeper_conceded: dict[int, dict] = {}  # gk pid -> {"team": id, "cs": n}
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
                a = agg.setdefault(pid, {
                    "name": pl["player"]["name"], "team_id": own_id,
                    "minutes": 0, "goals": 0, "assists": 0,
                    "shots_total": 0, "shots_on": 0, "pass_total": 0,
                    "pass_accurate": 0.0, "drib_att": 0, "drib_succ": 0,
                    "duel_total": 0, "duel_won": 0, "form": [],
                })
                mins = s["games"]["minutes"] or 0
                a["minutes"] += mins
                a["goals"] += s["goals"]["total"] or 0
                a["assists"] += s["goals"]["assists"] or 0
                a["shots_total"] += s["shots"]["total"] or 0
                a["shots_on"] += s["shots"]["on"] or 0
                a["pass_total"] += s["passes"]["total"] or 0
                pa = s["passes"]["accuracy"]
                if pa is not None:
                    a["pass_accurate"] += int(pa)
                a["drib_att"] += s["dribbles"]["attempts"] or 0
                a["drib_succ"] += s["dribbles"]["success"] or 0
                a["duel_total"] += s["duels"]["total"] or 0
                a["duel_won"] += s["duels"]["won"] or 0
                rating = s["games"]["rating"]
                if rating is not None and fm:
                    a["form"].append((fm["date"], opp_id, float(rating)))
                # Clean-sheet tally for goalkeepers who played 60+ minutes.
                if s["games"]["position"] == "G" and mins >= 60:
                    k = keeper_conceded.setdefault(pid, {"team": own_id, "cs": 0, "name": pl["player"]["name"]})
                    if (s["goals"]["conceded"] or 0) == 0:
                        k["cs"] += 1
    return {norm(v["name"]): v for v in agg.values()}, keeper_conceded


def _pct(num: int, den: int):
    return round(num / den * 100) if den else None


def _bars_from(agg: dict, seed_bars: list) -> list:
    computed = {
        "shot": _pct(agg["shots_on"], agg["shots_total"]),
        "pass": _pct(round(agg["pass_accurate"]), agg["pass_total"]),
        "dribble": _pct(agg["drib_succ"], agg["drib_att"]),
        "duel": _pct(agg["duel_won"], agg["duel_total"]),
    }
    out = []
    for label, value, pct_old in seed_bars:
        low = label.lower()
        key = next((k for k in computed if k in low), None)
        pct = computed.get(key) if key else None
        out.append([label, f"{pct}%", pct] if pct is not None else [label, value, pct_old])
    return out


# ---------------------------------------------------------------------------
# section merges
# ---------------------------------------------------------------------------

def team_metrics(matches: list[dict], id2code: dict) -> dict[str, dict]:
    """code -> {gpm, cpm, xgpm}: real goals, goals conceded and xG per match,
    aggregated over every match a side actually played (group + knockout)."""
    acc: dict[str, dict] = {}

    def slot(code):
        return acc.setdefault(code, {"played": 0, "gf": 0, "ga": 0, "xg": 0.0, "xg_n": 0})

    xg_by_fid = _team_xg_by_fixture(id2code)
    for m in matches:
        hs, as_ = m["home_score"] or 0, m["away_score"] or 0
        h, a = slot(m["home_code"]), slot(m["away_code"])
        h["played"] += 1; h["gf"] += hs; h["ga"] += as_
        a["played"] += 1; a["gf"] += as_; a["ga"] += hs
        for code, xg in (xg_by_fid.get(m["fid"]) or {}).items():
            s = acc.get(code)
            if s is not None and xg is not None:
                s["xg"] += xg; s["xg_n"] += 1

    out = {}
    for code, s in acc.items():
        p = s["played"] or 1
        out[code] = {
            "gpm": s["gf"] / p,
            "cpm": s["ga"] / p,
            "xgpm": (s["xg"] / s["xg_n"]) if s["xg_n"] else None,
        }
    return out


def _team_xg_by_fixture(id2code: dict) -> dict[int, dict]:
    """fixture id -> {code: expected_goals} from the cached statistics files."""
    out: dict[int, dict] = {}
    for f in (CACHE / "fixtures_stats").glob("*.json"):
        fid = int(f.stem)
        per = {}
        for team in json.loads(f.read_text()).get("response", []):
            code = id2code.get(team["team"]["id"])
            xg = next((s["value"] for s in team["statistics"] if s["type"] == "expected_goals"), None)
            per[code] = float(xg) if xg not in (None, "") else None
        out[fid] = per
    return out


# Bar-fill denominators (per-match), chosen so a strong side lands high but not
# pinned at 100%. Purely cosmetic — the numeric label carries the real value.
_BAR_SCALE = {"gpm": 3.5, "xgpm": 3.0, "cpm": 2.5}


def _team_bars(metrics: dict | None, seed_bars: list) -> list:
    if not seed_bars or not metrics:
        return seed_bars
    out = []
    for label, value, pct_old in seed_bars:
        low = label.lower()
        if "conceded" in low:
            key = "cpm"
        elif "xg" in low:
            key = "xgpm"
        elif "goals per match" in low or ("goal" in low and "conceded" not in low):
            key = "gpm"
        else:
            key = None
        v = metrics.get(key) if key else None
        if v is None:
            out.append([label, value, pct_old])
        else:
            width = max(0, min(100, round(v / _BAR_SCALE[key] * 100)))
            out.append([label, f"{v:.1f}", width])
    return out


def merge_teams(editorial: dict, matches: list[dict], id2code: dict, id2name: dict) -> list:
    fates = compute_fates(matches)
    metrics = team_metrics(matches, id2code)
    out = []
    for t in editorial["teams"]:
        code = t["code"]
        fate = fates.get(code, "Group stage")
        merged = dict(t)
        merged["fate"] = fate
        merged["sub"] = fate
        merged["status"] = fate
        merged["blurb"] = _blurb(code, t["name"], fate, matches, id2name)
        merged["bars"] = _team_bars(metrics.get(code), t["bars"])
        out.append(merged)
    return out


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
            rows.append({
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
            })
    return rows


def merge_matches(matches: list[dict], id2code: dict) -> list:
    out = []
    for m in matches:
        row = {k: v for k, v in m.items() if not k.startswith("_") and k != "fid"}
        if m["stage"] in ROUND_TO_STAGE.values():
            row["scorers"] = _scorers(m["fid"], id2code, m["home_code"], m["away_code"])
            row["stats"] = _match_stats(m["fid"], m["home_code"], m["away_code"], id2code, m["_venue_long"])
        else:
            row["scorers"] = None
            row["stats"] = None
        out.append(row)
    return out


def merge_players(editorial: dict, agg_by_name: dict, id2code: dict) -> tuple[list, list]:
    players, unmatched = [], []
    for p in editorial["players"]:
        agg = agg_by_name.get(norm(p["name"]))
        if agg is None:
            # No API row for this player — keep the editorial record but drop it
            # from the leaderboard so we never publish an unverified stat line.
            kept = dict(p)
            kept["board_rank"] = None
            players.append(kept)
            unmatched.append(p["name"])
            continue
        merged = dict(p)
        merged["goals"] = agg["goals"]
        merged["assists"] = agg["assists"]
        merged["minutes"] = agg["minutes"]
        if p.get("note"):
            merged["note"] = re.sub(r"\b\d+(?=\s+GOALS\b)", str(agg["goals"]), p["note"])
        ratings = [r for _, _, r in agg["form"]]
        if ratings:
            merged["rating"] = round(sum(ratings) / len(ratings), 1)
        merged["bars"] = _bars_from(agg, p["bars"])
        form = sorted(agg["form"], key=lambda t: t[0])
        merged["form"] = [[id2code.get(opp, "?"), round(r, 1)] for _, opp, r in form]
        if not merged["form"]:
            merged["form"] = p["form"]
        players.append(merged)

    # Re-rank the leaderboard by real output (goals, then assists).
    ranked = sorted(
        [p for p in players if p.get("board_rank")],
        key=lambda p: (-p["goals"], -p["assists"], p["name"]),
    )
    for i, p in enumerate(ranked, 1):
        p["board_rank"] = i
    return players, unmatched


def merge_awards(editorial: dict, agg_by_name: dict, keepers: dict, id2code: dict) -> list:
    awards = [dict(a) for a in editorial["awards"]]
    code2flag = {t["code"]: t["flag"] for t in editorial["teams"]}
    name2code = {norm(t["name"]): t["code"] for t in editorial["teams"]}

    def flag_for(team_name: str) -> str:
        return code2flag.get(name2code.get(norm(team_name), ""), "")

    top = _load("topscorers")["response"]
    boot = None
    if top:
        w = top[0]
        goals = w["statistics"][0]["goals"]["total"]
        assists = w["statistics"][0]["goals"].get("assists") or 0
        boot = {"name": w["player"]["name"], "detail": f"{goals} goals · {assists} assists",
                "flag": flag_for(w["statistics"][0]["team"]["name"])}

    # Golden Ball (tournament MVP) is a VOTED award the API does not expose.
    # Editorial fact: the 2026 winner was Rodri (Spain). Minutes come from the
    # cached data; a holding midfielder's value isn't in the goals column.
    rodri = agg_by_name.get("rodri")
    ball = {
        "name": "Rodri",
        "flag": code2flag.get("ESP", ""),
        "detail": f"{rodri['minutes']} mins · World champion" if rodri else "World champion",
    }

    # Golden Glove: goalkeeper with the most clean sheets (computed from cache).
    glove = None
    if keepers:
        best = max(keepers.values(), key=lambda k: k["cs"])
        glove = {"name": best["name"], "detail": f"{best['cs']} clean sheets",
                 "flag": code2flag.get(id2code.get(best["team"], ""), "")}

    picks = {"golden boot": boot, "golden ball": ball, "golden glove": glove}
    for a in awards:
        pick = picks.get(a["award"].lower())
        if pick:
            a["player_name"] = pick["name"]
            a["detail"] = pick["detail"]
            a["flag"] = pick["flag"]
    return awards


def merge_tournament_stats(matches: list[dict]) -> list:
    played = len(matches)
    goals = sum((m["home_score"] or 0) + (m["away_score"] or 0) for m in matches)
    gpm = round(goals / played, 1) if played else 0
    return [
        {"value": str(played), "label": "Matches played", "sort": 0},
        {"value": str(goals), "label": "Goals scored", "sort": 1},
        {"value": f"{gpm}", "label": "Goals per match", "sort": 2},
    ]


def build_merged() -> dict:
    editorial = _load_editorial()
    id2code = team_id_to_code(editorial)
    id2group = team_id_to_group(id2code)
    id2name = {t["code"]: t["name"] for t in editorial["teams"]}

    matches = normalised_matches(id2code, id2group)
    agg_by_name, keepers = aggregate_players()

    players, unmatched = merge_players(editorial, agg_by_name, id2code)
    if unmatched:
        print(f"merge: {len(unmatched)} player(s) kept editorial (no API data): {unmatched}")

    return {
        "teams": merge_teams(editorial, matches, id2code, id2name),
        "standings": merge_standings(editorial, id2code),
        "matches": merge_matches(matches, id2code),
        "players": players,
        "awards": merge_awards(editorial, agg_by_name, keepers, id2code),
        "tournament_stats": merge_tournament_stats(matches),
    }


if __name__ == "__main__":
    m = build_merged()
    for k, v in m.items():
        print(f"{k}: {len(v)} rows")
