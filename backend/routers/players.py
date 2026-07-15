from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
import schemas
from db import get_session

router = APIRouter()


@router.get("/api/players/{player_id}", response_model=schemas.PlayerResponse)
async def player(player_id: str, session: AsyncSession = Depends(get_session)):
    p = await session.get(models.Player, player_id)
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")

    team = (
        await session.scalars(
            select(models.Team).where(models.Team.code == p.team_code)
        )
    ).one()

    form = (
        await session.scalars(
            select(models.PlayerMatchStat)
            .where(models.PlayerMatchStat.player_id == p.id)
            .order_by(models.PlayerMatchStat.match_order)
        )
    ).all()

    return {
        "id": p.id,
        "name": p.name,
        "flag": p.flag,
        "teamName": team.name,
        "teamId": p.team_id,
        "pos": p.position,
        "num": p.number,
        "goals": p.goals,
        "assists": p.assists,
        "rating": p.rating,
        "mins": p.minutes,
        "note": p.note,
        "bars": p.bars,
        "form": [{"opp": f.opponent_code, "rating": f.rating} for f in form],
    }
