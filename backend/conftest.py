import sys
from pathlib import Path

# Make backend/ importable (etl, models, config) whether pytest is invoked from
# the repo root or from backend/.
sys.path.insert(0, str(Path(__file__).parent))
