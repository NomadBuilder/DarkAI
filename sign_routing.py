"""Match yard-sign requests to regional leads and local hub organizers."""

from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def _territories_path() -> Path:
    return _repo_root() / "ledger" / "data" / "sign-territories.json"


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def _email_overrides_path() -> Path:
    d = _repo_root() / "instance"
    d.mkdir(parents=True, exist_ok=True)
    return d / "sign-lead-emails.json"


def _load_email_overrides() -> dict[str, str]:
    path = _email_overrides_path()
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {str(k): str(v).strip() for k, v in data.items() if str(v).strip()}
    except (json.JSONDecodeError, OSError):
        pass
    return {}


def _env_lead_email(lead_id: str) -> str:
    key = f"SIGN_LEAD_EMAIL_{lead_id.upper().replace('-', '_')}"
    return (
        os.getenv(key, "").strip()
        or os.getenv("SIGN_DELIVERY_ALERT_EMAIL", "").strip()
        or os.getenv("CONTACT_EMAIL", "").strip()
        or "protectont@gmail.com"
    )


def _lead_email(lead_id: str) -> str:
    overrides = _load_email_overrides()
    if lead_id in overrides:
        return overrides[lead_id]
    for lead in load_territory_config().get("leads", []):
        if lead.get("id") == lead_id:
            email = str(lead.get("email") or "").strip()
            if email:
                return email
    return _env_lead_email(lead_id)


def clear_territory_cache() -> None:
    load_territory_config.cache_clear()


@lru_cache(maxsize=1)
def load_territory_config() -> dict[str, Any]:
    path = _territories_path()
    if not path.is_file():
        return {"leads": [], "territories": []}
    return json.loads(path.read_text(encoding="utf-8"))


def lead_name(lead_id: str) -> str:
    for lead in load_territory_config().get("leads", []):
        if lead.get("id") == lead_id:
            return str(lead.get("name") or lead_id)
    return lead_id or "Unassigned"


def route_sign_request(*, city: str, postal_code: str) -> dict[str, str]:
    """Return assignment fields for a yard-sign request."""
    city_n = _norm(city)
    postal = _norm(postal_code).replace(" ", "")
    fsa = postal[:3].upper() if len(postal) >= 3 else ""

    config = load_territory_config()
    best: dict[str, Any] | None = None
    best_score = 0

    for territory in config.get("territories", []):
        score = 0
        for kw in territory.get("keywords", []):
            kw_n = _norm(str(kw))
            if kw_n and kw_n in city_n:
                score = max(score, 10 + len(kw_n))
        for prefix in territory.get("fsaPrefixes", []):
            if fsa and fsa == str(prefix).upper():
                score = max(score, 20)

        if score > best_score:
            best_score = score
            best = territory

    if not best:
        return {
            "territoryId": "",
            "territoryArea": "Unassigned",
            "regionalLeadId": "",
            "regionalLeadName": "Unassigned",
            "hubName": "",
            "hubPhone": "",
            "organizerEmail": _lead_email(""),
        }

    lead_id = str(best.get("leadId") or "")
    return {
        "territoryId": str(best.get("id") or ""),
        "territoryArea": str(best.get("area") or ""),
        "regionalLeadId": lead_id,
        "regionalLeadName": lead_name(lead_id),
        "hubName": str(best.get("hubName") or ""),
        "hubPhone": str(best.get("hubPhone") or ""),
        "organizerEmail": _lead_email(lead_id),
    }


def list_leads() -> list[dict[str, str]]:
    return [
        {
            "id": str(lead.get("id")),
            "name": str(lead.get("name")),
            "email": _lead_email(str(lead.get("id") or "")),
        }
        for lead in load_territory_config().get("leads", [])
    ]


def build_territory_structure() -> list[dict[str, Any]]:
    """Regional leads with alert email and their assigned areas."""
    config = load_territory_config()
    structure: list[dict[str, Any]] = []

    for lead in config.get("leads", []):
        lead_id = str(lead.get("id") or "")
        areas = [
            {
                "area": str(t.get("area") or ""),
                "hubName": str(t.get("hubName") or ""),
                "hubPhone": str(t.get("hubPhone") or ""),
            }
            for t in config.get("territories", [])
            if str(t.get("leadId") or "") == lead_id
        ]
        areas.sort(key=lambda row: row["area"].lower())
        structure.append(
            {
                "id": lead_id,
                "name": str(lead.get("name") or lead_id),
                "email": _lead_email(lead_id),
                "areas": areas,
            }
        )
    return structure


def save_lead_email(lead_id: str, email: str) -> tuple[bool, str | None]:
    """Persist organizer alert email (survives redeploys via instance/)."""
    lead_id = lead_id.strip()
    email = email.strip()
    if not lead_id:
        return False, "Lead id is required"
    if not email or "@" not in email:
        return False, "A valid email address is required"

    known_ids = {str(lead.get("id")) for lead in load_territory_config().get("leads", [])}
    if lead_id not in known_ids:
        return False, "Unknown regional lead"

    overrides = _load_email_overrides()
    overrides[lead_id] = email
    path = _email_overrides_path()
    try:
        path.write_text(json.dumps(overrides, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except OSError as exc:
        return False, str(exc)
    return True, None
