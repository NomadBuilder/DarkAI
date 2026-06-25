"""Read/write social-post-ideas.json for ProtectOnt admin."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional, Tuple

from protectont_events import save_request_allowed

_REPO_ROOT = Path(__file__).resolve().parent

PATHS = (
    _REPO_ROOT / "ledger" / "public" / "data" / "social-post-ideas.json",
    _REPO_ROOT / "static" / "protectont" / "data" / "social-post-ideas.json",
)


def social_ideas_save_enabled() -> bool:
    flag = os.getenv("PROTECTONT_SOCIAL_IDEAS_DISABLE_SAVE", "").strip().lower()
    return flag not in ("1", "true", "yes")


def save_social_post_ideas_allowed(origin: str, referer: str) -> bool:
    if not save_request_allowed(origin, referer):
        return False
    ref = referer or ""
    return "/admin" in ref or "section=social-posts" in ref


def read_social_post_ideas_json() -> Tuple[Optional[dict], Optional[str]]:
    for path in PATHS:
        if path.is_file():
            try:
                with open(path, encoding="utf-8") as f:
                    return json.load(f), None
            except (json.JSONDecodeError, OSError) as e:
                return None, str(e)
    return None, "social-post-ideas.json not found"


def write_social_post_ideas_json(raw_body: str) -> Tuple[bool, Optional[str]]:
    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"

    if not isinstance(data, dict):
        return False, "JSON must be an object"

    if not isinstance(data.get("ideas"), list):
        return False, '"ideas" must be an array'

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
        return False, last_err or "Could not write social-post-ideas.json"
    return True, None
