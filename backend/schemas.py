from pydantic import BaseModel


class TeamRef(BaseModel):
    code: str
    name: str
    flag: str


class Hero(BaseModel):
    home: TeamRef
    away: TeamRef
    homeScore: int
    awayScore: int
    dateLabel: str | None
    venue: str | None
    scorers: dict | None
    stats: dict | None


class StandingRow(BaseModel):
    code: str
    flag: str
    name: str
    p: int
    w: int
    d: int
    l: int
    gd: str
    pts: int
    q: str
    fate: str | None


class KoResult(BaseModel):
    fa: str
    fb: str
    teams: str
    stage: str
    when: str


class TourStat(BaseModel):
    value: str
    label: str


class HomeResponse(BaseModel):
    hero: Hero
    groups: dict[str, list[StandingRow]]
    koResults: list[KoResult]
    tourStats: list[TourStat]


class TeamCard(BaseModel):
    id: str
    code: str
    flag: str
    name: str
    sub: str | None
    hasProfile: bool
    isChampion: bool


class TeamsResponse(BaseModel):
    cards: list[TeamCard]


class TeamMatch(BaseModel):
    stage: str
    oppCode: str
    oppFlag: str
    score: str
    res: str
    note: str


class KeyPlayer(BaseModel):
    id: str
    name: str
    pos: str
    goals: int
    assists: int
    rating: float


class TeamProfileResponse(BaseModel):
    id: str
    code: str
    flag: str
    name: str
    group: str
    sub: str | None
    status: str | None
    blurb: str | None
    radar: list[int]
    bars: list[list]
    groupRows: list[StandingRow]
    matches: list[TeamMatch]
    keyPlayers: list[KeyPlayer]


class FormPoint(BaseModel):
    opp: str
    rating: float


class PlayerResponse(BaseModel):
    id: str
    name: str
    flag: str
    teamName: str
    teamId: str | None
    pos: str
    num: int
    goals: int
    assists: int
    rating: float
    mins: int
    note: str | None
    bars: list[list]
    form: list[FormPoint]


class BracketMatch(BaseModel):
    ca: str
    cb: str
    fa: str
    fb: str
    sa: int
    sb: int
    winner: str
    note: str
    kind: str | None


class BracketCol(BaseModel):
    title: str
    sub: str
    matches: list[BracketMatch]


class BracketResponse(BaseModel):
    cols: list[BracketCol]


class BoardRow(BaseModel):
    id: str
    rank: int
    flag: str
    name: str
    teamName: str
    goals: int
    assists: int
    mins: int


class AssistRow(BaseModel):
    flag: str
    name: str
    n: int


class AwardRow(BaseModel):
    flag: str
    name: str
    award: str
    detail: str


class LeadersResponse(BaseModel):
    board: list[BoardRow]
    assists: list[AssistRow]
    awards: list[AwardRow]
