"""
State Manager to persist initialization sequence responses.
Stores a JSON file under /app/state/initialization_sequence_cache.json inside the container.
"""
from pathlib import Path
import json
from typing import Any, Dict

STATE_DIR = Path(__file__).resolve().parent.parent / "state"
STATE_DIR.mkdir(parents=True, exist_ok=True)
CACHE_PATH = STATE_DIR / "initialization_sequence_cache.json"


def save_init_responses(data: Dict[str, Any]) -> None:
    """Persist initialize responses (overwrites existing file)."""
    with CACHE_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_init_responses() -> Dict[str, Any]:
    if not CACHE_PATH.exists():
        return {}
    with CACHE_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_cache_path() -> str:
    return str(CACHE_PATH)