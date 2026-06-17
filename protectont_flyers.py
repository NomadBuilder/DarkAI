"""Read/write flyers.json for ProtectOnt printable flyers and /flyer-admin."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional, Tuple

from protectont_events import save_request_allowed

_REPO_ROOT = Path(__file__).resolve().parent

PATHS = (
    _REPO_ROOT / "ledger" / "public" / "data" / "flyers.json",
    _REPO_ROOT / "static" / "protectont" / "data" / "flyers.json",
)


def flyers_save_enabled() -> bool:
    flag = os.getenv("PROTECTONT_FLYERS_DISABLE_SAVE", "").strip().lower()
    return flag not in ("1", "true", "yes")


def save_from_flyer_admin(origin: str, referer: str) -> bool:
    if not save_request_allowed(origin, referer):
        return False
    return "flyer-admin" in (referer or "") or "/admin" in (referer or "")


def read_flyers_json() -> Tuple[Optional[dict], Optional[str]]:
    for path in PATHS:
        if path.is_file():
            try:
                with open(path, encoding="utf-8") as f:
                    return json.load(f), None
            except (json.JSONDecodeError, OSError) as e:
                return None, str(e)
    return None, "flyers.json not found"


def write_flyers_json(raw_body: str) -> Tuple[bool, Optional[str]]:
    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"

    if not isinstance(data, dict):
        return False, "JSON must be an object"

    if not isinstance(data.get("flyers"), list):
        return False, '"flyers" must be an array'

    if not isinstance(data.get("shared"), dict):
        return False, '"shared" must be an object'

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
        return False, last_err or "Could not write flyers.json"
    return True, None
