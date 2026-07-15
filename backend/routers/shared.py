"""Formatting helpers shared across routers, mirroring the design mock."""

STAGE_RANK = {
    "ROUND OF 32": 1,
    "ROUND OF 16": 2,
    "QUARTER-FINAL": 3,
    "SEMI-FINAL": 4,
    "THIRD PLACE": 5,
    "FINAL": 6,
}


def stage_rank(stage: str) -> int:
    return 0 if stage.startswith("GROUP") else STAGE_RANK[stage]


def timeline_note(match) -> str:
    """e.g. 'Jun 16', 'Pens 4–2 · Jul 15', 'Jul 19 · E. Rutherford'."""
    parts = [match.note, match.date_label, match.venue]
    return " · ".join(p for p in parts if p)


def bracket_note(match) -> str:
    """e.g. 'FT · Jun 28', 'PENS 3–2 · Jun 29', 'CHAMPIONS · FT · Jul 19'."""
    if match.kind == "champ":
        return f"CHAMPIONS · FT · {match.date_label}"
    if match.kind == "third":
        return f"THIRD PLACE · {match.date_label}"
    decider = match.note.upper() if match.note else "FT"
    return f"{decider} · {match.date_label}"
