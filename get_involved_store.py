"""ProtectOnt get-involved sign-ups — local persistence for admin dashboard."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def _store_path() -> Path:
    d = _repo_root() / "instance"
    d.mkdir(parents=True, exist_ok=True)
    return d / "get_involved_submissions.jsonl"


def normalize_submission(data: dict[str, Any]) -> dict[str, Any]:
    role_label = (data.get("role_label") or data.get("role") or "").strip()
    role_id = (data.get("role") or "").strip()
    submitted = (data.get("submitted_at") or "").strip() or datetime.now(timezone.utc).isoformat()

    return {
        "submittedAt": submitted,
        "request": role_label or role_id,
        "roleId": role_id,
        "name": (data.get("name") or "").strip(),
        "email": (data.get("email") or "").strip(),
        "phone": (data.get("phone") or "").strip(),
        "city": (data.get("city") or "").strip(),
        "postalCode": (data.get("postal_code") or "").strip(),
        "yardSignDesign": (data.get("yard_sign_design") or data.get("yard_sign_size") or "").strip(),
        "yardSignQuantity": (data.get("yard_sign_quantity") or "").strip(),
        "yardSignPaymentStatus": (data.get("yard_sign_payment_status") or "").strip(),
        "yardSignNotes": (data.get("yard_sign_notes") or "").strip(),
        "dropoffLocation": (data.get("dropoff_location") or "").strip(),
        "dropoffAvailability": (data.get("dropoff_availability") or "").strip(),
        "dropoffCapacity": (data.get("dropoff_capacity") or "").strip(),
        "dropoffListPublicly": (data.get("dropoff_list_publicly") or "").strip(),
        "volunteerRoles": (data.get("volunteer_roles") or "").strip(),
        "volunteerAvailability": (data.get("volunteer_availability") or "").strip(),
        "volunteerHasVehicle": (data.get("volunteer_has_vehicle") or "").strip(),
        "updatesTopics": (data.get("updates_topics") or "").strip(),
        "additionalNotes": (data.get("additional_notes") or "").strip(),
        "sourcePage": (data.get("source_page") or "join").strip(),
    }


def _dedupe_key(record: dict[str, Any]) -> str:
    email = (record.get("email") or "").strip().lower()
    submitted = (record.get("submittedAt") or record.get("submitted_at") or "")[:19]
    role = (record.get("roleId") or record.get("role") or "").strip().lower()
    name = (record.get("name") or "").strip().lower()
    return f"{submitted}|{email}|{role}|{name}"


def _existing_dedupe_keys() -> set[str]:
    return {_dedupe_key(row) for row in list_submissions()}


def bulk_import_submissions(
    rows: list[dict[str, Any]],
    *,
    source: str = "import",
) -> tuple[int, int]:
    """Append normalized rows, skipping duplicates. Returns (added, skipped)."""
    seen = _existing_dedupe_keys()
    added = 0
    skipped = 0
    path = _store_path()

    with open(path, "a", encoding="utf-8") as f:
        for raw in rows:
            if "submittedAt" in raw and "roleId" in raw:
                record = dict(raw)
                if not record.get("sourcePage"):
                    record["sourcePage"] = source
            else:
                payload = dict(raw)
                if not payload.get("source_page"):
                    payload["source_page"] = source
                record = normalize_submission(payload)

            key = _dedupe_key(record)
            if key in seen:
                skipped += 1
                continue

            record["id"] = str(uuid.uuid4())
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
            seen.add(key)
            added += 1

    return added, skipped


def append_submission(data: dict[str, Any]) -> dict[str, Any]:
    """Persist one sign-up; returns stored record with id."""
    record = normalize_submission(data)
    record["id"] = str(uuid.uuid4())
    line = json.dumps(record, ensure_ascii=False, default=str)
    path = _store_path()
    with open(path, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    return record


def list_submissions() -> list[dict[str, Any]]:
    path = _store_path()
    if not path.exists():
        return []

    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            logger.warning("Skipping corrupt get-involved submission line")

    rows.sort(key=lambda row: row.get("submittedAt") or "", reverse=True)
    return rows
