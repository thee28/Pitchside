from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
import schemas
from db import get_session
from routers.shared import stage_rank, timeline_note

router = APIRouter()


@router.get("/api/teams", response_model=schemas.TeamsResponse)
async def teams(session: AsyncSession = Depends(get_session)):
    cards = (
        await session.scalars(
            select(models.Team)
            .where(models.Team.card_order.is_not(None))
            .order_by(models.Team.card_order)
        )
    ).all()
    return {
        "cards": [
            {
                "id": t.id,
                "code": t.code,
                "flag": t.flag,
                "name": t.name,
                "sub": (t.sub or "").split(" · ")[0] or None,
                "hasProfile": t.has_profile,
                "isChampion": t.fate == "World Champions",
            }
            for t in cards
        ]
    }


@router.get("/api/teams/{team_id}", response_model=schemas.TeamProfileResponse)
async def team_profile(team_id: str, session: AsyncSession = Depends(get_session)):
    team = await session.get(models.Team, team_id)
    if not team or not team.has_profile:
        raise HTTPException(status_code=404, detail="Team not found")

    all_teams = {
        t.code: t for t in (await session.scalars(select(models.Team))).all()
    }

    standings = (
        await session.scalars(
            select(models.GroupStanding)
            .where(models.GroupStanding.group_letter == team.group_letter)
            .order_by(models.GroupStanding.position)
        )
    ).all()
    group_rows = [
        {
            "code": s.team_code,
            "flag": all_teams[s.team_code].flag,
            "name": all_teams[s.team_code].name,
            "p": s.played,
            "w": s.won,
            "d": s.drawn,
            "l": s.lost,
            "gd": s.gd,
            "pts": s.points,
            "q": s.qualification,
            "fate": all_teams[s.team_code].fate,
        }
        for s in standings
    ]

    matches = (
        await session.scalars(
            select(models.Match).where(
                (models.Match.home_code == team.code)
                | (models.Match.away_code == team.code)
            )
        )
    ).all()
    matches.sort(key=lambda m: (stage_rank(m.stage), m.stage_order))
    team_matches = []
    for m in matches:
        is_home = m.home_code == team.code
        own, opp = (
            (m.home_score, m.away_score) if is_home else (m.away_score, m.home_score)
        )
        opp_code = m.away_code if is_home else m.home_code
        res = (
            "D"
            if m.winner_code is None
            else "W"
            if m.winner_code == team.code
            else "L"
        )
        team_matches.append(
            {
                "stage": m.stage,
                "oppCode": opp_code,
                "oppFlag": all_teams[opp_code].flag,
                "score": f"{own}–{opp}",
                "res": res,
                "note": timeline_note(m),
            }
        )

    key_players = (
        await session.scalars(
            select(models.Player)
            .where(models.Player.team_id == team.id)
            .order_by(models.Player.key_player_order)
        )
    ).all()

    return {
        "id": team.id,
        "code": team.code,
        "flag": team.flag,
        "name": team.name,
        "group": team.group_letter,
        "sub": team.sub,
        "status": team.status,
        "blurb": team.blurb,
        "radar": team.radar,
        "bars": team.bars,
        "groupRows": group_rows,
        "matches": team_matches,
        "keyPlayers": [
            {
                "id": p.id,
                "name": p.name,
                "pos": p.position,
                "goals": p.goals,
                "assists": p.assists,
                "rating": p.rating,
            }
            for p in key_players
        ],
    }
