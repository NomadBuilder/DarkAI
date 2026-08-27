"""
First-party aggregate usage counters for Un-Default.

No cookies, no fingerprints, no repo names, no scanned text — only allowlisted
event names and coarse day buckets. Stored as JSON on disk (and optionally a
GitHub Gist when TELEMETRY_GIST_ID + TELEMETRY_GIST_TOKEN are set).
"""

from __future__ import annotations

import json
import os
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

ALLOWED_EVENTS = frozenset(
    {
        "for_agents_view",
        "init_copy",
        "marketplace_copy",
        "plugin_install_copy",
        "action_run",
    }
)

_LOCK = threading.Lock()
_RATE: dict[str, list[float]] = {}
_RATE_WINDOW_S = 60.0
_RATE_MAX = 40


def _data_path() -> Path:
    override = os.environ.get("UN_DEFAULT_USAGE_PATH", "").strip()
    if override:
        return Path(override)
    return Path(__file__).resolve().parent / "data" / "usage.json"


def _empty() -> dict[str, Any]:
    return {
        "version": 1,
        "updatedAt": None,
        "totals": {k: 0 for k in sorted(ALLOWED_EVENTS)},
        "days": {},
    }


def _load_unlocked(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return _empty()
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return _empty()
    if not isinstance(raw, dict):
        return _empty()
    totals = raw.get("totals") if isinstance(raw.get("totals"), dict) else {}
    days = raw.get("days") if isinstance(raw.get("days"), dict) else {}
    merged = _empty()
    for key in ALLOWED_EVENTS:
        merged["totals"][key] = int(totals.get(key) or 0)
    for day, bucket in days.items():
        if not isinstance(bucket, dict):
            continue
        merged["days"][day] = {
            k: int(bucket.get(k) or 0) for k in ALLOWED_EVENTS if bucket.get(k)
        }
    merged["updatedAt"] = raw.get("updatedAt")
    return merged


def _save_unlocked(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    tmp.replace(path)


def _maybe_sync_gist(data: dict[str, Any]) -> None:
    gist_id = os.environ.get("TELEMETRY_GIST_ID", "").strip()
    token = os.environ.get("TELEMETRY_GIST_TOKEN", "").strip()
    if not gist_id or not token:
        return
    try:
        import requests

        requests.patch(
            f"https://api.github.com/gists/{gist_id}",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            json={
                "files": {
                    "un-default-usage.json": {
                        "content": json.dumps(data, indent=2, sort_keys=True) + "\n"
                    }
                }
            },
            timeout=8,
        )
    except Exception:
        # Persistence is best-effort; local file remains source of truth for the instance.
        pass


def rate_limited(client_key: str) -> bool:
    now = time.monotonic()
    with _LOCK:
        hits = [t for t in _RATE.get(client_key, []) if now - t < _RATE_WINDOW_S]
        if len(hits) >= _RATE_MAX:
            _RATE[client_key] = hits
            return True
        hits.append(now)
        _RATE[client_key] = hits
        return False


def record_event(event: str) -> dict[str, Any] | None:
    if event not in ALLOWED_EVENTS:
        return None
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    path = _data_path()
    with _LOCK:
        data = _load_unlocked(path)
        data["totals"][event] = int(data["totals"].get(event) or 0) + 1
        bucket = data["days"].setdefault(day, {})
        bucket[event] = int(bucket.get(event) or 0) + 1
        data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        _save_unlocked(path, data)
        snapshot = json.loads(json.dumps(data))
    _maybe_sync_gist(snapshot)
    return snapshot


def read_stats() -> dict[str, Any]:
    path = _data_path()
    with _LOCK:
        data = _load_unlocked(path)
    # Public payload: totals + last 14 days only
    days = data.get("days") or {}
    recent_keys = sorted(days.keys())[-14:]
    return {
        "version": 1,
        "updatedAt": data.get("updatedAt"),
        "totals": data.get("totals") or {},
        "days": {k: days[k] for k in recent_keys},
        "privacy": (
            "Aggregate event counts only. No cookies, repo names, IPs stored in "
            "this file, page content, or scanned text."
        ),
    }


def badge_svg(metric: str = "action_run") -> str:
    stats = read_stats()
    totals = stats.get("totals") or {}
    if metric not in ALLOWED_EVENTS:
        metric = "action_run"
    label = {
        "action_run": "CI runs",
        "for_agents_view": "agents page",
        "init_copy": "init copies",
        "marketplace_copy": "marketplace copies",
        "plugin_install_copy": "plugin copies",
    }.get(metric, metric)
    value = str(int(totals.get(metric) or 0))
    label_w = 8 * len(label) + 20
    value_w = 8 * len(value) + 20
    width = label_w + value_w
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="20" role="img" aria-label="{escape(label)}: {escape(value)}">
  <title>{escape(label)}: {escape(value)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="m"><rect width="{width}" height="20" rx="3" fill="#fff"/></mask>
  <g mask="url(#m)">
    <rect width="{label_w}" height="20" fill="#555"/>
    <rect x="{label_w}" width="{value_w}" height="20" fill="#1a524a"/>
    <rect width="{width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="{label_w / 2}" y="15" fill="#010101" fill-opacity=".3">{escape(label)}</text>
    <text x="{label_w / 2}" y="14">{escape(label)}</text>
    <text x="{label_w + value_w / 2}" y="15" fill="#010101" fill-opacity=".3">{escape(value)}</text>
    <text x="{label_w + value_w / 2}" y="14">{escape(value)}</text>
  </g>
</svg>
"""
