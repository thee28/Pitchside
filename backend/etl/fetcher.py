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
    def fetch(self) -> dict:
        raise NotImplementedError(
            "Real football API ingestion not implemented yet; use the seed source."
        )


def get_source():
    if os.getenv("ETL_SOURCE", "seed") == "api":
        return ApiSource()
    return SeedFileSource()
