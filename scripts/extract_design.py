"""Extract the design reference (HTML template + component logic) from the
Claude Design .dc.html bundle in the repo root into design/.

Usage: python3 scripts/extract_design.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / "Pitchside - World Cup 2026.html"
OUT_DIR = ROOT / "design"


def main() -> None:
    lines = BUNDLE.read_text().split("\n")
    # The embedded app document is the longest JSON-string line in the bundle.
    doc_line = max((l for l in lines if l.startswith('"')), key=len)
    src = json.loads(doc_line)

    script_open = re.search(r'<script type="text/x-dc"[^>]*>', src)
    if not script_open:
        raise SystemExit("data-dc-script tag not found in bundle")
    script_end = src.find("</script>", script_open.end())
    logic = src[script_open.end():script_end]

    dc_open = re.search(r"<x-dc(?:\s[^>]*)?>", src)
    dc_close = src.rfind("</x-dc>")
    template = src[dc_open.end():dc_close]

    OUT_DIR.mkdir(exist_ok=True)
    (OUT_DIR / "logic.js").write_text(logic.strip() + "\n")
    (OUT_DIR / "template.html").write_text(template.strip() + "\n")
    print(f"wrote design/logic.js ({len(logic)} bytes)")
    print(f"wrote design/template.html ({len(template)} bytes)")


if __name__ == "__main__":
    main()
