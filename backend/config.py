import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://pitchside:pitchside@localhost:5433/pitchside",
)

# Sync driver URL for Alembic and the ETL (pandas/psycopg2).
SYNC_DATABASE_URL = DATABASE_URL.replace("+asyncpg", "+psycopg2")
