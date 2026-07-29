"""add stadiums table

Revision ID: c7a5d40b91e2
Revises: b3e7f1a9c2d4
Create Date: 2026-07-29 10:12:44.183201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c7a5d40b91e2'
down_revision: Union[str, Sequence[str], None] = 'b3e7f1a9c2d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('stadiums',
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('fifa_name', sa.String(length=64), nullable=False),
    sa.Column('local_name', sa.String(length=64), nullable=False),
    sa.Column('city', sa.String(length=64), nullable=False),
    sa.Column('region', sa.String(length=64), nullable=False),
    sa.Column('country', sa.String(length=32), nullable=False),
    sa.Column('flag', sa.String(length=16), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('opened', sa.Integer(), nullable=False),
    sa.Column('roof', sa.String(length=32), nullable=True),
    sa.Column('blurb', sa.Text(), nullable=True),
    sa.Column('matches_hosted', sa.Integer(), nullable=False),
    sa.Column('stages', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('sort', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('stadiums')
