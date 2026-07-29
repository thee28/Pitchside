from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models
import schemas
from db import get_session

router = APIRouter()

# Host countries in tournament-billing order: Canada, then the United States,
# then Mexico. Venues inside each country are ordered by the seed's `sort`
# (capacity, largest first).
COUNTRY_ORDER = ["Canada", "United States", "Mexico"]


@router.get("/api/stadiums", response_model=schemas.StadiumsResponse)
async def stadiums(session: AsyncSession = Depends(get_session)):
    rows = (
        await session.scalars(select(models.Stadium).order_by(models.Stadium.sort))
    ).all()

    by_country: dict[str, list[models.Stadium]] = {c: [] for c in COUNTRY_ORDER}
    for s in rows:
        by_country.setdefault(s.country, []).append(s)

    countries = []
    for country in COUNTRY_ORDER:
        group = by_country.get(country) or []
        if not group:
            continue
        countries.append(
            {
                "country": country,
                "flag": group[0].flag,
                "stadiums": [
                    {
                        "id": s.id,
                        "fifaName": s.fifa_name,
                        "localName": s.local_name,
                        "city": s.city,
                        "region": s.region,
                        "capacity": s.capacity,
                        "opened": s.opened,
                        "roof": s.roof,
                        "blurb": s.blurb,
                        "matches": s.matches_hosted,
                        "stages": s.stages or [],
                    }
                    for s in group
                ],
                "venues": len(group),
                "matches": sum(s.matches_hosted for s in group),
                "capacity": sum(s.capacity for s in group),
            }
        )

    return {"countries": countries}
