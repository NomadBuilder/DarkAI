"""Read/write protests.json for ProtectOnt admin events editor."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional, Tuple

_REPO_ROOT = Path(__file__).resolve().parent

# Canonical source for builds; live copy for immediate updates without rebuild
PATHS = (
    _REPO_ROOT / "ledger" / "public" / "data" / "protests.json",
    _REPO_ROOT / "static" / "protectont" / "data" / "protests.json",
)


def events_admin_token() -> str:
    return os.getenv("PROTECTONT_EVENTS_ADMIN_TOKEN", "").strip()


def events_save_enabled() -> bool:
    return bool(events_admin_token())


def read_protests_json() -> Tuple[Optional[dict], Optional[str]]:
    """Return (parsed JSON, error message). Tries ledger/public then static/protectont."""
    for path in PATHS:
        if path.is_file():
            try:
                with open(path, encoding="utf-8") as f:
                    return json.load(f), None
            except (json.JSONDecodeError, OSError) as e:
                return None, str(e)
    return None, "protests.json not found"


def write_protests_json(raw_body: str) -> Tuple[bool, Optional[str]]:
    """Validate JSON and write to all known paths. Returns (ok, error)."""
    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"

    if not isinstance(data, dict) or "events" not in data:
        return False, 'JSON must be an object with an "events" array'

    if not isinstance(data["events"], list):
        return False, '"events" must be an array'

    formatted = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    written = 0
    last_err: Optional[str] = None
    for path in PATHS:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(formatted, encoding="utf-8")
            written += 1
        except OSError as e:
            last_err = str(e)

    if written == 0:
        return False, last_err or "Could not write protests.json"
    return True, None
