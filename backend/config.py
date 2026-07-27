import os

from dotenv import load_dotenv

load_dotenv()

_RAW_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://pitchside:pitchside@localhost:5433/pitchside",
)


def _with_driver(url: str, driver: str) -> str:
    """Force a specific SQLAlchemy driver on a Postgres URL.

    Managed hosts (Render, Heroku, etc.) hand out plain `postgres://` or
    `postgresql://` URLs with no driver. The async app needs `+asyncpg` and
    Alembic/ETL need `+psycopg2`, so normalise whatever we're given.
    """
    scheme, sep, rest = url.partition("://")
    base = scheme.split("+", 1)[0]  # drop any existing +driver
    if base == "postgres":
        base = "postgresql"
    return f"{base}+{driver}{sep}{rest}"


# Async driver URL for the FastAPI app.
DATABASE_URL = _with_driver(_RAW_DATABASE_URL, "asyncpg")

# Sync driver URL for Alembic and the ETL (pandas/psycopg2).
SYNC_DATABASE_URL = _with_driver(_RAW_DATABASE_URL, "psycopg2")
