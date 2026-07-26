from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
from db import get_session
from routers.shared import timeline_note

router = APIRouter()


@router.get("/api/matches/{match_id}")
async def match_detail(match_id: int, session: AsyncSession = Depends(get_session)):
    match = await session.get(models.Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    teams = {
        t.code: t for t in (await session.scalars(select(models.Team))).all()
    }

    def ref(code: str) -> dict:
        t = teams[code]
        return {"code": t.code, "name": t.name, "flag": t.flag}

    return {
        "id": match.id,
        "stage": match.stage,
        "dateLabel": match.date_label,
        "note": match.note,
        "venue": match.venue,
        "home": ref(match.home_code),
        "away": ref(match.away_code),
        "homeScore": match.home_score,
        "awayScore": match.away_score,
        "winner": match.winner_code,
        "when": timeline_note(match),
        "scorers": match.scorers,
        "stats": match.stats,
        "lineups": match.lineups,
    }
