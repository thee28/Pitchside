from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    code: Mapped[str] = mapped_column(String(3), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    flag: Mapped[str] = mapped_column(String(16), nullable=False)
    group_letter: Mapped[str] = mapped_column(String(1), nullable=False)
    fate: Mapped[str | None] = mapped_column(String(64))
    sub: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str | None] = mapped_column(String(64))
    blurb: Mapped[str | None] = mapped_column(Text)
    radar: Mapped[list | None] = mapped_column(JSONB)
    bars: Mapped[list | None] = mapped_column(JSONB)
    has_profile: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    card_order: Mapped[int | None] = mapped_column(Integer)


class GroupStanding(Base):
    __tablename__ = "group_standings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_letter: Mapped[str] = mapped_column(String(1), nullable=False)
    team_code: Mapped[str] = mapped_column(
        String(3), ForeignKey("teams.code"), nullable=False, unique=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    played: Mapped[int] = mapped_column(Integer, nullable=False)
    won: Mapped[int] = mapped_column(Integer, nullable=False)
    drawn: Mapped[int] = mapped_column(Integer, nullable=False)
    lost: Mapped[int] = mapped_column(Integer, nullable=False)
    gd: Mapped[str] = mapped_column(String(8), nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    qualification: Mapped[str] = mapped_column(String(1), nullable=False)


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("stage", "home_code", "away_code"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stage: Mapped[str] = mapped_column(String(32), nullable=False)
    stage_order: Mapped[int] = mapped_column(Integer, nullable=False)
    home_code: Mapped[str] = mapped_column(String(3), ForeignKey("teams.code"), nullable=False)
    away_code: Mapped[str] = mapped_column(String(3), ForeignKey("teams.code"), nullable=False)
    home_score: Mapped[int] = mapped_column(Integer, nullable=False)
    away_score: Mapped[int] = mapped_column(Integer, nullable=False)
    winner_code: Mapped[str | None] = mapped_column(String(3))
    note: Mapped[str | None] = mapped_column(String(64))
    date_label: Mapped[str | None] = mapped_column(String(32))
    venue: Mapped[str | None] = mapped_column(String(64))
    kind: Mapped[str | None] = mapped_column(String(8))
    scorers: Mapped[dict | None] = mapped_column(JSONB)
    stats: Mapped[dict | None] = mapped_column(JSONB)


class Player(Base):
    __tablename__ = "players"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    flag: Mapped[str] = mapped_column(String(16), nullable=False)
    team_code: Mapped[str] = mapped_column(String(3), ForeignKey("teams.code"), nullable=False)
    # Null when the player's team has no profile page (mirrors mock behavior).
    team_id: Mapped[str | None] = mapped_column(String(16), ForeignKey("teams.id"))
    position: Mapped[str] = mapped_column(String(32), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    goals: Mapped[int] = mapped_column(Integer, nullable=False)
    assists: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False)
    minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str | None] = mapped_column(String(64))
    bars: Mapped[list | None] = mapped_column(JSONB)
    board_rank: Mapped[int | None] = mapped_column(Integer)
    key_player_order: Mapped[int | None] = mapped_column(Integer)


class PlayerMatchStat(Base):
    __tablename__ = "player_match_stats"
    __table_args__ = (UniqueConstraint("player_id", "match_order"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_id: Mapped[str] = mapped_column(String(32), ForeignKey("players.id"), nullable=False)
    opponent_code: Mapped[str] = mapped_column(String(3), nullable=False)
    rating: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False)
    match_order: Mapped[int] = mapped_column(Integer, nullable=False)


class Award(Base):
    __tablename__ = "awards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_name: Mapped[str] = mapped_column(String(64), nullable=False)
    flag: Mapped[str] = mapped_column(String(16), nullable=False)
    award: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    detail: Mapped[str] = mapped_column(String(64), nullable=False)


class TournamentStat(Base):
    __tablename__ = "tournament_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    value: Mapped[str] = mapped_column(String(16), nullable=False)
    label: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    sort: Mapped[int] = mapped_column(Integer, nullable=False)
