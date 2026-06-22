"""ProtectOnt Stripe / sheet payment records for admin dashboard."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def _store_path() -> Path:
    d = _repo_root() / "instance"
    d.mkdir(parents=True, exist_ok=True)
    return d / "payments_import.jsonl"


def excel_serial_to_iso(value: str) -> str:
    text = (value or "").strip()
    if not text:
        return ""
    try:
        serial = float(text)
    except ValueError:
        return text
    # Google Sheets / Excel day serial (1899-12-30 epoch)
    dt = datetime(1899, 12, 30) + timedelta(days=serial)
    return dt.replace(tzinfo=timezone.utc).isoformat()


def payment_dedupe_key(record: dict[str, Any]) -> str:
    email = (record.get("customerEmail") or "").strip().lower()
    amount = round(float(record.get("amount") or 0), 2)
    created = (record.get("createdAt") or "")[:10]
    return f"{created}|{email}|{amount}"


def normalize_sheet_payment(
    *,
    created: str,
    customer_name: str,
    customer_email: str,
    amount: str,
    quantity: str,
    custom_fields: dict[str, str],
) -> dict[str, Any] | None:
    email = customer_email.strip()
    if not email or "@" not in email:
        return None
    try:
        amount_num = round(float(amount or 0), 2)
    except ValueError:
        return None
    if amount_num <= 0:
        return None

    qty: int | None
    try:
        qty = int(float(quantity)) if quantity else None
    except ValueError:
        qty = None

    created_iso = excel_serial_to_iso(created)
    dedupe = payment_dedupe_key(
        {"customerEmail": email, "amount": amount_num, "createdAt": created_iso}
    )

    return {
        "id": f"sheet-{dedupe.replace('|', '-')}",
        "source": "sheet",
        "createdAt": created_iso,
        "customerName": customer_name.strip(),
        "customerEmail": email,
        "amount": amount_num,
        "currency": "CAD",
        "quantity": qty,
        "paymentStatus": "paid",
        "customFields": {k: v for k, v in custom_fields.items() if v},
    }


def bulk_import_payments(rows: list[dict[str, Any]]) -> tuple[int, int]:
    seen = {payment_dedupe_key(row) for row in list_imported_payments()}
    added = 0
    skipped = 0
    path = _store_path()

    with open(path, "a", encoding="utf-8") as f:
        for record in rows:
            key = payment_dedupe_key(record)
            if key in seen:
                skipped += 1
                continue
            record = dict(record)
            record.setdefault("id", f"sheet-{uuid.uuid4().hex[:12]}")
            record.setdefault("source", "sheet")
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
            seen.add(key)
            added += 1

    return added, skipped


def list_imported_payments() -> list[dict[str, Any]]:
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
            logger.warning("Skipping corrupt payment import line")

    rows.sort(key=lambda row: row.get("createdAt") or "", reverse=True)
    return rows


def merge_payment_lists(
    stripe_rows: list[dict[str, Any]],
    sheet_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()

    for row in stripe_rows:
        record = dict(row)
        record.setdefault("source", "stripe")
        key = payment_dedupe_key(record)
        if key in seen:
            continue
        seen.add(key)
        merged.append(record)

    for row in sheet_rows:
        record = dict(row)
        record.setdefault("source", "sheet")
        key = payment_dedupe_key(record)
        if key in seen:
            continue
        seen.add(key)
        merged.append(record)

    merged.sort(key=lambda row: row.get("createdAt") or "", reverse=True)
    return merged
