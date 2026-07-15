from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
import schemas
from db import get_session
from routers.shared import STAGE_RANK, timeline_note

router = APIRouter()

KO_STAGE_LABELS = {
    "FINAL": "F",
    "THIRD PLACE": "3RD",
    "SEMI-FINAL": "SF",
    "QUARTER-FINAL": "QF",
}


@router.get("/api/home", response_model=schemas.HomeResponse)
async def home(session: AsyncSession = Depends(get_session)):
    teams = {
        t.code: t for t in (await session.scalars(select(models.Team))).all()
    }

    final = (
        await session.scalars(
            select(models.Match).where(models.Match.stage == "FINAL")
        )
    ).one()
    hero = {
        "home": _ref(teams[final.home_code]),
        "away": _ref(teams[final.away_code]),
        "homeScore": final.home_score,
        "awayScore": final.away_score,
        "dateLabel": final.date_label,
        "venue": final.venue,
        "scorers": final.scorers,
        "stats": final.stats,
    }

    standings = (
        await session.scalars(
            select(models.GroupStanding).order_by(
                models.GroupStanding.group_letter, models.GroupStanding.position
            )
        )
    ).all()
    groups: dict[str, list] = {}
    for s in standings:
        t = teams[s.team_code]
        groups.setdefault(s.group_letter, []).append(
            {
                "code": s.team_code,
                "flag": t.flag,
                "name": t.name,
                "p": s.played,
                "w": s.won,
                "d": s.drawn,
                "l": s.lost,
                "gd": s.gd,
                "pts": s.points,
                "q": s.qualification,
                "fate": t.fate,
            }
        )

    ko_matches = (
        await session.scalars(
            select(models.Match)
            .where(models.Match.stage.in_(KO_STAGE_LABELS))
            .order_by(models.Match.stage_order)
        )
    ).all()
    ko_matches.sort(key=lambda m: (-STAGE_RANK[m.stage], m.stage_order))
    ko_results = []
    for m in ko_matches:
        winner, loser = (
            (m.home_code, m.away_code)
            if m.winner_code == m.home_code
            else (m.away_code, m.home_code)
        )
        w_score, l_score = (
            (m.home_score, m.away_score)
            if winner == m.home_code
            else (m.away_score, m.home_score)
        )
        ko_results.append(
            {
                "fa": teams[winner].flag,
                "fb": teams[loser].flag,
                "teams": f"{teams[winner].name} {w_score}–{l_score} {teams[loser].name}",
                "stage": KO_STAGE_LABELS[m.stage],
                "when": timeline_note(m),
            }
        )

    stats = (
        await session.scalars(
            select(models.TournamentStat).order_by(models.TournamentStat.sort)
        )
    ).all()

    return {
        "hero": hero,
        "groups": groups,
        "koResults": ko_results,
        "tourStats": [{"value": s.value, "label": s.label} for s in stats],
    }


def _ref(team: models.Team) -> dict:
    return {"code": team.code, "name": team.name, "flag": team.flag}
