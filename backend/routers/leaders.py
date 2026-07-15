from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
import schemas
from db import get_session

router = APIRouter()


@router.get("/api/leaders", response_model=schemas.LeadersResponse)
async def leaders(session: AsyncSession = Depends(get_session)):
    team_names = {
        t.code: t.name for t in (await session.scalars(select(models.Team))).all()
    }

    board = (
        await session.scalars(
            select(models.Player)
            .where(models.Player.board_rank.is_not(None))
            .order_by(models.Player.board_rank)
        )
    ).all()

    top_assists = (
        await session.scalars(
            select(models.Player)
            .order_by(models.Player.assists.desc(), models.Player.goals.desc())
            .limit(3)
        )
    ).all()

    awards = (
        await session.scalars(select(models.Award).order_by(models.Award.id))
    ).all()

    return {
        "board": [
            {
                "id": p.id,
                "rank": p.board_rank,
                "flag": p.flag,
                "name": p.name,
                "teamName": team_names[p.team_code],
                "goals": p.goals,
                "assists": p.assists,
                "mins": p.minutes,
            }
            for p in board
        ],
        "assists": [
            {"flag": p.flag, "name": p.name, "n": p.assists} for p in top_assists
        ],
        "awards": [
            {"flag": a.flag, "name": a.player_name, "award": a.award, "detail": a.detail}
            for a in awards
        ],
    }
