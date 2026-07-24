"""Data sources for the ETL. The tournament dataset is finite, so the default
source is a static seed file. ApiSource is the swap-in point for a real
football data API once full post-tournament data is published.
"""

import json
import os
from pathlib import Path

SEED_PATH = Path(__file__).parent / "seed" / "seed_data.json"


class SeedFileSource:
    def fetch(self) -> dict:
        return json.loads(SEED_PATH.read_text())


class ApiSource:
    """API-Football facts merged onto the editorial seed.

    Reads the on-disk cache in seed/raw_cache/ (populated by `python -m
    etl.pull_raw` while an API-Football Pro plan is active) and overlays real
    standings, group fixtures, player stats and the Golden Boot onto the
    editorial seed. Makes no network calls — the committed cache keeps this
    reproducible after the subscription lapses.
    """

    def fetch(self) -> dict:
        from etl.merge import build_merged

        return build_merged()


def get_source():
    if os.getenv("ETL_SOURCE", "seed") == "api":
        return ApiSource()
    return SeedFileSource()
