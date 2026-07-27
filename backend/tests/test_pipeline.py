"""Offline data-integrity tests for the ETL pipeline.

These run the real merge over the committed API-Football cache (no network, no
database) and assert the derived dataset is internally consistent and matches
the known WC2026 outcome. Run from backend/:  ./venv/bin/pytest
"""

from collections import Counter

import pytest

from etl.load import build_frames, validate
from etl.merge import build_merged


@pytest.fixture(scope="module")
def merged() -> dict:
    return build_merged()


def test_row_counts(merged):
    assert len(merged["teams"]) == 48
    assert len(merged["standings"]) == 48
    assert len(merged["matches"]) == 104
    assert len(merged["awards"]) == 3
    assert merged["players"], "no players merged"


def test_champion_and_final(merged):
    champions = [t for t in merged["teams"] if t["fate"] == "World Champions"]
    assert [t["name"] for t in champions] == ["Spain"]

    final = next(m for m in merged["matches"] if m["stage"] == "FINAL")
    assert final["winner_code"] == "ESP"
    assert (final["home_code"], final["away_code"]) == ("ESP", "ARG")

    third = next(m for m in merged["matches"] if m["stage"] == "THIRD PLACE")
    assert third["winner_code"] == "ENG"


def test_referential_integrity(merged):
    codes = {t["code"] for t in merged["teams"]}

    for m in merged["matches"]:
        assert m["home_code"] in codes, m
        assert m["away_code"] in codes, m
        if m["winner_code"] is not None:
            assert m["winner_code"] in (m["home_code"], m["away_code"]), m

    assert {s["team_code"] for s in merged["standings"]} == codes

    board_codes = {p["team_code"] for p in merged["players"]}
    assert board_codes <= codes


def test_no_duplicate_matches(merged):
    keys = Counter(
        (m["stage"], m["home_code"], m["away_code"]) for m in merged["matches"]
    )
    dups = [k for k, n in keys.items() if n > 1]
    assert dups == [], f"duplicate match keys: {dups}"


def test_awards_populated(merged):
    by_award = {a["award"].lower(): a for a in merged["awards"]}
    assert set(by_award) == {"golden boot", "golden ball", "golden glove"}
    for a in merged["awards"]:
        assert a["player_name"], a
        assert a["detail"], a


def test_validate_passes_on_merged(merged):
    # The same validation the loader runs, exercised without a database.
    validate(build_frames(merged))


def test_validate_raises_on_broken_data(merged):
    broken = dict(merged)
    bad_standings = [dict(s) for s in merged["standings"]]
    bad_standings[0]["points"] = bad_standings[0]["points"] + 999  # break arithmetic
    broken["standings"] = bad_standings
    with pytest.raises(ValueError):
        validate(build_frames(broken))
