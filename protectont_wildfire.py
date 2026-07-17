"""Read/write wildfire-campaign.json for ProtectOnt admin."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional, Tuple

from protectont_events import save_request_allowed

_REPO_ROOT = Path(__file__).resolve().parent

PATHS = (
    _REPO_ROOT / "ledger" / "public" / "data" / "wildfire-campaign.json",
    _REPO_ROOT / "static" / "protectont" / "data" / "wildfire-campaign.json",
)


def wildfire_save_enabled() -> bool:
    flag = os.getenv("PROTECTONT_WILDFIRE_DISABLE_SAVE", "").strip().lower()
    return flag not in ("1", "true", "yes")


def save_wildfire_campaign_allowed(origin: str, referer: str) -> bool:
    if not save_request_allowed(origin, referer):
        return False
    ref = referer or ""
    return "/admin" in ref or "section=wildfire" in ref


def read_wildfire_campaign_json() -> Tuple[Optional[dict], Optional[str]]:
    for path in PATHS:
        if path.is_file():
            try:
                with open(path, encoding="utf-8") as f:
                    return json.load(f), None
            except (json.JSONDecodeError, OSError) as e:
                return None, str(e)
    return None, "wildfire-campaign.json not found"


def write_wildfire_campaign_json(raw_body: str) -> Tuple[bool, Optional[str]]:
    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"

    if not isinstance(data, dict):
        return False, "JSON must be an object"

    if "communityTotal" not in data:
        return False, 'JSON must include "communityTotal"'

    if "donations" in data and not isinstance(data["donations"], list):
        return False, '"donations" must be an array'

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
        return False, last_err or "Could not write wildfire-campaign.json"
    return True, None
