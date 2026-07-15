from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
import schemas
from db import get_session
from routers.shared import bracket_note

router = APIRouter()

COLS = [
    ("Round of 32", "Jun 28 – Jul 3", ["ROUND OF 32"]),
    ("Round of 16", "Jul 4 – 7", ["ROUND OF 16"]),
    ("Quarter-finals", "Jul 9 – 11", ["QUARTER-FINAL"]),
    ("Semi-finals", "Jul 14 – 15", ["SEMI-FINAL"]),
    ("Final · Third place", "Jul 18 – 19 · East Rutherford", ["FINAL", "THIRD PLACE"]),
]


@router.get("/api/bracket", response_model=schemas.BracketResponse)
async def bracket(session: AsyncSession = Depends(get_session)):
    teams = {
        t.code: t.flag for t in (await session.scalars(select(models.Team))).all()
    }
    cols = []
    for title, sub, stages in COLS:
        matches = (
            await session.scalars(
                select(models.Match)
                .where(models.Match.stage.in_(stages))
                .order_by(models.Match.stage_order)
            )
        ).all()
        cols.append(
            {
                "title": title,
                "sub": sub,
                "matches": [
                    {
                        "ca": m.home_code,
                        "cb": m.away_code,
                        "fa": teams[m.home_code],
                        "fb": teams[m.away_code],
                        "sa": m.home_score,
                        "sb": m.away_score,
                        "winner": "a" if m.winner_code == m.home_code else "b",
                        "note": bracket_note(m),
                        "kind": m.kind,
                    }
                    for m in matches
                ],
            }
        )
    return {"cols": cols}
