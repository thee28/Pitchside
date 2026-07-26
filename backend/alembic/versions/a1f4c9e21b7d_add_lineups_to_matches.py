"""add lineups to matches

Revision ID: a1f4c9e21b7d
Revises: 6d23c3e8936c
Create Date: 2026-07-26 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1f4c9e21b7d'
down_revision: Union[str, Sequence[str], None] = '6d23c3e8936c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('matches', sa.Column('lineups', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('matches', 'lineups')
